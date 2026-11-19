# Design: KAF First Card

## Overview

A single-page, mobile-first React app. No backend. State lives in one React context and is saved to `localStorage`. "API calls" are mock functions that wait 400 to 1800 ms.

Stack: React 19, Vite, TypeScript (strict), Tailwind CSS v4. No router library: a small hash router (`#/ready`) keeps links shareable and the back button working.

Look and feel: calm blue and teal, white cards with large radius, generous spacing, 16 px base text, 48 px tap targets.

## Screen list

| Route | Screen | Stage | Requirements |
|---|---|---|---|
| `#/` | Home: promise, three persona entry points, trust strip, resume draft | none | REQ-6, REQ-10 |
| `#/ready` | Am I ready? form and result | 1 | REQ-1 |
| `#/cost` | Cost simulator | 2 | REQ-8 |
| `#/apply` | Document checklist, then wizard (5 steps), save and resume | 3 | REQ-2, 3, 4 |
| `#/track` | Timeline, in-principle decision, outcome, demo controls | 4 | REQ-5 |
| `#/use` | 3-month guide, reminders, tracker, pay-in-full nudge, quiz | 5 | REQ-1, 7 |
| `#/learn` | Learning cards | support | REQ-7 |
| `#/pricing` | Transparent pricing | support | REQ-6 |
| `#/trust` | Licence, PIDM, data use, scam safety | support | REQ-6 |
| `#/workshop` | Preference card, feedback, summary | support | REQ-9 |

Global chrome on every screen: prototype banner, header (logo, EN/BM toggle, Demo mode switch), stepper (stage screens), help button (chat or call), footer with trust links. The demo walkthrough panel floats above the footer when Demo mode is on.

## Wizard design (REQ-2)

Questions are a flat list. Each belongs to one of five steps.

| Step | Questions |
|---|---|
| 1 Identity | `scan` (MyKad scan, shows prefilled name, masked IC, DOB, address) |
| 2 Contact | `phone`, `email` |
| 3 Work and income | `employment`, `income`, `commitments` |
| 4 Income proof | `proof` (choose option, consent, simulated connect, summary) |
| 5 Review | `review` (cost summary, confirmation, submit) |

On mobile (under 768 px) the wizard shows one question at a time. On desktop it shows every question in the current step. Progress is questions done over total. Time left is remaining questions times an average of 20 seconds, rounded up to whole minutes.

## Component structure

```
src/
  main.tsx
  App.tsx                      layout + route switch
  index.css                    Tailwind import + theme tokens
  config/
    rates.ts                   APR, fees, min payment rule, limits, SLA text
  lib/
    cost.ts                    simulate(), minimumPayment(), compare()
    eligibility.ts             checkReadiness()
    mockApi.ts                 delay(), scanMyKad(), connectAccount(), lhdnLookup(), uploadFile(), submitApplication()
    format.ts                  money(), percent()
    ics.ts                     buildReminderIcs()
    csv.ts                     entriesToCsv()
    router.ts                  useRoute(), navigate()
  i18n/
    index.tsx                  LangProvider, useLang(), t(bi)
    common.ts                  shared UI strings
  state/
    types.ts                   data models
    store.tsx                  AppProvider, useApp(), persistence
    personas.ts                Hafiz, Aina, Daniel
  data/
    documents.ts               checklist + alternatives
    incomeProof.ts             three options
    learn.ts                   learning cards
    quiz.ts                    5 questions
    guide.ts                   first 3 months
    workshop.ts                option lists for preference card
    walkthrough.ts             demo steps
  components/
    ui/ Button, Card, Field, Tooltip(WhyAsk), Badge, Callout, Spinner, ProgressBar
    layout/ PrototypeBanner, Header, Stepper, Footer, HelpWidget, TrustStrip, ScamNote
    ready/ ReadyForm, ReadyResult
    cost/ SpendControls, ScenarioCard, ComparisonSentence
    apply/ DocChecklist, Wizard, StepIdentity, StepContact, StepWork, StepProof, StepReview, CostSummary
    track/ Timeline, DecisionCard, DemoControls
    use/ Guide, Reminders, Tracker, PayInFullNudge, Quiz
    workshop/ PreferenceCard, FeedbackForm, Summary
    demo/ Walkthrough
  pages/ Home, Ready, Cost, Apply, Track, Use, Learn, Pricing, Trust, Workshop
```

## Data models

