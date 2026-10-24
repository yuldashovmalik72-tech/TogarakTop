import { useState } from "react";

export default function StarRating({ value = 0, onChange, readOnly = false, size = "md" }) {
  const [hover, setHover] = useState(0);

  const sizeClass = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";
  const displayValue = hover || value;

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={`${sizeClass} transition ${
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } ${star <= displayValue ? "text-amber-400" : "text-muted/40"}`}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange?.(star)}
          aria-label={`${star} yulduz`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
