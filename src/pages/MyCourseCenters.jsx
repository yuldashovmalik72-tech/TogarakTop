import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import { Spinner, EmptyState } from "../components/Spinner.jsx";
import FileUploadField from "../components/FileUploadField.jsx";

export default function MyCourseCenters() {
  const { push } = useToast();
  const [centers, setCenters] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", contactPhone: "", contactTelegram: "" });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api.get("/course-centers/mine").then((res) => setCenters(res.data.data)).catch(() => setCenters([]));
  }

  useEffect(load, []);

  async function submit() {
    if (!form.name) return push("Markaz nomini kiriting", "error");
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      images.slice(0, 2).forEach((f) => fd.append("images", f));
      await api.post("/course-centers", fd);
      push("Markaz yaratildi");
      setForm({ name: "", address: "", contactPhone: "", contactTelegram: "" });
      setImages([]);
      setAdding(false);
      load();
    } catch (err) {
      push(errorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-ink">Mening o'quv markazlarim</h1>
        {!adding && (
          <button onClick={() => setAdding(true)} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
            + Yangi markaz
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-line bg-paper-raised p-4">
          <input placeholder="Markaz nomi" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          <input placeholder="Manzil" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Telefon" value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            <input placeholder="Telegram" value={form.contactTelegram} onChange={(e) => setForm((f) => ({ ...f, contactTelegram: e.target.value }))} className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <FileUploadField
            kind="image"
            accept="image/*"
            multiple
            value={images}
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            hint="Rasm (max 2) — ImgBB bulutiga yuklanadi"
          />
          <div className="flex gap-2">
            <button onClick={submit} disabled={submitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {submitting ? "Yaratilmoqda..." : "Yaratish"}
            </button>
            <button onClick={() => setAdding(false)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-soft">Bekor qilish</button>
          </div>
        </div>
      )}

      {centers === null && <Spinner />}
      {centers?.length === 0 && !adding && (
        <div className="mt-8">
          <EmptyState title="Hali markaz yaratmagansiz" description="'KURS' turidagi to'garaklar uchun avval o'quv markazi kerak bo'ladi." />
        </div>
      )}

      {centers?.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {centers.map((c) => (
            <Link key={c.id} to={`/markaz/${c.id}`} className="flex items-center justify-between rounded-2xl border border-line bg-paper-raised p-4 hover:border-primary/40">
              <div>
                <p className="font-display font-bold text-ink">{c.name}</p>
                <p className="text-sm text-muted">{c.circles?.length || 0} ta yo'nalish</p>
              </div>
              <span className="text-muted">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
