import { useEffect, useState } from "react";
import api from "../lib/api.js";
import { errorMessage, useToast } from "../context/ToastContext.jsx";
import { formatSchedule } from "../lib/format.js";

export default function TrialLessonModal({ circle, onClose }) {
  const { push } = useToast();
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [childAge, setChildAge] = useState("");
  const [userGoal, setUserGoal] = useState("");
  const [notes, setNotes] = useState("");
  const [groupId, setGroupId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Telefondan faqat raqamlarni qoldirib tekshiradi: 998XXXXXXXXX yoki 9XXXXXXXX
  function isPhoneValid(value) {
    const digits = value.replace(/\D/g, "");
    return digits.length === 12 || digits.length === 9;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldError("");

    if (!parentName.trim()) return setFieldError("Iltimos, ismingizni kiriting.");
    if (!phone.trim()) return setFieldError("Iltimos, telefon raqamingizni kiriting.");
    if (!isPhoneValid(phone)) return setFieldError("Telefon raqam noto'g'ri. Masalan: +998 90 123 45 67");

    setSubmitting(true);
    try {
      const res = await api.post("/leads", {
        circleId: circle.id,
        groupId: groupId || undefined,
        parentName: parentName.trim(),
        phone: phone.trim(),
        childAge: childAge ? Number(childAge) : undefined,
        userGoal: userGoal.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setSuccess(res.data.data);
    } catch (err) {
      push(errorMessage(err, "Arizani yuborishda xatolik yuz berdi"), "error");
    } finally {
      setSubmitting(false);
    }
  }

  const groups = circle.groups || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sinov darsiga yozilish"
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-paper-raised p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-wash text-2xl">
              ✓
            </div>
            <h2 className="mt-4 font-display text-xl font-extrabold text-ink">Ariza qabul qilindi!</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">{success.circleName}</span> ({success.centerName})
              administratori tez orada <span className="font-semibold">{success.phone}</span> raqami orqali
              bog'lanadi va bepul daraja aniqlash testiga (Placement Test) navbat beradi.
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Yopish
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-extrabold text-ink">🎯 Sinov darsiga yozilish</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {circle.name} — bepul daraja aniqlash testi
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Yopish"
                className="rounded-lg p-1.5 text-muted transition hover:bg-paper hover:text-ink"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <div>
                <label htmlFor="lead-name" className="text-xs font-semibold text-ink-soft">
                  Ota-ona ismi *
                </label>
                <input
                  id="lead-name"
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Masalan: Aziza Karimova"
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="lead-phone" className="text-xs font-semibold text-ink-soft">
                  Telefon raqam *
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-primary"
                />
              </div>

              {groups.length > 0 && (
                <div>
                  <label htmlFor="lead-group" className="text-xs font-semibold text-ink-soft">
                    Guruh (ixtiyoriy)
                  </label>
                  <select
                    id="lead-group"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary"
                  >
                    <option value="">Markaz tanlasin</option>
                    {groups.map((g, i) => (
                      <option key={g.id} value={g.id}>
                        {g.teacherName || `Guruh ${i + 1}`}
                        {g.schedule?.length ? ` — ${formatSchedule(g.schedule)}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="lead-age" className="text-xs font-semibold text-ink-soft">
                    Farzand yoshi
                  </label>
                  <input
                    id="lead-age"
                    type="number"
                    min="1"
                    max="60"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    placeholder="10"
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="lead-goal" className="text-xs font-semibold text-ink-soft">
                    Maqsad
                  </label>
                  <input
                    id="lead-goal"
                    type="text"
                    value={userGoal}
                    onChange={(e) => setUserGoal(e.target.value)}
                    placeholder="IELTS 7+"
                    className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lead-notes" className="text-xs font-semibold text-ink-soft">
                  Qo'shimcha izoh
                </label>
                <textarea
                  id="lead-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Qulay vaqt, savollar..."
                  className="mt-1 w-full resize-none rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary"
                />
              </div>

              {fieldError && (
                <p className="rounded-xl bg-danger-wash px-3 py-2 text-xs font-medium text-danger">⚠ {fieldError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 rounded-xl bg-accent py-3 text-sm font-bold text-ink transition hover:brightness-95 disabled:opacity-60"
              >
                {submitting ? "Yuborilmoqda..." : "Bepul sinov darsiga navbat olish"}
              </button>
              <p className="text-center text-[11px] leading-relaxed text-muted">
                Arizangiz to'g'ridan-to'g'ri markaz ma'muriga yuboriladi. Sizga qo'ng'iroq qilib, test vaqti kelishib oladi.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
