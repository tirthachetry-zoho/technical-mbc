import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { invalidateCategories, invalidateProducts } from "@/lib/cache";

async function createCategory(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

  await db.category.create({
    data: { name, slug },
  });

  invalidateCategories();
  invalidateProducts();
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await db.category.delete({ where: { id } });
  invalidateCategories();
  invalidateProducts();
  revalidatePath("/admin/categories");
}

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Categories</h1>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Add New Category</h2>
        <form action={createCategory} className="flex gap-3">
          <input
            name="name"
            placeholder="Category name"
            required
            className="input-field flex-1"
          />
          <button className="btn-primary">Add</button>
        </form>
      </div>

      {categories.length === 0 ? (
        <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-1">No categories yet.</p>
          <p className="text-sm">Create one above to get started.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Name</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Slug</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="py-3 px-4 font-medium">{c.name}</td>
                  <td className="px-3 text-gray-500 dark:text-gray-400">{c.slug}</td>
                  <td className="px-3">
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="text-red-600 hover:text-red-700 text-xs font-medium">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
