import type { Bi } from '../lib/eligibility.ts';

export type Network = 'Visa' | 'Mastercard' | 'Amex' | 'UnionPay';
export type CardKind = 'conventional' | 'islamic';
/** premium covers Signature, Infinite, World and other top cards. */
export type Tier = 'classic' | 'gold' | 'platinum' | 'premium' | 'secured' | 'student';
export type Proof = 'payslip' | 'bank_statement' | 'lhdn' | 'gig_statement';
export type RewardType = 'cashback' | 'points' | 'miles' | 'none';
export type PerkKey =
  | 'lounge' | 'loungeUnlimited' | 'skyLounge' | 'travelIns' | 'golf' | 'dining' | 'fastTrack'
  | 'concierge' | 'noLateFee' | 'cinema' | 'airportTransfer' | 'grabRides' | 'familyTakaful';

export const NETWORKS: Network[] = ['Visa', 'Mastercard', 'Amex', 'UnionPay'];
export const KINDS: CardKind[] = ['conventional', 'islamic'];
export const TIERS: Tier[] = ['classic', 'gold', 'platinum', 'premium', 'secured', 'student'];
export const PROOFS: Proof[] = ['payslip', 'bank_statement', 'lhdn', 'gig_statement'];
export const REWARD_TYPES: RewardType[] = ['cashback', 'points', 'miles', 'none'];
export const PERK_KEYS: PerkKey[] = ['lounge', 'loungeUnlimited', 'skyLounge', 'travelIns', 'golf', 'dining', 'fastTrack', 'concierge', 'noLateFee', 'cinema', 'airportTransfer', 'grabRides', 'familyTakaful'];

export interface Perk {
  k: PerkKey;
  /** Visits a year, or an amount in RM, depending on the perk. */
  n?: number;
}

export interface Source {
  name: string;
  url: string;
}

export interface LateFee {
  /** Flat part in RM. 0 when the fee is only a percentage. */
  flat: number;
  percent: number;
  max: number | null;
}

/** Cash advance fee: a percentage, a flat amount, or both, with an optional minimum. */
export interface CashAdvance {
  percent?: number;
  flat?: number;
  min?: number;
}

// ---------- The file: src/data/cards.json ----------

/** Rules shared by every card of a bank. A card can override some of them. */
export interface RawBank {
  id: string;
  name: string;
  short: string;
  website: string;
  cardsUrl: string | null;
  feesUrl: string | null;
  pdsUrl: string | null;
  sources: Source[];
  interest: { min: number; max: number | null; note: Bi } | null;
  minPayment: { percent: number; floor: number } | null;
  lateFee: LateFee | null;
  cashAdvance: CashAdvance | null;
  fxPercent: number | null;
  fxNote: Bi | null;
  serviceTax: number | null;
  minAge: number | null;
  maxAge: number | null;
  incomeProof: Proof[];
  supplementary: { annualFee: number | null } | null;
  approvalTime: Bi | null;
  instalment0: Bi | null;
}

export interface RawCard {
  id: string;
  /** The id of the bank in `banks`. */
  bank: string;
  name: string;
  network: Network | null;
  kind: CardKind;
  tier: Tier;
  /** RM a year for the principal card. null means the bank does not state it. */
  annualFee: number | null;
  annualFeeWaiver: Bi | null;
  /** RM a year. null means not stated or by invitation. See incomeNote. */
  minAnnualIncome: number | null;
  incomeNote?: Bi;
  interestOverride?: { min: number; max: number | null };
  lateFeeOverride?: LateFee;
  cashAdvanceOverride?: CashAdvance;
  minAge?: number;
  incomeProof?: Proof[];
  supplementary?: { annualFee: number | null };
  /** valuePercent is the highest advertised cashback rate, used only to sort. null when not a plain cashback rate. */
  rewards: { type: RewardType; valuePercent: number | null; summary: Bi };
  perks: Perk[];
  /** True when a fixed-deposit-backed or deposit-pledge option exists. */
  secured: boolean;
  securedDeposit?: number;
  /** The card's own page on the bank's website, or null. */
  sourceUrl: string | null;
  /** YYYY-MM-DD */
  lastChecked: string;
}

export interface CardsFile {
  meta: { lastUpdated: string; note: Bi };
  banks: RawBank[];
  cards: RawCard[];
}

// ---------- What the app uses: a card with its bank's rules filled in ----------

export interface CardRecord {
  id: string;
  bankId: string;
  bank: string;
  bankShort: string;
  bankWebsite: string;
  name: string;
  network: Network | null;
  kind: CardKind;
  tier: Tier;
  annualFee: number | null;
  annualFeeWaiver: Bi | null;
  serviceTax: number | null;
  interest: { min: number; max: number | null } | null;
  interestNote: Bi | null;
  minPayment: { percent: number; floor: number } | null;
  lateFee: LateFee | null;
  cashAdvance: CashAdvance | null;
  fxPercent: number | null;
  fxNote: Bi | null;
  minAge: number | null;
  maxAge: number | null;
  minAnnualIncome: number | null;
  incomeNote: Bi | null;
  incomeProof: Proof[];
  supplementary: { annualFee: number | null } | null;
  rewards: { type: RewardType; valuePercent: number | null; summary: Bi };
  perks: Perk[];
  instalment0: Bi | null;
  approvalTime: Bi | null;
  secured: boolean;
  securedDeposit: number | null;
  lastUpdated: string;
  /** The card's own page, else the bank's cards page, else the bank's website. */
  sourceUrl: string;
  /** True when sourceUrl is the card's own page. */
  hasOwnPage: boolean;
  feesUrl: string | null;
  pdsUrl: string | null;
  dataSources: Source[];
}
