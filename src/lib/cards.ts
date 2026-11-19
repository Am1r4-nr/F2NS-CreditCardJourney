import type { CardKind, CardRecord, Network, Proof, RewardType, Tier } from '../data/cardTypes.ts';
import type { Bi, ReadyInput } from './eligibility.ts';
import { money, parseAmount } from './format.ts';
import type { Terms } from './cost.ts';

// ---------- Derived fields ----------

export type Criterion = 'income' | 'proof' | 'fee' | 'digital' | 'secured';
export type FeeKind = 'free' | 'waivable' | 'paid';

export interface Derived {
  /** 1 to 5 */
  friendliness: number;
  /** Points (0 to 1) earned per criterion. */
  points: Record<Criterion, number>;
  gigFriendly: boolean;
  studentFriendly: boolean;
  feeKind: FeeKind;
}

export function feeKind(c: CardRecord): FeeKind {
  if (c.annualFee === 0) return 'free';
  return c.annualFeeWaiver ? 'waivable' : 'paid';
}

export function acceptsGig(c: CardRecord): boolean {
  return c.incomeProof.includes('bank_statement') || c.incomeProof.includes('gig_statement');
}

export function isStudentFriendly(c: CardRecord): boolean {
  return c.tier === 'student' || c.minAge <= 18 || (c.secured && c.minAnnualIncome <= 24000);
}

export function derive(c: CardRecord): Derived {
  const points: Record<Criterion, number> = {
    income: c.minAnnualIncome <= 24000 ? 1 : c.minAnnualIncome <= 36000 ? 0.5 : 0,
    proof: c.incomeProof.length >= 3 ? 1 : c.incomeProof.length === 2 ? 0.5 : 0,
    fee: c.annualFee === 0 ? 1 : c.annualFeeWaiver ? 0.7 : c.annualFee <= 100 ? 0.4 : 0,
    digital: c.digitalApplication ? 1 : 0,
    secured: c.secured ? 1 : 0,
  };
  const sum = Object.values(points).reduce((a, b) => a + b, 0);
  return {
    friendliness: Math.max(1, Math.min(5, Math.round(sum))),
    points,
    gigFriendly: acceptsGig(c),
    studentFriendly: isStudentFriendly(c),
    feeKind: feeKind(c),
  };
}

export const CRITERIA_LABEL: Record<Criterion, Bi> = {
  income: { en: 'Low income requirement', ms: 'Keperluan pendapatan rendah' },
  proof: { en: 'Flexible income proof', ms: 'Bukti pendapatan fleksibel' },
  fee: { en: 'Low or waivable annual fee', ms: 'Yuran tahunan rendah atau boleh dikecualikan' },
  digital: { en: 'Digital application', ms: 'Permohonan digital' },
  secured: { en: 'Secured option', ms: 'Pilihan bercagar' },
};

// ---------- Filters, search, sort ----------

export type SortKey = 'best' | 'fee' | 'rate' | 'income' | 'rewards';

export interface Filters {
  bank: string;
  kind: '' | CardKind;
  network: '' | Network;
  tier: '' | Tier;
  fee: '' | FeeKind;
  reward: '' | RewardType;
  /** Monthly income slider. At INCOME_SLIDER_MAX it means "no limit". */
  maxMonthlyIncome: number;
  gig: boolean;
  secured: boolean;
  digital: boolean;
  student: boolean;
}

export const INCOME_SLIDER_MAX = 5000;
export const INCOME_SLIDER_STEP = 250;

export const DEFAULT_FILTERS: Filters = {
  bank: '',
  kind: '',
  network: '',
  tier: '',
  fee: '',
  reward: '',
  maxMonthlyIncome: INCOME_SLIDER_MAX,
  gig: false,
  secured: false,
  digital: false,
  student: false,
};

export function activeFilterCount(f: Filters, query: string): number {
  let n = query.trim() ? 1 : 0;
  if (f.bank) n++;
  if (f.kind) n++;
  if (f.network) n++;
  if (f.tier) n++;
  if (f.fee) n++;
  if (f.reward) n++;
  if (f.maxMonthlyIncome < INCOME_SLIDER_MAX) n++;
  if (f.gig) n++;
  if (f.secured) n++;
  if (f.digital) n++;
  if (f.student) n++;
  return n;
}

