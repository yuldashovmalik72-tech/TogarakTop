import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import BrandMark from "../components/BrandMark.jsx";
import GoogleLoginButton from "../components/GoogleLoginButton.jsx";

export default function Register() {
  const { register, googleLogin } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ firstName: "", lastName: "", age: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({ ...form, age: form.age ? Number(form.age) : undefined });
      push("Xush kelibsiz! Hisobingiz yaratildi");
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Ro'yxatdan o'tishda xatolik yuz berdi"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle(idToken) {
    try {
      await googleLogin(idToken);
      push("Google orqali ro'yxatdan o'tdingiz");
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Google orqali kirishda xatolik"));
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <BrandMark size={36} />
        <h1 className="font-display text-2xl font-extrabold text-ink">Ro'yxatdan o'tish</h1>
        <p className="text-sm text-muted">Bir necha soniyada hisob yarating</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-6 shadow-sm">
        {error && (
          <div className="rounded-xl bg-danger-wash px-3 py-2 text-sm text-danger">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-soft">Ism</span>
            <input
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className="rounded-xl border border-line px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-soft">Familiya</span>
            <input
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className="rounded-xl border border-line px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-soft">Yosh (ixtiyoriy)</span>
          <input
            type="number"
            min="1"
            max="120"
            value={form.age}
            onChange={(e) => update("age", e.target.value)}
            className="rounded-xl border border-line px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-soft">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="rounded-xl border border-line px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-soft">Parol</span>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="rounded-xl border border-line px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            placeholder="kamida 6 belgi"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? "Yaratilmoqda..." : "Hisob yaratish"}
        </button>
      </form>

      <div className="mt-4">
        <GoogleLoginButton onCredential={handleGoogle} />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Hisobingiz bormi?{" "}
        <Link to="/kirish" className="font-medium text-primary hover:underline">
          Kiring
        </Link>
      </p>
    </div>
  );
}
