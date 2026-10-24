import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  timeout: 15000, // 15 soniya timeout (Render cold start uchun)
});

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function setAccessToken(token) {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshingPromise = null;

// Access token muddati tugasa (401), avtomatik ravishda refresh token orqali
// yangi token olib, so'rovni bir marta qayta yuboradi. Foydalanuvchi bu jarayonni
// sezmaydi - login sahifasiga tashlab yuborilmaydi, agar refresh ham muddati
// o'tmagan bo'lsa.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthRoute = original?.url?.includes("/auth/login") || original?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        if (!refreshingPromise) {
          refreshingPromise = api.post("/auth/refresh").then((res) => {
            const newToken = res.data?.data?.accessToken;
            setAccessToken(newToken);
            return newToken;
          }).finally(() => {
            refreshingPromise = null;
          });
        }
        const newToken = await refreshingPromise;
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        setAccessToken(null);
        localStorage.removeItem("user");
        window.location.href = "/kirish";
      }
    }
    return Promise.reject(error);
  }
);

export { getAccessToken, setAccessToken };
export default api;
