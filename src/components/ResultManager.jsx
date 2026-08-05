import { useState } from "react";
import api from "../lib/api.js";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import { imageUrl } from "../lib/format.js";
import ConfirmButton from "./ConfirmButton.jsx";

const TYPES = ["IELTS", "CEFR", "TOEFL", "SAT", "Olimpiada", "Boshqa"];

export default function ResultManager({ circleId, results, isOwner, onChange }) {
  const { push } = useToast();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", type: "IELTS", studentName: "" });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!form.title || !file) return push("Sarlavha va rasm kiriting", "error");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("type", form.type);
      if (form.studentName) fd.append("studentName", form.studentName);
      fd.append("image", file);
      await api.post(`/circles/${circleId}/results`, fd);
      push("Natija qo'shildi, admin tasdiqlashi kutilmoqda");
      setForm({ title: "", type: "IELTS", studentName: "" });
      setFile(null);
      setAdding(false);
      onChange();
    } catch (err) {
      push(errorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/results/${id}`);
      push("Natija o'chirildi");
      onChange();
    } catch (err) {
      push(errorMessage(err), "error");
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {results?.map((r) => (
          <div key={r.id} className="overflow-hidden rounded-xl border border-line bg-paper-raised">
            <img src={imageUrl(r.imageUrl)} alt={r.title} className="aspect-square w-full object-cover" />
            <div className="p-2.5">
              <p className="text-sm font-semibold text-ink">{r.title}</p>
              <p className="text-xs text-muted">
                {r.studentName} {r.verified ? <span className="text-primary">✓ tasdiqlangan</span> : <span>tekshirilmoqda</span>}
              </p>
              {isOwner && (
                <ConfirmButton onConfirm={() => remove(r.id)} className="mt-1 text-xs font-medium text-danger hover:underline">
                  O'chirish
                </ConfirmButton>
              )}
            </div>
          </div>
        ))}
      </div>

      {isOwner && (
        <div className="mt-3 rounded-2xl border border-dashed border-line p-4">
          {!adding ? (
            <button onClick={() => setAdding(true)} className="text-sm font-medium text-primary hover:underline">
              + Natija qo'shish
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                placeholder="Masalan: IELTS 7.5"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="rounded-lg border border-line px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
              <div className="flex gap-2">
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="flex-1 rounded-lg border border-line px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none"
                >
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  placeholder="O'quvchi ismi (ixtiyoriy)"
                  value={form.studentName}
                  onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
                  className="flex-1 rounded-lg border border-line px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
              <div className="flex gap-2">
                <button onClick={submit} disabled={submitting} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
                  {submitting ? "Yuklanmoqda..." : "Qo'shish"}
                </button>
                <button onClick={() => setAdding(false)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft">
                  Bekor qilish
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!results?.length && !isOwner && <p className="text-sm text-muted">Hali natija qo'shilmagan</p>}
    </div>
  );
}
