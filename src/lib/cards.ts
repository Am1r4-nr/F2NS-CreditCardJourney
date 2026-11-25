import type { CardKind, CardRecord, Network, RewardType, Tier } from '../data/cardTypes.ts';
import type { Bi, ReadyInput } from './eligibility.ts';
import { money, parseAmount } from './format.ts';
import { DEFAULT_TERMS, type Terms } from './cost.ts';
import {
  NOT_STATED, REWARD_LABEL, ageText, annualFeeText, cashAdvanceText, depositText, fxText, incomeText, interestText,
  lateFeeText, minPaymentText, networkText, perksSummary, proofLabel, serviceTaxText,
} from './cardText.ts';

export { REWARD_LABEL, proofLabel };

// ---------- Derived fields ----------

export type Criterion = 'income' | 'proof' | 'fee' | 'secured';
export type FeeKind = 'free' | 'waivable' | 'paid' | 'unknown';

export interface Derived {
  /** 1 to 5 */
  friendliness: number;
  /** Points (0 to 1) earned per criterion. */
  points: Record<Criterion, number>;
  gigFriendly: boolean;
  lowIncomeFriendly: boolean;
  feeKind: FeeKind;
}

export function feeKind(c: CardRecord): FeeKind {
  if (c.annualFee === null) return 'unknown';
  if (c.annualFee === 0) return 'free';
  return c.annualFeeWaiver ? 'waivable' : 'paid';
}

/** The bank lists a bank statement or a gig earnings statement as income proof. */
export function acceptsGig(c: CardRecord): boolean {
  return c.incomeProof.includes('bank_statement') || c.incomeProof.includes('gig_statement');
}

/** Income of RM2,000 a month or less is needed, or a fixed deposit can back the card. */
export function isLowIncomeFriendly(c: CardRecord): boolean {
  return c.secured || (c.minAnnualIncome !== null && c.minAnnualIncome <= 24000);
}

export function derive(c: CardRecord): Derived {
  const points: Record<Criterion, number> = {
    income: c.minAnnualIncome === null ? 0 : c.minAnnualIncome <= 24000 ? 1 : c.minAnnualIncome <= 36000 ? 0.5 : 0,
    proof: c.incomeProof.length >= 3 ? 1 : c.incomeProof.length === 2 ? 0.5 : 0,
    fee: c.annualFee === null ? 0 : c.annualFee === 0 ? 1 : c.annualFeeWaiver ? (c.annualFee <= 200 ? 0.7 : 0.3) : c.annualFee <= 100 ? 0.4 : 0,
    secured: c.secured ? 1 : 0,
  };
  const sum = Object.values(points).reduce((a, b) => a + b, 0);
  return {
    friendliness: Math.max(1, Math.min(5, Math.round(1 + sum))),
    points,
    gigFriendly: acceptsGig(c),
    lowIncomeFriendly: isLowIncomeFriendly(c),
    feeKind: feeKind(c),
  };
}

export const CRITERIA_LABEL: Record<Criterion, Bi> = {
  income: { en: 'Low income requirement (RM2,000 a month or less)', ms: 'Keperluan pendapatan rendah (RM2,000 sebulan atau kurang)' },
  proof: { en: 'Flexible income proof (3 or more kinds)', ms: 'Bukti pendapatan fleksibel (3 jenis atau lebih)' },
  fee: { en: 'Low or waivable annual fee', ms: 'Yuran tahunan rendah atau boleh dikecualikan' },
  secured: { en: 'Can be backed by a fixed deposit', ms: 'Boleh disandarkan dengan simpanan tetap' },
};

// ---------- Filters, search, sort ----------

export type SortKey = 'best' | 'fee' | 'rate' | 'income' | 'rewards';

export interface Filters {
  bank: string;
  kind: '' | CardKind;
  network: '' | Network | 'unknown';
  tier: '' | Tier;
  fee: '' | FeeKind;
  reward: '' | RewardType;
  /** Monthly income slider. At INCOME_SLIDER_MAX it means "no limit". */
  maxMonthlyIncome: number;
  gig: boolean;
  secured: boolean;
  lowIncome: boolean;
}

