import type { WorkshopEntry } from '../state/types.ts';
import { CARD_FEATURES, DEAL_BREAKERS, PROOF_CHOICES, SEAMLESS, TIME_CHOICES, TRUST_BUILDERS, type Option } from '../data/workshop.ts';
import { findCard } from '../data/cards.ts';

export interface Tally {
  key: string;
  count: number;
}

/** Counts how many testers picked each key, most picked first. Ties are sorted by key so the order is stable. */
export function tally(entries: WorkshopEntry[], pick: (e: WorkshopEntry) => string[]): Tally[] {
  const m = new Map<string, number>();
  for (const e of entries) for (const k of new Set(pick(e))) if (k) m.set(k, (m.get(k) ?? 0) + 1);
  return [...m.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export function averageRating(entries: WorkshopEntry[]): number | null {
  const r = entries.map((e) => e.rating).filter((n) => n >= 1 && n <= 5);
  if (r.length === 0) return null;
  return Math.round((r.reduce((a, b) => a + b, 0) / r.length) * 10) / 10;
}

/** Toggles a choice in a "pick up to N" list. Returns blocked = true when the list is full and the key is new. */
export function togglePick(list: string[], key: string, max: number): { list: string[]; blocked: boolean } {
  if (list.includes(key)) return { list: list.filter((k) => k !== key), blocked: false };
  if (list.length >= max) return { list, blocked: true };
  return { list: [...list, key], blocked: false };
}

export function labelOf(options: Option[], key: string, lang: 'en' | 'ms' = 'en'): string {
  return options.find((o) => o.key === key)?.label[lang] ?? key;
}

export function cardName(id: string): string {
  const c = findCard(id);
  return c ? `${c.bank} ${c.name}` : id;
}

// ---------- Export ----------

/** Quotes a CSV cell. A leading = + - or @ is made harmless so a spreadsheet will not run it as a formula. */
export function csvCell(value: string | number): string {
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

const join = (xs: string[]) => xs.join('; ');

export const CSV_HEADER = [
  'id', 'saved_at', 'tester', 'top3_seamless', 'top3_deal_breakers', 'preferred_income_proof', 'acceptable_decision_time',
  'what_builds_trust', 'card_features_that_mattered', 'cards_compared', 'cards_viewed', 'card_selected', 'rating_1_to_5', 'where_got_stuck',
];

export function entriesToCsv(entries: WorkshopEntry[]): string {
  const rows = entries.map((e) => [
    e.id, e.at, e.tester,
    join(e.seamless.map((k) => labelOf(SEAMLESS, k))),
    join(e.dealBreakers.map((k) => labelOf(DEAL_BREAKERS, k))),
    labelOf(PROOF_CHOICES, e.proof),
    labelOf(TIME_CHOICES, e.time),
    join(e.trust.map((k) => labelOf(TRUST_BUILDERS, k))),
    join((e.cardFeatures ?? []).map((k) => labelOf(CARD_FEATURES, k))),
    join((e.cardsCompared ?? []).map(cardName)),
    join((e.cardsViewed ?? []).map(cardName)),
    e.cardSelected ? cardName(e.cardSelected) : '',
    e.rating,
    e.stuck,
  ]);
  return [CSV_HEADER, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

export function entriesToJson(entries: WorkshopEntry[]): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), count: entries.length, entries }, null, 2);
}