export function matches(c: CardRecord, query: string, f: Filters): boolean {
  const q = query.trim().toLowerCase();
  if (q && !`${c.bank} ${c.name}`.toLowerCase().includes(q)) return false;
  if (f.bank && c.bank !== f.bank) return false;
  if (f.kind && c.kind !== f.kind) return false;
  if (f.network && c.network !== f.network) return false;
  if (f.tier && c.tier !== f.tier) return false;
  if (f.fee && feeKind(c) !== f.fee) return false;
  if (f.reward && c.rewards.type !== f.reward) return false;
  if (f.maxMonthlyIncome < INCOME_SLIDER_MAX && c.minAnnualIncome / 12 > f.maxMonthlyIncome) return false;
  if (f.gig && !acceptsGig(c)) return false;
  if (f.secured && !c.secured) return false;
  if (f.digital && !c.digitalApplication) return false;
  if (f.student && !isStudentFriendly(c)) return false;
  return true;
}

/** Card tiers in the order we show them, with plain-language meaning. */
export const TIER_ORDER: Tier[] = ['classic', 'gold', 'platinum', 'secured', 'student'];

export const TIER_INFO: Record<Tier, { icon: string; label: Bi; blurb: Bi }> = {
  classic: { icon: '◇', label: { en: 'Classic', ms: 'Klasik' }, blurb: { en: 'Basic card. Usually the lowest income needed.', ms: 'Kad asas. Biasanya pendapatan paling rendah diperlukan.' } },
  gold: { icon: '◆', label: { en: 'Gold', ms: 'Emas' }, blurb: { en: 'More rewards and perks. Mid-level income needed.', ms: 'Lebih banyak ganjaran dan faedah. Pendapatan sederhana diperlukan.' } },
  platinum: { icon: '❖', label: { en: 'Platinum', ms: 'Platinum' }, blurb: { en: 'Premium perks such as travel. Higher income needed.', ms: 'Faedah premium seperti perjalanan. Pendapatan lebih tinggi diperlukan.' } },
  secured: { icon: '🔒', label: { en: 'Secured', ms: 'Bercagar' }, blurb: { en: 'Backed by your own fixed deposit. Easier to get with little credit history.', ms: 'Disandarkan dengan simpanan tetap anda. Lebih mudah diperoleh jika sejarah kredit sedikit.' } },
  student: { icon: '🎓', label: { en: 'Student', ms: 'Pelajar' }, blurb: { en: 'Made for students, with a low income needed.', ms: 'Dibuat untuk pelajar, dengan pendapatan rendah diperlukan.' } },
};

/** How many cards fall in each tier, given the search and every filter except the tier itself. */
export function tierCounts(cards: CardRecord[], query: string, f: Filters): Record<Tier, number> {
  const out: Record<Tier, number> = { classic: 0, gold: 0, platinum: 0, secured: 0, student: 0 };
  for (const c of cards) if (matches(c, query, { ...f, tier: '' })) out[c.tier] += 1;
  return out;
}

export function filterCards(cards: CardRecord[], query: string, f: Filters): CardRecord[] {
  return cards.filter((c) => matches(c, query, f));
}

export function sortCards(cards: CardRecord[], sort: SortKey): CardRecord[] {
  const byName = (a: CardRecord, b: CardRecord) => `${a.bank} ${a.name}`.localeCompare(`${b.bank} ${b.name}`);
  const list = [...cards];
  switch (sort) {
    case 'fee':
      return list.sort((a, b) => a.annualFee - b.annualFee || a.interestPa - b.interestPa || byName(a, b));
    case 'rate':
      return list.sort((a, b) => a.interestPa - b.interestPa || a.annualFee - b.annualFee || byName(a, b));
    case 'income':
      return list.sort((a, b) => a.minAnnualIncome - b.minAnnualIncome || a.annualFee - b.annualFee || byName(a, b));
    case 'rewards':
      return list.sort((a, b) => b.rewards.valuePercent - a.rewards.valuePercent || a.annualFee - b.annualFee || byName(a, b));
    case 'best':
    default:
      return list.sort(
        (a, b) =>
          derive(b).friendliness - derive(a).friendliness ||
          a.minAnnualIncome - b.minAnnualIncome ||
          a.annualFee - b.annualFee ||
          byName(a, b),
      );
  }
}

