export default function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="13" cy="16" r="9" fill="var(--color-primary)" />
      <circle cx="21" cy="16" r="9" fill="var(--color-accent)" fillOpacity="0.9" />
    </svg>
  );
}
