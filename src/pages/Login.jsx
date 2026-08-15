import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import BrandMark from "../components/BrandMark.jsx";
import GoogleLoginButton from "../components/GoogleLoginButton.jsx";

export default function Login() {
  const { login, googleLogin } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      push("Xush kelibsiz!");
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Email yoki parol noto'g'ri"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle(idToken) {
    try {
      await googleLogin(idToken);
      push("Google orqali kirdingiz");
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Google orqali kirishda xatolik"));
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <BrandMark size={36} />
        <h1 className="font-display text-2xl font-extrabold text-ink">Xush kelibsiz</h1>
        <p className="text-sm text-muted">Hisobingizga kirib, to'garaklarni boshqaring</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-6 shadow-sm">
        {error && (
          <div className="rounded-xl bg-danger-wash px-3 py-2 text-sm text-danger">{error}</div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-soft">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-line px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            placeholder="siz@email.com"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-soft">Parol</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-line px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>

      <div className="mt-4">
        <GoogleLoginButton onCredential={handleGoogle} />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Hisobingiz yo'qmi?{" "}
        <Link to="/royxatdan-otish" className="font-medium text-primary hover:underline">
          Ro'yxatdan o'ting
        </Link>
      </p>
    </div>
  );
}
