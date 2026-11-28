import type { Bi } from './eligibility.ts';
import type { ScoreEntry } from '../state/types.ts';
import { isIsoDate } from './usage.ts';

/**
 * Credit score tracking. The app cannot read a credit bureau. The user types in the score they
 * saw on their own report (for example from CTOS or RAM Credit), and we show how it moves.
 */
export const SCORE_MIN = 300;
export const SCORE_MAX = 850;
export const SCORE_SOURCES = ['CTOS', 'RAM Credit', 'Other'] as const;

export function validateScore(score: string, date: string, today: string): Bi | undefined {
  const n = Number(score);
  if (score.trim() === '' || !Number.isFinite(n) || !Number.isInteger(n)) return { en: 'Please type your score as a whole number.', ms: 'Sila taip skor anda sebagai nombor bulat.' };
  if (n < SCORE_MIN || n > SCORE_MAX) return { en: `A score is between ${SCORE_MIN} and ${SCORE_MAX}. Please check your report.`, ms: `Skor adalah antara ${SCORE_MIN} dan ${SCORE_MAX}. Sila semak laporan anda.` };
  if (!isIsoDate(date)) return { en: 'Please pick the date you checked it.', ms: 'Sila pilih tarikh anda menyemaknya.' };
  if (date > today) return { en: 'The date cannot be in the future.', ms: 'Tarikh tidak boleh pada masa hadapan.' };
  return undefined;
}

/** Oldest first. Same-day entries keep the order they were added in. */
export function sortedScores(entries: ScoreEntry[]): ScoreEntry[] {
  return entries.map((e, i) => ({ e, i })).sort((a, b) => (a.e.date === b.e.date ? a.i - b.i : a.e.date < b.e.date ? -1 : 1)).map((x) => x.e);
}

export interface ScoreTrend {
  latest: ScoreEntry;
  /** Change from the check before it, or null when there is only one. */
  change: number | null;
  /** Change since the first check, or null when there is only one. */
  sinceFirst: number | null;
  direction: 'up' | 'down' | 'same' | null;
}

export function scoreTrend(entries: ScoreEntry[]): ScoreTrend | null {
  const s = sortedScores(entries);
  if (s.length === 0) return null;
  const latest = s[s.length - 1];
  if (s.length === 1) return { latest, change: null, sinceFirst: null, direction: null };
  const change = latest.score - s[s.length - 2].score;
  return { latest, change, sinceFirst: latest.score - s[0].score, direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same' };
}

/** The score range the chart shows: the data with some room, in steps of 50, never wider than 300-850. */
export function chartRange(entries: ScoreEntry[]): { min: number; max: number } {
  if (entries.length === 0) return { min: SCORE_MIN, max: SCORE_MAX };
  const scores = entries.map((e) => e.score);
  let min = Math.max(SCORE_MIN, Math.floor((Math.min(...scores) - 20) / 50) * 50);
  let max = Math.min(SCORE_MAX, Math.ceil((Math.max(...scores) + 20) / 50) * 50);
  while (max - min < 100) {
    if (min > SCORE_MIN) min -= 50;
    if (max - min < 100 && max < SCORE_MAX) max += 50;
  }
  return { min, max };
}

/** Points for a line chart in a width x height box. The score axis follows chartRange. */
export function chartPoints(entries: ScoreEntry[], width: number, height: number, pad = 12, left = pad): { x: number; y: number; entry: ScoreEntry }[] {
  const s = sortedScores(entries);
  const { min, max } = chartRange(entries);
  return s.map((entry, i) => ({
    entry,
    x: s.length === 1 ? (left + width - pad) / 2 : left + (i * (width - pad - left)) / (s.length - 1),
    y: pad + (1 - (entry.score - min) / (max - min)) * (height - 2 * pad),
  }));
}