import { useEffect, useState } from "react";
import api from "../lib/api.js";

export default function StatsPanel({ circleId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get(`/circles/${circleId}/stats`).then((res) => setStats(res.data.data)).catch(() => setStats(null));
  }, [circleId]);

  if (!stats) return null;

  const rows = [
    { label: "Guruhlar soni", value: stats.groupsCount },
    { label: "Jami o'rinlar", value: stats.totalCapacity },
    { label: "Band qilingan", value: stats.totalTaken },
    { label: "Bo'sh joylar", value: stats.freeSeats },
    { label: "Natijalar soni", value: stats.resultsCount },
    { label: "Video-tur", value: stats.hasVideoTour ? "bor" : "yo'q" },
  ];

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-4">
      <p className="font-display font-bold text-ink">Statistika</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="font-mono text-lg font-bold text-primary">{r.value}</p>
            <p className="text-xs text-muted">{r.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
