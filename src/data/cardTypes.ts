import type { Bi } from '../lib/eligibility.ts';

export type Network = 'Visa' | 'Mastercard' | 'Amex';
export type CardKind = 'conventional' | 'islamic';
export type Tier = 'classic' | 'gold' | 'platinum' | 'secured' | 'student';
export type Proof = 'payslip' | 'bank_statement' | 'lhdn' | 'gig_statement';
export type RewardType = 'cashback' | 'points' | 'miles' | 'none';

export const NETWORKS: Network[] = ['Visa', 'Mastercard', 'Amex'];
export const KINDS: CardKind[] = ['conventional', 'islamic'];
export const TIERS: Tier[] = ['classic', 'gold', 'platinum', 'secured', 'student'];
export const PROOFS: Proof[] = ['payslip', 'bank_statement', 'lhdn', 'gig_statement'];
export const REWARD_TYPES: RewardType[] = ['cashback', 'points', 'miles', 'none'];

/** One card. Edit src/data/cards.json to change the data. All values are illustrative samples. */
export interface CardRecord {
  id: string;
  bank: string;
  /** 2 to 3 letters shown in the logo placeholder. */
  bankShort: string;
  /** Illustrative product name, not a real product. */
  name: string;
  network: Network;
  kind: CardKind;
  tier: Tier;
  /** RM per year. */
  annualFee: number;
  /** Plain-language waiver condition, or null when there is none. */
  annualFeeWaiver: Bi | null;
  /** % a year. For Islamic cards this is the profit rate. */
  interestPa: number;
  /** Minimum payment is the higher of percent of balance or floor (RM). */
  minPayment: { percent: number; floor: number };
  /** Late fee is the higher of flat (RM) or percent of balance. */
  lateFee: { flat: number; percent: number };
  cashAdvance: { percent: number; min: number };
  fxFeePercent: number;
  minAge: number;
  /** RM per year. */
  minAnnualIncome: number;
  incomeProof: Proof[];
  supplementary: { max: number; annualFee: number };
  /** valuePercent is a rough illustrative return, used only for sorting. */
  rewards: { type: RewardType; summary: Bi; valuePercent: number };
  welcomeOffer: Bi | null;
  instalment0: Bi | null;
  digitalApplication: boolean;
  approvalTime: Bi;
  /** True when a fixed-deposit-backed option exists. */
  secured: boolean;
  pros: Bi[];
  cons: Bi[];
  bestFor: Bi;
  notFor: Bi;
  /** YYYY-MM-DD */
  lastUpdated: string;
  /** Placeholder link to the bank's official page. */
  sourceUrl: string;
}

export interface CardsFile {
  meta: { lastUpdated: string; note: Bi };
  cards: CardRecord[];
}
