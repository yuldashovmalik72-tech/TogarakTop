import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../lib/api.js";
import SearchBar from "../components/SearchBar.jsx";
import CircleCard from "../components/CircleCard.jsx";
import { Spinner, EmptyState } from "../components/Spinner.jsx";

export default function Home() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const runSearch = useCallback(async (params) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/circles", { params });
      setItems(res.data.data.items);
    } catch {
      setError(t("home.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    runSearch({ sort: "rating" });
  }, [runSearch]);

  // Debounced query for text search
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Auto-search when filters change
  useEffect(() => {
    runSearch({
      query: debouncedQuery || undefined,
      type: type || undefined,
      category: category || undefined,
      sort: "rating",
    });
  }, [debouncedQuery, type, category, runSearch]);

  return (
    <div>
      <section className="border-b border-line bg-gradient-to-b from-primary-wash/60 to-paper px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {t("home.title").split(" ").slice(0, 3).join(" ")} <span className="text-primary">{t("home.title").split(" ").slice(3).join(" ")}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-soft sm:text-lg">
            {t("home.subtitle")}
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar
              query={query}
              setQuery={setQuery}
              type={type}
              setType={setType}
              category={category}
              setCategory={setCategory}
            />
          </div>

          <Link
            to="/taqqoslash"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-paper-raised px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-primary/50 hover:text-primary"
          >
            ⚖ {t("home.aiCompare")}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {loading && <Spinner label={t("home.loading")} />}

        {!loading && error && (
          <EmptyState title="Xatolik yuz berdi" description={error} />
        )}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            title={t("home.empty")}
            description={t("home.emptyDesc")}
          />
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <p className="mb-4 text-sm text-muted">{items.length} {t("home.found")}</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((c) => (
                <CircleCard key={c.id} circle={c} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
