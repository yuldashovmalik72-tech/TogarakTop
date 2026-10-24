export default function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      {/* Outer circle */}
      <circle cx="32" cy="32" r="28" fill="none" stroke="url(#needleGrad)" strokeWidth="2" />
      {/* Tick marks */}
      <line x1="32" y1="4" x2="32" y2="10" stroke="url(#needleGrad)" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="54" x2="32" y2="60" stroke="url(#needleGrad)" strokeWidth="2" strokeLinecap="round" />
      <line x1="4" y1="32" x2="10" y2="32" stroke="url(#needleGrad)" strokeWidth="2" strokeLinecap="round" />
      <line x1="54" y1="32" x2="60" y2="32" stroke="url(#needleGrad)" strokeWidth="2" strokeLinecap="round" />
      {/* Diagonal ticks */}
      <line x1="12" y1="12" x2="16" y2="16" stroke="url(#needleGrad)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="48" y1="48" x2="52" y2="52" stroke="url(#needleGrad)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="52" x2="16" y2="48" stroke="url(#needleGrad)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="48" y1="16" x2="52" y2="12" stroke="url(#needleGrad)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Compass needle */}
      <polygon points="32,14 44,44 32,38 20,44" fill="url(#needleGrad)" />
      {/* Center dot */}
      <circle cx="32" cy="32" r="4" fill="#1e293b" stroke="url(#needleGrad)" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="2" fill="#60a5fa" />
    </svg>
  );
}
