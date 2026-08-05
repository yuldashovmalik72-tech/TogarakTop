import { CATEGORY_OPTIONS } from "../lib/format.js";

const TYPES = [
  { value: "", label: "Barchasi" },
  { value: "UY", label: "Uyda" },
  { value: "ONLINE", label: "Onlayn" },
  { value: "KURS", label: "O'quv markazi" },
];

export default function SearchBar({ query, setQuery, type, setType, category, setCategory, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-paper-raised p-2 shadow-sm">
        <svg
          className="ml-2 h-5 w-5 shrink-0 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Masalan: ingliz tili, shaxmat, dasturlash..."
          className="flex-1 bg-transparent py-2 text-base text-ink placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Qidirish
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              type === t.value
                ? "border-primary bg-primary text-white"
                : "border-line bg-paper-raised text-ink-soft hover:border-primary/40"
            }`}
          >
            {t.label}
          </button>
        ))}

        <span className="mx-1 h-4 w-px bg-line" />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-line bg-paper-raised px-3 py-1.5 text-xs font-medium text-ink-soft focus:outline-none"
        >
          <option value="">Barcha yo'nalishlar</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
