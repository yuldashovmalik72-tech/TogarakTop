// "To'garak" so'zining o'zi "doira" degani - shu g'oyani haqiqiy
// ma'lumotga (bo'sh joylar nisbati) aylantiruvchi kichik doira grafik.
export default function CapacityRing({ taken = 0, max = 0, size = 40 }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(taken / max, 1) : 0;
  const offset = circumference * (1 - ratio);
  const isFull = max > 0 && taken >= max;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isFull ? "var(--color-danger)" : "var(--color-primary)"}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-ink-soft">
        {max > 0 ? `${Math.max(max - taken, 0)}` : "—"}
      </span>
    </div>
  );
}
