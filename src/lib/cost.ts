import { RATES, SIM_LIMITS } from '../config/rates.ts';

export type RepayMode = 'minimum' | 'fixed' | 'full';

export interface SimInput {
  spend: number;
  mode: RepayMode;
  fixed: number;
}

/** The rate and fee rules the simulator uses. Defaults come from config/rates.ts. A card can replace them. */
export interface Terms {
  aprPercent: number;
  minPercent: number;
  minFloor: number;
  lateFlat: number;
  latePercent: number;
  /** Most the late fee can be, in RM. Leave out for no limit. */
  lateMax?: number | null;
}

export const DEFAULT_TERMS: Terms = {
  aprPercent: RATES.aprPercent,
  minPercent: RATES.minPaymentPercent,
  minFloor: RATES.minPaymentFloor,
  lateFlat: RATES.lateFeeFlat,
  latePercent: RATES.lateFeePercent,
};

export interface SimResult {
  interest: number;
  firstMinPayment: number;
  lateFee: number;
  total: number;
  months: number;
  /** True when the chosen fixed amount was below the minimum, so the minimum was used. */
  usedMinimum: boolean;
  neverEnds: boolean;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Minimum payment: higher of X% of the balance or the floor, never more than the balance. */
export function minimumPayment(balance: number, terms: Terms = DEFAULT_TERMS): number {
  if (balance <= 0) return 0;
  const m = Math.max((balance * terms.minPercent) / 100, terms.minFloor);
  return round2(Math.min(m, balance));
}

export function lateFee(balance: number, terms: Terms = DEFAULT_TERMS): number {
  const fee = Math.max(terms.lateFlat, (balance * terms.latePercent) / 100);
  return round2(terms.lateMax != null ? Math.min(fee, terms.lateMax) : fee);
}

export function simulate(input: SimInput, terms: Terms = DEFAULT_TERMS): SimResult {
  const spend = Math.max(0, input.spend);
  const late = lateFee(spend, terms);
  if (input.mode === 'full') {
    return { interest: 0, firstMinPayment: minimumPayment(spend, terms), lateFee: late, total: round2(spend), months: 1, usedMinimum: false, neverEnds: false };
  }

  const monthlyRate = terms.aprPercent / 100 / 12;
  let balance = spend;
  let interest = 0;
  let months = 0;
  let usedMinimum = false;
  const firstMin = minimumPayment(spend, terms);

  while (balance > 0.005 && months < SIM_LIMITS.maxMonths) {
    const charge = balance * monthlyRate;
    interest += charge;
    balance += charge;
    const min = minimumPayment(balance, terms);
    let pay = min;
    if (input.mode === 'fixed') {
      if (input.fixed < min && months === 0) usedMinimum = true;
      pay = Math.max(min, input.fixed);
    }
    pay = Math.min(pay, balance);
    balance -= pay;
    months += 1;
  }

  const neverEnds = balance > 0.005;
  return {
    interest: round2(interest),
    firstMinPayment: firstMin,
    lateFee: late,
    total: round2(spend + interest),
    months,
    usedMinimum,
    neverEnds,
  };
}

/** Interest avoided this month by paying the full statement balance. */
export function interestAvoided(balance: number, terms: Terms = DEFAULT_TERMS): number {
  return round2(balance * (terms.aprPercent / 100 / 12));
}
