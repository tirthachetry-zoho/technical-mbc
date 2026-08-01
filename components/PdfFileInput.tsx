"use client";

export default function PdfFileInput({ 
  name = "pdf", 
  className = "w-full text-sm"
}: { 
  name?: string; 
  className?: string;
}) {
  return (
    <div>
      <input 
        name={name} 
        type="file" 
        accept="application/pdf" 
        className={className}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
            if (titleInput) {
              // Remove .pdf extension and convert to title case
              const fileName = file.name.replace(/\.pdf$/i, '');
              const title = fileName
                .replace(/[-_]/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase())
                .trim();
              titleInput.value = title;
            }
          }
        }}
      />
    </div>
  );
}