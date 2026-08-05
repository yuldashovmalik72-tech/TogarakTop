import { useState } from "react";
import api from "../lib/api.js";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import { DAYS } from "../lib/format.js";
import ConfirmButton from "./ConfirmButton.jsx";
import CapacityRing from "./CapacityRing.jsx";

const emptyDraft = { teacherName: "", teacherBio: "", maxStudents: "", schedule: [], status: "ACTIVE" };

function ScheduleEditor({ schedule, onChange }) {
  function addRow() {
    onChange([...schedule, { day: DAYS[0], start: "16:00", end: "17:30" }]);
  }
  function updateRow(i, field, value) {
    const next = [...schedule];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  }
  function removeRow(i) {
    onChange(schedule.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-ink-soft">Jadval</span>
        <button type="button" onClick={addRow} className="text-xs font-medium text-primary hover:underline">
          + Kun qo'shish
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {schedule.map((row, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <select
              value={row.day}
              onChange={(e) => updateRow(i, "day", e.target.value)}
              className="flex-1 rounded-lg border border-line px-2 py-1 text-xs focus:border-primary focus:outline-none"
            >
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="time" value={row.start} onChange={(e) => updateRow(i, "start", e.target.value)} className="rounded-lg border border-line px-2 py-1 text-xs focus:border-primary focus:outline-none" />
            <input type="time" value={row.end} onChange={(e) => updateRow(i, "end", e.target.value)} className="rounded-lg border border-line px-2 py-1 text-xs focus:border-primary focus:outline-none" />
            <button type="button" onClick={() => removeRow(i)} className="text-danger">✕</button>
          </div>
        ))}
        {schedule.length === 0 && <p className="text-xs text-muted">Kun qo'shilmagan</p>}
      </div>
    </div>
  );
}

function CertificateUploader({ groupId, certificates, onUploaded, isOwner }) {
  const { push } = useToast();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!title || !file) return push("Nom va rasm tanlang", "error");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("image", file);
      await api.post(`/groups/${groupId}/certificates`, fd);
      push("Sertifikat yuklandi, admin tasdiqlashi kutilmoqda");
      setTitle("");
      setFile(null);
      onUploaded();
    } catch (err) {
      push(errorMessage(err, "Yuklashda xatolik"), "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/certificates/${id}`);
      push("Sertifikat o'chirildi");
      onUploaded();
    } catch (err) {
      push(errorMessage(err), "error");
    }
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="mb-2 text-xs font-medium text-ink-soft">O'qituvchi sertifikatlari</p>
      <div className="flex flex-wrap gap-2">
        {certificates?.map((c) => (
          <span
            key={c.id}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
              c.verified ? "border-primary/30 bg-primary-wash text-primary" : "border-line text-muted"
            }`}
          >
            {c.verified ? "✓" : "…"} {c.title}
            {isOwner && (
              <button onClick={() => handleDelete(c.id)} className="text-danger">✕</button>
            )}
          </span>
        ))}
      </div>
      {isOwner && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            placeholder="Masalan: IELTS 8.0"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-line px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
          />
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs" />
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="rounded-lg bg-ink px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            {uploading ? "..." : "Yuklash"}
          </button>
        </div>
      )}
    </div>
  );
}

function GroupCard({ group, isOwner, onSaved, onDeleted }) {
  const { push } = useToast();
  const [draft, setDraft] = useState({
    teacherName: group.teacherName || "",
    teacherBio: group.teacherBio || "",
    maxStudents: group.maxStudents || "",
    schedule: group.schedule || [],
    status: group.status,
  });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.patch(`/groups/${group.id}`, {
        teacherName: draft.teacherName,
        teacherBio: draft.teacherBio,
        maxStudents: Number(draft.maxStudents),
        schedule: draft.schedule,
        status: draft.status,
      });
      push("Guruh yangilandi");
      setEditing(false);
      onSaved();
    } catch (err) {
      push(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await api.delete(`/groups/${group.id}`);
      push("Guruh o'chirildi");
      onDeleted();
    } catch (err) {
      push(errorMessage(err), "error");
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-4">
      {!editing ? (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display font-bold text-ink">{group.teacherName || "O'qituvchi ko'rsatilmagan"}</p>
            {group.teacherBio && <p className="mt-0.5 text-sm text-muted">{group.teacherBio}</p>}
            <p className="mt-2 font-mono text-xs text-ink-soft">
              {group.schedule?.length ? group.schedule.map((s) => `${s.day} ${s.start}-${s.end}`).join(", ") : "Jadval kiritilmagan"}
            </p>
            {isOwner && (
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => setEditing(true)} className="text-xs font-medium text-primary hover:underline">
                  Tahrirlash
                </button>
                <ConfirmButton onConfirm={remove} className="text-xs font-medium text-danger hover:underline">
                  O'chirish
                </ConfirmButton>
              </div>
            )}
          </div>
          <CapacityRing taken={group.takenStudents} max={group.maxStudents} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            placeholder="O'qituvchi ismi"
            value={draft.teacherName}
            onChange={(e) => setDraft((d) => ({ ...d, teacherName: e.target.value }))}
            className="rounded-lg border border-line px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none"
          />
          <input
            placeholder="O'qituvchi haqida (ixtiyoriy)"
            value={draft.teacherBio}
            onChange={(e) => setDraft((d) => ({ ...d, teacherBio: e.target.value }))}
            className="rounded-lg border border-line px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Guruh hajmi"
              value={draft.maxStudents}
              onChange={(e) => setDraft((d) => ({ ...d, maxStudents: e.target.value }))}
              className="w-1/2 rounded-lg border border-line px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none"
            />
            <select
              value={draft.status}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
              className="w-1/2 rounded-lg border border-line px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none"
            >
              <option value="ACTIVE">Faol - qabul bor</option>
              <option value="FULL">Joy yo'q</option>
              <option value="INACTIVE">Vaqtincha to'xtatilgan</option>
            </select>
          </div>
          <ScheduleEditor schedule={draft.schedule} onChange={(s) => setDraft((d) => ({ ...d, schedule: s }))} />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
            <button onClick={() => setEditing(false)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft">
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      <CertificateUploader groupId={group.id} certificates={group.certificates} onUploaded={onSaved} isOwner={isOwner} />
    </div>
  );
}

export default function GroupManager({ circleId, circleType, groups, isOwner, onChange }) {
  const { push } = useToast();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [submitting, setSubmitting] = useState(false);

  const canAddMore = circleType === "KURS" || (groups?.length || 0) === 0;

  async function submitNewGroup() {
    if (!draft.teacherName || !draft.maxStudents) return push("O'qituvchi ismi va guruh hajmini kiriting", "error");
    setSubmitting(true);
    try {
      await api.post(`/circles/${circleId}/groups`, {
        teacherName: draft.teacherName,
        teacherBio: draft.teacherBio || undefined,
        maxStudents: Number(draft.maxStudents),
        schedule: draft.schedule,
      });
      push("Guruh qo'shildi");
      setDraft(emptyDraft);
      setAdding(false);
      onChange();
    } catch (err) {
      push(errorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {groups?.length > 0 ? (
        groups.map((g) => (
          <GroupCard key={g.id} group={g} isOwner={isOwner} onSaved={onChange} onDeleted={onChange} />
        ))
      ) : (
        <p className="text-sm text-muted">Hali guruh qo'shilmagan</p>
      )}

      {isOwner && canAddMore && (
        <div className="rounded-2xl border border-dashed border-line p-4">
          {!adding ? (
            <button onClick={() => setAdding(true)} className="text-sm font-medium text-primary hover:underline">
              + Yangi guruh qo'shish
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                placeholder="O'qituvchi ismi"
                value={draft.teacherName}
                onChange={(e) => setDraft((d) => ({ ...d, teacherName: e.target.value }))}
                className="rounded-lg border border-line px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
              <input
                placeholder="Guruh hajmi"
                type="number"
                value={draft.maxStudents}
                onChange={(e) => setDraft((d) => ({ ...d, maxStudents: e.target.value }))}
                className="rounded-lg border border-line px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
              <ScheduleEditor schedule={draft.schedule} onChange={(s) => setDraft((d) => ({ ...d, schedule: s }))} />
              <div className="flex gap-2">
                <button onClick={submitNewGroup} disabled={submitting} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
                  {submitting ? "Qo'shilmoqda..." : "Qo'shish"}
                </button>
                <button onClick={() => setAdding(false)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft">
                  Bekor qilish
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {isOwner && !canAddMore && (
        <p className="text-xs text-muted">UY/ONLINE turida faqat 1 ta guruh bo'lishi mumkin</p>
      )}
    </div>
  );
}
