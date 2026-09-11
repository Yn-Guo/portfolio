export function ProjectDiagram({
  kind,
  className,
}: {
  kind?: string;
  className?: string;
}) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    vectorEffect: 'non-scaling-stroke' as const,
  };

  const drawing = (() => {
    switch (kind) {
      case 'high-rise':
        return (
          <>
            <line x1="8" y1="72" x2="112" y2="72" opacity="0.45" />
            <rect x="46" y="16" width="28" height="56" rx="2" />
            <line x1="60" y1="16" x2="60" y2="72" opacity="0.8" />
            <line x1="46" y1="32" x2="74" y2="32" />
            <line x1="46" y1="50" x2="74" y2="50" />
            <path d="M46 66 L74 58 M46 58 L74 66" opacity="0.7" />
          </>
        );
      case 'long-span':
        return (
          <>
            <line x1="8" y1="70" x2="112" y2="70" opacity="0.45" />
            <path d="M10 70 Q60 6 110 70" />
            <line x1="10" y1="70" x2="110" y2="70" />
            <line x1="30" y1="70" x2="30" y2="45" opacity="0.7" />
            <line x1="45" y1="70" x2="45" y2="31" opacity="0.7" />
            <line x1="60" y1="70" x2="60" y2="26" opacity="0.7" />
            <line x1="75" y1="70" x2="75" y2="31" opacity="0.7" />
            <line x1="90" y1="70" x2="90" y2="45" opacity="0.7" />
            <circle cx="30" cy="45" r="1.8" />
            <circle cx="45" cy="31" r="1.8" />
            <circle cx="60" cy="26" r="1.8" />
            <circle cx="75" cy="31" r="1.8" />
            <circle cx="90" cy="45" r="1.8" />
          </>
        );
      case 'cfw':
        return (
          <>
            <ellipse cx="60" cy="46" rx="42" ry="16" opacity="0.5" />
            <path d="M22 52 Q48 12 96 40" />
            <path d="M28 38 Q62 74 100 34" opacity="0.85" />
            <path d="M36 58 Q64 30 94 54" opacity="0.7" />
            <circle cx="20" cy="52" r="2.4" />
            <circle cx="30" cy="36" r="2.4" />
            <circle cx="60" cy="72" r="2.4" />
            <circle cx="97" cy="39" r="2.4" />
            <circle cx="101" cy="34" r="2.4" />
          </>
        );
      case 'workflow':
        return (
          <>
            <rect x="12" y="28" width="26" height="24" rx="4" />
            <rect x="47" y="28" width="26" height="24" rx="4" />
            <rect x="82" y="28" width="26" height="24" rx="4" />
            <path d="M38 40 h9 M73 40 h9" />
            <path d="M43 36 l4 4 -4 4 M78 36 l4 4 -4 4" />
            <line x1="12" y1="66" x2="108" y2="66" opacity="0.35" />
          </>
        );
      case 'renovation':
        return (
          <>
            <rect x="14" y="28" width="52" height="40" rx="3" strokeDasharray="5 4" />
            <rect x="64" y="36" width="42" height="32" rx="3" />
            <path d="M18 66 L62 30 M18 30 L62 66" opacity="0.85" />
            <path d="M68 66 L102 38 M68 38 L102 66" opacity="0.5" />
          </>
        );
      case 'detail':
      default:
        return (
          <>
            <path d="M18 68 h20 v-12 h20 v-12 h20 v-12 h20" />
            <line x1="18" y1="20" x2="110" y2="20" opacity="0.45" />
            <path d="M38 56 L58 44 M58 44 L78 32" opacity="0.75" />
            <circle cx="38" cy="56" r="1.8" />
            <circle cx="58" cy="44" r="1.8" />
            <circle cx="78" cy="32" r="1.8" />
          </>
        );
    }
  })();

  return (
    <svg
      viewBox="0 0 120 80"
      className={className}
      role="img"
      aria-hidden="true"
      {...stroke}
    >
      {drawing}
    </svg>
  );
}
