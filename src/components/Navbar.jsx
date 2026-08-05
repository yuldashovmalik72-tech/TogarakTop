import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import BrandMark from "./BrandMark.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    push("Tizimdan chiqdingiz", "info");
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <BrandMark size={26} />
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">Togarak</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                to="/togarak-yaratish"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
              >
                + To'garak yaratish
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
                      <Link onClick={() => setMenuOpen(false)} to="/profil" className="px-4 py-2 text-ink-soft hover:bg-paper">Profil</Link>
                      <Link onClick={() => setMenuOpen(false)} to="/mening-togaraklarim" className="px-4 py-2 text-ink-soft hover:bg-paper">Mening to'garaklarim</Link>
                      <Link onClick={() => setMenuOpen(false)} to="/mening-markazlarim" className="px-4 py-2 text-ink-soft hover:bg-paper">O'quv markazlarim</Link>
                      {user.role === "ADMIN" && (
                        <Link onClick={() => setMenuOpen(false)} to="/admin" className="px-4 py-2 font-medium text-accent-dark hover:bg-paper">Admin panel</Link>
                      )}
                    </nav>
                    <button
                      onClick={handleLogout}
                      className="w-full border-t border-line px-4 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger-wash"
                    >
                      Chiqish
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/kirish" className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink">
                Kirish
              </Link>
              <Link to="/royxatdan-otish" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark">
                Ro'yxatdan o'tish
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
