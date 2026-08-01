"use client";

import { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

async function extractFirstPageAsImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
  const page = await pdf.getPage(1);
  
  const scale = 2.0;
  const viewport = page.getViewport({ scale });
  
  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }
  
  // Render PDF page to canvas
  await page.render({
    canvasContext: ctx,
    viewport: viewport,
  }).promise;
  
  // Convert canvas to JPEG data URL
  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function PdfFileInput({ 
  name = "pdf", 
  className = "w-full text-sm"
}: { 
  name?: string; 
  className?: string;
}) {
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    
    // Auto-fill title from filename
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    if (titleInput && !titleInput.value) {
      const fileName = file.name.replace(/\.pdf$/i, '');
      const title = fileName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();
      titleInput.value = title;
    }

    // Extract first page as thumbnail
    setIsExtracting(true);
    try {
      const dataUrl = await extractFirstPageAsImage(file);
      setThumbnailDataUrl(dataUrl);
      
      // Update hidden thumbnail input
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = dataUrl;
      }
    } catch (err) {
      console.error("Failed to extract thumbnail:", err);
      setError("Could not extract thumbnail from PDF");
      setThumbnailDataUrl(null);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-2">
      <input 
        name={name} 
        type="file" 
        accept="application/pdf" 
        className={className}
        onChange={handleFileChange}
      />
      
      {/* Hidden input to store extracted thumbnail data URL */}
      <input 
        ref={thumbnailInputRef}
        name="extractedThumbnail" 
        type="hidden" 
      />
      
      {isExtracting && (
        <p className="text-xs text-blue-600">Extracting thumbnail from PDF...</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      
      {thumbnailDataUrl && !isExtracting && (
        <div className="mt-2">
          <p className="text-xs text-green-600 mb-1">✓ Thumbnail extracted from first page</p>
          <img 
            src={thumbnailDataUrl} 
            alt="Extracted thumbnail" 
            className="w-32 h-auto rounded border border-gray-200"
          />
        </div>
      )}
    </div>
  );
}