import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CATEGORY_OPTIONS } from "../lib/format.js";

export default function SearchBar({ query, setQuery, type, setType, category, setCategory }) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef(null);

  const TYPES = [
    { value: "", label: t("home.all") },
    { value: "UY", label: t("home.atHome") },
    { value: "ONLINE", label: t("home.online") },
    { value: "KURS", label: t("home.courseCenter") },
  ];

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
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
          onClick={() => setFocused(true)}
          type="text"
          placeholder={t("home.searchPlaceholder")}
          className="flex-1 bg-transparent py-2 text-base text-ink placeholder:text-muted focus:outline-none"
        />
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
      </div>

      {focused && (
        <div className="absolute left-0 right-0 z-10 mt-2 rounded-xl border border-line bg-paper-raised p-3 shadow-lg">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("directions")}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setCategory(""); setFocused(false); }}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                !category ? "border-primary bg-primary text-white" : "border-line text-ink-soft hover:border-primary/40"
              }`}
            >
              {t("home.all")}
            </button>
            {CATEGORY_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setCategory(c); setFocused(false); }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  category === c ? "border-primary bg-primary text-white" : "border-line text-ink-soft hover:border-primary/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
