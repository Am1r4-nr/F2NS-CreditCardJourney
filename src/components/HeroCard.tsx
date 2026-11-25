/** A decorative copper card resting on a peach block. Pure SVG, no images, hidden from screen readers. */
export function HeroCard() {
  return (
    <svg viewBox="0 0 520 420" role="presentation" aria-hidden="true" focusable="false" className="h-auto w-full max-w-xl">
      <defs>
        <linearGradient id="blockTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6dcd0" />
          <stop offset="1" stopColor="#efc9bb" />
        </linearGradient>
        <linearGradient id="blockSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9b9a8" />
          <stop offset="1" stopColor="#dfa593" />
        </linearGradient>
        <linearGradient id="copper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#efab92" />
          <stop offset="0.55" stopColor="#dc8467" />
          <stop offset="1" stopColor="#c46a52" />
        </linearGradient>
        <linearGradient id="chip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7d7c4" />
          <stop offset="1" stopColor="#c98d6e" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#8a4a3a" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* the block */}
      <polygon points="250,70 500,10 500,300 250,400" fill="url(#blockTop)" />
      <polygon points="120,220 250,70 250,400 120,420" fill="url(#blockSide)" opacity="0.85" />
      <polygon points="250,70 500,10 500,60 250,120" fill="#fff" opacity="0.18" />

      {/* the card */}
      <g transform="translate(30 150) rotate(-17 150 95)" filter="url(#soft)">
        <rect width="330" height="205" rx="18" fill="url(#copper)" />
        <rect width="330" height="205" rx="18" fill="none" stroke="#fff" strokeOpacity="0.25" />
        <rect x="26" y="34" width="52" height="40" rx="8" fill="url(#chip)" stroke="#fff" strokeOpacity="0.5" />
        <path d="M26 54h52M52 34v40" stroke="#9c5f47" strokeOpacity="0.45" strokeWidth="1.5" />
        <path d="M100 44c8 6 8 22 0 28M110 40c12 10 12 30 0 40" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
        <text x="26" y="150" fill="#9a4a35" fillOpacity="0.85" fontSize="15" fontWeight="700" letterSpacing="3" fontFamily="Poppins, sans-serif">CARDHOLDER NAME</text>
        <text x="26" y="176" fill="#fff" fillOpacity="0.7" fontSize="12" letterSpacing="3" fontFamily="Poppins, sans-serif">0000 0000 0000 0000</text>
        <circle cx="262" cy="160" r="22" fill="#e0484e" fillOpacity="0.92" />
        <circle cx="284" cy="160" r="22" fill="#f1a63a" fillOpacity="0.9" />
      </g>
    </svg>
  );
}
