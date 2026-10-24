import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api.js";
import { errorMessage, useToast } from "../context/ToastContext.jsx";
import { imageUrl } from "../lib/format.js";
import TrialLessonModal from "../components/TrialLessonModal.jsx";

const GOAL_CHIPS = [
  "6 oyda IELTS 7+ olish",
  "Dasturlashni noldan o'rganish",
  "Matematikani mustahkamlash",
  "Maktabga tayyorlov",
];

const DISTRICTS = [
  "Bektemir", "Chilonzor", "Mirobod", "Mirzo Ulug'bek", "Olmazor", "Sergeli",
  "Shayxontohur", "Uchtepa", "Yakkasaroy", "Yashnobod", "Yangihayot", "Yunusobod",
];

const LOADING_STEPS = [
  "Narx/sifat nisbati hisoblanmoqda...",
  "Dars soati narxlari solishtirilmoqda...",
  "Guruh sig'imi va ustoz e'tibori tahlil qilinmoqda...",
  "Byudjet mosligi tekshirilmoqda...",
  "Yakuniy hukm shakllantirilmoqda...",
];

function fmtMoney(n) {
  if (n === null || n === undefined || n === "") return "—";
  return `${new Intl.NumberFormat("uz-UZ").format(n)} so'm`;
}

function CircleSlot({ label, accent, circles, value, onChange, disabled }) {
  const selected = circles.find((c) => c.id === value);
  const cover = selected?.images?.[0] ? imageUrl(selected.images[0]) : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:border-white/20 sm:p-5">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono text-sm font-bold ${
            accent === "amber" ? "bg-amber-400/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"
          }`}
        >
          {label}
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
          {label === "A" ? "Birinchi variant" : "Ikkinchi variant"}
        </span>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="dark-select mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-white outline-none transition focus:border-emerald-400/60 disabled:opacity-50"
      >
        <option value="">— To'garakni tanlang —</option>
        {circles.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.courseCenter?.name ? ` (${c.courseCenter.name})` : ""}
          </option>
        ))}
      </select>

      {selected && (
        <div className="mt-3 flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5">
            {cover ? (
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-white/25">
                {selected.name?.[0]}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{selected.name}</p>
            <p className="truncate text-xs text-white/50">
              {selected.courseCenter?.name || selected.address || "O'quv markazi"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ data, isWinner, accent }) {
  const winRing = isWinner
    ? accent === "amber"
      ? "border-amber-400/60 shadow-[0_0_70px_-18px_rgba(251,191,36,0.55)]"
      : "border-emerald-400/60 shadow-[0_0_70px_-18px_rgba(52,211,153,0.55)]"
    : "border-white/10";

  const rows = [
    ["O'quv markazi", data.centerName],
    ["Oylik narx", fmtMoney(data.monthlyPrice)],
    ["Soatbay narx", data.hourlyPrice ? `${fmtMoney(data.hourlyPrice)}/soat` : "—"],
    ["Guruh sig'imi", data.groupSize ? `${data.groupSize} kishilik` : "—"],
    ["Mas'ul ustoz", data.teacher || "—"],
    ["Natija ko'rsatkichi", data.successRate ? `✓ ${data.successRate}%` : "—"],
    ["Qo'shimcha to'lovlar", data.totalCostNote || "Ma'lumot berilmagan"],
    ["Manzil", data.address || "—"],
  ];

  return (
    <div className={`rounded-2xl border bg-white/[0.04] p-5 backdrop-blur-xl transition sm:p-6 ${winRing}`}>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm font-bold ${
            accent === "amber" ? "bg-amber-400/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"
          }`}
        >
          {accent === "amber" ? "B" : "A"}
        </span>
        {isWinner && (
          <span className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#2b1a02]">
            🏆 G'olib
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-lg font-bold leading-snug text-white">{data.name}</h3>

      <dl className="mt-4 flex flex-col gap-2.5 border-t border-white/10 pt-4 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="shrink-0 text-white/45">{k}</dt>
            <dd className="text-right font-medium text-white/85">{v}</dd>
          </div>
        ))}
      </dl>

      {isWinner && data.id && (
        <Link
          to={`/togarak/${data.id}`}
          className="mt-5 block rounded-xl border border-amber-400/40 bg-amber-400/10 py-2.5 text-center text-sm font-bold text-amber-300 transition hover:bg-amber-400/20"
        >
          G'olib to'garakni ko'rish →
        </Link>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { push } = useToast();

  const [circles, setCircles] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [slotA, setSlotA] = useState(searchParams.get("a") || "");
  const [slotB, setSlotB] = useState(searchParams.get("b") || "");
  const [userGoal, setUserGoal] = useState("");
  const [district, setDistrict] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [formError, setFormError] = useState("");

  const [comparing, setComparing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [trialCircle, setTrialCircle] = useState(null);
  const [trialLoading, setTrialLoading] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    api
      .get("/circles", { params: { limit: 50 } })
      .then((res) => setCircles(res.data.data.items))
      .catch(() => push("To'garaklar ro'yxatini yuklashda xatolik", "error"))
      .finally(() => setListLoading(false));
  }, [push]);

  useEffect(() => {
    if (!comparing) return;
    const t = setInterval(() => setStepIdx((i) => (i + 1) % LOADING_STEPS.length), 1400);
    return () => clearInterval(t);
  }, [comparing]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const sameCircle = slotA && slotB && slotA === slotB;

  const winnerCircle = result ? (result.winner === "A" ? result.circleA : result.circleB) : null;

  async function openTrial() {
    if (!winnerCircle) return;
    setTrialLoading(true);
    try {
      const res = await api.get(`/circles/${winnerCircle.id}`);
      setTrialCircle(res.data.data);
    } catch {
      setTrialCircle({ id: winnerCircle.id, name: winnerCircle.name, groups: [] });
    } finally {
      setTrialLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!slotA || !slotB) return setFormError("Ikkala variantni ham tanlang.");
    if (sameCircle) return setFormError("Ikkita har xil to'garakni tanlang.");
    if (!userGoal.trim()) return setFormError("Maqsadingizni yozing (masalan: 6 oyda IELTS 7+ olish).");
    if (!maxBudget || Number(maxBudget) <= 0) return setFormError("Maksimal oylik byudjetingizni kiriting.");

    setComparing(true);
    setStepIdx(0);
    try {
      const res = await api.post("/ai/compare", {
        circleAId: slotA,
        circleBId: slotB,
        userGoal: district ? `${userGoal.trim()}\nQulay tuman: ${district}` : userGoal.trim(),
        maxBudget: Number(maxBudget),
      });
      setResult(res.data.data);
      setSearchParams({ a: slotA, b: slotB }, { replace: true });
    } catch (err) {
      setFormError(errorMessage(err, "AI tahlilida xatolik yuz berdi. Qayta urinib ko'ring."));
    } finally {
      setComparing(false);
    }
  }

  function reset() {
    setResult(null);
    setFormError("");
    setSlotA("");
    setSlotB("");
    setUserGoal("");
    setDistrict("");
    setMaxBudget("");
    setSearchParams({}, { replace: true });
  }

  const sourceLabel = useMemo(() => {
    if (!result) return "";
    return result.source === "gemini-ai" ? "Gemini AI" : "Aqlli algoritm (heuristika)";
  }, [result]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#070b0a] text-white">
      {/* Fon nurli dog'lar (Cyber-Glass muhiti) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-amber-400/10 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-400/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Sarlavha */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-300">
            ⚖ AI Arbitr · Xolis taqqoslash
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ikki to'garakni AI bilan{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-amber-300 bg-clip-text text-transparent">
              xolisona solishtiring
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
            Maqsadingiz va byudjetingizni yozing — AI soatbay narx, guruh sig'imi, ustoz tajribasi va
            imtihon natijalarini taqqoslab, qat'iy hukm chiqaradi.
          </p>
        </div>

        {/* Natija */}
        {result && (
          <div ref={resultRef} className="mt-12 scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold">AI Yakuniy Hukmi</h2>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] text-white/50">
                Manba: {sourceLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ResultCard data={result.circleA} isWinner={result.winner === "A"} accent="emerald" />
              <ResultCard data={result.circleB} isWinner={result.winner === "B"} accent="amber" />
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] p-6 backdrop-blur-xl">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-emerald-300">
                ⚖ Hukm sababi
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/85 sm:text-base">
                {result.verdict}
              </p>
            </div>

            {winnerCircle && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={openTrial}
                  disabled={trialLoading}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 py-4 font-display text-base font-extrabold text-[#06231c] shadow-[0_0_50px_-12px_rgba(52,211,153,0.6)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-12"
                >
                  {trialLoading ? "Yuklanmoqda..." : "🎯 Bepul Sinov Dars Band qilish"}
                </button>
                <p className="text-center text-xs text-white/45">
                  G&apos;olib to&apos;garakda bepul daraja aniqlash testi (Placement Test) — ariza to&apos;g&apos;ridan-to&apos;g&apos;ri markaz ma&apos;muriga yuboriladi
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <h3 className="text-sm font-bold uppercase tracking-wide text-amber-300">💰 Byudjet tahlili</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{result.budgetAnalysis || "—"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-300">🎯 Tavsiya</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{result.recommendation || "—"}</p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-white/40">
              G'olib: <span className="font-bold text-amber-300">{result.winnerName}</span> · Bu hukm AI
              tomonidan bazadagi rasmiy raqamlar asosida chiqarildi.
            </p>

            <div className="mt-6 flex justify-center">
              <button
                onClick={reset}
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:border-emerald-400/50 hover:bg-white/10"
              >
                ↺ Qayta solishtirish
              </button>
            </div>
          </div>
        )}

        {/* Forma */}
        {!result && (
          <form onSubmit={handleSubmit} className="mt-10">
            <div className="relative">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CircleSlot
                  label="A"
                  accent="emerald"
                  circles={circles}
                  value={slotA}
                  onChange={setSlotA}
                  disabled={listLoading || comparing}
                />
                <CircleSlot
                  label="B"
                  accent="amber"
                  circles={circles}
                  value={slotB}
                  onChange={setSlotB}
                  disabled={listLoading || comparing}
                />
              </div>
              <div
                aria-hidden
                className="mx-auto my-1 hidden h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#0c1310] font-display text-sm font-extrabold text-white/70 shadow-lg sm:absolute sm:left-1/2 sm:top-1/2 sm:z-20 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:my-0 sm:flex"
              >
                VS
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:p-5">
              <label htmlFor="goal" className="text-xs font-semibold uppercase tracking-widest text-white/45">
                Maqsadingiz
              </label>
              <textarea
                id="goal"
                value={userGoal}
                onChange={(e) => setUserGoal(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Masalan: O'g'lim 6 oyda IELTS 7+ olishi kerak"
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400/60"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {GOAL_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setUserGoal(chip)}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60 transition hover:border-emerald-400/50 hover:text-emerald-300"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:p-5">
              <label htmlFor="district" className="text-xs font-semibold uppercase tracking-widest text-white/45">
                Sizga qaysi tuman qulay?
              </label>
              <select
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={comparing}
                className="dark-select mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-white outline-none transition focus:border-emerald-400/60"
              >
                <option value="">Farqi yo&apos;q — istalgan tuman</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-white/40">
                Tanlangan tuman AI hukmiga hisobga olinadi — qulay hududdagi markaz ustunlik beriladi.
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:p-5">
              <label htmlFor="budget" className="text-xs font-semibold uppercase tracking-widest text-white/45">
                Maksimal byudjet (so&apos;m/oy)
              </label>
              <input
                id="budget"
                type="number"
                min="0"
                step="10000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="750000"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400/60"
              />
            </div>

            {formError && (
              <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                ⚠ {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={comparing || listLoading}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 py-4 font-display text-base font-extrabold text-[#06231c] shadow-[0_0_50px_-12px_rgba(52,211,153,0.6)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {comparing ? "AI tahlil qilmoqda..." : "⚖ AI Hukmini olish"}
            </button>
          </form>
        )}

        {/* Yuklanmoqda holati */}
        {comparing && (
          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-6 text-center backdrop-blur-xl">
            <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
            <p className="mt-4 text-sm font-medium text-emerald-200">{LOADING_STEPS[stepIdx]}</p>
            <p className="mt-1 text-xs text-white/40">Bu odatda bir necha soniya oladi.</p>
          </div>
        )}
      </div>

      {trialCircle && <TrialLessonModal circle={trialCircle} onClose={() => setTrialCircle(null)} />}
    </div>
  );
}
