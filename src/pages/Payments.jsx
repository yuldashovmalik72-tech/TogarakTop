import { Link } from "react-router-dom";

/** To'lov tizimi o'chirilgan — startup bepul */
export default function Payments() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-display text-xl font-bold text-ink">To'lovlar o'chirilgan</h1>
      <p className="mt-2 text-sm text-muted">
        Startup bosqichida barcha xizmatlar bepul. Video-tur va boshqa imkoniyatlar to'lovsiz.
      </p>
      <Link to="/" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
        Bosh sahifa
      </Link>
    </div>
  );
}
