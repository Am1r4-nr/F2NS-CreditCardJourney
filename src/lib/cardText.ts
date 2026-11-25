import type { CardRecord, Perk, Proof, RewardType } from '../data/cardTypes.ts';
import type { Bi } from './eligibility.ts';
import { money } from './format.ts';

export const NOT_STATED: Bi = { en: 'Not stated. Ask the bank', ms: 'Tidak dinyatakan. Tanya bank' };
const both = (s: string): Bi => ({ en: s, ms: s });

const num = (n: number) => String(Math.round(n * 100) / 100);

export function rateLabel(c: CardRecord): Bi {
  return c.kind === 'islamic'
    ? { en: 'Profit rate a year', ms: 'Kadar keuntungan setahun' }
    : { en: 'Interest a year', ms: 'Faedah setahun' };
}

/** Short interest text such as "15% to 18%" or "14%". */
export function interestText(c: CardRecord): Bi {
  const i = c.interest;
  if (!i) return NOT_STATED;
  if (i.max === null) return { en: `From ${num(i.min)}%`, ms: `Dari ${num(i.min)}%` };
  if (i.max === i.min) return both(`${num(i.min)}%`);
  return { en: `${num(i.min)}% to ${num(i.max)}%`, ms: `${num(i.min)}% hingga ${num(i.max)}%` };
}

export function annualFeeText(c: CardRecord): Bi {
  if (c.annualFee === null) return NOT_STATED;
  if (c.annualFee === 0) return { en: 'RM0 a year', ms: 'RM0 setahun' };
  return { en: `${money(c.annualFee)} a year`, ms: `${money(c.annualFee)} setahun` };
}

export function minPaymentText(c: CardRecord): Bi {
  const m = c.minPayment;
  if (!m) return NOT_STATED;
  return {
    en: `Higher of ${num(m.percent)}% of balance or ${money(m.floor)}`,
    ms: `Yang lebih tinggi antara ${num(m.percent)}% daripada baki atau ${money(m.floor)}`,
  };
}

export function lateFeeText(c: CardRecord): Bi {
  const l = c.lateFee;
  if (!l) return NOT_STATED;
  const capEn = l.max !== null ? `, up to ${money(l.max)}` : '';
  const capMs = l.max !== null ? `, sehingga ${money(l.max)}` : '';
  if (l.flat > 0) {
    return {
      en: `Higher of ${money(l.flat)} or ${num(l.percent)}% of balance${capEn}`,
      ms: `Yang lebih tinggi antara ${money(l.flat)} atau ${num(l.percent)}% daripada baki${capMs}`,
    };
  }
  return { en: `${num(l.percent)}% of balance${capEn}`, ms: `${num(l.percent)}% daripada baki${capMs}` };
}

export function cashAdvanceText(c: CardRecord): Bi {
  const a = c.cashAdvance;
  if (!a) return NOT_STATED;
  const tail: Bi = { en: '. Interest starts at once', ms: '. Faedah bermula serta-merta' };
  let main: Bi;
  if (a.percent !== undefined && a.flat !== undefined && a.min === undefined) {
    main = { en: `${money(a.flat)} plus ${num(a.percent)}%`, ms: `${money(a.flat)} serta ${num(a.percent)}%` };
  } else if (a.percent !== undefined && a.min !== undefined) {
    main = { en: `${num(a.percent)}% or ${money(a.min)}, whichever is higher`, ms: `${num(a.percent)}% atau ${money(a.min)}, mana yang lebih tinggi` };
  } else if (a.percent !== undefined) {
    main = both(`${num(a.percent)}%`);
  } else if (a.flat !== undefined) {
    main = both(money(a.flat));
  } else {
    return NOT_STATED;
  }
  return { en: main.en + tail.en, ms: main.ms + tail.ms };
}

export function fxText(c: CardRecord): Bi {
  if (c.fxPercent === null) return NOT_STATED;
  if (c.fxPercent === 0) return c.fxNote ?? { en: 'No markup', ms: 'Tiada tambahan' };
  return { en: `${num(c.fxPercent)}%${c.fxNote ? `. ${c.fxNote.en}` : ''}`, ms: `${num(c.fxPercent)}%${c.fxNote ? `. ${c.fxNote.ms}` : ''}` };
}

export function serviceTaxText(c: CardRecord): Bi {
  if (c.serviceTax === null) return NOT_STATED;
  return { en: `${money(c.serviceTax)} a year on each card`, ms: `${money(c.serviceTax)} setahun bagi setiap kad` };
}

export function incomeText(c: CardRecord): Bi {
  if (c.minAnnualIncome === null) return c.incomeNote ?? NOT_STATED;
  const monthly = Math.round(c.minAnnualIncome / 12);
  const base: Bi = { en: `${money(c.minAnnualIncome)} a year (${money(monthly)} a month)`, ms: `${money(c.minAnnualIncome)} setahun (${money(monthly)} sebulan)` };
  return c.incomeNote ? { en: `${base.en}. ${c.incomeNote.en}`, ms: `${base.ms}. ${c.incomeNote.ms}` } : base;
}

