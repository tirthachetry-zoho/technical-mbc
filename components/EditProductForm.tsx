"use client";

import PriceCalculator from "@/components/PriceCalculator";
import PdfFileInput from "@/components/PdfFileInput";

export default function EditProductForm({ 
  product,
  categories,
  action
}: { 
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    categoryId: string;
    price: number;
    discountPct: number;
    thumbnailUrl: string;
    pdfKey: string;
    language: string;
    pages: number;
    fileSizeMb: number;
    featured: boolean;
    bestSeller: boolean;
    published: boolean;
  };
  categories: { id: string; name: string }[];
  action: (formData: FormData) => Promise<void> | void;
}) {
  return (
    <form action={action} className="card p-6 space-y-4">
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="existingPdfKey" value={product.pdfKey} />
      
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input name="title" defaultValue={product.title} required className="input-field" />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input name="slug" defaultValue={product.slug} className="input-field" />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" defaultValue={product.description} required rows={4} className="input-field" />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select name="categoryId" required className="input-field" defaultValue={product.categoryId}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      
      <PriceCalculator defaultPrice={product.price / 100} defaultDiscount={product.discountPct} />
      
      <div>
        <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
        <div className="space-y-2">
          <input name="thumbnailFile" type="file" accept="image/*" className="w-full text-sm" />
          <p className="text-xs text-gray-500">Current: {product.thumbnailUrl}</p>
          <p className="text-xs text-gray-500">Or provide new URL:</p>
          <input name="thumbnailUrl" defaultValue={product.thumbnailUrl} placeholder="https://..." className="input-field" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <input name="language" defaultValue={product.language} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pages</label>
          <input name="pages" type="number" defaultValue={product.pages} className="input-field" />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">File Size (MB)</label>
        <input name="fileSizeMb" type="number" step="0.1" defaultValue={product.fileSizeMb} className="input-field" />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">PDF File</label>
        <PdfFileInput name="pdf" className="w-full text-sm" />
        <p className="text-xs text-gray-500">Current: {product.pdfKey}</p>
      </div>
      
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product.featured} className="rounded" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="bestSeller" defaultChecked={product.bestSeller} className="rounded" />
          Bestseller
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={product.published} className="rounded" />
          Published
        </label>
      </div>
      
      <button className="btn-primary w-full">Update Product</button>
    </form>
  );
}