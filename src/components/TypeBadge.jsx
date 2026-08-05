const TYPE_MAP = {
  UY: { label: "Uyda", dot: "bg-accent" },
  ONLINE: { label: "Onlayn", dot: "bg-primary" },
  KURS: { label: "O'quv markazi", dot: "bg-ink-soft" },
};

export default function TypeBadge({ type }) {
  const info = TYPE_MAP[type] || { label: type, dot: "bg-muted" };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-raised px-2.5 py-1 text-xs font-medium text-ink-soft">
      <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  );
}

export { TYPE_MAP };
