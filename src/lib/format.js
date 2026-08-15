import { API_BASE } from "./api.js";

export function formatPrice(circle) {
  if (!circle) return "";
  if (circle.priceType === "FREE") return "Bepul";
  if (circle.priceType === "NEGOTIABLE") return "Kelishilgan holda";
  if (!circle.priceAmount) return "Narx ko'rsatilmagan";

  const amount = new Intl.NumberFormat("uz-UZ").format(circle.priceAmount);
  const currency = circle.currency === "USD" ? "$" : "so'm";
  const periodMap = {
    MONTHLY: "/oy",
    WEEKLY: "/hafta",
    ONE_TIME: "",
    PER_LESSON: "/dars",
  };
  const period = periodMap[circle.pricePeriod] ?? "";
  return `${amount} ${currency}${period}`;
}

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

export function formatSchedule(schedule) {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) return "Jadval kiritilmagan";
  return schedule.map((s) => `${s.day} ${s.start}–${s.end}`).join(", ");
}

export const CATEGORY_OPTIONS = [
  "Til o'rganish",
  "Matematika",
  "IT va dasturlash",
  "San'at",
  "Musiqa",
  "Sport",
  "Raqs",
  "Robototexnika",
  "Shaxmat",
  "Boshqa",
];

export const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

export const FEATURE_LABELS = {
  VIDEO_TOUR: "To'liq video (xonalar sharhi)",
  ANALYTICS: "Kengaytirilgan statistika",
  PROMO: "Qidiruvda yuqorida chiqish",
};

export const FEATURE_PRICES = { VIDEO_TOUR: 0, ANALYTICS: 0, PROMO: 0 };

export const PROVIDER_LABELS = {
  CLICK: "Click",
  PAYME: "Payme",
  UZUM: "Uzum Bank",
  ALIF: "Alif",
  PAYNET: "Paynet",
};

export const CIRCLE_STATUS_LABELS = {
  PENDING: { label: "Tekshirilmoqda", cls: "bg-accent-wash text-accent-dark" },
  ACTIVE: { label: "Faol", cls: "bg-primary-wash text-primary" },
  INACTIVE: { label: "O'chirilgan", cls: "bg-line text-muted" },
  REJECTED: { label: "Rad etilgan", cls: "bg-danger-wash text-danger" },
  ARCHIVED: { label: "Arxivlangan", cls: "bg-line text-muted" },
};

export const PAYMENT_STATUS_LABELS = {
  PENDING: { label: "Kutilmoqda", cls: "bg-accent-wash text-accent-dark" },
  SUCCESS: { label: "To'landi", cls: "bg-primary-wash text-primary" },
  FAILED: { label: "Muvaffaqiyatsiz", cls: "bg-danger-wash text-danger" },
  CANCELLED: { label: "Bekor qilingan", cls: "bg-line text-muted" },
};

export function formatDate(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(iso));
}

export function formatMoney(amount, currency = "UZS") {
  const formatted = new Intl.NumberFormat("uz-UZ").format(amount);
  return currency === "USD" ? `$${formatted}` : `${formatted} so'm`;
}
