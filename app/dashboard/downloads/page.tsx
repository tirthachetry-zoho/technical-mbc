"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type FileEntry = {
  title: string;
  url?: string;
  watermarked?: boolean;
  data?: string;
};

function DownloadsContent() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const [files, setFiles] = useState<FileEntry[] | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/download/${orderId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setFiles(data.files);
        setRemaining(data.remainingDownloads);
      })
      .catch((e) => setError(e.message));
  }, [orderId]);

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

  if (!orderId) return <p>No order selected.</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!files) return <p>Loading your download links…</p>;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Your Downloads</h1>
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
            </div>
            <button
              onClick={() => downloadFile(f)}
              className="btn-primary text-sm"
            >
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DownloadsPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <DownloadsContent />
    </Suspense>
  );
}
