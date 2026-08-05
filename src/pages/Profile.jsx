import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import api from "../lib/api.js";

export default function Profile() {
  const { user, setUserFromOutside } = useAuth();
  const { push } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    age: user?.age ?? "",
  });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const links = [
    { to: "/mening-togaraklarim", label: "Mening to'garaklarim", desc: "Yaratgan to'garaklaringiz" },
    { to: "/mening-markazlarim", label: "O'quv markazlarim", desc: "Kurs markazlari" },
    { to: "/togarak-yaratish", label: "Yangi to'garak", desc: "E'lon qo'shish" },
  ];
  if (user.role === "ADMIN") {
    links.push({ to: "/admin", label: "Admin panel", desc: "Moderatsiya" });
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch("/auth/me", {
        firstName: form.firstName,
        lastName: form.lastName,
        age: form.age === "" ? null : Number(form.age),
      });
      const updated = res.data.data;
      localStorage.setItem("user", JSON.stringify(updated));
      if (setUserFromOutside) setUserFromOutside(updated);
      push("Profil yangilandi");
      setEditing(false);
    } catch (err) {
      push(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/auth/change-password", pwd);
      push("Parol o'zgartirildi. Qayta kiring");
      setPwd({ currentPassword: "", newPassword: "" });
    } catch (err) {
      push(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-wash font-display text-xl font-bold text-primary">
          {user.firstName?.[0]}
          {user.lastName?.[0]}
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-muted">{user.email}</p>
          {user.role === "ADMIN" && (
            <span className="mt-1 inline-block rounded-full bg-accent-wash px-2 py-0.5 text-xs font-semibold text-accent-dark">
              Admin
            </span>
          )}
          {!user.isVerified && (
            <span className="mt-1 ml-1 inline-block rounded-full bg-danger-wash px-2 py-0.5 text-xs text-danger">
              Email tasdiqlanmagan
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-paper-raised p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display font-bold text-ink">Profil</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-xs font-medium text-primary hover:underline">
              Tahrirlash
            </button>
          )}
        </div>
        {editing ? (
          <form onSubmit={saveProfile} className="flex flex-col gap-3">
            <input
              className="rounded-xl border border-line px-3 py-2 text-sm"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              placeholder="Ism"
              required
            />
            <input
              className="rounded-xl border border-line px-3 py-2 text-sm"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              placeholder="Familiya"
              required
            />
            <input
              type="number"
              className="rounded-xl border border-line px-3 py-2 text-sm"
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              placeholder="Yosh"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white">
                Saqlash
              </button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-line px-4 py-2 text-xs">
                Bekor
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted">
            Yosh: {user.age ?? "—"} · Rol: {user.role}
          </p>
        )}
      </div>

      {user.password !== undefined || true ? (
        <form onSubmit={changePassword} className="mt-4 rounded-2xl border border-line bg-paper-raised p-4">
          <h2 className="mb-3 font-display font-bold text-ink">Parolni almashtirish</h2>
          <div className="flex flex-col gap-2">
            <input
              type="password"
              placeholder="Joriy parol"
              value={pwd.currentPassword}
              onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
              className="rounded-xl border border-line px-3 py-2 text-sm"
              required
            />
            <input
              type="password"
              placeholder="Yangi parol (min 6)"
              minLength={6}
              value={pwd.newPassword}
              onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
              className="rounded-xl border border-line px-3 py-2 text-sm"
              required
            />
            <button type="submit" disabled={saving} className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-white">
              Parolni saqlash
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-4 flex flex-col gap-2">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="flex items-center justify-between rounded-2xl border border-line bg-paper-raised p-4 hover:border-primary/40"
          >
            <div>
              <p className="font-medium text-ink">{l.label}</p>
              <p className="text-sm text-muted">{l.desc}</p>
            </div>
            <span className="text-muted">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
