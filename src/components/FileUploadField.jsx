import { useId, useRef } from "react";

const ICONS = {
  image: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16.5l4.5-4.5a2 2 0 012.8 0l4.2 4.2M14 13l1.5-1.5a2 2 0 012.8 0L21 14.3M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
    />
  ),
  video: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM16 9.5l4-2v9l-4-2"
    />
  ),
  file: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6M13 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-6-5z"
    />
  ),
};

/**
 * Ikonli, "Choose File" o'rniga tugma+fayl nomi ko'rsatuvchi fayl yuklash maydoni.
 *
 * props:
 *  - kind: "image" | "video" | "file"  (ikon va standart matnlarni belgilaydi)
 *  - multiple: bool
 *  - accept: string
 *  - value: File | File[] | null
 *  - onChange: (e) => void   (native change event, avvalgi kod bilan mos)
 *  - label: tugma matni (ixtiyoriy)
 *  - hint: kichik yordam matni (ixtiyoriy)
 *  - size: "sm" | "md"
 */
export default function FileUploadField({
  kind = "file",
  multiple = false,
  accept,
  value,
  onChange,
  label,
  hint,
  size = "md",
  className = "",
}) {
  const inputRef = useRef(null);
  const id = useId();

  const files = Array.isArray(value) ? value : value ? [value] : [];
  const hasFile = files.length > 0;

  const defaultLabel = kind === "video" ? "Video tanlash" : kind === "image" ? "Rasm tanlash" : "Fayl tanlash";
  const btnText = label || defaultLabel;

  const sizeCls = size === "sm" ? "px-3 py-1.5 text-xs" : "px-3.5 py-2 text-sm";
  const iconCls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  function summary() {
    if (!hasFile) return null;
    if (files.length === 1) return files[0].name;
    return `${files.length} ta fayl tanlandi`;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className="sr-only"
      />
      <label
        htmlFor={id}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-paper-raised font-semibold text-ink-soft transition hover:border-primary hover:text-primary ${sizeCls}`}
      >
        <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          {ICONS[kind] || ICONS.file}
        </svg>
        {btnText}
      </label>

      {hasFile ? (
        <span className="inline-flex max-w-[220px] items-center gap-1.5 truncate rounded-lg bg-primary-wash px-2.5 py-1 text-xs font-medium text-primary-dark">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="truncate">{summary()}</span>
        </span>
      ) : (
        hint && <span className="text-xs text-muted">{hint}</span>
      )}
    </div>
  );
}
