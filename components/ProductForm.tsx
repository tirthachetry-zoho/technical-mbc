"use client";

import PriceCalculator from "@/components/PriceCalculator";
import PdfFileInput from "@/components/PdfFileInput";

export default function ProductForm({
  categories, 
  action 
}: { 
  categories: { id: string; name: string }[]; 
  action: (formData: FormData) => Promise<void> | void;
}) {
  return (
    <form action={action} className="card p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input name="title" placeholder="Product title" required className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" placeholder="Product description" required rows={4} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select name="categoryId" required className="input-field">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <PriceCalculator />
      <div>
        <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
        <div className="space-y-2">
          <input name="thumbnailFile" type="file" accept="image/*" className="w-full text-sm" />
          <p className="text-xs text-gray-500">Or provide URL:</p>
          <input name="thumbnailUrl" placeholder="https://..." className="input-field" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <input name="language" placeholder="English" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pages</label>
          <input name="pages" type="number" placeholder="0" className="input-field" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">PDF File</label>
        <PdfFileInput name="pdf" className="w-full text-sm" />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" className="rounded" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="bestSeller" className="rounded" />
          Bestseller
        </label>
      </div>
      <button className="btn-primary w-full">Create Product</button>
    </form>
  );
}