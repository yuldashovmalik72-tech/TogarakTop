import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api.js";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { CATEGORY_OPTIONS } from "../lib/format.js";

export default function EditCircle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/circles/${id}`).then((res) => {
      const c = res.data.data;
      setForm({
        name: c.name,
        category: c.category,
        direction: c.direction,
        description: c.description,
        tavsif: c.tavsif,
        address: c.address || "",
        ageGroupMin: c.ageGroupMin || "",
        ageGroupMax: c.ageGroupMax || "",
        contactPhone: c.contactPhone || "",
        contactTelegram: c.contactTelegram || "",
        priceType: c.priceType,
        priceAmount: c.priceAmount || "",
        currency: c.currency || "UZS",
        pricePeriod: c.pricePeriod || "MONTHLY",
      });
    }).catch(() => setError("To'garak topilmadi"));
  }, [id]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.patch(`/circles/${id}`, form);
      push("O'zgarishlar saqlandi, qayta moderatsiyaga yuborildi");
      navigate(`/togarak/${id}`);
    } catch (err) {
      setError(errorMessage(err, "Saqlashda xatolik yuz berdi"));
    } finally {
      setSaving(false);
    }
  }

  if (error && !form) return <div className="mx-auto max-w-2xl px-4 py-10 text-center text-danger">{error}</div>;
  if (!form) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link to={`/togarak/${id}`} className="mb-4 inline-block text-sm text-muted hover:text-ink">← Orqaga</Link>
      <h1 className="font-display text-2xl font-extrabold text-ink">To'garakni tahrirlash</h1>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-6 shadow-sm">
        {error && <div className="rounded-xl bg-danger-wash px-3 py-2 text-sm text-danger">{error}</div>}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-soft">Nomi</span>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-soft">Kategoriya</span>
            <select value={form.category} onChange={(e) => update("category", e.target.value)} className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none">
              {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-soft">Yo'nalish</span>
            <input value={form.direction} onChange={(e) => update("direction", e.target.value)} className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-soft">Tavsif</span>
          <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-soft">Nega aynan shu to'garak?</span>
          <textarea rows={3} value={form.tavsif} onChange={(e) => update("tavsif", e.target.value)} className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
        </label>

        <div className="flex gap-2">
          {[{ v: "FREE", l: "Bepul" }, { v: "FIXED", l: "Belgilangan" }, { v: "NEGOTIABLE", l: "Kelishilgan" }].map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => update("priceType", o.v)}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${form.priceType === o.v ? "border-primary bg-primary-wash text-primary" : "border-line text-ink-soft"}`}
            >
              {o.l}
            </button>
          ))}
        </div>
        {form.priceType === "FIXED" && (
          <div className="grid grid-cols-3 gap-3">
            <input type="number" placeholder="Summa" value={form.priceAmount} onChange={(e) => update("priceAmount", e.target.value)} className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
            <select value={form.currency} onChange={(e) => update("currency", e.target.value)} className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none">
              <option value="UZS">so'm</option>
              <option value="USD">$</option>
            </select>
            <select value={form.pricePeriod} onChange={(e) => update("pricePeriod", e.target.value)} className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none">
              <option value="MONTHLY">oyiga</option>
              <option value="WEEKLY">haftaga</option>
              <option value="PER_LESSON">darsga</option>
              <option value="ONE_TIME">bir martalik</option>
            </select>
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-soft">Manzil</span>
          <input value={form.address} onChange={(e) => update("address", e.target.value)} className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Yosh (dan)" value={form.ageGroupMin} onChange={(e) => update("ageGroupMin", e.target.value)} className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
          <input type="number" placeholder="Yosh (gacha)" value={form.ageGroupMax} onChange={(e) => update("ageGroupMax", e.target.value)} className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Telefon" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
          <input placeholder="Telegram" value={form.contactTelegram} onChange={(e) => update("contactTelegram", e.target.value)} className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
        </div>

        <button type="submit" disabled={saving} className="mt-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
}