```ts
type Lang = 'en' | 'ms';
type Bi = { en: string; ms: string };           // every user-facing string
type IncomeType = 'salaried' | 'gig' | 'parttime' | 'student';

interface ReadyInput { age: string; incomeType: IncomeType; income: string; commitments: string; }
type Verdict = 'likely' | 'maybe' | 'notyet';
interface Reason { status: 'good' | 'check' | 'problem'; text: Bi; }
interface ReadyResult { verdict: Verdict; reasons: Reason[]; plan: Bi[]; }

type RepayMode = 'minimum' | 'fixed' | 'full';
interface SimInput { spend: number; mode: RepayMode; fixed: number; }
interface SimResult { interest: number; firstMinPayment: number; lateFee: number; total: number; months: number; usedMinimum: boolean; neverEnds: boolean; }

type ProofMethod = 'bank' | 'lhdn' | 'upload';
interface ProofResult { method: ProofMethod; avgMonthly: number; lowest: number; highest: number; source: string; }

interface Draft {
  step: number; q: number;                       // wizard position
  scanned: boolean;
  identity: { name: string; ic: string; dob: string; address: string };
  phone: string; email: string;
  employment: IncomeType; income: string; commitments: string;
  proofMethod: ProofMethod; consent: boolean; proof: ProofResult | null;
  costRead: boolean; savedAt: string | null;
}

interface Submission { ref: string; at: string; inPrinciple: Verdict; }
interface TrackState { outcome: 'approved' | 'rejected'; stage: 0 | 1 | 2 | 3; }

interface UseState { paid: boolean[]; spent: number; reminderOn: boolean; daysBefore: number; quiz: number[]; }

interface WorkshopEntry {
  id: string; at: string; tester: string;
  seamless: string[]; dealBreakers: string[]; proof: string; time: string; trust: string[];
  rating: number; stuck: string;
}

interface AppState {
  lang: Lang; demo: boolean; walkStep: number | null; walkStartedAt: number | null;
  ready: ReadyInput; sim: SimInput; draft: Draft; submission: Submission | null;
  track: TrackState; use: UseState; entries: WorkshopEntry[];
  done: Record<'ready' | 'cost' | 'apply' | 'track' | 'use', boolean>;
}
```

## Key logic

**Cost (`lib/cost.ts`).** Monthly rate is APR / 12. For "full", the grace period applies: interest 0, total equals spend, months 1. Otherwise each month: add interest on the balance, pay `max(5% of balance, RM50)` (or the fixed amount if it is higher), capped at balance plus interest. Repeat until the balance is zero (hard stop at 600 months, flagged as `neverEnds`). Total cost is spend plus interest. Late fee is `max(RM10, 1% of balance)`.

**Readiness (`lib/eligibility.ts`).** Config values: minimum age 21, minimum monthly income RM2,000, comfortable commitments ratio 40%, maximum 60%.
- Age under minimum: problem.
- Income under minimum: problem. Within RM500 above the minimum: check.
- Commitments over 60% of income: problem. Between 40% and 60%: check.
- Student: check unless income meets the minimum (then good).
- Gig or part-time: a hint to connect a bank account (not a problem by itself).
- Any problem gives "Not yet". Otherwise any check gives "Maybe". Otherwise "Likely".
- Plan items are generated from each problem (for example "Build steady income toward RM2,000 a month" and "Pay down commitments until they are under 40% of income").

**Decision demo.** Approved shows limit RM1,500 and reasons. Rejected shows reasons "Income we could confirm is below RM2,000 a month" and "Commitments are high compared with income", then next steps (try again in 3 months, build income records, talk to us).

**Demo walkthrough.** Each step has `route`, optional patch to apply (wizard position, track outcome and stage), talking points (Bi), and seconds. Eight steps, 290 seconds in total.

## Internationalisation

