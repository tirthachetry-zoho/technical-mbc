import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function createCoupon(formData: FormData) {
  "use server";
  const code = (formData.get("code") as string).toUpperCase().trim();
  const type = formData.get("type") as string;
  const value = parseInt(formData.get("value") as string, 10);
  const minOrderVal = Math.round(parseFloat((formData.get("minOrderVal") as string) || "0") * 100);
  const usageLimit = (formData.get("usageLimit") as string) || null;
  const expiresAt = (formData.get("expiresAt") as string) || null;

  await db.coupon.create({
    data: {
      code,
      type,
      value,
      minOrderVal,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

async function deleteCoupon(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await db.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { id: "desc" }, include: { _count: { select: { orders: true } } } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Coupons</h1>

      {/* Create form */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Create New Coupon</h2>
        <form action={createCoupon} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <input name="code" placeholder="Coupon Code (e.g. SAVE10)" required className="input-field" />
          <select name="type" required className="input-field">
            <option value="FLAT">Flat (₹)</option>
            <option value="PERCENT">Percent (%)</option>
          </select>
          <input name="value" type="number" placeholder="Value" required className="input-field" />
          <input name="minOrderVal" type="number" step="0.01" placeholder="Min order ₹ (optional)" className="input-field" />
          <input name="usageLimit" type="number" placeholder="Usage limit (optional)" className="input-field" />
          <input name="expiresAt" type="date" className="input-field" />
          <div className="col-span-full">
            <button className="btn-primary">Create Coupon</button>
          </div>
        </form>
      </div>

      {/* Coupons table */}
      {coupons.length === 0 ? (
        <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-1">No coupons yet.</p>
          <p className="text-sm">Create one above to get started.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Code</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Type</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Value</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Min Order</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Usage</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Expires</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Orders</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-brand-500">{c.code}</td>
                  <td className="px-3">{c.type}</td>
                  <td className="px-3">{c.type === "FLAT" ? `₹${c.value / 100}` : `${c.value}%`}</td>
                  <td className="px-3">{c.minOrderVal > 0 ? `₹${c.minOrderVal / 100}` : "—"}</td>
                  <td className="px-3">
                    {c.usageLimit ? `${c.usedCount}/${c.usageLimit}` : `${c.usedCount} used`}
                  </td>
                  <td className="px-3">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-3">{c._count.orders}</td>
                  <td className="px-3">
                    <form action={deleteCoupon}>
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
