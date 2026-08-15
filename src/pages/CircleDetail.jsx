import { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import { Spinner, EmptyState } from "../components/Spinner.jsx";
import TypeBadge from "../components/TypeBadge.jsx";
import StatusPill from "../components/StatusPill.jsx";
import ConfirmButton from "../components/ConfirmButton.jsx";
import GroupManager from "../components/GroupManager.jsx";
import ResultManager from "../components/ResultManager.jsx";
import VideoTourPanel from "../components/VideoTourPanel.jsx";
import StatsPanel from "../components/StatsPanel.jsx";
import { formatPrice, imageUrl, CIRCLE_STATUS_LABELS } from "../lib/format.js";

export default function CircleDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get(`/circles/${id}`)
      .then((res) => setCircle(res.data.data))
      .catch(() => setError("To'garak topilmadi yoki hali moderatsiyadan o'tmagan"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner label="Yuklanmoqda..." />;
  if (error || !circle) return <EmptyState title="Topilmadi" description={error} />;

  const isOwner = user && circle.ownerId === user.id;
  const isAdmin = user?.role === "ADMIN";
  const canManage = isOwner || isAdmin;
  const images = circle.images || [];

  async function deleteCircle() {
    try {
      await api.delete(`/circles/${circle.id}`);
      push("To'garak o'chirildi");
      navigate("/mening-togaraklarim");
    } catch (err) {
      push(errorMessage(err), "error");
    }
  }

  async function changeStatus(status) {
    try {
      await api.patch(`/circles/${circle.id}/status`, { status });
      push("Status yangilandi");
      load();
    } catch (err) {
      push(errorMessage(err), "error");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        ← Qidiruvga qaytish
      </Link>

      {/* Egasi / admin uchun boshqaruv paneli */}
      {canManage && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-paper-raised p-3">
          <StatusPill map={CIRCLE_STATUS_LABELS} value={circle.status} />
          {isOwner && (
            <>
              <Link to={`/togarak/${circle.id}/tahrirlash`} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-primary/40">
                Tahrirlash
              </Link>
              <ConfirmButton onConfirm={deleteCircle} className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger-wash">
                O'chirish
              </ConfirmButton>
            </>
          )}
          {isAdmin && circle.status === "PENDING" && (
            <>
              <button onClick={() => changeStatus("ACTIVE")} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white">
                ✓ Tasdiqlash
              </button>
              <button onClick={() => changeStatus("REJECTED")} className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white">
                ✕ Rad etish
              </button>
            </>
          )}
          
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-primary-wash">
            {images.length > 0 ? (
              <img src={imageUrl(images[activeImg])} alt={circle.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-5xl font-extrabold text-primary/25">
                {circle.direction?.[0]?.toUpperCase() || "T"}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-2 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${activeImg === i ? "border-primary" : "border-transparent"}`}
                >
                  <img src={imageUrl(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <VideoTourPanel
              videoUrl={circle.videoUrl}
              isOwner={isOwner}
              uploadUrl={`/circles/${circle.id}/video-tour`}
              onUploaded={load}
             />
          </div>

          <div className="mt-6">
            <h2 className="font-display text-lg font-bold text-ink">To'garak haqida</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{circle.description}</p>
          </div>

          <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-wash p-4">
            <h2 className="font-display text-sm font-bold text-accent-dark">Nega aynan shu to'garak?</h2>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{circle.tavsif}</p>
          </div>

          <div className="mt-8">
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Guruhlar</h2>
            <GroupManager
              circleId={circle.id}
              circleType={circle.type}
              groups={circle.groups}
              isOwner={isOwner}
              onChange={load}
            />
          </div>

          <div className="mt-8">
            <h2 className="mb-3 font-display text-lg font-bold text-ink">O'quvchilar natijalari</h2>
            <ResultManager circleId={circle.id} results={circle.results} isOwner={isOwner} onChange={load} />
          </div>

          {isOwner && (
            <div className="mt-8">
              <StatsPanel circleId={circle.id} />
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
            <TypeBadge type={circle.type} />
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-accent-dark">{circle.direction}</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight text-ink">{circle.name}</h1>

            {circle.courseCenter && (
              <Link to={`/markaz/${circle.courseCenter.id}`} className="mt-2 block text-sm font-medium text-primary hover:underline">
                {circle.courseCenter.name} →
              </Link>
            )}

            <p className="mt-4 font-mono text-xl font-bold text-primary">{formatPrice(circle)}</p>

            <dl className="mt-5 flex flex-col gap-3 border-t border-line pt-4 text-sm">
              {circle.address && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Manzil</dt>
                  <dd className="text-right text-ink-soft">{circle.address}</dd>
                </div>
              )}
              {(circle.ageGroupMin || circle.ageGroupMax) && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Yosh</dt>
                  <dd className="text-ink-soft">{circle.ageGroupMin || "0"}–{circle.ageGroupMax || "∞"} yosh</dd>
                </div>
              )}
            </dl>

            <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4">
              {circle.contactPhone && (
                <a href={`tel:${circle.contactPhone}`} className="rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white transition hover:bg-primary-dark">
                  📞 {circle.contactPhone}
                </a>
              )}
              {circle.contactTelegram && (
                <a
                  href={`https://t.me/${circle.contactTelegram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-line py-2.5 text-center text-sm font-semibold text-ink-soft transition hover:border-primary/40"
                >
                  Telegram: {circle.contactTelegram}
                </a>
              )}
              {!circle.contactPhone && !circle.contactTelegram && (
                <p className="text-center text-sm text-muted">Aloqa ma'lumoti kiritilmagan</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