Every string is a `Bi` object next to the component that uses it. `t(bi)` picks by the active language. Language is stored in state, so switching never resets forms.

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1` per screen, focused on route change.
- Stepper is an ordered list with `aria-current="step"`.
- Tooltips are buttons with `aria-expanded` and a described-by region, closed by Escape.
- Errors use `aria-invalid` and `aria-describedby`. A polite live region announces results.
- Minimum control size 48 px. Colour tokens chosen for at least 4.5:1 contrast.
- `prefers-reduced-motion` disables transitions.

## Error handling

- Mock services can be set to fail (a "Try again" path exists for the MyKad scan and account connection).
- Corrupt `localStorage` data is ignored and replaced by defaults.

## Verification approach

- `tsc --noEmit` and `vite build` must pass.
- Cost and readiness logic are checked with a small script against known values (RM500 minimum-only gives RM50 payments).
- Manual walk through of the Hafiz demo in both languages at 360 px and 1280 px.

---

# REQ-11 Credit Card Comparison Hub: design

## New and changed screens

| Route | Screen | Notes |
|---|---|---|
| `#/compare` | Card Comparison Hub | New. Listing, filters, sort, search, best match panel, compare bar, tips |
| (overlay) | Card detail drawer | Opens from a card. Focus trapped. |
| (overlay) | Compare table | Opens from the compare bar. Full-width panel. |
| `#/cost` | Cost simulator | Changed. Can load a card's terms. |
| `#/ready` | Am I ready? | Result gets a "Compare cards" link. |
| `#/apply`, `#/track`, `#/use`, `#/learn`, `#/workshop` | Not built yet | Show a "coming soon" screen, not Home. |

Stepper: five numbered stages stay as they are. An optional "Compare cards" pill sits between stage 1 and stage 2 with no number. The header gets a main navigation with "Compare cards" so the hub is reachable from anywhere.

## Data model

`src/data/cards.json` holds `{ "meta": {...}, "cards": [...] }`. The type lives in `src/data/cardTypes.ts`.

```ts
type Network = 'Visa' | 'Mastercard' | 'Amex';
type CardKind = 'conventional' | 'islamic';
type Tier = 'classic' | 'gold' | 'platinum' | 'secured' | 'student';
type Proof = 'payslip' | 'bank_statement' | 'lhdn' | 'gig_statement';
type RewardType = 'cashback' | 'points' | 'miles' | 'none';

interface CardRecord {
  id: string;
  bank: string;                         // "Maybank"
  bankShort: string;                    // 2 to 3 letters for the logo placeholder
  name: string;                         // illustrative product name
  network: Network;
  kind: CardKind;
  tier: Tier;
  annualFee: number;                    // RM
  annualFeeWaiver: Bi | null;           // plain-language waiver condition
  interestPa: number;                   // % a year (profit rate for Islamic cards)
  minPayment: { percent: number; floor: number };   // higher of percent or floor
  lateFee: { flat: number; percent: number };       // higher of flat or percent
  cashAdvance: { percent: number; min: number };
  fxFeePercent: number;
  minAge: number;
  minAnnualIncome: number;              // RM per year
  incomeProof: Proof[];
  supplementary: { max: number; annualFee: number };
  rewards: { type: RewardType; summary: Bi; valuePercent: number };  // valuePercent: rough return, used only to sort
  welcomeOffer: Bi | null;
  instalment0: Bi | null;
  digitalApplication: boolean;
  approvalTime: Bi;
  secured: boolean;                     // a fixed-deposit-backed option exists
  pros: Bi[];
  cons: Bi[];
  bestFor: Bi;
  notFor: Bi;
  lastUpdated: string;                  // YYYY-MM-DD
  sourceUrl: string;                    // placeholder link
}
```

Derived (never stored): `friendliness` (1 to 5), `friendlinessMet` (which of the five criteria passed), `gigFriendly`, `studentFriendly`, `feeKind` (`free` | `waivable` | `paid`).

## Scoring logic (`lib/cards.ts`)

Five criteria, each worth 0 to 1 point. Sum, round to nearest whole number, clamp to 1..5.

| Criterion | Points |
|---|---|
| Low income requirement | 1 if min annual income ≤ RM24,000; 0.5 if ≤ RM36,000; else 0 |
| Flexible income proof | 1 if 3 or more proof types; 0.5 if 2; else 0 |
| Low or waivable annual fee | 1 if RM0; 0.7 if waivable; 0.4 if ≤ RM100; else 0 |
| Digital application | 1 if yes, else 0 |
| Secured option | 1 if yes, else 0 |

- `gigFriendly` = accepts `bank_statement` or `gig_statement`.
- `studentFriendly` = tier is `student`, or minimum age is 18 or less, or (secured and minimum income ≤ RM24,000).
- `feeKind` = `free` if the fee is 0, `waivable` if a waiver condition exists, else `paid`.
- Default sort: score descending, then lowest minimum income, then lowest annual fee, then name. No sponsor field exists.
- Best rewards sort: `rewards.valuePercent` descending.

