import type { Account } from '../lib/account.ts';
import type { Bi, IncomeType, Lang, ReadyInput } from '../lib/eligibility.ts';
import type { SimInput, RepayMode } from '../lib/cost.ts';
import type { Filters, SortKey } from '../lib/cards.ts';

export type { Bi, IncomeType, Lang, ReadyInput, SimInput, RepayMode };

export type ProofMethod = 'bank' | 'lhdn' | 'upload';

export interface ProofResult {
  method: ProofMethod;
  avgMonthly: number;
  lowest: number;
  highest: number;
  source: string;
}

export interface Identity {
  name: string;
  ic: string;
  dob: string;
  address: string;
}

export interface Draft {
  /** Wizard position: index into the flat question list. */
  q: number;
  scanned: boolean;
  manualIdentity: boolean;
  identity: Identity;
  phone: string;
  email: string;
  employment: IncomeType;
  income: string;
  commitments: string;
  proofMethod: ProofMethod;
  consent: boolean;
  proof: ProofResult | null;
  costRead: boolean;
  savedAt: string | null;
  started: boolean;
}

export interface Submission {
  ref: string;
  at: string;
  inPrinciple: 'likely' | 'maybe' | 'notyet';
}

export type Outcome = 'approved' | 'rejected';

export interface TrackState {
  outcome: Outcome;
  /** 0 Submitted, 1 Documents verified, 2 Under review, 3 Decision. */
  stage: 0 | 1 | 2 | 3;
}

export type Category = 'food' | 'transport' | 'groceries' | 'bills' | 'shopping' | 'other';

export interface Txn {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  amount: number;
  category: Category;
  note: string;
}

export interface Payment {
  id: string;
  /** The statement date (YYYY-MM-DD) this payment is for. */
  statementEnd: string;
  /** YYYY-MM-DD */
  paidOn: string;
  amount: number;
}

export type DaysBefore = 1 | 3 | 5 | 7;

export interface UseState {
  limit: number;
  /** 1 to 28 */
  statementDay: number;
  txns: Txn[];
  payments: Payment[];
  reminderOn: boolean;
  daysBefore: DaysBefore;
  quiz: (number | null)[];
  /** Ids of the first-3-months checklist items that are ticked. */
  guide?: string[];
}

export interface WorkshopEntry {
  id: string;
  at: string;
  tester: string;
  seamless: string[];
  dealBreakers: string[];
  proof: string;
  time: string;
  trust: string[];
  rating: number;
  stuck: string;
  /** REQ-11: card features that mattered most when comparing (up to 3). */
  cardFeatures: string[];
  cardsCompared: string[];
  cardsViewed: string[];
  cardSelected: string | null;
}

export interface CompareState {
  query: string;
  filters: Filters;
  sort: SortKey;
  /** Up to 3 card ids chosen for the compare tool. */
  selected: string[];
  /** Card ids only, for the workshop summary. */
  log: { compared: string[]; viewed: string[] };
}

export type StageKey = 'ready' | 'cost' | 'apply' | 'track' | 'use';

export interface AppState {
  lang: Lang;
  /** The signed-in prototype account, or null. Applying needs one, so the answers can be saved. */
  account: Account | null;
  demo: boolean;
  walkStep: number;
  walkStartedAt: number | null;
  ready: ReadyInput;
  readyDone: boolean;
  sim: SimInput;
  draft: Draft;
  submission: Submission | null;
  track: TrackState;
  use: UseState;
  entries: WorkshopEntry[];
  compare: CompareState;
  /** The card the user picked via Apply or Simulate. Null means standard rates. */
  selectedCardId: string | null;
  done: Record<StageKey, boolean>;
  /** Stages the user chose to skip past after confirming. Shown in orange on the timeline. */
  skipped: Record<StageKey, boolean>;
  /** The timeline step the user was last on. "Start applying" in the sidebar returns here. */
  lastStage: 'ready' | 'cost' | 'apply';
}
