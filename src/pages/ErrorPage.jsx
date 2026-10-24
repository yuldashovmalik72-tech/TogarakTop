import { Link } from "react-router-dom";
import BrandMark from "../components/BrandMark.jsx";

/**
 * 404 va boshqa xatoliklar uchun umumiy sahifa.
 *
 * @param {number} [code=404]
 * @param {string} [title]
 * @param {string} [description]
 */
export default function ErrorPage({
  code = 404,
  title,
  description,
}) {
  const status = code ?? 404;

  let heading = title;
  let message = description;

  if (!heading) {
    if (status === 404) heading = "Sahifa topilmadi";
    else if (status === 403) heading = "Ruxsat yo'q";
    else if (status >= 500) heading = "Server xatosi";
    else heading = "Xatolik yuz berdi";
  }

  if (!message) {
    if (status === 404) {
      message =
        "Siz qidirgan sahifa mavjud emas yoki ko‘chirib yuborilgan. Bosh sahifaga qaytib qayta urinib ko‘ring.";
    } else if (status === 403) {
      message = "Bu sahifani ko‘rish uchun ruxsatingiz yetarli emas.";
    } else if (status >= 500) {
      message = "Serverda muammo yuz berdi. Bir ozdan keyin qayta urinib ko‘ring.";
    } else {
      message = "Kutilmagan xatolik yuz berdi. Bosh sahifaga qayting.";
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex items-center gap-2 opacity-80">
        <BrandMark size={32} />
        <span className="font-display text-xl font-extrabold text-ink">PathFinder</span>
      </div>

      <p className="font-mono text-6xl font-bold tracking-tight text-primary/25 sm:text-7xl">
        {status}
      </p>

      <h1 className="mt-3 font-display text-2xl font-extrabold text-ink sm:text-3xl">
        {heading}
      </h1>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
        {message}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          ← Bosh sahifa
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center rounded-xl border border-line bg-paper-raised px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-primary/40 hover:text-primary"
        >
          Orqaga qaytish
        </button>
      </div>
    </div>
  );
}

/** 404 uchun qulay wrapper */
export function NotFound() {
  return (
    <ErrorPage
      code={404}
      title="Sahifa topilmadi"
      description="Siz qidirgan sahifa mavjud emas yoki ko‘chirib yuborilgan. Bosh sahifaga qaytib qayta urinib ko‘ring."
    />
  );
}
