import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function approveReview(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await db.review.update({ where: { id }, data: { approved: true } });
  revalidatePath("/admin/reviews");
}

async function deleteReview(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await db.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
}

export default async function AdminReviewsPage() {
  const [pending, approved] = await Promise.all([
    db.review.findMany({
      where: { approved: false },
      include: { product: { select: { title: true } }, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.review.findMany({
      where: { approved: true },
      include: { product: { select: { title: true } }, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Reviews</h1>

      {/* Pending reviews */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Pending Approval ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="card p-6 text-center text-gray-500 dark:text-gray-400">
            <p>No pending reviews.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{r.user.name || r.user.email}</span>
                      <span className="text-amber-500 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    </div>
                    <p className="text-xs text-brand-500 mb-1">{r.product.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={approveReview}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">Approve</button>
                    </form>
                    <form action={deleteReview}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved reviews */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Approved Reviews</h2>
        {approved.length === 0 ? (
          <div className="card p-6 text-center text-gray-500 dark:text-gray-400">
            <p>No approved reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {approved.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{r.user.name || r.user.email}</span>
                      <span className="text-amber-500 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    </div>
                    <p className="text-xs text-brand-500 mb-1">{r.product.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
                  </div>
                  <form action={deleteReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
