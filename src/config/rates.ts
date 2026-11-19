// Single source of truth for every illustrative rate, fee and limit.
// These numbers are for the prototype only. They are not a real bank offer.

export const RATES = {
  /** Interest rate per year on a balance that is not paid in full. */
  aprPercent: 15,
  /** Minimum payment is the higher of this percent of the balance or the floor. */
  minPaymentPercent: 5,
  minPaymentFloor: 50,
  /** Late fee is the higher of the flat fee or this percent of the balance. */
  lateFeeFlat: 10,
  lateFeePercent: 1,
  /** Fees that are not part of the simulator total, but must be shown. */
  annualFeeFirstYear: 0,
  annualFeeAfter: 50,
  serviceTaxPerYear: 25,
  cashAdvancePercent: 5,
  cashAdvanceMin: 10,
  fxFeePercent: 1,
  /** Days with no interest when the full statement balance is paid on time. */
  graceDays: 20,
  /** Illustrative credit limit range for a first card. */
  limitMin: 500,
  limitMax: 3000,
  approvedDemoLimit: 1500,
} as const;

export const SIM_LIMITS = {
  spendMin: 100,
  spendMax: 3000,
  spendStep: 50,
  spendDefault: 500,
  fixedDefault: 100,
  maxMonths: 600,
} as const;

export const ELIGIBILITY = {
  minAge: 21,
  minMonthlyIncome: 2000,
  /** Income within this amount above the minimum is a "check", not a clear pass. */
  incomeBuffer: 500,
  comfortableCommitmentsRatio: 0.4,
  maxCommitmentsRatio: 0.6,
} as const;

export const DECISION_TIME = {
  en: 'the same day, and at most 3 working days',
  ms: 'hari yang sama, dan paling lama 3 hari bekerja',
} as const;

export const UTILISATION_TARGET = 30;

/** Placeholder contact details. Not real. */
export const PLACEHOLDERS = {
  phone: '1-300-00-0000',
  license: 'BNM licence no. XXXX (placeholder)',
};
