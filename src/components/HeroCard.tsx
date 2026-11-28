/** A decorative red-to-yellow card, tilted. Pure SVG, no images, hidden from screen readers. */
export function HeroCard() {
  return (
    <svg viewBox="0 0 400 270" role="presentation" aria-hidden="true" focusable="false" className="h-auto w-full">
      <defs>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#b3141b" />
          <stop offset="0.5" stopColor="#ee4f1a" />
          <stop offset="1" stopColor="#fbb02d" />
        </linearGradient>
        <linearGradient id="cardShine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="chipGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e3b4" />
          <stop offset="1" stopColor="#c9a25a" />
        </linearGradient>
        <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#4a0709" floodOpacity="0.45" />
        </filter>
      </defs>
      <g transform="rotate(-5 200 135)" filter="url(#cardShadow)">
        <rect x="20" y="20" width="360" height="226" rx="22" fill="url(#cardGrad)" />
        <rect x="20" y="20" width="360" height="226" rx="22" fill="url(#cardShine)" />
        <rect x="20.5" y="20.5" width="359" height="225" rx="21.5" fill="none" stroke="#fff" strokeOpacity="0.35" />
        {/* mark */}
        <g transform="translate(46 46)" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 40V4M4 24L30 4M12 20l20 20" />
        </g>
        {/* contactless */}
        <g transform="translate(300 52)" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="3.5" strokeLinecap="round">
          <path d="M6 4c8 8 8 20 0 28M16 0c12 11 12 29 0 40" />
        </g>
        {/* chip */}
        <rect x="248" y="150" width="54" height="42" rx="8" fill="url(#chipGrad)" stroke="#fff" strokeOpacity="0.5" />
        <path d="M248 171h54M275 150v42M248 160h18M284 160h18M248 182h18M284 182h18" stroke="#8a6a32" strokeOpacity="0.55" strokeWidth="1.4" fill="none" />
        {/* circles */}
        <circle cx="318" cy="205" r="20" fill="#e0242b" fillOpacity="0.95" />
        <circle cx="338" cy="205" r="20" fill="#fdbe3a" fillOpacity="0.95" />
        <text x="46" y="214" fill="#fff" fillOpacity="0.9" fontSize="13" fontWeight="600" letterSpacing="3" fontFamily="Poppins, sans-serif">KAF FIRST CARD</text>
      </g>
    </svg>
  );
}