// ---------- Best match for me ----------

export interface Match {
  card: CardRecord;
  score: number;
  reasons: Bi[];
}

export interface MatchResult {
  matches: Match[];
  /** Why other cards were left out, as counts. */
  excluded: { tooYoung: number; lowIncome: number; noProof: number };
  /** A secured card that fits, if any, for the "if few fit" note. */
  securedFit: CardRecord | null;
}

function proofOk(type: ReadyInput['incomeType'], proofs: Proof[]): boolean {
  const has = (p: Proof) => proofs.includes(p);
  switch (type) {
    case 'salaried':
      return has('payslip') || has('bank_statement') || has('lhdn');
    case 'gig':
      return has('bank_statement') || has('gig_statement');
    case 'parttime':
    case 'student':
      return has('payslip') || has('bank_statement') || has('gig_statement');
  }
}

export function bestMatches(cards: CardRecord[], ready: ReadyInput, limit = 3): MatchResult {
  const age = parseAmount(ready.age);
  const monthly = parseAmount(ready.income);
  const annual = (Number.isNaN(monthly) ? 0 : monthly) * 12;
  const excluded = { tooYoung: 0, lowIncome: 0, noProof: 0 };
  const fits: Match[] = [];

  for (const c of cards) {
    if (!Number.isNaN(age) && age < c.minAge) { excluded.tooYoung++; continue; }
    if (annual < c.minAnnualIncome) { excluded.lowIncome++; continue; }
    if (!proofOk(ready.incomeType, c.incomeProof)) { excluded.noProof++; continue; }

    const d = derive(c);
    let score = d.friendliness;
    const reasons: Bi[] = [];

    if (ready.incomeType === 'gig' && d.gigFriendly) {
      score += 1;
      reasons.push({ en: 'It accepts bank statements or gig earnings statements, so you do not need a payslip.', ms: 'Ia menerima penyata bank atau penyata pendapatan gig, jadi anda tidak perlukan slip gaji.' });
    }
    if ((ready.incomeType === 'student' || ready.incomeType === 'parttime') && (d.studentFriendly || d.gigFriendly)) {
      score += 1;
      reasons.push({ en: 'It has rules that work for students and part-time earners.', ms: 'Ia mempunyai peraturan yang sesuai untuk pelajar dan pekerja separuh masa.' });
    }
    if (ready.incomeType === 'salaried' && c.incomeProof.includes('payslip')) {
      reasons.push({ en: 'You can use your payslip as proof of income.', ms: 'Anda boleh guna slip gaji sebagai bukti pendapatan.' });
    }
    if (c.digitalApplication) {
      score += 1;
      reasons.push({ en: `You can apply online. Typical approval: ${c.approvalTime.en.toLowerCase()}.`, ms: `Anda boleh memohon dalam talian. Kelulusan biasa: ${c.approvalTime.ms.toLowerCase()}.` });
    }
    if (annual >= c.minAnnualIncome * 1.25) {
      score += 0.5;
      reasons.push({ en: `Your income of ${money(monthly)} a month is comfortably above the ${money(Math.round(c.minAnnualIncome / 12))} a month it asks for.`, ms: `Pendapatan anda ${money(monthly)} sebulan selesa melebihi ${money(Math.round(c.minAnnualIncome / 12))} sebulan yang diminta.` });
    } else {
      reasons.push({ en: `Your income of ${money(monthly)} a month meets the ${money(Math.round(c.minAnnualIncome / 12))} a month it asks for, but with little room to spare.`, ms: `Pendapatan anda ${money(monthly)} sebulan memenuhi ${money(Math.round(c.minAnnualIncome / 12))} sebulan yang diminta, tetapi dengan ruang yang sedikit.` });
    }
    if (d.feeKind === 'free') {
      reasons.push({ en: 'There is no annual fee.', ms: 'Tiada yuran tahunan.' });
    } else if (d.feeKind === 'waivable' && c.annualFeeWaiver) {
      reasons.push({ en: `The ${money(c.annualFee)} annual fee can be waived. ${c.annualFeeWaiver.en}.`, ms: `Yuran tahunan ${money(c.annualFee)} boleh dikecualikan. ${c.annualFeeWaiver.ms}.` });
    }
    if (c.secured) {
      reasons.push({ en: 'It can be backed by a fixed deposit, which helps if you have little credit history.', ms: 'Ia boleh disandarkan dengan simpanan tetap, yang membantu jika sejarah kredit anda sedikit.' });
    }
    fits.push({ card: c, score, reasons: reasons.slice(0, 4) });
  }

  fits.sort((a, b) => b.score - a.score || a.card.minAnnualIncome - b.card.minAnnualIncome || a.card.annualFee - b.card.annualFee);
  const top = fits.slice(0, limit);
  const securedFit = fits.find((m) => m.card.secured)?.card ?? null;
  return { matches: top, excluded, securedFit };
}

