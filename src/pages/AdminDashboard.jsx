import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import { Spinner, EmptyState } from "../components/Spinner.jsx";
import TypeBadge from "../components/TypeBadge.jsx";
import { imageUrl, formatDate } from "../lib/format.js";

const TABS = [
  { key: "circles", label: "To'garaklar" },
  { key: "certificates", label: "Sertifikatlar" },
  { key: "results", label: "Natijalar" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("circles");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">Admin panel</h1>
      <p className="mt-1 text-sm text-muted">Moderatsiya kutayotgan barcha kontent shu yerda</p>

      <div className="mt-6 flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "circles" && <PendingCircles />}
        {tab === "certificates" && <PendingCertificates />}
        {tab === "results" && <PendingResults />}
      </div>
    </div>
  );
}

function PendingCircles() {
  const { push } = useToast();
  const [items, setItems] = useState(null);

  function load() {
    api.get("/circles/pending").then((res) => setItems(res.data.data)).catch(() => setItems([]));
  }
  useEffect(load, []);

  async function act(id, status) {
    try {
      await api.patch(`/circles/${id}/status`, { status });
      push(status === "ACTIVE" ? "Tasdiqlandi" : "Rad etildi");
      load();
    } catch (err) {
      push(errorMessage(err), "error");
    }
  }

  if (items === null) return <Spinner />;
  if (items.length === 0) return <EmptyState title="Navbat bo'sh" description="Tekshirilishi kerak bo'lgan to'garaklar yo'q" />;

  return (
    <div className="flex flex-col gap-3">
      {items.map((c) => (
        <div key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper-raised p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <TypeBadge type={c.type} />
              <span className="text-xs text-muted">{c._count?.groups ?? 0} ta guruh</span>
            </div>
            <Link to={`/togarak/${c.id}`} className="mt-1 block truncate font-display font-bold text-ink hover:text-primary">
              {c.name}
            </Link>
            <p className="text-xs text-muted">{c.owner?.firstName} {c.owner?.lastName} · {c.owner?.email}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={() => act(c.id, "ACTIVE")} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white">✓ Tasdiqlash</button>
            <button onClick={() => act(c.id, "REJECTED")} className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white">✕ Rad etish</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingCertificates() {
  const { push } = useToast();
  const [items, setItems] = useState(null);

  function load() {
    api.get("/certificates/pending").then((res) => setItems(res.data.data)).catch(() => setItems([]));
  }
  useEffect(load, []);

  async function act(id, verified) {
    try {
      await api.patch(`/certificates/${id}/verify`, { verified });
      push(verified ? "Tasdiqlandi" : "Rad etildi");
      load();
    } catch (err) {
      push(errorMessage(err), "error");
    }
  }

  if (items === null) return <Spinner />;
  if (items.length === 0) return <EmptyState title="Navbat bo'sh" description="Tekshirilishi kerak bo'lgan sertifikat yo'q" />;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((c) => (
        <div key={c.id} className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
          <img src={imageUrl(c.imageUrl)} alt={c.title} className="aspect-video w-full object-cover" />
          <div className="p-3">
            <p className="text-sm font-semibold text-ink">{c.title}</p>
            <Link to={`/togarak/${c.group?.circle?.id}`} className="text-xs text-primary hover:underline">
              {c.group?.circle?.name}
            </Link>
            <div className="mt-2 flex gap-2">
              <button onClick={() => act(c.id, true)} className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-white">✓</button>
              <button onClick={() => act(c.id, false)} className="flex-1 rounded-lg bg-danger py-1.5 text-xs font-semibold text-white">✕</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingResults() {
  const { push } = useToast();
  const [items, setItems] = useState(null);

  function load() {
    api.get("/results/pending").then((res) => setItems(res.data.data)).catch(() => setItems([]));
  }
  useEffect(load, []);

  async function act(id, verified) {
    try {
      await api.patch(`/results/${id}/verify`, { verified });
      push(verified ? "Tasdiqlandi" : "Rad etildi");
      load();
    } catch (err) {
      push(errorMessage(err), "error");
    }
  }

  if (items === null) return <Spinner />;
  if (items.length === 0) return <EmptyState title="Navbat bo'sh" description="Tekshirilishi kerak bo'lgan natija yo'q" />;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((r) => (
        <div key={r.id} className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
          <img src={imageUrl(r.imageUrl)} alt={r.title} className="aspect-square w-full object-cover" />
          <div className="p-3">
            <p className="text-sm font-semibold text-ink">{r.title}</p>
            <Link to={`/togarak/${r.circle?.id}`} className="text-xs text-primary hover:underline">
              {r.circle?.name}
            </Link>
            <p className="text-xs text-muted">{formatDate(r.createdAt)}</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => act(r.id, true)} className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-white">✓</button>
              <button onClick={() => act(r.id, false)} className="flex-1 rounded-lg bg-danger py-1.5 text-xs font-semibold text-white">✕</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
