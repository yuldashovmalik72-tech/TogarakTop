import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TypeBadge from "./TypeBadge.jsx";
import { formatPrice, imageUrl } from "../lib/format.js";
import { useCompare } from "../context/CompareContext.jsx";

export default function CircleCard({ circle }) {
  const { t } = useTranslation();
  const { toggle, isActive } = useCompare();
  const cover = circle.images?.[0] ? imageUrl(circle.images[0]) : null;
  const inCompare = isActive(circle.id);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper-raised transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
      <Link
        to={`/togarak/${circle.id}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-primary-wash"
      >
        {cover ? (
          <img
            src={cover}
            alt={circle.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-3xl font-extrabold text-primary/30">
              {circle.direction?.[0]?.toUpperCase() || "T"}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          {circle.type && <TypeBadge type={circle.type} />}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">{circle.direction}</p>
        <h3 className="font-display text-base font-bold leading-snug text-ink">{circle.name}</h3>
        {circle.courseCenter && (
          <p className="text-sm text-muted">{circle.courseCenter.name}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-mono text-sm font-semibold text-primary">{formatPrice(circle)}</span>
          {circle.address && <span className="max-w-[45%] truncate text-xs text-muted">{circle.address}</span>}
        </div>
        <button
          onClick={() => toggle(circle)}
          className={`mt-2 w-full rounded-xl border py-2 text-xs font-bold transition ${
            inCompare
              ? "border-primary/50 bg-primary-wash text-primary"
              : "border-line text-ink-soft hover:border-primary/40 hover:text-primary"
          }`}
        >
          {inCompare ? "✓ Solishtirishda tanlangan" : ` ${t("addToCompare")}`}
        </button>
      </div>
    </div>
  );
}
