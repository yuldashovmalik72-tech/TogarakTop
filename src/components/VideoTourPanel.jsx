import { useState } from "react";
import api from "../lib/api.js";
import { useToast, errorMessage } from "../context/ToastContext.jsx";
import { imageUrl } from "../lib/format.js";
import FileUploadField from "./FileUploadField.jsx";

/** Startup: video-tur bepul — to'lov yo'q */
export default function VideoTourPanel({ videoUrl, isOwner, uploadUrl, onUploaded }) {
  const { push } = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function uploadVideo() {
    if (!file) return push("Video faylni tanlang", "error");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("video", file);
      await api.post(uploadUrl, fd);
      push("Video muvaffaqiyatli yuklandi");
      setFile(null);
      onUploaded?.();
    } catch (err) {
      push(errorMessage(err), "error");
    } finally {
      setUploading(false);
    }
  }

  if (videoUrl) {
    return (
      <div>
        <video src={imageUrl(videoUrl)} controls className="w-full rounded-2xl" />
        {isOwner && (
          <div className="mt-3 rounded-2xl border border-dashed border-line p-4">
            <p className="mb-2 text-xs text-muted">Videoni almashtirish (bepul)</p>
            <div className="flex flex-wrap items-center gap-2">
              <FileUploadField
                kind="video"
                accept="video/*"
                size="sm"
                value={file}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                label="Video tanlash"
                hint="Fayl tanlanmagan"
              />
              <button
                type="button"
                onClick={uploadVideo}
                disabled={uploading || !file}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                {uploading ? "Yuklanmoqda..." : "Yuklash"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isOwner) {
    return <p className="text-sm text-muted">Video-tur hali yuklanmagan</p>;
  }

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-4">
      <p className="font-display font-bold text-ink">Video-tur yuklash</p>
      <p className="mt-1 text-sm text-muted">
        Xonalarni to‘liq ko‘rsatuvchi video. Startup bosqichida <strong>bepul</strong>.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FileUploadField
          kind="video"
          accept="video/*"
          size="sm"
          value={file}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          label="Video tanlash"
          hint="Fayl tanlanmagan"
        />
        <button
          type="button"
          onClick={uploadVideo}
          disabled={uploading || !file}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
        >
          {uploading ? "Yuklanmoqda..." : "Video yuklash"}
        </button>
      </div>
    </div>
  );
}
