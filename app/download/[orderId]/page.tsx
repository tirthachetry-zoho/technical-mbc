"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FileEntry = {
  title: string;
  url?: string;
  watermarked?: boolean;
  data?: string;
  error?: string;
};

type Props = {
  params: Promise<{ orderId: string }>;
};

export default function PublicDownloadPage({ params }: Props) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[] | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    params.then(({ orderId: id }) => {
      setOrderId(id);
      if (!id) {
        setError("No order ID provided");
        return;
      }

      fetch(`/api/download/${id}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setFiles(data.files);
          setRemaining(data.remainingDownloads);
        })
        .catch((e) => setError(e.message));
    });
  }, [params]);

  function downloadFile(file: FileEntry) {
    if (file.watermarked && file.data) {
      // Convert base64 to blob and trigger download
      const binary = atob(file.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (file.url) {
      window.open(file.url, "_blank");
    }
  }

  if (!orderId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-red-600 mb-4">No order ID provided</p>
        <Link href="/" className="btn-primary">
          Go to Home
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/" className="btn-primary">
          Go to Home
        </Link>
      </div>
    );
  }

  if (!files) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading your download links…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Downloads</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Thank you for your purchase! Download your files below.
        </p>
      </div>

      <div className="card p-4 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
        <p className="text-sm text-green-700 dark:text-green-300">
          ✅ Payment confirmed! Your downloads are ready.
        </p>
      </div>

      <div className="card p-4 bg-brand-50 dark:bg-brand-900/30 border-brand-200 dark:border-brand-800">
        <p className="text-sm">
          {remaining !== null && remaining > 0
            ? `⚠️ ${remaining} downloads remaining for this order. Links expire in 5 minutes.`
            : "⚠️ This is your last download for this order."}
        </p>
      </div>

      <ul className="space-y-2">
        {files.map((f, i) => (
          <li key={i} className="card p-4 flex justify-between items-center">
            <div>
              <span className="font-medium">{f.title}</span>
              {f.watermarked && (
                <span className="ml-2 text-xs text-brand-500">🔒 Watermarked</span>
              )}
              {f.error && (
                <p className="text-red-600 text-sm mt-1">{f.error}</p>
              )}
            </div>
            {!f.error && (
              <button
                onClick={() => downloadFile(f)}
                className="btn-primary text-sm"
              >
                Download
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="text-center pt-8">
        <Link href="/" className="btn-outline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}