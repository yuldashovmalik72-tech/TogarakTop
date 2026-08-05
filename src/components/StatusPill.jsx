export default function StatusPill({ map, value }) {
  const info = map[value] || { label: value, cls: "bg-line text-muted" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${info.cls}`}>{info.label}</span>;
}
