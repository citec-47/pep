/**
 * Drawn stand-in for a product that has no photography yet.
 *
 * Each product gets a consistent colour drawn from its slug, so the catalogue
 * reads as a set rather than a wall of identical grey boxes. Upload a real
 * photo and this disappears on its own.
 */

const PALETTES = [
  { wash: "#e4f1f3", tint: "#c7e6ea", glass: "#0e8f9e", fill: "#8ecfd6" },
  { wash: "#e9eef5", tint: "#d3dded", glass: "#3f5f8a", fill: "#a8bfdd" },
  { wash: "#eceaf4", tint: "#dcd7ea", glass: "#5f5296", fill: "#bdb3da" },
  { wash: "#e6f2ea", tint: "#cee5d6", glass: "#3f7c58", fill: "#a5cfb5" },
  { wash: "#f5ede4", tint: "#ebdcc9", glass: "#96703c", fill: "#dcc3a0" },
  { wash: "#f4e9ec", tint: "#e8d2d9", glass: "#8d4c60", fill: "#d7aeba" },
];

function pick(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTES[h % PALETTES.length];
}

export function ProductArtwork({
  seed,
  label,
  className = "",
}: {
  seed: string;
  /** Short caption on the vial label, e.g. "5 mg". */
  label?: string | null;
  className?: string;
}) {
  const c = pick(seed);
  const id = seed.replace(/[^a-z0-9]/gi, "") || "artwork";

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Illustrated vial"
      className={`h-full w-full ${className}`}
    >
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.wash} />
          <stop offset="100%" stopColor={c.tint} />
        </linearGradient>

        <linearGradient id={`glass-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="42%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor={c.glass} stopOpacity="0.18" />
        </linearGradient>

        <pattern id={`grid-${id}`} width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0H0V26" fill="none" stroke={c.glass} strokeOpacity="0.09" strokeWidth="1" />
        </pattern>

        {/* Keeps the liquid inside the vial body. */}
        <clipPath id={`body-${id}`}>
          <path d="M167 96h66a0 0 0 0 1 0 0v122a14 14 0 0 1-14 14h-38a14 14 0 0 1-14-14V96z" />
        </clipPath>
      </defs>

      <rect width="400" height="300" fill={`url(#bg-${id})`} />
      <rect width="400" height="300" fill={`url(#grid-${id})`} />

      {/* Shadow the vial sits in. */}
      <ellipse cx="200" cy="243" rx="52" ry="9" fill={c.glass} opacity="0.16" />

      {/* Crimp cap and neck. */}
      <rect x="182" y="52" width="36" height="20" rx="4" fill={c.glass} />
      <rect x="182" y="58" width="36" height="3" fill="#ffffff" opacity="0.28" />
      <rect x="188" y="72" width="24" height="16" fill={c.glass} opacity="0.35" />
      <rect x="184" y="86" width="32" height="8" rx="3" fill={c.glass} opacity="0.55" />

      {/* Body. */}
      <path
        d="M167 96h66v122a14 14 0 0 1-14 14h-38a14 14 0 0 1-14-14V96z"
        fill={`url(#glass-${id})`}
        stroke={c.glass}
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />

      {/* Reconstituted contents. */}
      <g clipPath={`url(#body-${id})`}>
        <rect x="167" y="176" width="66" height="60" fill={c.fill} opacity="0.85" />
        <ellipse cx="200" cy="176" rx="33" ry="5" fill="#ffffff" opacity="0.4" />
      </g>

      {/* Label band. */}
      <rect x="167" y="128" width="66" height="38" fill="#ffffff" opacity="0.92" />
      <rect x="174" y="136" width="34" height="3" rx="1.5" fill={c.glass} opacity="0.55" />
      <rect x="174" y="143" width="22" height="3" rx="1.5" fill={c.glass} opacity="0.3" />
      {label && (
        <text
          x="174"
          y="160"
          fontFamily="var(--font-mono), ui-monospace, monospace"
          fontSize="11"
          fontWeight="600"
          fill={c.glass}
        >
          {label}
        </text>
      )}

      {/* Highlight down the left edge of the glass. */}
      <rect x="174" y="104" width="5" height="112" rx="2.5" fill="#ffffff" opacity="0.55" />
    </svg>
  );
}
