import { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import { Spinner, EmptyState } from "../components/Spinner.jsx";
import ConfirmButton from "../components/ConfirmButton.jsx";
import VideoTourPanel from "../components/VideoTourPanel.jsx";
import CircleCard from "../components/CircleCard.jsx";
import { imageUrl } from "../lib/format.js";

export default function CourseCenterDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [center, setCenter] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.get(`/course-centers/${id}`).then((res) => setCenter(res.data.data)).catch(() => setError("Markaz topilmadi"));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (error) return <EmptyState title="Topilmadi" description={error} />;
  if (!center) return <Spinner />;

  const isOwner = user && center.ownerId === user.id;
  const groups = (center.circles || []).flatMap((c) => c.groups || []);
  const teachers = [...new Set(groups.map((g) => g.teacherName).filter(Boolean))];

  function startEdit() {
    setDraft({
      name: center.name,
      description: center.description || "",
      address: center.address || "",
      contactPhone: center.contactPhone || "",
      contactTelegram: center.contactTelegram || "",
    });
    setEditing(true);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      await api.patch(`/course-centers/${id}`, draft);
      push("Markaz yangilandi");
      setEditing(false);
      load();
    } catch (err) {
      push(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await api.delete(`/course-centers/${id}`);
      push("Markaz o'chirildi");
      navigate("/mening-markazlarim");
    } catch (err) {
      push(errorMessage(err), "error");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        ← Qidiruvga qaytish
      </Link>

      <div className="rounded-2xl border border-line bg-paper-raised p-6">
        {!editing ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {center.images?.[0] && (
                <img src={imageUrl(center.images[0])} alt="" className="h-16 w-16 rounded-xl object-cover" />
              )}
              <div>
                <h1 className="font-display text-2xl font-extrabold text-ink">{center.name}</h1>
                {center.address && <p className="mt-1 text-sm text-muted">{center.address}</p>}
                <div className="mt-2 flex gap-3 text-sm text-ink-soft">
                  {center.contactPhone && <span>📞 {center.contactPhone}</span>}
                  {center.contactTelegram && <span>✈ {center.contactTelegram}</span>}
                </div>
              </div>
            </div>
            {isOwner && (
              <div className="flex shrink-0 gap-2">
                <button onClick={startEdit} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-primary/40">
                  Tahrirlash
                </button>
                <ConfirmButton onConfirm={remove} className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger-wash">
                  O'chirish
                </ConfirmButton>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Nomi" className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            <textarea value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Tavsif" rows={2} className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            <input value={draft.address} onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))} placeholder="Manzil" className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input value={draft.contactPhone} onChange={(e) => setDraft((d) => ({ ...d, contactPhone: e.target.value }))} placeholder="Telefon" className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              <input value={draft.contactTelegram} onChange={(e) => setDraft((d) => ({ ...d, contactTelegram: e.target.value }))} placeholder="Telegram" className="rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={saveEdit} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
              <button onClick={() => setEditing(false)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-soft">
                Bekor qilish
              </button>
            </div>
          </div>
        )}

        {center.description && !editing && (
          <p className="mt-4 whitespace-pre-line text-sm text-ink-soft">{center.description}</p>
        )}

        {teachers.length > 0 && !editing && (
          <div className="mt-4 rounded-xl bg-primary-wash p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">👥 Ustozlar jamoasi</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">
              {teachers.length} nafar ustoz, {groups.length} ta guruh
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{teachers.join(" · ")}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <VideoTourPanel
          videoUrl={center.tourVideoUrl}
          isOwner={isOwner}
          uploadUrl={`/course-centers/${center.id}/video-tour`}
          onUploaded={load}
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Yo'nalishlar</h2>
        {center.circles?.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {center.circles.map((c) => (
              <CircleCard key={c.id} circle={c} />
            ))}
          </div>
        ) : (
          <EmptyState title="Hali yo'nalish yo'q" description="Bu markazga tegishli faol yo'nalishlar hozircha ko'rsatilmagan." />
        )}
      </div>
    </div>
  );
}
