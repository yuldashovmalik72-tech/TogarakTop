import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "./ToastContext.jsx";

const STORAGE_KEY = "togarak-compare";
const MAX_COMPARE = 2;

const CompareContext = createContext(null);

// Kartochka / sahifa ma'lumotini tray uchun yengil ko'rinishga keltiradi
export function toCompareItem(circle) {
  if (!circle) return null;
  return {
    id: circle.id,
    name: circle.name,
    centerName: circle.courseCenter?.name || circle.centerName || "",
    priceAmount: circle.priceAmount ?? circle.monthlyPrice ?? null,
    priceType: circle.priceType,
    currency: circle.currency,
    pricePeriod: circle.pricePeriod,
    address: circle.address || "",
  };
}

export function CompareProvider({ children }) {
  const { push } = useToast();
  const [items, setItems] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // sessionStorage mavjud bo'lmasa jim o'tkazamiz
    }
  }, [items]);

  const toggle = useCallback(
    (circle) => {
      const item = toCompareItem(circle);
      if (!item) return;
      setItems((prev) => {
        if (prev.some((c) => c.id === item.id)) {
          return prev.filter((c) => c.id !== item.id);
        }
        if (prev.length >= MAX_COMPARE) {
          push(`Bir vaqtda faqat ${MAX_COMPARE} ta to'garak solishtiriladi`, "info");
          return prev;
        }
        return [...prev, item];
      });
    },
    [push]
  );

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      toggle,
      remove,
      clear,
      isActive: (id) => items.some((c) => c.id === id),
      isFull: items.length >= MAX_COMPARE,
    }),
    [items, toggle, remove, clear]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare CompareProvider ichida ishlatilishi kerak");
  return ctx;
}
