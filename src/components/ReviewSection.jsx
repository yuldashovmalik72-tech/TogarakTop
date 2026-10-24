import { useCallback, useEffect, useState } from "react";
import api from "../lib/api.js";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import StarRating from "./StarRating.jsx";

export default function ReviewSection({ groupId, teacherName }) {
  const { push } = useToast();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: "", authorName: "" });

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/reviews", { params: { groupId } })
      .then((res) => {
        setReviews(res.data.data || []);
        setAvgRating(res.data.avgRating || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.comment.trim() || !form.authorName.trim()) {
      push("Ism va sharh to'ldirilishi shart", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/reviews", { ...form, groupId });
      push("Sharhingiz qo'shildi!");
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
    if (mins < 60) return `${mins} daqiqa oldin`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} soat oldin`;
    const days = Math.floor(hours / 24);
    return `${days} kun oldin`;
  }

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5">
      <h2 className="font-display text-lg font-bold text-ink">
        {teacherName ? `${teacherName} haqida sharhlar` : "Sharhlar"}
      </h2>

      {reviews.length > 0 && (
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-primary-wash p-3">
          <div>
            <p className="font-mono text-2xl font-bold text-primary">{avgRating.toFixed(1)}</p>
            <StarRating value={Math.round(avgRating)} readOnly size="sm" />
          </div>
          <p className="text-sm text-ink-soft">{reviews.length} ta sharh</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">Reyting</label>
          <StarRating value={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">Ismingiz</label>
          <input
            type="text"
            value={form.authorName}
            onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
            placeholder="Ismingiz"
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary/50 focus:outline-none"
            maxLength={100}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">Sharhingiz</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            placeholder="Ustoz haqida fikringiz..."
            rows={3}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary/50 focus:outline-none"
            maxLength={1000}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? "Yuborilmoqda..." : "Sharh qoldirish"}
        </button>
      </form>

      {reviews.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-line bg-paper p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">{review.authorName}</p>
                <p className="text-xs text-muted">{timeAgo(review.createdAt)}</p>
              </div>
              <StarRating value={review.rating} readOnly size="sm" />
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{review.comment}</p>
            </div>
          ))}
        </div>
      )}

      {reviews.length === 0 && !loading && (
        <p className="mt-4 text-center text-sm text-muted">Hali sharh yo'q. Birinchi sharhni qoldiring!</p>
      )}
    </div>
  );
}