**Best match for me.** Input is the Ready answers. Monthly income times 12 gives annual income.
1. Exclude a card if age is below `minAge`, annual income is below `minAnnualIncome`, or the user is a gig worker and the card accepts neither bank statement nor gig statement. For students, exclude cards with income above the user's if the card is not secured or student tier.
2. Rank the rest by: friendliness score, plus 1 for a close fit to the user's type (gig friendly for gig, student friendly for students, digital for everyone), plus 0.5 if the card still leaves at least 25% headroom between the user's income and the minimum.
3. Take the top 3. Build 2 to 4 reasons from the facts (for example "Accepts bank statements, so no payslip is needed").
4. If fewer than 3 fit, show the ones that fit and add a note listing why others were left out. If a secured card exists and fits, mention it first.

**Compare rows.** Each row has a `kind`: `lowerBetter`, `higherBetter`, `boolTrue`, or `text`. Best is computed per row. Ties mark all tied cards. "Differs" is true when values are not all equal. Text rows (such as welcome offer) show "Differs" but no best.

| Group | Row | Kind |
|---|---|---|
| Fees | Annual fee | lowerBetter |
| Fees | Waiver condition | text |
| Fees | Late payment fee (flat) | lowerBetter |
| Fees | Cash advance fee % | lowerBetter |
| Fees | Foreign currency fee % | lowerBetter |
| Fees | Supplementary card fee | lowerBetter |
| Rates | Interest rate p.a. | lowerBetter |
| Rates | Minimum payment rule | text |
| Rates | 0% instalment plans | text |
| Eligibility | Minimum age | lowerBetter |
| Eligibility | Minimum annual income | lowerBetter |
| Eligibility | Accepted income proof (count) | higherBetter |
| Eligibility | Gig-worker friendly | boolTrue |
| Eligibility | Secured option | boolTrue |
| Rewards | Rewards type and summary | text |
| Rewards | Return (illustrative) | higherBetter |
| Rewards | Welcome offer | text |
| Application | Digital application | boolTrue |
| Application | Typical approval time | text |
| Application | First-card friendliness | higherBetter |

## Cost simulator integration

`lib/cost.ts` takes an optional `Terms` argument:

```ts
interface Terms { aprPercent: number; minPercent: number; minFloor: number; lateFlat: number; latePercent: number; }
```

When omitted, `Terms` comes from `config/rates.ts` (REQ-8 stays the single source for defaults). The selected card's record is mapped to `Terms`. The Cost screen shows the card name, the fees that are not part of the simulation (annual, cash advance, foreign currency), and a "Use standard rates" button.

## State additions

```ts
interface CompareState {
  query: string;
  filters: {
    bank: string; kind: '' | CardKind; network: '' | Network; fee: '' | 'free' | 'waivable' | 'paid';
    reward: '' | RewardType; maxMonthlyIncome: number;   // slider; max value means no limit
    gig: boolean; secured: boolean; digital: boolean; student: boolean;
  };
  sort: 'best' | 'fee' | 'rate' | 'income' | 'rewards';
  selected: string[];                    // up to 3 ids for the compare tool
  log: { compared: string[]; viewed: string[] };   // ids, for the workshop summary
}
// AppState gets: compare: CompareState; selectedCardId: string | null;
// WorkshopEntry gets: cardFeatures: string[]; cardsCompared: string[]; cardsViewed: string[]; cardSelected: string | null;
```

Filters and selection live in the global store, so a language switch or leaving the page never resets them.

## Component structure

```
src/
  data/cards.json, cardTypes.ts, cards.ts      (typed loader)
  lib/cards.ts                                 scoring, filters, sort, best match, compare rows
  components/cards/
    CardTile, FilterPanel, SortBar, BestMatchPanel, CompareBar,
    CompareTable, CardDetail, TipsStrip, Disclaimer, SelectedCardChip, BankLogo
  pages/Compare.tsx
```

## Accessibility notes

- Filters are real form controls inside a `fieldset` with a legend. On mobile they sit in a collapsible section opened by a button with `aria-expanded`.
- Card selection is a checkbox labelled "Compare {card name}". At 3 selected, other checkboxes stay focusable but show the limit message instead of selecting.
- Compare table uses `<th scope="col">` and `<th scope="row">`. Best uses the text "Best" plus bold and a border. Differs uses the text "Differs" plus an icon.
- Detail drawer is `role="dialog"` with `aria-modal`, a focus trap, Escape to close and focus return.
- A polite live region announces result count, sort change, limit message and compare bar changes.

---

# REQ-12 Monthly usage and payment tracker: design

