/** Marca "Finance": mão segurando cédulas, sobre círculo verde. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Finance" className={className}>
      <circle cx="100" cy="100" r="100" fill="#5F9128" />
      <g transform="translate(17.5,17)">
        <g stroke="#5F9128" strokeWidth="3.4" strokeLinejoin="round">
          <rect x="58" y="26" width="55" height="36" rx="3" fill="#ffffff" transform="rotate(-17 85 44)" />
          <rect x="103" y="26" width="55" height="36" rx="3" fill="#ffffff" transform="rotate(17 131 44)" />
          <rect x="80" y="34" width="56" height="36" rx="3" fill="#ffffff" />
        </g>
        <text x="108" y="61" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="29" fontWeight="700" fill="#5F9128">
          $
        </text>
        <g fill="#ffffff">
          <rect x="108" y="78" width="40" height="14" rx="7" transform="rotate(-20 108 85)" />
          <rect x="112" y="92" width="45" height="14" rx="7" transform="rotate(-10 112 99)" />
          <rect x="113" y="106" width="43" height="14" rx="7" transform="rotate(0 113 113)" />
          <rect x="110" y="119" width="36" height="14" rx="7" transform="rotate(10 110 126)" />
          <rect x="56" y="84" width="76" height="52" rx="24" />
          <rect x="74" y="122" width="44" height="15" rx="7.5" transform="rotate(14 74 129)" />
          <rect x="4" y="100" width="66" height="30" rx="15" transform="rotate(6 4 115)" />
        </g>
      </g>
    </svg>
  )
}
