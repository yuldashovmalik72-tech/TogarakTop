import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setAccessToken } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((data) => {
    setAccessToken(data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  // Sahifa yangilanganda, agar eski access token muddati o'tgan bo'lsa ham,
  // refresh cookie orqali sessiyani tiklashga urinamiz.
  useEffect(() => {
    async function restore() {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data);
        localStorage.setItem("user", JSON.stringify(res.data.data));
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    }
    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function register(payload) {
    const res = await api.post("/auth/register", payload);
    persistSession(res.data.data);
    return res.data.data;
  }

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    persistSession(res.data.data);
    return res.data.data;
  }

  async function googleLogin(idToken) {
    const res = await api.post("/auth/google", { idToken });
    persistSession(res.data.data);
    return res.data.data;
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // e'tiborsiz qoldiramiz - baribir lokal sessiyani tozalaymiz
    }
    clearSession();
  }

  const setUserFromOutside = useCallback((u) => {
    setUser(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, googleLogin, logout, setUserFromOutside }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth AuthProvider ichida ishlatilishi kerak");
  return ctx;
}