## Screen

`#/use` ("Use it well") becomes the usage tracker. Sections, top to bottom:

1. Selected card chip and reminder banner (if due).
2. **Pay by** card: statement date, due date, balance, days left, status badge. Holds the "Record payment" form.
3. **Pay in full or minimum**: two columns on wide screens, stacked on phones. Interest avoided nudge, late fee.
4. **This month's usage**: spend, limit, utilisation bar with a 30% marker, label, category breakdown.
5. **Log a spend** form and the list of spends in this cycle.
6. **Credit-building tracker**: last 3 statements, "On-time payments: N out of 3".
7. **Settings and reminders**: statement day, limit, reminder toggle and days, `.ics` download, sample data buttons.

The first-3-months guide, learning cards and quiz stay "to do" for this stage.

## Data model

```ts
type Category = 'food' | 'transport' | 'groceries' | 'bills' | 'shopping' | 'other';
interface Txn { id: string; date: string /* YYYY-MM-DD */; amount: number; category: Category; note: string; }
interface Payment { id: string; statementEnd: string /* statement date, YYYY-MM-DD */; paidOn: string; amount: number; }
interface UseState {
  limit: number; statementDay: number;          // 1 to 28
  txns: Txn[]; payments: Payment[];
  reminderOn: boolean; daysBefore: 1 | 3 | 5 | 7;
  quiz: (number | null)[];                      // kept for the quiz task
}
```

Replaces the earlier placeholder fields `paid` and `spent`. Saved data from older versions is ignored safely.

## Billing rules (`lib/usage.ts`, pure and tested)

All dates are `YYYY-MM-DD` strings handled in UTC, so the user's time zone never shifts a date.

- Statement date of a month = that month's `statementDay`.
- A cycle is `(previous statement date, statement date]`. A spend on the statement date belongs to the cycle that ends that day.
- The statement is issued the day after. The **open statement** is the latest one whose date is before today.
- The **current cycle** ends on the first statement date on or after today.
- Due date = statement date + `RATES.graceDays` (20).
- Balance = sum of spends in the cycle.
- Minimum payment = `minimumPayment(balance, terms)`.
- `onTimePaid` = sum of payments with `paidOn <= due`.
- Status for a statement with balance above 0:

| Condition | Status |
|---|---|
| `onTimePaid >= balance` | `paid_full` |
| `onTimePaid >= minimum` | `paid_min` |
| today after due | `overdue` |
| today equals due | `due_today` |
| days left 5 or fewer | `due_soon` |
| otherwise | `upcoming` |

  For old statements that were never paid on time the status is `late`. A balance of 0 gives `none`.
- Tracker "on time" = status is `paid_full` or `paid_min`, over the last 3 issued statements with a balance.
- Utilisation = current cycle spend / limit. Bands: up to 30 good, up to 70 high, above 70 too high.
- Pay-in-full nudge = `interestAvoided(balance, terms)`. Minimum path = `simulate({ spend: balance, mode: 'minimum' }, terms)`.
- Reminder date = due date minus `daysBefore`. Banner shows when today is on or after it and the open statement is not satisfied.

## Components

```
src/lib/usage.ts, ics.ts
src/pages/Use.tsx
src/components/usage.tsx   PayByCard, PayOptions, UsageMeter, SpendForm, SpendList, Tracker, Settings, ReminderBanner
```

`.ics` file: one all-day event per due date (next 3), with a `VALARM` trigger of `-P{n}D`. Created in the browser and downloaded with a `Blob`.

## Sample data

"Load sample spending" sets `statementDay` to the day of the month 5 days ago (capped at 28), adds spend for the 3 closed cycles and the current one with fixed amounts, and records on-time payments for the two oldest statements. The newest statement is left open and due in about 15 days.

## Tier classification (REQ-11.13)

- Filters gets 	ier: '' | Tier. matches() checks it, ctiveFilterCount() counts it, and DEFAULT_FILTERS clears it.
- lib/cards.ts exports TIER_ORDER and TIER_INFO (symbol, label and one-sentence description in both languages) and 	ierCounts(cards, query, filters), which counts cards per tier using every filter except the tier.
- TierTag component shows symbol + label + tier on tiles, in the detail header and in the compare table header.
- The hub shows tier buttons (ria-pressed) above search, and a Card tier drop-down in the filter panel. Both set the same filter.
- A 	ier row in COMPARE_ROWS (group Eligibility, kind text) shows the label and description.
