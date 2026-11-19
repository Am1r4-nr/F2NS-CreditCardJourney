export function money(n: number, decimals?: number): string {
  const d = decimals ?? (Number.isInteger(n) ? 0 : 2);
  return `RM${n.toLocaleString('en-MY', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
}

export function percent(n: number): string {
  return `${Math.round(n)}%`;
}

/** Parse a user-typed number such as "2,800" or "RM 2800". Returns NaN when empty or invalid. */
export function parseAmount(s: string): number {
  const cleaned = s.replace(/[^\d.]/g, '');
  if (cleaned === '' || cleaned === '.') return NaN;
  return Number(cleaned);
}

/** A YYYY-MM-DD date shown in the chosen language, for example "Fri, 11 Dec 2026". */
export function fmtDate(iso: string, lang: 'en' | 'ms'): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === 'ms' ? 'ms-MY' : 'en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** Month and year only, for example "Nov 2026". */
export function fmtMonth(iso: string, lang: 'en' | 'ms'): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === 'ms' ? 'ms-MY' : 'en-MY', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}
