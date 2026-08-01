import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function createCategory(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

  await db.category.create({
    data: { name, slug },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-4">Categories ({categories.length})</h1>

      <div className="card p-6 mb-6">
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
        <p className="text-gray-500 text-sm">No categories yet.</p>
      ) : (
        <div className="card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Slug</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 px-3 font-medium">{c.name}</td>
                  <td className="py-2 px-3 text-gray-500">{c.slug}</td>
                  <td className="py-2 px-3">
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="text-red-600 hover:underline text-xs">Delete</button>
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
