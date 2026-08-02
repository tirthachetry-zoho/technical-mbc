"use client";

import { useState, useEffect } from "react";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string | null };
};

export default function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setCount(data.count || 0);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Review submitted! It will appear after admin approval.");
        setShowForm(false);
        setComment("");
      } else if (res.status === 401) {
        window.location.href = "/login";
      } else {
        setMessage(data.error || "Failed to submit review");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function renderStars(value: number) {
    return "★".repeat(value) + "☆".repeat(5 - value);
  }

  if (loading) return <p className="text-gray-500 text-sm">Loading reviews…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold">Reviews</h3>
          {count > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-amber-500">{renderStars(Math.round(avgRating))}</span>
              <span className="text-gray-500 dark:text-gray-400">
                {avgRating} ({count} {count === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-brand-500 hover:underline"
        >
          {showForm ? "Cancel" : "Write a review"}
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.includes("submitted")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={submitReview} className="card p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-2xl ${n <= rating ? "text-amber-500" : "text-gray-300"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              minLength={5}
              rows={3}
              className="input-field"
              placeholder="Share your experience with this product..."
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary text-sm">
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {(r.user.name || "U")[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">{r.user.name || "Anonymous"}</span>
                </div>
                <span className="text-amber-500 text-sm">{renderStars(r.rating)}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(r.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
