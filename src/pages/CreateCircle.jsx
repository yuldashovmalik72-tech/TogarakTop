import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import { CATEGORY_OPTIONS, DAYS } from "../lib/format.js";
import FileUploadField from "../components/FileUploadField.jsx";

const STEPS = ["Turi", "Asosiy", "Rasm", "Narx", "Manzil", "Guruh", "Tayyor"];

const emptyForm = {
  type: "",
  courseCenterId: "",
  newCenter: { name: "", address: "", contactPhone: "", contactTelegram: "" },
  name: "",
  category: "",
  direction: "",
  description: "",
  tavsif: "",
  images: [],
  priceType: "FREE",
  priceAmount: "",
  currency: "UZS",
  pricePeriod: "MONTHLY",
  materialsIncluded: "",
  refundable: "",
  extraCostsNote: "",
  address: "",
  ageGroupMin: "",
  ageGroupMax: "",
  contactPhone: "",
  contactTelegram: "",
};

const emptyGroup = { teacherName: "", teacherBio: "", maxStudents: "", schedule: [] };

function YesNoRow({ label, value, onChange }) {
  const options = [
    { v: "true", l: "Ha" },
    { v: "false", l: "Yo'q" },
    { v: "", l: "Aytmayman" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-sm text-ink-soft">{label}</span>
      <div className="flex gap-1.5">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
              value === o.v ? "border-primary bg-primary-wash text-primary" : "border-line text-ink-soft"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CreateCircle() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [group, setGroup] = useState(emptyGroup);
  const [myCenters, setMyCenters] = useState(null);
  const [creatingCenter, setCreatingCenter] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdCircleId, setCreatedCircleId] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function loadMyCenters() {
    try {
      const res = await api.get("/course-centers/mine");
      setMyCenters(res.data.data);
    } catch {
      setMyCenters([]);
    }
  }

  function goNext() {
    setError("");
    if (step === 0) {
      if (!form.type) return setError("Davom etish uchun turini tanlang");
      if (form.type === "KURS" && myCenters === null) loadMyCenters();
    }
    if (step === 1 && (!form.name || !form.category || !form.direction || !form.description || !form.tavsif)) {
      return setError("Barcha maydonlarni to'ldiring");
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  function setImageUrl(idx, value) {
    setForm((f) => {
      const images = [...(f.images || [])];
      images[idx] = value;
      return { ...f, images };
    });
  }

  function setImageFile(idx, file) {
    setForm((f) => {
      const images = [...(f.images || [])];
      images[idx] = file;
      return { ...f, images };
    });
  }

  async function createCourseCenter() {
    setError("");
    if (!form.newCenter.name) return setError("Markaz nomini kiriting");
    setCreatingCenter(true);
    try {
      const fd = new FormData();
      fd.append("name", form.newCenter.name);
      if (form.newCenter.address) fd.append("address", form.newCenter.address);
      if (form.newCenter.contactPhone) fd.append("contactPhone", form.newCenter.contactPhone);
      if (form.newCenter.contactTelegram) fd.append("contactTelegram", form.newCenter.contactTelegram);
      const res = await api.post("/course-centers", fd);
      const center = res.data.data;
      setMyCenters((list) => [...(list || []), center]);
      update("courseCenterId", center.id);
    } catch (err) {
      setError(err.response?.data?.message || "Markaz yaratishda xatolik yuz berdi");
    } finally {
      setCreatingCenter(false);
    }
  }

  function addScheduleRow() {
    setGroup((g) => ({ ...g, schedule: [...g.schedule, { day: DAYS[0], start: "16:00", end: "17:30" }] }));
  }

  function updateScheduleRow(idx, field, value) {
    setGroup((g) => {
      const schedule = [...g.schedule];
      schedule[idx] = { ...schedule[idx], [field]: value };
      return { ...g, schedule };
    });
  }

  function removeScheduleRow(idx) {
    setGroup((g) => ({ ...g, schedule: g.schedule.filter((_, i) => i !== idx) }));
  }

  async function submitCircle() {
    setError("");
    if (form.type === "KURS" && !form.courseCenterId) {
      return setError("Iltimos, o'quv markazini tanlang yoki yangi markaz yarating");
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("category", form.category);
      fd.append("direction", form.direction);
      fd.append("type", form.type);
      fd.append("description", form.description);
      fd.append("tavsif", form.tavsif);
      fd.append("priceType", form.priceType);
      if (form.priceType === "FIXED") {
        fd.append("priceAmount", form.priceAmount);
        fd.append("currency", form.currency);
        fd.append("pricePeriod", form.pricePeriod);
      }
      fd.append("materialsIncluded", form.materialsIncluded);
      fd.append("refundable", form.refundable);
      if (form.extraCostsNote) fd.append("extraCostsNote", form.extraCostsNote);
      if (form.address) fd.append("address", form.address);
      if (form.ageGroupMin) fd.append("ageGroupMin", form.ageGroupMin);
      if (form.ageGroupMax) fd.append("ageGroupMax", form.ageGroupMax);
      if (form.contactPhone) fd.append("contactPhone", form.contactPhone);
      if (form.contactTelegram) fd.append("contactTelegram", form.contactTelegram);
      if (form.type === "KURS") fd.append("courseCenterId", form.courseCenterId);
      const imageFiles = (form.images || []).filter((v) => v instanceof File);
      imageFiles.forEach((f) => fd.append("images", f));
      const imageUrls = (form.images || [])
        .filter((v) => typeof v === "string")
        .map((u) => u.trim())
        .filter((u) => /^https?:\/\//i.test(u));
      if (imageUrls.length) fd.append("imageUrls", JSON.stringify(imageUrls));

      const res = await api.post("/circles", fd);
      setCreatedCircleId(res.data.data.id);
      setStep(5);
    } catch (err) {
      setError(err.response?.data?.message || "To'garak yaratishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitGroup() {
    setError("");
    if (!group.teacherName) return setError("O'qituvchi ismini kiriting");
    if (!group.maxStudents) return setError("Guruh hajmini kiriting");
    setSubmitting(true);
    try {
      await api.post(`/circles/${createdCircleId}/groups`, {
        teacherName: group.teacherName,
        teacherBio: group.teacherBio || undefined,
        maxStudents: Number(group.maxStudents),
        schedule: group.schedule,
      });
      setStep(6);
    } catch (err) {
      setError(err.response?.data?.message || "Guruh qo'shishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">To'garak yaratish</h1>
      <p className="mt-1 text-sm text-muted">Bir necha oddiy qadam - hammasi tushunarli va tez</p>

      {step < 6 && (
        <div className="mt-6 flex items-center gap-1.5">
          {STEPS.slice(0, 6).map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-line"}`} />
          ))}
        </div>
      )}

      {error && <div className="mt-4 rounded-xl bg-danger-wash px-3.5 py-2.5 text-sm text-danger">{error}</div>}

      <div className="mt-6 rounded-2xl border border-line bg-paper-raised p-6 shadow-sm">
        {/* 0. TURI */}
        {step === 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-bold text-ink">To'garak qayerda o'tkaziladi?</h2>
            {[
              { value: "UY", title: "Uyda", desc: "Bitta guruh, siz yoki boshqa o'qituvchi uyingizda dars beradi" },
              { value: "ONLINE", title: "Onlayn", desc: "Bitta guruh, dars internet orqali o'tkaziladi" },
              { value: "KURS", title: "O'quv markazi", desc: "Katta markaz (masalan 'Registon LC') ostida, bir nechta guruh bilan" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("type", opt.value)}
                className={`rounded-xl border p-4 text-left transition ${
                  form.type === opt.value ? "border-primary bg-primary-wash" : "border-line hover:border-primary/40"
                }`}
              >
                <p className="font-semibold text-ink">{opt.title}</p>
                <p className="mt-0.5 text-sm text-muted">{opt.desc}</p>
              </button>
            ))}

            {form.type === "KURS" && (
              <div className="mt-2 rounded-xl border border-line bg-paper p-4">
                <p className="mb-3 text-sm font-medium text-ink-soft">Qaysi o'quv markaziga tegishli?</p>

                {myCenters === null && <p className="text-sm text-muted">Yuklanmoqda...</p>}

                {myCenters?.length > 0 && (
                  <div className="mb-3 flex flex-col gap-2">
                    {myCenters.map((c) => (
                      <label
                        key={c.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                          form.courseCenterId === c.id ? "border-primary bg-primary-wash" : "border-line"
                        }`}
                      >
                        <input
                          type="radio"
                          name="center"
                          checked={form.courseCenterId === c.id}
                          onChange={() => update("courseCenterId", c.id)}
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                )}

                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Yoki yangi markaz yarating</p>
                <div className="flex flex-col gap-2">
                  <input
                    placeholder="Markaz nomi (masalan: Registon LC)"
                    value={form.newCenter.name}
                    onChange={(e) => update("newCenter", { ...form.newCenter, name: e.target.value })}
                    className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    placeholder="Manzil"
                    value={form.newCenter.address}
                    onChange={(e) => update("newCenter", { ...form.newCenter, address: e.target.value })}
                    className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    placeholder="Telefon"
                    value={form.newCenter.contactPhone}
                    onChange={(e) => update("newCenter", { ...form.newCenter, contactPhone: e.target.value })}
                    className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={createCourseCenter}
                    disabled={creatingCenter}
                    className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-soft disabled:opacity-60"
                  >
                    {creatingCenter ? "Yaratilmoqda..." : "Markaz yaratish"}
                  </button>
                  {form.courseCenterId && form.newCenter.name && myCenters?.some((c) => c.id === form.courseCenterId) && (
                    <p className="text-xs text-primary">✓ Markaz tanlandi</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 1. ASOSIY */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-bold text-ink">Asosiy ma'lumot</h2>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-soft">To'garak nomi</span>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Masalan: Speaking Club - Ingliz tili"
                className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-soft">Kategoriya</span>
                <select
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">Tanlang</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-soft">Yo'nalish</span>
                <input
                  value={form.direction}
                  onChange={(e) => update("direction", e.target.value)}
                  placeholder="Masalan: Ingliz tili"
                  className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-soft">To'garak haqida</span>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                placeholder="Nima o'rgatiladi, dastur qanday tuzilgan..."
                className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-soft">Nega aynan shu to'garak?</span>
              <textarea
                value={form.tavsif}
                onChange={(e) => update("tavsif", e.target.value)}
                rows={3}
                placeholder="Masalan: bizda faqat amaliy suhbat orqali o'rgatiladi..."
                className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
          </div>
        )}

        {/* 2. RASM — fayl (backend ImgBB ga yuklaydi) yoki URL */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-bold text-ink">Rasmlar (ixtiyoriy)</h2>
            <p className="text-sm text-muted">
              Rasmni tanlasangiz, server uni ImgBB bulutiga yuklab doimiy havola qilib qo&apos;yadi
              (yoki quyida to&apos;liq https://... havolani qo&apos;lda kiriting). Maksimum 2 ta.
            </p>
            {[0, 1].map((idx) => {
              const slot = form.images[idx];
              const isFile = slot instanceof File;
              const preview = isFile ? URL.createObjectURL(slot) : typeof slot === "string" && slot ? slot : null;
              return (
                <div key={idx} className="flex flex-col gap-2 rounded-xl border border-line p-3">
                  <span className="text-sm font-medium text-ink-soft">Rasm {idx + 1}</span>
                  <FileUploadField
                    kind="image"
                    accept="image/*"
                    value={isFile ? slot : null}
                    onChange={(e) => {
                      setImageFile(idx, e.target.files?.[0] || null);
                      e.target.value = "";
                    }}
                    hint="Yuklanmagan"
                  />
                  <span className="text-center text-xs text-muted">yoki</span>
                  <input
                    type="url"
                    placeholder="https://... (havola bilan qo'shish)"
                    value={isFile ? "" : slot || ""}
                    onChange={(e) => setImageUrl(idx, e.target.value)}
                    className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                  {preview && (
                    <img src={preview} alt="" className="h-24 w-24 rounded-xl object-cover border border-line" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 3. NARX */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-bold text-ink">Narx</h2>
            <div className="flex gap-2">
              {[
                { v: "FREE", l: "Bepul" },
                { v: "FIXED", l: "Belgilangan narx" },
                { v: "NEGOTIABLE", l: "Kelishilgan holda" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => update("priceType", o.v)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    form.priceType === o.v ? "border-primary bg-primary-wash text-primary" : "border-line text-ink-soft"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>

            {form.priceType === "FIXED" && (
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  placeholder="Summa"
                  value={form.priceAmount}
                  onChange={(e) => update("priceAmount", e.target.value)}
                  className="col-span-1 rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
                <select
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="UZS">so'm</option>
                  <option value="USD">$</option>
                </select>
                <select
                  value={form.pricePeriod}
                  onChange={(e) => update("pricePeriod", e.target.value)}
                  className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
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
                <p className="mt-0.5 text-xs text-muted">
                  Ota-onalar yashirin to'lovlardan eng ko'p shikoyat qiladi — ochiq yozsangiz ishonch oshadi.
                </p>
              </div>
              <YesNoRow
                label="Kitob/materiallar narxga kiritilganmi?"
                value={form.materialsIncluded}
                onChange={(v) => update("materialsIncluded", v)}
              />
              <YesNoRow
                label="O'tkazib yuborilgan dars puli qaytariladimi?"
                value={form.refundable}
                onChange={(v) => update("refundable", v)}
              />
              <input
                value={form.extraCostsNote}
                onChange={(e) => update("extraCostsNote", e.target.value)}
                placeholder="Boshqa qo'shimcha to'lovlar (masalan: forma kiyimi 100 000 so'm alohida)"
                className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 4. MANZIL */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-bold text-ink">Manzil va aloqa</h2>
            {form.type !== "ONLINE" && (
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-soft">Manzil</span>
                <input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="Shahar, tuman, ko'cha"
                  className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </label>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-soft">Yosh (dan)</span>
                <input
                  type="number"
                  value={form.ageGroupMin}
                  onChange={(e) => update("ageGroupMin", e.target.value)}
                  className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-soft">Yosh (gacha)</span>
                <input
                  type="number"
                  value={form.ageGroupMax}
                  onChange={(e) => update("ageGroupMax", e.target.value)}
                  className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-soft">Telefon</span>
                <input
                  value={form.contactPhone}
                  onChange={(e) => update("contactPhone", e.target.value)}
                  placeholder="+998..."
                  className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-soft">Telegram</span>
                <input
                  value={form.contactTelegram}
                  onChange={(e) => update("contactTelegram", e.target.value)}
                  placeholder="@username"
                  className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </label>
            </div>
          </div>
        )}

        {/* 5. GURUH */}
        {step === 5 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-bold text-ink">Birinchi guruhni qo'shing</h2>
            <p className="text-sm text-muted">
              To'garak moderatsiyaga chiqishi uchun kamida bitta guruh (o'qituvchi, jadval, hajmi) kerak.
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-soft">O'qituvchi ismi</span>
              <input
                value={group.teacherName}
                onChange={(e) => setGroup((g) => ({ ...g, teacherName: e.target.value }))}
                className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-soft">Guruh hajmi (nechta o'quvchi)</span>
              <input
                type="number"
                value={group.maxStudents}
                onChange={(e) => setGroup((g) => ({ ...g, maxStudents: e.target.value }))}
                className="rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-ink-soft">Dars jadvali</span>
                <button type="button" onClick={addScheduleRow} className="text-xs font-medium text-primary hover:underline">
                  + Kun qo'shish
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {group.schedule.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={row.day}
                      onChange={(e) => updateScheduleRow(i, "day", e.target.value)}
                      className="flex-1 rounded-lg border border-line px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
                    >
                      {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input
                      type="time"
                      value={row.start}
                      onChange={(e) => updateScheduleRow(i, "start", e.target.value)}
                      className="rounded-lg border border-line px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                    <input
                      type="time"
                      value={row.end}
                      onChange={(e) => updateScheduleRow(i, "end", e.target.value)}
                      className="rounded-lg border border-line px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                    <button type="button" onClick={() => removeScheduleRow(i)} className="text-danger">✕</button>
                  </div>
                ))}
                {group.schedule.length === 0 && <p className="text-xs text-muted">Hali kun qo'shilmagan</p>}
              </div>
            </div>
          </div>
        )}

        {/* 6. TAYYOR */}
        {step === 6 && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-wash text-2xl">✓</div>
            <h2 className="font-display text-xl font-bold text-ink">Yuborildi!</h2>
            <p className="max-w-sm text-sm text-muted">
              To'garagingiz admin tomonidan tekshirilmoqda. Tasdiqlangach, qidiruvda barchaga ko'rinadi.
            </p>
            <button
              onClick={() => navigate("/mening-togaraklarim")}
              className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Mening to'garaklarim
            </button>
          </div>
        )}

        {/* Navigatsiya tugmalari */}
        {step < 6 && (
          <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="rounded-xl px-4 py-2 text-sm font-medium text-ink-soft disabled:opacity-0"
            >
              Orqaga
            </button>

            {step === 4 ? (
              <button
                type="button"
                onClick={submitCircle}
                disabled={submitting}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {submitting ? "Yuborilmoqda..." : "To'garakni yaratish"}
              </button>
            ) : step === 5 ? (
              <button
                type="button"
                onClick={submitGroup}
                disabled={submitting}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {submitting ? "Qo'shilmoqda..." : "Guruhni qo'shish"}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Davom etish
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