/** Short income text for card tiles, such as "RM2,000 a month". */
export function incomeShort(c: CardRecord): Bi {
  if (c.minAnnualIncome === null) return { en: 'Ask the bank', ms: 'Tanya bank' };
  const m = Math.round(c.minAnnualIncome / 12);
  return { en: `${money(m)} a month`, ms: `${money(m)} sebulan` };
}

export function networkText(c: CardRecord): Bi {
  return c.network ? both(c.network) : { en: 'Not stated', ms: 'Tidak dinyatakan' };
}

export function ageText(c: CardRecord): Bi {
  if (c.minAge === null) return NOT_STATED;
  return c.maxAge ? { en: `${c.minAge} to ${c.maxAge}`, ms: `${c.minAge} hingga ${c.maxAge}` } : both(String(c.minAge));
}

export const REWARD_LABEL: Record<RewardType, Bi> = {
  cashback: { en: 'Cashback', ms: 'Tunai balik' },
  points: { en: 'Points', ms: 'Mata' },
  miles: { en: 'Miles', ms: 'Batu udara' },
  none: { en: 'No rewards', ms: 'Tiada ganjaran' },
};

const PROOF_LABEL: Record<Proof, Bi> = {
  payslip: { en: 'Payslip', ms: 'Slip gaji' },
  bank_statement: { en: 'Bank statement', ms: 'Penyata bank' },
  lhdn: { en: 'LHDN record', ms: 'Rekod LHDN' },
  gig_statement: { en: 'Gig earnings statement', ms: 'Penyata pendapatan gig' },
};
export const proofLabel = (p: Proof): Bi => PROOF_LABEL[p];

export function perkText(p: Perk): Bi {
  const n = p.n;
  switch (p.k) {
    case 'lounge':
      return { en: `${n ?? ''} airport lounge visits a year`.trim(), ms: `${n ?? ''} lawatan lounge lapangan terbang setahun`.trim() };
    case 'loungeUnlimited':
      return { en: 'Unlimited airport lounge visits', ms: 'Lawatan lounge lapangan terbang tanpa had' };
    case 'skyLounge':
      return { en: `Subang Sky Lounge visits (up to ${n ?? 12} a year, with monthly spending)`, ms: `Lawatan Subang Sky Lounge (sehingga ${n ?? 12} setahun, dengan perbelanjaan bulanan)` };
    case 'travelIns':
      return n
        ? { en: `Travel insurance (death or disability up to ${money(n)})`, ms: `Insurans perjalanan (kematian atau hilang upaya sehingga ${money(n)})` }
        : { en: 'Travel insurance', ms: 'Insurans perjalanan' };
    case 'golf':
      return { en: 'Golf green fee privileges', ms: 'Keistimewaan yuran padang golf' };
    case 'dining':
      return { en: 'Dining discounts', ms: 'Diskaun makan' };
    case 'fastTrack':
      return { en: 'Airport fast track', ms: 'Laluan pantas lapangan terbang' };
    case 'concierge':
      return { en: 'Concierge service', ms: 'Perkhidmatan concierge' };
    case 'noLateFee':
      return { en: 'No late payment charge', ms: 'Tiada caj bayaran lewat' };
    case 'cinema':
      return { en: 'Cinema discounts', ms: 'Diskaun pawagam' };
    case 'airportTransfer':
      return { en: 'Airport transfers', ms: 'Pengangkutan ke lapangan terbang' };
    case 'grabRides':
      return { en: 'Free Grab rides from the airport', ms: 'Perjalanan Grab percuma dari lapangan terbang' };
    case 'familyTakaful':
      return { en: `Family takaful cover${n ? ` up to ${money(n)}` : ''}`, ms: `Perlindungan takaful keluarga${n ? ` sehingga ${money(n)}` : ''}` };
  }
}

export function perksList(c: CardRecord): Bi[] {
  return c.perks.map(perkText);
}

export function perksSummary(c: CardRecord): Bi {
  if (c.perks.length === 0) return { en: 'None listed', ms: 'Tiada disenaraikan' };
  const list = perksList(c);
  return { en: list.map((p) => p.en).join('; '), ms: list.map((p) => p.ms).join('; ') };
}

export function depositText(c: CardRecord): Bi {
  if (!c.secured) return { en: 'No', ms: 'Tidak' };
  return c.securedDeposit
    ? { en: `Yes. Pledge a fixed deposit of ${money(c.securedDeposit)} or more`, ms: `Ya. Cagarkan simpanan tetap ${money(c.securedDeposit)} atau lebih` }
    : { en: 'Yes', ms: 'Ya' };
}
