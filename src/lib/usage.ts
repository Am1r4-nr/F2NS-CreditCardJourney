import { RATES, UTILISATION_TARGET } from '../config/rates.ts';
import type { Category, Payment, Txn } from '../state/types.ts';
import { minimumPayment, type Terms, DEFAULT_TERMS } from './cost.ts';

// All dates are 'YYYY-MM-DD' strings handled in UTC, so a time zone never shifts a date.

export const CATEGORIES: Category[] = ['food', 'transport', 'groceries', 'bills', 'shopping', 'other'];

const DAY = 86_400_000;
const parse = (iso: string): number => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const fmt = (ms: number): string => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

export const isIsoDate = (s: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(parse(s));
export const addDays = (iso: string, n: number): string => fmt(parse(iso) + n * DAY);
export const daysBetween = (fromIso: string, toIso: string): number => Math.round((parse(toIso) - parse(fromIso)) / DAY);

/** Today as YYYY-MM-DD in the user's local time. */
export function todayIso(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function statementOfMonth(year: number, month0: number, day: number): string {
  return fmt(Date.UTC(year, month0, day));
}

/** First statement date on or after `iso`. */
export function statementOnOrAfter(iso: string, day: number): string {
  const [y, m] = iso.split('-').map(Number);
  const cand = statementOfMonth(y, m - 1, day);
  return cand >= iso ? cand : statementOfMonth(y, m, day);
}

/** Last statement date strictly before `iso`. */
export function statementBefore(iso: string, day: number): string {
  const [y, m] = iso.split('-').map(Number);
  const cand = statementOfMonth(y, m - 1, day);
  return cand < iso ? cand : statementOfMonth(y, m - 2, day);
}

export function previousStatement(end: string, day: number): string {
  return statementBefore(end, day);
}

export const dueDate = (statementEnd: string): string => addDays(statementEnd, RATES.graceDays);

export interface Cycle {
  /** First day of the cycle. */
  start: string;
  /** Statement date, the last day of the cycle. */
  end: string;
}

export function cycleEndingOn(end: string, day: number): Cycle {
  return { start: addDays(previousStatement(end, day), 1), end };
}

/** The cycle that contains `iso`. */
export function cycleOf(iso: string, day: number): Cycle {
  return cycleEndingOn(statementOnOrAfter(iso, day), day);
}

export const spendIn = (txns: Txn[], c: Cycle): number =>
  round2(txns.filter((t) => t.date >= c.start && t.date <= c.end).reduce((a, t) => a + t.amount, 0));

const round2 = (n: number) => Math.round(n * 100) / 100;

// ---------- Statements ----------

export type StatementStatus = 'none' | 'upcoming' | 'due_soon' | 'due_today' | 'overdue' | 'paid_full' | 'paid_min';

export interface Statement {
  cycle: Cycle;
  due: string;
  balance: number;
  minimum: number;
  /** Payments made on or before the due date. */
  paidOnTime: number;
  /** All payments for this statement. */
  paidTotal: number;
  /** Days from today until the due date. Negative when overdue. */
  daysLeft: number;
  status: StatementStatus;
  payments: Payment[];
  /** True once the statement is paid in a way that needs no more action. */
  settled: boolean;
}

export function buildStatement(end: string, txns: Txn[], payments: Payment[], day: number, today: string, terms: Terms = DEFAULT_TERMS): Statement {
  const cycle = cycleEndingOn(end, day);
  const due = dueDate(end);
  const balance = spendIn(txns, cycle);
  const mine = payments.filter((p) => p.statementEnd === end);
  const paidTotal = round2(mine.reduce((a, p) => a + p.amount, 0));
  const paidOnTime = round2(mine.filter((p) => p.paidOn <= due).reduce((a, p) => a + p.amount, 0));
  const minimum = minimumPayment(balance, terms);
  const daysLeft = daysBetween(today, due);

  let status: StatementStatus;
  if (balance <= 0) status = 'none';
  else if (paidOnTime >= balance - 0.005) status = 'paid_full';
  else if (paidOnTime >= minimum - 0.005) status = 'paid_min';
  else if (today > due) status = 'overdue';
  else if (daysLeft === 0) status = 'due_today';
  else if (daysLeft <= 5) status = 'due_soon';
  else status = 'upcoming';
  return { cycle, due, balance, minimum, paidOnTime, paidTotal, daysLeft, status, payments: mine, settled: status === 'none' || status === 'paid_full' || status === 'paid_min' };
}

export interface UsageSummary {
  today: string;
  current: Cycle;
  currentSpend: number;
  utilisation: number;
  band: 'good' | 'high' | 'too_high';
  overLimit: boolean;
  /** The latest issued statement, or null before the first one. */
  open: Statement | null;
  /** Up to the last 3 issued statements that had a balance, newest first. */
  recent: Statement[];
  onTimeCount: number;
  nextStatement: string;
  /** Category totals for the current cycle, largest first. */
  byCategory: { category: Category; total: number; percent: number }[];
}

export function bandOf(utilisationPercent: number): UsageSummary['band'] {
  if (utilisationPercent <= UTILISATION_TARGET) return 'good';
  if (utilisationPercent <= 70) return 'high';
  return 'too_high';
}

export function summarise(txns: Txn[], payments: Payment[], day: number, limit: number, today: string, terms: Terms = DEFAULT_TERMS): UsageSummary {
  const current = cycleOf(today, day);
  const currentSpend = spendIn(txns, current);
  const utilisation = limit > 0 ? (currentSpend / limit) * 100 : 0;

  const lastEnd = statementBefore(today, day);
  const open = txns.some((t) => t.date <= lastEnd) || payments.some((p) => p.statementEnd === lastEnd)
    ? buildStatement(lastEnd, txns, payments, day, today, terms)
    : null;

  // Last 3 issued statements with a balance.
  const recent: Statement[] = [];
  let end = lastEnd;
  for (let i = 0; i < 12 && recent.length < 3; i++) {
    const s = buildStatement(end, txns, payments, day, today, terms);
    if (s.balance > 0) recent.push(s);
    end = previousStatement(end, day);
  }
  const onTimeCount = recent.filter((s) => s.status === 'paid_full' || s.status === 'paid_min').length;

  const inCycle = txns.filter((t) => t.date >= current.start && t.date <= current.end);
  const byCategory = CATEGORIES.map((category) => {
    const total = round2(inCycle.filter((t) => t.category === category).reduce((a, t) => a + t.amount, 0));
    return { category, total, percent: currentSpend > 0 ? Math.round((total / currentSpend) * 100) : 0 };
  })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  return {
    today,
    current,
    currentSpend,
    utilisation,
    band: bandOf(utilisation),
    overLimit: currentSpend > limit,
    open,
    recent,
    onTimeCount,
    nextStatement: current.end,
    byCategory,
  };
}

/** The statement the user should act on: the open one if it still needs paying. */
export function needsAction(s: Statement | null): s is Statement {
  return !!s && !s.settled && s.balance > 0;
}

export function reminderDate(due: string, daysBefore: number): string {
  return addDays(due, -daysBefore);
}

export function reminderDue(open: Statement | null, today: string, daysBefore: number): boolean {
  return needsAction(open) && today >= reminderDate(open.due, daysBefore);
}

// ---------- Sample data for demos ----------

let counter = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

const SAMPLE: { offset: number; amount: number; category: Category; note: string }[] = [
  { offset: 2, amount: 85, category: 'groceries', note: 'Weekly groceries' },
  { offset: 5, amount: 32.5, category: 'food', note: 'Lunch with friends' },
  { offset: 9, amount: 120, category: 'transport', note: 'Fuel' },
  { offset: 13, amount: 66, category: 'bills', note: 'Phone bill' },
  { offset: 19, amount: 149.9, category: 'shopping', note: 'Work shoes' },
  { offset: 24, amount: 45, category: 'food', note: 'Dinner' },
];

/** Builds sample spending for 3 closed cycles and the current one. The newest closed statement is due in about 15 days. */
export function sampleData(today: string): { statementDay: number; txns: Txn[]; payments: Payment[] } {
  const anchor = addDays(today, -5);
  const statementDay = Math.min(28, Number(anchor.slice(8, 10)));
  const txns: Txn[] = [];
  const payments: Payment[] = [];
  let end = statementBefore(today, statementDay);
  const ends: string[] = [];
  for (let i = 0; i < 3; i++) { ends.push(end); end = previousStatement(end, statementDay); }

  const scale = [1, 0.8, 0.6]; // newest closed cycle, then older ones
  ends.forEach((e, i) => {
    const c = cycleEndingOn(e, statementDay);
    SAMPLE.forEach((s, k) => {
      const date = addDays(c.start, Math.min(s.offset, daysBetween(c.start, c.end)));
      txns.push({ id: uid(`s${i}${k}`), date, amount: Math.round(s.amount * scale[i] * 100) / 100, category: s.category, note: s.note });
    });
    if (i > 0) {
      const bal = spendIn(txns, c);
      payments.push({ id: uid(`p${i}`), statementEnd: e, paidOn: addDays(dueDate(e), -4), amount: bal });
    }
  });
  const cur = cycleOf(today, statementDay);
  SAMPLE.slice(0, 3).forEach((s, k) => {
    const date = addDays(cur.start, Math.min(k * 2, Math.max(0, daysBetween(cur.start, today))));
    if (date <= today) txns.push({ id: uid(`c${k}`), date, amount: s.amount, category: s.category, note: s.note });
  });
  return { statementDay, txns, payments };
}

export { uid as newId };
