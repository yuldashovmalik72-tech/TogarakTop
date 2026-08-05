import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";
import { Spinner, EmptyState } from "../components/Spinner.jsx";
import TypeBadge from "../components/TypeBadge.jsx";
import { formatPrice, imageUrl } from "../lib/format.js";

const STATUS_MAP = {
  PENDING: { label: "Tekshirilmoqda", cls: "bg-accent-wash text-accent-dark" },
  ACTIVE: { label: "Faol", cls: "bg-primary-wash text-primary" },
  INACTIVE: { label: "O'chirilgan", cls: "bg-line text-muted" },
  REJECTED: { label: "Rad etilgan", cls: "bg-danger-wash text-danger" },
  ARCHIVED: { label: "Arxivlangan", cls: "bg-line text-muted" },
};

export default function MyCircles() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/circles/mine")
      .then((res) => setItems(res.data.data))
      .catch(() => setError("Ma'lumotlarni yuklab bo'lmadi"));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-ink">Mening to'garaklarim</h1>
        <Link
          to="/togarak-yaratish"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          + Yangi to'garak
        </Link>
      </div>

      {items === null && !error && <Spinner />}
      {error && <EmptyState title="Xatolik" description={error} />}

      {items?.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="Hali to'garak yaratmagansiz"
            description="Birinchi to'garagingizni qo'shib, o'quvchilarga yetib boring."
          />
        </div>
      )}

      {items?.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {items.map((c) => {
            const status = STATUS_MAP[c.status] || { label: c.status, cls: "bg-line text-muted" };
            return (
              <Link
                key={c.id}
                to={`/togarak/${c.id}`}
                className="flex items-center gap-4 rounded-2xl border border-line bg-paper-raised p-4 transition hover:border-primary/40"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-primary-wash">
                  {c.images?.[0] ? (
                    <img src={imageUrl(c.images[0])} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display font-bold text-primary/30">
                      {c.direction?.[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <TypeBadge type={c.type} />
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-display font-bold text-ink">{c.name}</p>
                  <p className="text-sm text-muted">{c._count?.groups ?? 0} ta guruh · {formatPrice(c)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
