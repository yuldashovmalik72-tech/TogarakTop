import { useEffect, useState, useCallback } from "react";
import api from "../lib/api.js";
import SearchBar from "../components/SearchBar.jsx";
import CircleCard from "../components/CircleCard.jsx";
import { Spinner, EmptyState } from "../components/Spinner.jsx";

export default function Home() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = useCallback(async (params) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/circles", { params });
      setItems(res.data.data.items);
    } catch {
      setError("Qidiruvda xatolik yuz berdi. Internetni tekshirib, qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch({});
  }, [runSearch]);

  function handleSubmit(e) {
    e.preventDefault();
    setHasSearched(true);
    runSearch({
      query: query || undefined,
      type: type || undefined,
      category: category || undefined,
    });
  }

  return (
    <div>
      <section className="border-b border-line bg-gradient-to-b from-primary-wash/60 to-paper px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Farzandingiz uchun <span className="text-primary">to'g'ri to'garak</span>ni toping
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-soft sm:text-lg">
            Ingliz tilidan shaxmatgacha — yaqiningizdagi va onlayn to'garaklarni bir joydan qidiring, solishtiring, tanlang.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar
              query={query}
              setQuery={setQuery}
              type={type}
              setType={setType}
              category={category}
              setCategory={setCategory}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {loading && <Spinner label="To'garaklar qidirilmoqda..." />}

        {!loading && error && (
          <EmptyState title="Xatolik yuz berdi" description={error} />
        )}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            title={hasSearched ? "Hech narsa topilmadi" : "Hozircha to'garaklar yo'q"}
            description={
              hasSearched
                ? "Boshqa kalit so'z yoki filtr bilan qayta urinib ko'ring."
                : "Birinchi bo'lib o'z to'garagingizni qo'shing."
            }
          />
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <p className="mb-4 text-sm text-muted">{items.length} ta to'garak topildi</p>
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