// ---------- Cost simulator terms ----------

export function termsFromCard(c: CardRecord): Terms {
  return {
    aprPercent: c.interestPa,
    minPercent: c.minPayment.percent,
    minFloor: c.minPayment.floor,
    lateFlat: c.lateFee.flat,
    latePercent: c.lateFee.percent,
  };
}

// ---------- Compare table ----------

export type RowGroup = 'fees' | 'rates' | 'eligibility' | 'rewards' | 'application';
export type RowKind = 'lower' | 'higher' | 'bool' | 'text';

export interface Cell {
  main: Bi;
  note?: Bi;
}

export interface CompareRow {
  id: string;
  group: RowGroup;
  label: Bi;
  kind: RowKind;
  /** Value used to find the best card and to detect differences. */
  value: (c: CardRecord, d: Derived) => number | boolean | string;
  display: (c: CardRecord, d: Derived) => Cell;
}

export const GROUP_LABEL: Record<RowGroup, Bi> = {
  fees: { en: 'Fees', ms: 'Yuran' },
  rates: { en: 'Rates', ms: 'Kadar' },
  eligibility: { en: 'Eligibility', ms: 'Kelayakan' },
  rewards: { en: 'Rewards', ms: 'Ganjaran' },
  application: { en: 'Application', ms: 'Permohonan' },
};

const YES: Bi = { en: 'Yes', ms: 'Ya' };
const NO: Bi = { en: 'No', ms: 'Tidak' };
const NONE: Bi = { en: 'None', ms: 'Tiada' };
const yn = (b: boolean): Bi => (b ? YES : NO);
const pct = (n: number) => `${n}%`;
const both = (s: string): Bi => ({ en: s, ms: s });
const higherOf = (flat: number, percent: number): Bi => ({
  en: `Higher of ${money(flat)} or ${pct(percent)} of balance`,
  ms: `Yang lebih tinggi antara ${money(flat)} atau ${pct(percent)} daripada baki`,
});

const PROOF_LABEL: Record<Proof, Bi> = {
  payslip: { en: 'Payslip', ms: 'Slip gaji' },
  bank_statement: { en: 'Bank statement', ms: 'Penyata bank' },
  lhdn: { en: 'LHDN record', ms: 'Rekod LHDN' },
  gig_statement: { en: 'Gig earnings statement', ms: 'Penyata pendapatan gig' },
};
export const proofLabel = (p: Proof): Bi => PROOF_LABEL[p];

export const REWARD_LABEL: Record<RewardType, Bi> = {
  cashback: { en: 'Cashback', ms: 'Tunai balik' },
  points: { en: 'Points', ms: 'Mata' },
  miles: { en: 'Miles', ms: 'Batu udara' },
  none: { en: 'No rewards', ms: 'Tiada ganjaran' },
};

