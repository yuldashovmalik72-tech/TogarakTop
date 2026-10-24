import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api.js";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { CATEGORY_OPTIONS } from "../lib/format.js";
import FileUploadField from "../components/FileUploadField.jsx";

const TEXT_FIELDS = [
  "name", "category", "direction", "description", "tavsif", "address", "ageGroupMin", "ageGroupMax",
  "contactPhone", "contactTelegram", "priceType", "priceAmount", "currency", "pricePeriod",
];

export default function EditCircle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const [form, setForm] = useState(null);
  const [originalImages, setOriginalImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/circles/${id}`).then((res) => {
      const c = res.data.data;
      setOriginalImages(c.images || []);
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
        materialsIncluded: c.materialsIncluded === null || c.materialsIncluded === undefined ? "" : String(c.materialsIncluded),
        refundable: c.refundable === null || c.refundable === undefined ? "" : String(c.refundable),
        extraCostsNote: c.extraCostsNote || "",
        images: [...(c.images || []), "", ""].slice(0, 2),
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
      const fd = new FormData();
      TEXT_FIELDS.forEach((k) => {
        if (form[k] !== undefined && form[k] !== null) fd.append(k, form[k]);
      });
      fd.append("materialsIncluded", form.materialsIncluded);
      fd.append("refundable", form.refundable);
      fd.append("extraCostsNote", form.extraCostsNote);
      const imageFiles = (form.images || []).filter((v) => v instanceof File);
      imageFiles.forEach((f) => fd.append("images", f));
      const urlSlots = (form.images || [])
        .filter((v) => typeof v === "string")
        .map((u) => u.trim())
        .filter(Boolean);
      if (urlSlots.length) fd.append("imageUrls", JSON.stringify(urlSlots));
      // Slotdan olib tashlangan eski rasmlarni serverda ham o'chirish
      const dropped = originalImages.filter((u) => !urlSlots.includes(u));
      if (dropped.length) fd.append("removeImages", JSON.stringify(dropped));

      await api.patch(`/circles/${id}`, fd);
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

        <div className="flex flex-col gap-3 rounded-xl border border-line bg-paper p-4">
          <div>
            <p className="text-sm font-medium text-ink-soft">To'liq yakuniy narx (shaffoflik uchun)</p>
            <p className="mt-0.5 text-xs text-muted">Ota-onalar yashirin to'lovlardan eng ko'p shikoyat qiladi — ochiq yozsangiz ishonch oshadi.</p>
          </div>
          {[{ f: "materialsIncluded", l: "Kitob/materiallar narxga kiritilganmi?" }, { f: "refundable", l: "O'tkazib yuborilgan dars puli qaytariladimi?" }].map((row) => (
            <div key={row.f} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-ink-soft">{row.l}</span>
              <div className="flex gap-1.5">
                {[{ v: "true", l: "Ha" }, { v: "false", l: "Yo'q" }, { v: "", l: "Aytmayman" }].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => update(row.f, o.v)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${form[row.f] === o.v ? "border-primary bg-primary-wash text-primary" : "border-line text-ink-soft"}`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <input
            value={form.extraCostsNote}
            onChange={(e) => update("extraCostsNote", e.target.value)}
            placeholder="Boshqa qo'shimcha to'lovlar (masalan: forma kiyimi 100 000 so'm alohida)"
            className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>

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

        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <p className="text-sm font-medium text-ink-soft">Rasmlar (ixtiyoriy, max 2)</p>
          <p className="text-xs text-muted">Fayl tanlasangiz server uni ImgBB bulutiga yuklaydi yoki to&apos;liq https://... havola qoldiring.</p>
          {[0, 1].map((idx) => {
            const slot = form.images?.[idx];
            const isFile = slot instanceof File;
            const preview = isFile ? URL.createObjectURL(slot) : typeof slot === "string" && slot ? slot : null;
            return (
              <div key={idx} className="flex flex-col gap-2 rounded-xl border border-line p-3">
                <FileUploadField
                  kind="image"
                  accept="image/*"
                  size="sm"
                  value={isFile ? slot : null}
                  onChange={(e) => {
                    const images = [...(form.images || ["", ""])];
                    images[idx] = e.target.files?.[0] || "";
                    update("images", images);
                    e.target.value = "";
                  }}
                  hint={`Rasm ${idx + 1} — yuklanmagan`}
                />
                <input
                  type="url"
                  placeholder={`yoki havola ${idx + 1} — https://...`}
                  value={isFile ? "" : slot || ""}
                  onChange={(e) => {
                    const images = [...(form.images || ["", ""])];
                    images[idx] = e.target.value;
                    update("images", images);
                  }}
                  className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
                {preview && (
                  <img src={preview} alt="" className="h-20 w-20 rounded-lg object-cover border border-line" />
                )}
              </div>
            );
          })}
        </div>

        <button type="submit" disabled={saving} className="mt-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
}