export const INCOME_SLIDER_MAX = 10000;
export const INCOME_SLIDER_STEP = 500;

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
  lowIncome: false,
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
  if (f.lowIncome) n++;
  return n;
}

export function matches(c: CardRecord, query: string, f: Filters): boolean {
  const q = query.trim().toLowerCase();
  if (q && !`${c.bank} ${c.name}`.toLowerCase().includes(q)) return false;
  if (f.bank && c.bank !== f.bank) return false;
  if (f.kind && c.kind !== f.kind) return false;
  if (f.network === 'unknown' ? c.network !== null : f.network && c.network !== f.network) return false;
  if (f.tier && c.tier !== f.tier) return false;
  if (f.fee && feeKind(c) !== f.fee) return false;
  if (f.reward && c.rewards.type !== f.reward) return false;
  // A card with no stated income cannot be shown to fit under the slider.
  if (f.maxMonthlyIncome < INCOME_SLIDER_MAX && (c.minAnnualIncome === null || c.minAnnualIncome / 12 > f.maxMonthlyIncome)) return false;
  if (f.gig && !acceptsGig(c)) return false;
  if (f.secured && !c.secured) return false;
  if (f.lowIncome && !isLowIncomeFriendly(c)) return false;
  return true;
}

/** Card tiers in the order we show them, with plain-language meaning. */
export const TIER_ORDER: Tier[] = ['classic', 'gold', 'platinum', 'premium', 'secured', 'student'];

export const TIER_INFO: Record<Tier, { icon: string; label: Bi; blurb: Bi }> = {
  classic: { icon: '◇', label: { en: 'Classic', ms: 'Klasik' }, blurb: { en: 'Basic card. Usually the lowest income needed.', ms: 'Kad asas. Biasanya pendapatan paling rendah diperlukan.' } },
  gold: { icon: '◆', label: { en: 'Gold', ms: 'Emas' }, blurb: { en: 'More rewards and perks. Mid-level income needed.', ms: 'Lebih banyak ganjaran dan faedah. Pendapatan sederhana diperlukan.' } },
  platinum: { icon: '❖', label: { en: 'Platinum', ms: 'Platinum' }, blurb: { en: 'Better rewards, and sometimes travel cover. A higher income is needed.', ms: 'Ganjaran lebih baik, dan kadangkala perlindungan perjalanan. Pendapatan lebih tinggi diperlukan.' } },
  premium: { icon: '✦', label: { en: 'Premium', ms: 'Premium' }, blurb: { en: 'Signature, Infinite, World and similar cards. Lounge access and travel perks. High income needed.', ms: 'Kad Signature, Infinite, World dan seumpamanya. Akses lounge dan faedah perjalanan. Pendapatan tinggi diperlukan.' } },
  secured: { icon: '🔒', label: { en: 'Secured', ms: 'Bercagar' }, blurb: { en: 'Backed by your own fixed deposit. Easier to get with little credit history.', ms: 'Disandarkan dengan simpanan tetap anda. Lebih mudah diperoleh jika sejarah kredit sedikit.' } },
  student: { icon: '🎓', label: { en: 'Student', ms: 'Pelajar' }, blurb: { en: 'Made for students, with a low income needed.', ms: 'Dibuat untuk pelajar, dengan pendapatan rendah diperlukan.' } },
};

/** How many cards fall in each tier, given the search and every filter except the tier itself. */
export function tierCounts(cards: CardRecord[], query: string, f: Filters): Record<Tier, number> {
  const out: Record<Tier, number> = { classic: 0, gold: 0, platinum: 0, premium: 0, secured: 0, student: 0 };
  for (const c of cards) if (matches(c, query, { ...f, tier: '' })) out[c.tier] += 1;
  return out;
}

export function filterCards(cards: CardRecord[], query: string, f: Filters): CardRecord[] {
  return cards.filter((c) => matches(c, query, f));
}