export const COMPARE_ROWS: CompareRow[] = [
  {
    id: 'annualFee', group: 'fees', label: { en: 'Annual fee', ms: 'Yuran tahunan' }, kind: 'lower',
    value: (c) => c.annualFee,
    display: (c) => ({ main: both(money(c.annualFee)), note: c.annualFeeWaiver ?? undefined }),
  },
  {
    id: 'lateFee', group: 'fees', label: { en: 'Late payment fee', ms: 'Fi bayaran lewat' }, kind: 'lower',
    value: (c) => c.lateFee.flat,
    display: (c) => ({ main: higherOf(c.lateFee.flat, c.lateFee.percent) }),
  },
  {
    id: 'cashAdvance', group: 'fees', label: { en: 'Cash advance fee', ms: 'Fi pendahuluan tunai' }, kind: 'lower',
    value: (c) => c.cashAdvance.percent,
    display: (c) => ({ main: { en: `${pct(c.cashAdvance.percent)} (at least ${money(c.cashAdvance.min)})`, ms: `${pct(c.cashAdvance.percent)} (sekurang-kurangnya ${money(c.cashAdvance.min)})` } }),
  },
  {
    id: 'fx', group: 'fees', label: { en: 'Foreign currency fee', ms: 'Fi mata wang asing' }, kind: 'lower',
    value: (c) => c.fxFeePercent,
    display: (c) => ({ main: both(pct(c.fxFeePercent)) }),
  },
  {
    id: 'suppFee', group: 'fees', label: { en: 'Extra (supplementary) card fee', ms: 'Yuran kad tambahan' }, kind: 'lower',
    value: (c) => (c.supplementary.max === 0 ? Number.POSITIVE_INFINITY : c.supplementary.annualFee),
    display: (c) => ({ main: c.supplementary.max === 0 ? { en: 'Not offered', ms: 'Tidak ditawarkan' } : both(`${money(c.supplementary.annualFee)} (max ${c.supplementary.max})`) }),
  },
  {
    id: 'rate', group: 'rates', label: { en: 'Interest rate a year', ms: 'Kadar faedah setahun' }, kind: 'lower',
    value: (c) => c.interestPa,
    display: (c) => ({ main: both(pct(c.interestPa)), note: c.kind === 'islamic' ? { en: 'Shown as a profit rate', ms: 'Ditunjukkan sebagai kadar keuntungan' } : undefined }),
  },
  {
    id: 'minPay', group: 'rates', label: { en: 'Minimum payment rule', ms: 'Peraturan bayaran minimum' }, kind: 'text',
    value: (c) => `${c.minPayment.percent}/${c.minPayment.floor}`,
    display: (c) => ({ main: { en: `Higher of ${pct(c.minPayment.percent)} of balance or ${money(c.minPayment.floor)}`, ms: `Yang lebih tinggi antara ${pct(c.minPayment.percent)} daripada baki atau ${money(c.minPayment.floor)}` } }),
  },
  {
    id: 'instalment', group: 'rates', label: { en: '0% instalment plans', ms: 'Pelan ansuran 0%' }, kind: 'text',
    value: (c) => c.instalment0?.en ?? '',
    display: (c) => ({ main: c.instalment0 ?? NONE }),
  },
  {
    id: 'minAge', group: 'eligibility', label: { en: 'Minimum age', ms: 'Umur minimum' }, kind: 'lower',
    value: (c) => c.minAge,
    display: (c) => ({ main: both(String(c.minAge)) }),
  },
  {
    id: 'minIncome', group: 'eligibility', label: { en: 'Minimum income', ms: 'Pendapatan minimum' }, kind: 'lower',
    value: (c) => c.minAnnualIncome,
    display: (c) => ({ main: { en: `${money(c.minAnnualIncome)} a year (${money(Math.round(c.minAnnualIncome / 12))} a month)`, ms: `${money(c.minAnnualIncome)} setahun (${money(Math.round(c.minAnnualIncome / 12))} sebulan)` } }),
  },
  {
    id: 'proofs', group: 'eligibility', label: { en: 'Income proof accepted', ms: 'Bukti pendapatan diterima' }, kind: 'higher',
    value: (c) => c.incomeProof.length,
    display: (c) => ({ main: { en: c.incomeProof.map((p) => PROOF_LABEL[p].en).join(', '), ms: c.incomeProof.map((p) => PROOF_LABEL[p].ms).join(', ') } }),
  },
  {
    id: 'gig', group: 'eligibility', label: { en: 'Gig-worker friendly', ms: 'Mesra pekerja gig' }, kind: 'bool',
    value: (_c, d) => d.gigFriendly,
    display: (_c, d) => ({ main: yn(d.gigFriendly) }),
  },
  {
    id: 'securedRow', group: 'eligibility', label: { en: 'Secured (deposit-backed) option', ms: 'Pilihan bercagar (disandarkan deposit)' }, kind: 'bool',
    value: (c) => c.secured,
    display: (c) => ({ main: yn(c.secured) }),
  },
  {
    id: 'tier', group: 'eligibility', label: { en: 'Card tier', ms: 'Tahap kad' }, kind: 'text',
    value: (c) => c.tier,
    display: (c) => ({ main: TIER_INFO[c.tier].label, note: TIER_INFO[c.tier].blurb }),
  },
  {
    id: 'rewardType', group: 'rewards', label: { en: 'Rewards', ms: 'Ganjaran' }, kind: 'text',
    value: (c) => `${c.rewards.type}|${c.rewards.summary.en}`,
    display: (c) => ({ main: REWARD_LABEL[c.rewards.type], note: c.rewards.summary }),
  },
  {
    id: 'rewardValue', group: 'rewards', label: { en: 'Rough return (illustrative)', ms: 'Anggaran pulangan (ilustrasi)' }, kind: 'higher',
    value: (c) => c.rewards.valuePercent,
    display: (c) => ({ main: both(pct(c.rewards.valuePercent)) }),
  },
  {
    id: 'welcome', group: 'rewards', label: { en: 'Welcome offer', ms: 'Tawaran alu-aluan' }, kind: 'text',
    value: (c) => c.welcomeOffer?.en ?? '',
    display: (c) => ({ main: c.welcomeOffer ?? NONE }),
  },
  {
    id: 'digital', group: 'application', label: { en: 'Apply online', ms: 'Mohon dalam talian' }, kind: 'bool',
    value: (c) => c.digitalApplication,
    display: (c) => ({ main: yn(c.digitalApplication) }),
  },
  {
    id: 'approval', group: 'application', label: { en: 'Typical approval time', ms: 'Masa kelulusan biasa' }, kind: 'text',
    value: (c) => c.approvalTime.en,
    display: (c) => ({ main: c.approvalTime }),
  },
  {
    id: 'friendly', group: 'application', label: { en: 'First-card friendliness (1 to 5)', ms: 'Kemesraan kad pertama (1 hingga 5)' }, kind: 'higher',
    value: (_c, d) => d.friendliness,
    display: (_c, d) => ({ main: both(`${d.friendliness} / 5`) }),
  },
];

export interface RowResult {
  row: CompareRow;
  cells: Cell[];
  /** Indexes of cards that hold the best value. Empty when there is no meaningful best. */
  best: number[];
  differs: boolean;
}

export function compareRows(cards: CardRecord[]): RowResult[] {
  const ds = cards.map(derive);
  return COMPARE_ROWS.map((row) => {
    const vals = cards.map((c, i) => row.value(c, ds[i]));
    const cells = cards.map((c, i) => row.display(c, ds[i]));
    const differs = new Set(vals.map((v) => String(v))).size > 1;
    let best: number[] = [];
    if (differs && cards.length > 1) {
      if (row.kind === 'lower' || row.kind === 'higher') {
        const nums = vals as number[];
        const target = row.kind === 'lower' ? Math.min(...nums) : Math.max(...nums);
        if (Number.isFinite(target)) best = nums.map((n, i) => (n === target ? i : -1)).filter((i) => i >= 0);
      } else if (row.kind === 'bool') {
        best = (vals as boolean[]).map((b, i) => (b ? i : -1)).filter((i) => i >= 0);
      }
    }
    return { row, cells, best, differs };
  });
}
