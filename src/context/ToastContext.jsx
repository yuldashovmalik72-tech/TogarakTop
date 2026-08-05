import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              t.type === "error"
                ? "bg-danger text-white"
                : t.type === "info"
                ? "bg-ink text-white"
                : "bg-primary text-white"
            }`}
          >
            {t.type === "error" ? "⚠" : t.type === "info" ? "ℹ" : "✓"} {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast ToastProvider ichida ishlatilishi kerak");
  return ctx;
}

// Har xil joyda takrorlanadigan "xatolikni chiqarish" mantig'ini birlashtiradi
export function errorMessage(err, fallback = "Xatolik yuz berdi") {
  return err?.response?.data?.message || fallback;
}