/** Sorts numbers with "not stated" (null) always last. */
export function nullLast(a: number | null, b: number | null, dir: 1 | -1 = 1): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * dir;
}

export function sortCards(cards: CardRecord[], sort: SortKey): CardRecord[] {
  const byName = (a: CardRecord, b: CardRecord) => `${a.bank} ${a.name}`.localeCompare(`${b.bank} ${b.name}`);
  const list = [...cards];
  switch (sort) {
    case 'fee':
      return list.sort((a, b) => nullLast(a.annualFee, b.annualFee) || nullLast(a.interest?.min ?? null, b.interest?.min ?? null) || byName(a, b));
    case 'rate':
      return list.sort((a, b) => nullLast(a.interest?.min ?? null, b.interest?.min ?? null) || nullLast(a.annualFee, b.annualFee) || byName(a, b));
    case 'income':
      return list.sort((a, b) => nullLast(a.minAnnualIncome, b.minAnnualIncome) || nullLast(a.annualFee, b.annualFee) || byName(a, b));
    case 'rewards':
      return list.sort((a, b) => nullLast(a.rewards.valuePercent, b.rewards.valuePercent, -1) || nullLast(a.annualFee, b.annualFee) || byName(a, b));
    case 'best':
    default:
      return list.sort(
        (a, b) =>
          derive(b).friendliness - derive(a).friendliness ||
          nullLast(a.minAnnualIncome, b.minAnnualIncome) ||
          nullLast(a.annualFee, b.annualFee) ||
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
  excluded: { tooYoung: number; lowIncome: number; noProof: number; incomeNotStated: number };
  /** A deposit-backed card that fits, if any, for the "if few fit" note. */
  securedFit: CardRecord | null;
}

function proofOk(type: ReadyInput['incomeType'], c: CardRecord): boolean {
  const has = (p: CardRecord['incomeProof'][number]) => c.incomeProof.includes(p);
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

/** Picks the best cards, with at most one per bank first so the list is not all one bank. */
export function bestMatches(cards: CardRecord[], ready: ReadyInput, limit = 3): MatchResult {
  const age = parseAmount(ready.age);
  const monthly = parseAmount(ready.income);
  const annual = (Number.isNaN(monthly) ? 0 : monthly) * 12;
  const excluded = { tooYoung: 0, lowIncome: 0, noProof: 0, incomeNotStated: 0 };
  const fits: Match[] = [];

  for (const c of cards) {
    if (!Number.isNaN(age) && c.minAge !== null && age < c.minAge) { excluded.tooYoung++; continue; }
    // A deposit-backed card can be an option when income or proof falls short: the user pledges a fixed deposit instead.
    const incomeShort = c.minAnnualIncome !== null && annual < c.minAnnualIncome;
    const proofShort = !proofOk(ready.incomeType, c);
    const depositRoute = c.secured && (incomeShort || proofShort || c.minAnnualIncome === null);
    if (!depositRoute) {
      if (c.minAnnualIncome === null) { excluded.incomeNotStated++; continue; }
      if (incomeShort) { excluded.lowIncome++; continue; }
      if (proofShort) { excluded.noProof++; continue; }
    }

    const d = derive(c);
    let score = d.friendliness;
    const reasons: Bi[] = [];

    if (ready.incomeType === 'gig' && d.gigFriendly) {
      score += 1;
      reasons.push({ en: `${c.bank} lists bank statements as income proof, so a payslip is not the only way. It may also ask for tax or business papers.`, ms: `${c.bank} menyenaraikan penyata bank sebagai bukti pendapatan, jadi slip gaji bukan satu-satunya cara. Ia juga mungkin meminta dokumen cukai atau perniagaan.` });
    }
    if ((ready.incomeType === 'student' || ready.incomeType === 'parttime') && d.lowIncomeFriendly) {
      score += 1;
      reasons.push({ en: 'It asks for a low income, or can be backed by a fixed deposit.', ms: 'Ia meminta pendapatan rendah, atau boleh disandarkan dengan simpanan tetap.' });
    }
    if (ready.incomeType === 'salaried' && c.incomeProof.includes('payslip')) {
      reasons.push({ en: 'You can use your payslip as proof of income.', ms: 'Anda boleh guna slip gaji sebagai bukti pendapatan.' });
    }
    const monthlyNeed = c.minAnnualIncome === null ? 0 : Math.round(c.minAnnualIncome / 12);
    if (depositRoute) {
      score += 0.5;
      reasons.unshift({
        en: `You can pledge a fixed deposit${c.securedDeposit ? ` of ${money(c.securedDeposit)} or more` : ''} with the bank instead of showing income. The bank still decides.`,
        ms: `Anda boleh mencagarkan simpanan tetap${c.securedDeposit ? ` ${money(c.securedDeposit)} atau lebih` : ''} dengan bank sebagai ganti menunjukkan pendapatan. Bank masih memutuskan.`,
      });
    } else if (c.minAnnualIncome !== null && annual >= c.minAnnualIncome * 1.25) {
      score += 0.5;
      reasons.push({ en: `Your income of ${money(monthly)} a month is comfortably above the ${money(monthlyNeed)} a month it asks for.`, ms: `Pendapatan anda ${money(monthly)} sebulan selesa melebihi ${money(monthlyNeed)} sebulan yang diminta.` });
    } else if (c.minAnnualIncome !== null) {
      reasons.push({ en: `Your income of ${money(monthly)} a month meets the ${money(monthlyNeed)} a month it asks for, with little room to spare.`, ms: `Pendapatan anda ${money(monthly)} sebulan memenuhi ${money(monthlyNeed)} sebulan yang diminta, dengan ruang yang sedikit.` });
    }
    if (d.feeKind === 'free') {
      reasons.push({ en: 'There is no annual fee. The RM25 yearly service tax may still apply.', ms: 'Tiada yuran tahunan. Cukai perkhidmatan RM25 setahun mungkin masih dikenakan.' });
    } else if (d.feeKind === 'waivable' && c.annualFeeWaiver && c.annualFee !== null) {
      reasons.push({ en: `The ${money(c.annualFee)} annual fee can be waived. ${c.annualFeeWaiver.en}.`, ms: `Yuran tahunan ${money(c.annualFee)} boleh dikecualikan. ${c.annualFeeWaiver.ms}.` });
    }
    if (c.secured && !depositRoute) {
      reasons.push({ en: 'It can be backed by a fixed deposit, which helps if you have little credit history.', ms: 'Ia boleh disandarkan dengan simpanan tetap, yang membantu jika sejarah kredit anda sedikit.' });
    }
    fits.push({ card: c, score, reasons: reasons.slice(0, 4) });
  }

  fits.sort((a, b) => b.score - a.score || (a.card.annualFee ?? 9999) - (b.card.annualFee ?? 9999) || (a.card.minAnnualIncome ?? 0) - (b.card.minAnnualIncome ?? 0) || a.card.name.localeCompare(b.card.name));
  const top: Match[] = [];
  const usedBanks = new Set<string>();
  for (const m of fits) {
    if (top.length >= limit) break;
    if (usedBanks.has(m.card.bankId)) continue;
    usedBanks.add(m.card.bankId);
    top.push(m);
  }
  for (const m of fits) {
    if (top.length >= limit) break;
    if (!top.includes(m)) top.push(m);
  }
  const securedFit = fits.find((m) => m.card.secured)?.card ?? null;
  return { matches: top, excluded, securedFit };
}

// ---------- Cost simulator terms ----------

/** For a card with a range of rates, uses the highest, because new cardholders usually start there. */
export function termsFromCard(c: CardRecord): Terms {
  return {
    aprPercent: c.interest ? (c.interest.max ?? c.interest.min) : DEFAULT_TERMS.aprPercent,
    minPercent: c.minPayment?.percent ?? DEFAULT_TERMS.minPercent,
    minFloor: c.minPayment?.floor ?? DEFAULT_TERMS.minFloor,
    lateFlat: c.lateFee ? c.lateFee.flat : DEFAULT_TERMS.lateFlat,
    latePercent: c.lateFee ? c.lateFee.percent : DEFAULT_TERMS.latePercent,
    lateMax: c.lateFee ? c.lateFee.max : null,
  };
}

/** Which parts of the card's terms are missing, so the simulator can say it used standard figures. */
export function missingTerms(c: CardRecord): { interest: boolean; minPayment: boolean; lateFee: boolean } {
  return { interest: !c.interest, minPayment: !c.minPayment, lateFee: !c.lateFee };
}

// ---------- Compare table ----------

export type RowGroup = 'fees' | 'rates' | 'eligibility' | 'rewards' | 'application';
export type RowKind = 'lower' | 'higher' | 'bool' | 'text';

export interface Cell {
  main: Bi;
  note?: Bi;
}

type RowValue = number | boolean | string | null;

export interface CompareRow {
  id: string;
  group: RowGroup;
  label: Bi;
  kind: RowKind;
  /** Value used to find the best card and to detect differences. null means "not stated". */
  value: (c: CardRecord, d: Derived) => RowValue;
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
const yn = (b: boolean): Bi => (b ? YES : NO);

export const COMPARE_ROWS: CompareRow[] = [
  {
    id: 'annualFee', group: 'fees', label: { en: 'Annual fee', ms: 'Yuran tahunan' }, kind: 'lower',
    value: (c) => c.annualFee,
    display: (c) => ({ main: annualFeeText(c), note: c.annualFeeWaiver ?? undefined }),
  },
  {
    id: 'serviceTax', group: 'fees', label: { en: 'Service tax', ms: 'Cukai perkhidmatan' }, kind: 'text',
    value: (c) => c.serviceTax,
    display: (c) => ({ main: serviceTaxText(c) }),
  },
  {
    id: 'lateFee', group: 'fees', label: { en: 'Late payment charge', ms: 'Caj bayaran lewat' }, kind: 'text',
    value: (c) => (c.lateFee ? `${c.lateFee.flat}/${c.lateFee.percent}/${c.lateFee.max}` : null),
    display: (c) => ({ main: lateFeeText(c) }),
  },
  {
    id: 'cashAdvance', group: 'fees', label: { en: 'Cash advance fee', ms: 'Fi pendahuluan tunai' }, kind: 'text',
    value: (c) => (c.cashAdvance ? JSON.stringify(c.cashAdvance) : null),
    display: (c) => ({ main: cashAdvanceText(c) }),
  },
  {
    id: 'fx', group: 'fees', label: { en: 'Foreign currency fee', ms: 'Fi mata wang asing' }, kind: 'lower',
    value: (c) => c.fxPercent,
    display: (c) => ({ main: fxText(c) }),
  },
  {
    id: 'rate', group: 'rates', label: { en: 'Interest or profit rate a year', ms: 'Kadar faedah atau keuntungan setahun' }, kind: 'lower',
    value: (c) => c.interest?.min ?? null,
    display: (c) => ({ main: interestText(c), note: c.interestNote ?? undefined }),
  },
  {
    id: 'minPay', group: 'rates', label: { en: 'Minimum payment rule', ms: 'Peraturan bayaran minimum' }, kind: 'text',
    value: (c) => (c.minPayment ? `${c.minPayment.percent}/${c.minPayment.floor}` : null),
    display: (c) => ({ main: minPaymentText(c) }),
  },
  {
    id: 'instalment', group: 'rates', label: { en: '0% instalment plans', ms: 'Pelan ansuran 0%' }, kind: 'text',
    value: (c) => c.instalment0?.en ?? null,
    display: (c) => ({ main: c.instalment0 ?? NOT_STATED }),
  },
  {
    id: 'tier', group: 'eligibility', label: { en: 'Card tier', ms: 'Tahap kad' }, kind: 'text',
    value: (c) => c.tier,
    display: (c) => ({ main: TIER_INFO[c.tier].label, note: TIER_INFO[c.tier].blurb }),
  },
  {
    id: 'minAge', group: 'eligibility', label: { en: 'Minimum age', ms: 'Umur minimum' }, kind: 'lower',
    value: (c) => c.minAge,
    display: (c) => ({ main: ageText(c) }),
  },
  {
    id: 'minIncome', group: 'eligibility', label: { en: 'Minimum income', ms: 'Pendapatan minimum' }, kind: 'lower',
    value: (c) => c.minAnnualIncome,
    display: (c) => ({ main: incomeText(c) }),
  },
  {
    id: 'proofs', group: 'eligibility', label: { en: 'Income proof the bank lists', ms: 'Bukti pendapatan yang disenaraikan bank' }, kind: 'higher',
    value: (c) => c.incomeProof.length,
    display: (c) => ({ main: { en: c.incomeProof.map((p) => proofLabel(p).en).join(', '), ms: c.incomeProof.map((p) => proofLabel(p).ms).join(', ') } }),
  },
  {
    id: 'gig', group: 'eligibility', label: { en: 'Lists bank statements as proof', ms: 'Menyenaraikan penyata bank sebagai bukti' }, kind: 'bool',
    value: (_c, d) => d.gigFriendly,
    display: (_c, d) => ({ main: yn(d.gigFriendly) }),
  },
  {
    id: 'securedRow', group: 'eligibility', label: { en: 'Fixed-deposit-backed option', ms: 'Pilihan disandarkan simpanan tetap' }, kind: 'bool',
    value: (c) => c.secured,
    display: (c) => ({ main: depositText(c) }),
  },
  {
    id: 'rewardType', group: 'rewards', label: { en: 'Rewards', ms: 'Ganjaran' }, kind: 'text',
    value: (c) => `${c.rewards.type}|${c.rewards.summary.en}`,
    display: (c) => ({ main: REWARD_LABEL[c.rewards.type], note: c.rewards.summary }),
  },
  {
    id: 'rewardValue', group: 'rewards', label: { en: 'Highest cashback rate', ms: 'Kadar tunai balik tertinggi' }, kind: 'higher',
    value: (c) => c.rewards.valuePercent,
    display: (c) => ({ main: c.rewards.valuePercent === null ? { en: 'No cashback rate', ms: 'Tiada kadar tunai balik' } : { en: `Up to ${c.rewards.valuePercent}%, with conditions`, ms: `Sehingga ${c.rewards.valuePercent}%, dengan syarat` } }),
  },
  {
    id: 'perks', group: 'rewards', label: { en: 'Travel and lifestyle perks', ms: 'Faedah perjalanan dan gaya hidup' }, kind: 'text',
    value: (c) => c.perks.map((p) => `${p.k}${p.n ?? ''}`).join(','),
    display: (c) => ({ main: perksSummary(c) }),
  },
  {
    id: 'approval', group: 'application', label: { en: 'Typical approval time', ms: 'Masa kelulusan biasa' }, kind: 'text',
    value: (c) => c.approvalTime?.en ?? null,
    display: (c) => ({ main: c.approvalTime ?? NOT_STATED }),
  },
  {
    id: 'friendly', group: 'application', label: { en: 'First-card friendliness (1 to 5)', ms: 'Kemesraan kad pertama (1 hingga 5)' }, kind: 'higher',
    value: (_c, d) => d.friendliness,
    display: (_c, d) => ({ main: { en: `${d.friendliness} / 5`, ms: `${d.friendliness} / 5` } }),
  },
];

// Network is shown in headers, but kept here for completeness in the detail view.
export const networkLabel = networkText;

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
        const nums = vals.filter((v): v is number => typeof v === 'number');
        if (nums.length > 0) {
          const target = row.kind === 'lower' ? Math.min(...nums) : Math.max(...nums);
          best = vals.map((v, i) => (v === target ? i : -1)).filter((i) => i >= 0);
        }
      } else if (row.kind === 'bool') {
        best = vals.map((v, i) => (v === true ? i : -1)).filter((i) => i >= 0);
      }
    }
    return { row, cells, best, differs };
  });
}
