import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import BrandMark from "./BrandMark.jsx";

const LANGUAGES = [
  { code: "uz", label: "O'zbek" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const menuRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function changeLanguage(code) {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
    setLangOpen(false);
  }

  async function handleLogout() {
    await logout();
    push(t("nav.logout"), "info");
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <BrandMark size={26} />
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">Velox</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/taqqoslash"
            className="rounded-full px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-primary-wash hover:text-primary"
          >
            ⚖ {t("nav.compare")}
          </Link>
          <Link
            to="/xarita"
            className="rounded-full px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-primary-wash hover:text-primary"
          >
            📍 {t("nav.map")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Til tanlash */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-paper-raised px-3 text-sm font-medium text-ink-soft transition hover:border-primary/40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {i18n.language.toUpperCase()}
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-line bg-paper-raised shadow-lg">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-paper ${
                      i18n.language === lang.code ? "font-semibold text-primary" : "text-ink-soft"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              <Link
                to="/togarak-yaratish"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
              >
                + {t("nav.create")}
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-wash font-display text-sm font-bold text-primary"
                >
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-lg">
                    <div className="border-b border-line px-4 py-3">
                      <p className="truncate text-sm font-semibold text-ink">{user.firstName} {user.lastName}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                    <nav className="flex flex-col py-1 text-sm">
                      <Link onClick={() => setMenuOpen(false)} to="/profil" className="px-4 py-2 text-ink-soft hover:bg-paper">{t("nav.profile")}</Link>
                      <Link onClick={() => setMenuOpen(false)} to="/mening-togaraklarim" className="px-4 py-2 text-ink-soft hover:bg-paper">{t("nav.myCircles")}</Link>
                      <Link onClick={() => setMenuOpen(false)} to="/mening-markazlarim" className="px-4 py-2 text-ink-soft hover:bg-paper">{t("nav.myCenters")}</Link>
                      {user.role === "ADMIN" && (
                        <Link onClick={() => setMenuOpen(false)} to="/admin" className="px-4 py-2 font-medium text-accent-dark hover:bg-paper">{t("nav.admin")}</Link>
                      )}
                    </nav>
                    <button
                      onClick={handleLogout}
                      className="w-full border-t border-line px-4 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger-wash"
                    >
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/kirish" className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink">
                {t("nav.login")}
              </Link>
              <Link to="/royxatdan-otish" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark">
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
