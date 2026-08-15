import { useState } from "react";

// Og'ir modal kutubxonasiz, oddiy ikki bosqichli tasdiqlash tugmasi:
// birinchi bosishda "Rostdan ham?" holatiga o'tadi, ikkinchi bosishda amalni bajaradi.
export default function ConfirmButton({ onConfirm, children, confirmLabel = "Tasdiqlash", className = "", ...rest }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={async () => {
            await onConfirm();
            setConfirming(false);
          }}
          className="rounded-lg bg-danger px-2.5 py-1 text-xs font-semibold text-white"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink-soft"
        >
          Bekor qilish
        </button>
      </span>
    );
  }

  return (
    <button type="button" onClick={() => setConfirming(true)} className={className} {...rest}>
      {children}
    </button>
  );
}
