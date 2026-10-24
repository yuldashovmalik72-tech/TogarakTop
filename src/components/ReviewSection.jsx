import { useCallback, useEffect, useState } from "react";
import api from "../lib/api.js";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import StarRating from "./StarRating.jsx";

export default function ReviewSection({ circleId, avgRating: initialAvg, reviewCount: initialCount, distribution: initialDist, reviews: initialReviews }) {
  const { push } = useToast();
  const [reviews, setReviews] = useState(initialReviews || []);
  const [avgRating, setAvgRating] = useState(initialAvg || 0);
  const [reviewCount, setReviewCount] = useState(initialCount || 0);
  const [distribution, setDistribution] = useState(initialDist || []);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: "", authorName: "" });

  const load = useCallback(() => {
    api
      .get("/reviews", { params: { circleId } })
      .then((res) => {
        setReviews(res.data.data || []);
        setAvgRating(res.data.avgRating || 0);
        setReviewCount(res.data.total || 0);
        setDistribution(res.data.distribution || []);
      })
      .catch(() => {});
  }, [circleId]);

  useEffect(() => {
    if (!initialReviews) load();
  }, [load, initialReviews]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.authorName.trim()) {
      push("Ismingizni kiriting", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/reviews", {
        circleId,
        rating: form.rating,
        comment: form.comment.trim() || null,
        authorName: form.authorName.trim(),
      });
      push("Baho qo'shildi!");
      setForm({ rating: 5, comment: "", authorName: "" });
      load();
    } catch (err) {
      push(errorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "hozirgina";
    if (mins < 60) return `${mins} daq oldin`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} soat oldin`;
    const days = Math.floor(hours / 24);
    return `${days} kun oldin`;
  }

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5">
      <h2 className="font-display text-lg font-bold text-ink">Baholar va sharhlar</h2>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="text-center sm:text-left">
          <p className="font-mono text-4xl font-bold text-ink">{avgRating.toFixed(1)}</p>
          <StarRating value={Math.round(avgRating)} readOnly size="sm" />
          <p className="mt-1 text-xs text-muted">{reviewCount} ta baho</p>
        </div>

        <div className="flex-1 space-y-1">
          {distribution.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-muted">{star}</span>
              <span className="text-amber-400">★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-wash">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-muted">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 border-t border-line pt-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Baho bering</p>
          <StarRating value={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} />
        </div>
        <input
          type="text"
          value={form.authorName}
          onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
          placeholder="Ismingiz"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary/50 focus:outline-none"
          maxLength={100}
        />
        <textarea
          value={form.comment}
          onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
          placeholder="Sharhingiz (ixtiyoriy)"
          rows={2}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary/50 focus:outline-none"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? "Yuborilmoqda..." : "Baho berish"}
        </button>
      </form>

      {reviews.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-line bg-paper p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">{review.authorName}</p>
                <p className="text-xs text-muted">{timeAgo(review.createdAt)}</p>
              </div>
              <StarRating value={review.rating} readOnly size="sm" />
              {review.comment && <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
