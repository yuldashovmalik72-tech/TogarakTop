import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCompare } from "../context/CompareContext.jsx";

export default function CompareTray() {
  const { items, remove, clear } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  if (items.length === 0 || location.pathname === "/taqqoslash") return null;

  const slots = [items[0] || null, items[1] || null];
  const ready = items.length === 2;

  function goCompare() {
    if (!ready) return;
    navigate(`/taqqoslash?a=${items[0].id}&b=${items[1].id}`);
  }

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4">
      <div className="flex w-full max-w-2xl flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1310]/95 px-4 py-3 text-white shadow-2xl backdrop-blur-xl">
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">Solishtirish</span>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {slots.map((item, i) => (
            <div
              key={i}
              className={`flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs ${
                item ? "border-emerald-400/40 bg-emerald-400/10" : "border-dashed border-white/20 text-white/40"
              }`}
            >
              <span className={`font-mono font-bold ${item ? "text-emerald-300" : "text-white/40"}`}>
                {i === 0 ? "A" : "B"}
              </span>
              {item ? (
                <>
                  <span className="max-w-[10rem] truncate font-medium">{item.name}</span>
                  <button
                    onClick={() => remove(item.id)}
                    aria-label="Tanlovdan olib tashlash"
                    className="text-white/50 transition hover:text-white"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <span>Kartochkadan tanlang</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={clear} className="text-xs text-white/50 transition hover:text-white">
            Tozalash
          </button>
          <button
            onClick={goCompare}
            disabled={!ready}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              ready
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-[#06231c] hover:brightness-110"
                : "cursor-not-allowed bg-white/10 text-white/40"
            }`}
          >
            ⚖ Taqqoslash →
          </button>
        </div>
      </div>
    </div>
  );
}
