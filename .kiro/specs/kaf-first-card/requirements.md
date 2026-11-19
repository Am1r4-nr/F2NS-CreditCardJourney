# Requirements: KAF First Card

Prototype for the MDEC-KAF Digital Bank Launchpad Accelerator, Use Case 2: Responsible Credit for First-Time Users.
All content is illustrative. There is no real backend and no real bank offer.

## Personas

| Persona | Profile | Main need |
|---|---|---|
| Hafiz (primary) | 25, e-hailing and delivery gig worker, irregular income, no payslip | "How do I prove my income?" |
| Aina | 23, fresh graduate, RM3,500/month, no credit history | Know what the card really costs |
| Daniel | 24, final-year student, part-time income | Know if he qualifies and what to do if not |

## Glossary

- **System**: the KAF First Card web prototype.
- **Stage**: one of the five journey stages (Am I ready, What will it cost, Apply, Track, Use it well).
- **Mock service**: a local function that returns fixed data after a simulated delay (400 to 1800 ms).
- **Config file**: `src/config/rates.ts`, the single place that holds illustrative rates, fees and limits.

## Cross-cutting requirements

### NFR-1 Language
**User story:** As a Bahasa Malaysia speaker, I want to switch the whole site between English and Bahasa Malaysia, so I can understand everything in my own language.

1. THE System SHALL show an EN / BM toggle in the header on every screen.
2. WHEN the user switches language, THE System SHALL re-render all visible text in the chosen language without losing form input or the current screen.
3. THE System SHALL remember the chosen language between visits.
4. THE System SHALL set the `lang` attribute of the page to match the chosen language.

### NFR-2 Accessibility and plain language
**User story:** As a first-time user on a small phone, I want large, clear and simple screens, so I can finish without frustration.

1. THE System SHALL make every button, link and form control at least 44 by 44 CSS pixels.
2. THE System SHALL use text and background colour pairs with a contrast ratio of at least 4.5:1.
3. THE System SHALL show a visible focus ring on every interactive element.
4. THE System SHALL label every form field and associate error messages with their field.
5. THE System SHALL write user-facing copy at about Grade 8 reading level, with short sentences and no unexplained jargon.
6. WHEN a term such as "CCRIS" or "utilisation" is shown, THE System SHALL explain it in plain words nearby or link to a learning card.
7. WHEN the screen changes, THE System SHALL move keyboard focus to the new screen heading.
8. WHERE the user prefers reduced motion, THE System SHALL turn off non-essential animation.

### NFR-3 Prototype disclosure
**User story:** As a tester, I want to know this is not a real offer, so I do not share real personal data.

1. THE System SHALL show a banner on every screen saying this is a prototype, illustrative only, and not a real bank offer.
2. THE System SHALL NOT send any data to a server.
3. THE System SHALL NOT collect a real NRIC number. All identity data comes from fixed mock data.

### NFR-4 Responsive layout
**User story:** As a user on any device, I want a layout that fits my screen.

1. THE System SHALL be designed mobile-first and work from 320 px wide.
2. WHILE the viewport is 768 px or wider, THE System SHALL use a multi-column layout where it helps (for example side-by-side cost comparison).
3. THE System SHALL NOT scroll horizontally at any width from 320 px.

---

## REQ-1 Five-stage journey with a persistent progress stepper

**User story:** As a first-time applicant, I want to see all five stages and where I am, so I know what is coming and how far I have gone.

1. THE System SHALL show a stepper with five stages: Am I ready, What will it cost, Apply, Track, Use it well.
2. WHILE the user is on any stage screen, THE System SHALL keep the stepper visible and mark the current stage.
3. WHEN the user selects a stage in the stepper, THE System SHALL open that stage.
4. THE System SHALL mark a stage as done once its main task is completed.

### Stage 1: Am I ready?
**User story:** As Hafiz, I want a quick check before I apply, so I do not waste time or risk a rejection.

5. THE System SHALL ask for age, income type (salaried, gig, part-time, student), approximate monthly income and monthly commitments.
6. WHEN the user submits valid answers, THE System SHALL show one result: "Likely", "Maybe" or "Not yet".
7. THE System SHALL list the reasons for the result in plain language, each marked as good, check or problem.
8. IF the result is "Not yet", THEN THE System SHALL show a "How to qualify" action plan with at least one concrete step per problem found.
9. THE System SHALL state on the result and on the form that this check does NOT affect the user's credit record.
10. WHERE the user picks Hafiz, Aina or Daniel quick-fill, THE System SHALL fill the form with that persona's values.
11. IF the age, income or commitments are missing or invalid, THEN THE System SHALL show a friendly message next to that field.

### Stage 2: What will it cost?
12. THE System SHALL provide the cost simulator described in REQ-8.

### Stage 3: Apply
13. THE System SHALL provide the application described in REQ-2, REQ-3 and REQ-4.

### Stage 4: Track
14. THE System SHALL provide the status timeline described in REQ-5.

### Stage 5: Use it well
**User story:** As a new cardholder, I want simple guidance for my first three months, so I build a good record and avoid costly mistakes.

15. THE System SHALL show a first-3-months guide with at least three actions per month.
16. THE System SHALL let the user turn on a repayment reminder, choose how many days before the due date, and download a calendar (.ics) file for it.
17. THE System SHALL show a credit-building tracker with on-time payments (out of 3) and a utilisation percentage.
18. WHEN the user marks a payment as paid on time, THE System SHALL update the on-time count and the tracker.
19. WHEN utilisation is above 30%, THE System SHALL show a warning with a tip to lower it. WHEN it is at or below 30%, THE System SHALL show a positive message.
20. THE System SHALL show a "pay in full" nudge that states how much interest the user avoids this month by paying the full statement balance.
21. THE System SHALL show the short quiz described in REQ-7 at the end of this stage.

---

## REQ-2 Seamless application

**User story:** As Aina, I want the application to fill itself in and take only a few minutes, so I do not give up halfway.

1. THE System SHALL split the application into no more than 5 steps: Identity, Contact, Work and income, Income proof, Review and submit.
2. WHEN the user selects "Scan MyKad" and the mock eKYC finishes, THE System SHALL prefill name, masked IC number, date of birth and address from mock data.
3. THE System SHALL NOT ask the user to type any detail that was prefilled, unless the user chooses to edit it.
4. WHILE the viewport is narrower than 768 px, THE System SHALL show one question per screen.
5. WHILE the viewport is 768 px or wider, THE System SHALL show all questions of the current step together.
6. THE System SHALL show a progress bar and an estimated time left (in minutes) on every application screen.
7. WHEN the user selects "Save and continue later", THE System SHALL save the draft locally, confirm that it is saved, and offer a way to resume from the home page and the Apply stage.
8. WHEN the user returns to a saved draft, THE System SHALL restore the answers and the position.
9. IF an answer is invalid (for example a phone number that is not a Malaysian mobile number), THEN THE System SHALL show a friendly inline message and keep the user on that question.
10. WHEN the user selects "Back", THE System SHALL return to the previous question without losing answers.
11. IF the MyKad scan fails or the user prefers not to scan, THEN THE System SHALL offer to enter the details by hand.

---

## REQ-3 Deal-breaker protection

**User story:** As a cautious first-time applicant, I want no surprises about fees, documents or rejection, so I can trust the process.

### (a) Fees are clear
1. WHEN the user reaches the final step, THE System SHALL show a full cost summary before the Submit button: interest rate, annual fee, service tax, late fee, cash advance fee, minimum payment rule and credit limit range.
2. THE System SHALL require the user to confirm they have read the cost summary before they can submit.
3. THE System SHALL source every rate and fee from the config file.

### (b) Documents are known upfront
4. WHEN the user opens the Apply stage, THE System SHALL show a document checklist before any question is asked.
5. THE System SHALL list, for each document, what it is for and at least one alternative if the user does not have it.
6. THE System SHALL cover at least: identity (MyKad), proof of income, proof of address and a selfie check.

### (c) Rejection always has reasons
7. IF the decision is a rejection, THEN THE System SHALL show at least two plain-language reasons.
8. IF the decision is a rejection, THEN THE System SHALL show next steps, including when the user can try again and how to reach a human.
9. THE System SHALL state that a rejection does not stop the user from applying again later.

### Why we ask this
10. THE System SHALL show a "Why we ask this" control next to every sensitive field: IC number, date of birth, address, phone, income, commitments and income proof.
11. WHEN the user selects the control (by tap, click or keyboard), THE System SHALL show a short plain-language reason. THE System SHALL NOT depend on hover only.
12. WHEN the user selects the control again or presses Escape, THE System SHALL hide the reason.

---

## REQ-4 Income proof options

**User story:** As Hafiz, I have no payslip, so I want other ways to prove my income that fit irregular earnings.

1. THE System SHALL offer three options and let the user choose exactly one:
   - Connect bank or e-wallet account (simulated)
   - LHDN record (simulated)
   - Upload payslip or gig-platform earnings statement (simulated)
2. THE System SHALL pre-select "Connect bank or e-wallet" and label it "Recommended".
3. THE System SHALL show, for each option, how it helps people with irregular income.
4. WHEN the user chooses to connect an account, THE System SHALL first show what is accessed (income and spending totals, last 6 months), what is not accessed (passwords, transfers, ability to move money), that access is read-only, and that the user can revoke it.
5. THE System SHALL require an explicit consent checkbox before the simulated connection starts.
6. WHEN the connection, LHDN lookup or upload finishes, THE System SHALL show a summary: average monthly income over 6 months, lowest month and highest month.
7. IF the user has not completed the chosen option, THEN THE System SHALL NOT allow them to continue to the review step and SHALL explain why.
8. WHEN the user chooses upload, THE System SHALL accept a simulated file pick and show the file name and a success state. THE System SHALL NOT read or send the file.
9. WHEN the user changes the option, THE System SHALL clear the previous proof result.

---

## REQ-5 Decision time and tracking

**User story:** As an applicant, I want to know quickly what happens next and how long it takes, so I am not left waiting in the dark.

1. WHEN the user submits the application, THE System SHALL show an in-principle decision after a short simulated delay.
2. THE System SHALL state the final approval time as "same day, and at most 3 working days".
3. THE System SHALL show a reference number after submission.
4. THE System SHALL show a timeline with four stages: Submitted, Documents verified, Under review, Decision.
5. THE System SHALL mark each stage as done, current or waiting.
6. WHEN the timeline reaches Decision, THE System SHALL show the outcome with reasons (REQ-3 items 7 to 9).
7. THE System SHALL provide an Approved demo and a Rejected demo.
8. THE System SHALL provide a "Demo controls" toggle to switch between Approved and Rejected, and a control to move the timeline forward or back.
9. WHEN the outcome is Approved, THE System SHALL show an illustrative credit limit, what to do first, and a link to the Use it well stage.
10. WHERE the user has not submitted an application, THE System SHALL still let them view the demo timeline, labelled as a demo.

---

## REQ-6 Trust with a digital bank

**User story:** As a cautious young adult, I want clear signs that this is safe, so I feel comfortable sharing my details.

1. THE System SHALL show a trust strip with a "Licensed by Bank Negara Malaysia" placeholder badge and a PIDM protection placeholder note.
2. THE System SHALL show "How we use and protect your data" as exactly three plain-language bullets.
3. THE System SHALL provide a transparent pricing page listing every fee from the config file, with a "no hidden fees" statement.
4. THE System SHALL show a Help control on every stage screen that offers chat and call.
5. WHEN the user opens chat, THE System SHALL show a simulated chat with a canned reply after a short delay.
6. THE System SHALL show a scam safety note: "We will never ask for your TAC or password via WhatsApp or call." The note SHALL appear in the trust section and in the Apply stage.
7. THE System SHALL mark all licence, PIDM and phone details as placeholders.

---

## REQ-7 Credit education

**User story:** As someone new to credit, I want short, friendly lessons, so I understand how credit works.

1. THE System SHALL provide learning cards that each take 30 to 60 seconds to read, covering: credit score and CCRIS; minimum payment versus full payment; utilisation; dos and don'ts of a first card; common myths.
2. THE System SHALL show an estimated reading time on every card.
3. THE System SHALL include the myth "Applying always hurts my score" with a short, accurate explanation.
4. THE System SHALL provide a quiz of 5 questions at the end of the Use it well stage.
5. WHEN the user answers a question, THE System SHALL show whether it is right and a one-sentence explanation.
6. WHEN the quiz ends, THE System SHALL show the score and suggest the card to review for each wrong answer.
7. THE System SHALL let the user filter or open any card from a Learn page at any time.

---

## REQ-8 Cost transparency simulator

**User story:** As Aina, I want to see exactly what a purchase costs me under different repayment choices, so I choose the habit that saves money.

1. THE System SHALL provide a spend slider (RM100 to RM3,000, step RM50, default RM500).
2. THE System SHALL provide a repayment choice: minimum only, fixed monthly amount, or pay in full.
3. WHERE the user picks a fixed amount, THE System SHALL let them set the monthly amount.
4. IF the fixed amount is below the minimum payment, THEN THE System SHALL use the minimum payment and tell the user why.
5. THE System SHALL show: interest charged, first-month minimum payment, late fee example, total cost, and months to repay.
6. THE System SHALL compute minimum payment as the higher of 5% of the balance or RM50, capped at the balance.
7. THE System SHALL show "Pay minimum only" and "Pay in full" side by side on screens 768 px or wider and stacked on narrower screens.
8. THE System SHALL show a plain sentence such as "If you only pay the minimum on RM500, you'll pay RM X extra over Y months".
9. THE System SHALL read the rate (15% a year), the minimum rule and the late fee from the config file only.
10. THE System SHALL state that figures are illustrative.
11. WHEN the user changes any input, THE System SHALL update all outputs immediately.

---

## REQ-9 Journey Preference Card and feedback capture

**User story:** As the workshop facilitator, I want testers to record their preferences and feedback, and to compile results across at least 3 testers, so I can fill in the deliverable.

1. THE System SHALL provide a Journey Preference Card with five fields: top 3 things that make applying seamless; top 3 deal-breakers; preferred income proof; acceptable decision time; what builds trust.
2. WHEN the user picks more than 3 options for a "top 3" field, THE System SHALL prevent it and explain that 3 is the limit.
3. THE System SHALL provide a feedback form with a 1 to 5 rating, a "Where did you get stuck?" text box and an optional tester name.
4. WHEN the user saves, THE System SHALL store the card and feedback as one tester entry in local storage.
5. THE System SHALL show a summary view with: number of testers against the target of 3, the most-picked option per field with counts, average rating, and every "stuck" comment.
6. WHEN there are fewer than 3 entries, THE System SHALL show how many more are needed.
7. THE System SHALL let the facilitator export all entries as CSV and JSON, and delete all entries after a confirmation.
8. THE System SHALL let the facilitator start a new tester entry without losing saved ones.

---

## REQ-10 Presentation-ready demo mode

**User story:** As the presenter, I want a one-click demo with a guided walkthrough, so I can present the whole journey in under 5 minutes.

1. THE System SHALL provide a "Demo mode" switch in the header.
2. WHEN the user turns on Demo mode, THE System SHALL load the Hafiz persona: readiness answers, MyKad data, contact details, income details and the recommended income proof option.
3. WHEN Demo mode is on, THE System SHALL show a guided walkthrough panel with numbered steps, a title, one or two sentences of talking points, and a suggested time.
4. THE System SHALL cover the full journey in at most 8 steps with suggested times that add up to 5 minutes or less.
5. WHEN the presenter selects Next or Back, THE System SHALL open the matching screen in the right state (for example the Approved decision, then the Rejected decision).
6. THE System SHALL show total elapsed time against the 5-minute target.
7. WHEN the user turns off Demo mode, THE System SHALL close the walkthrough and keep the data already entered.
8. THE System SHALL provide a "Reset demo" control that restores the initial state.

---

## REQ-11 Credit Card Comparison Hub

**Goal:** a page that compiles credit cards from banks in Malaysia and lets first-time users compare benefits, rates, fees and eligibility side by side before they apply. All card data is sample data for the prototype.

**Primary persona:** Hafiz. It must also work for Aina and Daniel.

### Amendments to earlier requirements

- **REQ-1 (stepper):** THE System SHALL show "Compare cards" in the stepper between "Am I ready?" and "What will it cost?" as an optional step. The five numbered stages and their order SHALL NOT change, and no stage SHALL require the comparison to be completed.
- **REQ-8 (simulator):** THE System SHALL accept the interest rate, minimum payment rule and late fee of a chosen card in place of the config defaults (see 11.9).
- **REQ-9 (preference card):** THE System SHALL add a sixth field, "Which card features mattered most when comparing?", and log compared and selected cards (see 11.10).
- **NFR-3 (disclosure):** THE System SHALL show the card data disclaimer in 11.2 wherever card data appears.

### 11.1 Card data

**User story:** As the workshop facilitator, I want all card data in one file I can edit, so I can keep it up to date without touching the code.

1. THE System SHALL read all card data from one file, `src/data/cards.json`, described by one TypeScript type.
2. THE System SHALL include 10 to 12 cards from different Malaysian banks, including both conventional and Islamic cards.
3. THE System SHALL store for each card: bank, card name, network (Visa, Mastercard or Amex), card type (conventional or Islamic), tier (classic, gold, platinum, secured or student), annual fee, annual fee waiver condition, interest rate per year, minimum payment rule, late payment fee, cash advance fee, foreign currency fee, minimum age, minimum annual income, accepted income proofs (payslip, bank statement, LHDN, gig earnings statement), supplementary cards, rewards type (cashback, points, miles or none) with a summary, welcome offer, 0% instalment plans, digital application (yes or no), typical approval time, secured option, pros and cons, a last updated date and a source link.
4. THE System SHALL show a "Last updated" date and a "Source: bank official website" link placeholder on every card.
5. THE System SHALL mark every value as sample data to be verified on each bank's official website.
6. IF a card record is missing a required field or has an unknown value, THEN the logic check script SHALL fail and name the card and the field.

### 11.2 Disclaimers and neutrality

**User story:** As a first-time user, I want to know this is not advice or a paid ranking, so I can trust the comparison.

1. THE System SHALL show this visible text on the hub, in the compare table and in the card detail: "Illustrative comparison for a prototype. Not financial advice. Check the bank's official terms before applying."
2. THE System SHALL show this note near the sort control: "Ranking is based on suitability for first-time users, not sponsorship."
3. THE System SHALL use neutral wording and SHALL NOT use urgency, countdowns or "best deal" claims.
4. THE System SHALL NOT take any payment or sponsorship into account in sorting.

### 11.3 Derived fields

**User story:** As Daniel, I want a simple score, so I can see which cards suit a beginner without reading every detail.

1. THE System SHALL compute a "First-card friendliness" score from 1 to 5 using five equal criteria: low income requirement, flexible income proof, low or waivable annual fee, digital application, and secured option.
2. THE System SHALL show how the score is worked out in plain language, and which criteria a card met.
3. WHEN a card accepts a bank statement or a gig earnings statement as income proof, THE System SHALL show a "Gig-worker friendly" badge.
4. THE System SHALL show the score as a number and a label such as "4 out of 5", not by colour alone.

### 11.4 Listing, search and sort

**User story:** As Hafiz, I want to scan cards quickly on my phone, so I can shortlist without reading everything.

1. THE System SHALL list cards as a grid on screens 768 px or wider, and as stacked cards on narrower screens.
2. THE System SHALL show on each card: bank logo placeholder, card name, annual fee, interest rate, key reward, income requirement, friendliness score and badges.
3. THE System SHALL show badges where they apply: "Gig-worker friendly", "No annual fee", "Fee waivable", "Islamic", "Secured", "Student".
4. THE System SHALL provide a search box that matches bank name or card name, ignoring case.
5. THE System SHALL provide these sorts: best for first-time users (default), lowest annual fee, lowest interest rate, lowest minimum income, best rewards.
6. WHEN the user changes the sort, THE System SHALL re-order the list and announce the new order to screen readers.
7. THE System SHALL show the number of cards that match.

### 11.5 Filters

1. THE System SHALL provide filters for: bank; card type; network; annual fee (free, waivable, paid); rewards type; minimum income (slider); accepts gig income proof; secured card; digital application; student-friendly.
2. WHEN the user applies the "accepts gig income proof" filter, THE System SHALL show only cards that accept a bank statement or a gig earnings statement.
3. WHEN the user applies several filters, THE System SHALL show only cards that match all of them.
4. THE System SHALL make every filter usable by keyboard and labelled for screen readers.
5. WHEN the user switches language, THE System SHALL keep the search text, filters, sort and selected cards.
6. WHEN the user leaves the hub and comes back, THE System SHALL keep the search text, filters, sort and selected cards.
7. IF no card matches, THEN THE System SHALL show a friendly message and a "Clear filters" button, and SHALL announce it to screen readers through a polite live region. THE System SHALL NOT move focus automatically, so typing in the search box is never interrupted.
8. WHEN the user selects "Clear filters", THE System SHALL reset every filter and the search text but keep the compare selection.

### 11.6 Compare tool

**User story:** As Aina, I want to put cards side by side, so I can see which differences matter.

1. THE System SHALL let the user select up to 3 cards for comparison from the list.
2. WHEN the user selects a 4th card, THE System SHALL prevent the selection and explain that the limit is 3 and that one card must be removed first.
3. WHILE at least 1 card is selected, THE System SHALL show a compare bar with the selected cards, a remove control for each, and a "Compare" button that is enabled from 2 cards.
4. WHEN the user opens the comparison, THE System SHALL show a table with one column per card and these row groups: Fees, Rates, Eligibility, Rewards, Application.
5. THE System SHALL keep the table header (card names) visible while the user scrolls down.
6. WHILE the viewport is narrower than 768 px, THE System SHALL let the table scroll sideways and keep the first column (row labels) fixed.
7. THE System SHALL mark the best value in each comparable row with a text label ("Best") and a visual highlight.
8. THE System SHALL mark rows where the cards differ with the text "Differs", and SHALL offer a switch to show only differing rows.
9. IF several cards share the best value, THEN THE System SHALL mark all of them.
10. THE System SHALL show a note that "best" means lowest cost or easiest rules for that row, not an overall recommendation.

### 11.7 Card detail

**User story:** As Hafiz, I want the full picture of one card in plain language, so I know what I am signing up for.

1. WHEN the user selects "Details" on a card, THE System SHALL open a detail view (a drawer on wide screens, a full-height sheet on narrow screens).
2. THE System SHALL show in the detail view: all stored fields grouped as in the compare table, pros and cons, "Who is this card best for?", a plain-language fee explainer, and a "Why this might not suit you" note.
3. WHEN the annual fee has a waiver condition, THE System SHALL show the condition in plain language next to the fee, on the listing, the table and the detail view.
4. WHILE the detail view is open, THE System SHALL trap keyboard focus inside it, close on Escape, and return focus to the button that opened it.
5. THE System SHALL show "Simulate cost with this card", "Apply with this card" and "Add to compare" in the detail view.

### 11.8 Best match for me

**User story:** As a user who has done the readiness check, I want suggested cards that fit my situation, so I do not have to work it out myself.

1. WHILE the user has completed "Am I ready?", THE System SHALL show a "Best match for me" panel with the top 3 cards.
2. THE System SHALL use the user's age, income type and monthly income to exclude cards the user clearly cannot meet (minimum age, minimum income, or no accepted income proof that suits their income type) and to rank the rest.
3. THE System SHALL give each recommended card at least two plain-language reasons.
4. IF fewer than 3 cards fit, THEN THE System SHALL show only those that fit and explain why others were left out, including a secured card suggestion where one exists.
5. IF no card fits, THEN THE System SHALL say so kindly and link to the "how to qualify" plan.
6. WHILE the user has not completed "Am I ready?", THE System SHALL show a button to take the check first, and SHALL NOT show recommendations.
7. THE System SHALL state that the match is a suggestion, not an approval.

### 11.9 Journey integration

1. WHEN the user selects "Simulate cost with this card", THE System SHALL open the cost simulator loaded with that card's interest rate, minimum payment rule and late fee.
2. WHILE a card is loaded in the simulator, THE System SHALL show its name, show its annual fee, cash advance fee and foreign currency fee, and offer "Use standard rates" to go back to the defaults.
3. WHEN the user selects "Apply with this card", THE System SHALL save that card as the selected card and open the Apply stage.
4. WHILE a card is selected, THE System SHALL show it (bank, card name, annual fee) on the Apply, Track and Use it well screens, with a "Change card" link back to the hub.
5. WHEN the user opens a stage screen without comparing, THE System SHALL work as before using default terms.
6. WHEN a stage screen does not exist yet in the build, THE System SHALL show a clear "coming soon" screen, not a different screen.

### 11.10 Preference card and tester log

**User story:** As the workshop facilitator, I want to know which card features mattered and which cards testers looked at, so I can summarise results for 3 or more testers.

1. THE System SHALL record, per session, the list of cards the user compared, the list of cards the user viewed in detail, and the card the user selected.
2. THE System SHALL add to the Journey Preference Card the field "Which card features mattered most when comparing?" with the options annual fee, interest rate, rewards, income requirement, and brand or bank trust, and let the user pick up to 3.
3. WHEN the user saves a tester entry, THE System SHALL store the chosen features, the compared cards and the selected card with it.
4. THE System SHALL include these in the summary view (most-picked features with counts, most-compared cards, most-selected cards) and in the CSV and JSON export.
5. THE System SHALL store only card ids and feature keys, not personal data.

### 11.11 Education tie-in

1. THE System SHALL show short tips on the hub, such as "Avoid applying for many cards at once" and "Annual fee is not the only cost: check the interest rate and late fees".
2. THE System SHALL link each tip to the matching learning card on the Learn page.
3. WHEN the user has 3 cards selected for compare or has viewed more than 3 card details, THE System SHALL show the tip about applying for many cards at once.

### 11.12 Language and accessibility

1. THE System SHALL show every label, filter, badge, message and card text in English and Bahasa Malaysia using the existing language toggle.
2. THE System SHALL make all controls on the hub at least 44 by 44 CSS pixels.
3. THE System SHALL NOT convey any information by colour alone: best values, differences, badges and score each have a text or symbol label.
4. THE System SHALL give every control, badge and table cell an accessible name, and the compare table SHALL use proper header cells with scope.
5. THE System SHALL keep text and background contrast at 4.5:1 or better.
6. WHEN the compare bar, filter result count or limit message changes, THE System SHALL announce it through a polite live region.

---

## REQ-12 Monthly usage and payment tracker (Stage 5: Use it well)

**Goal:** a page where a new cardholder logs what they spend each month, sees how much of their limit they use, and always knows when to pay and how much. It builds on REQ-1 items 16 to 20 (reminders, credit-building tracker, "pay in full" nudge). The first-3-months guide and the quiz of Stage 5 are separate and not part of this requirement.

**Primary persona:** Hafiz, who has irregular income and needs to plan around due dates.

### 12.1 Settings

**User story:** As a cardholder, I want to tell the app my statement day and limit, so the dates and percentages match my card.

1. THE System SHALL let the user set a statement day from 1 to 28 and a credit limit in RM.
2. THE System SHALL default the limit to the approved demo limit in the config file and the statement day to 15.
3. WHEN the user changes either value, THE System SHALL recalculate every figure on the page at once.
4. IF the limit is empty, zero or not a number, THEN THE System SHALL show a friendly message and keep the last good value in use.

### 12.2 Log spending

**User story:** As a cardholder, I want to log each purchase quickly, so I can see my month at a glance.

1. THE System SHALL let the user add a spend with amount (RM), date, category (food, transport, groceries, bills, shopping, other) and an optional note.
2. THE System SHALL default the date to today and SHALL NOT accept a future date.
3. IF the amount is missing, zero, negative or above RM100,000, THEN THE System SHALL show a friendly message next to the field and not save.
4. THE System SHALL list the spends of the current billing cycle, newest first, each with a delete control.
5. WHEN the user deletes a spend, THE System SHALL update all totals and announce the change to screen readers.
6. THE System SHALL keep all entries on the device only.

### 12.3 Monthly usage

1. THE System SHALL show total spend so far in the current billing cycle, the limit, and utilisation as a percentage.
2. THE System SHALL show utilisation as a bar with a marker at 30% and as text.
3. WHILE utilisation is 30% or less, THE System SHALL show the label "Good" with a tick symbol.
4. WHILE utilisation is above 30% and up to 70%, THE System SHALL show "Getting high" with a warning symbol and a tip to lower it.
5. WHILE utilisation is above 70%, THE System SHALL show "Too high" with a stop symbol and a tip to pay down before the statement date.
6. IF spend in the cycle is above the limit, THEN THE System SHALL say so and explain that a card can be declined or charged extra.
7. THE System SHALL show a breakdown of the cycle's spend by category with amounts and percentages as text.

### 12.4 When to pay

**User story:** As Hafiz, I want one clear answer to "when and how much do I pay", so I never pay late by accident.

1. THE System SHALL treat a billing cycle as ending on the statement day, with the statement issued the next day.
2. THE System SHALL set the due date at the statement date plus the grace days in the config file (20 days).
3. THE System SHALL show, for the latest issued statement: the statement date, the due date in the chosen language, the statement balance, and the days left.
4. THE System SHALL show a status with a text label and symbol: "Nothing to pay", "Upcoming", "Due soon" (5 days or fewer), "Due today", "Overdue", "Paid in full", "Paid on time (not in full)".
5. IF no statement has been issued yet, THEN THE System SHALL show the date the first statement will be issued and the due date after that.
6. THE System SHALL show "Pay by" as the main action on the page, above the spending log.

### 12.5 Pay in full or minimum

1. THE System SHALL show side by side, for the open statement: pay in full (amount, interest RM0) and pay the minimum (amount, interest, months to repay).
2. THE System SHALL show the late fee that applies if the due date is missed.
3. THE System SHALL show a nudge stating the interest avoided this month by paying in full.
4. THE System SHALL use the rate, minimum payment rule and late fee of the selected card, or the standard terms from the config file when no card is selected, and SHALL say which it used.

### 12.6 Record a payment

1. THE System SHALL let the user record a payment against a statement as full, minimum or another amount, with a date that defaults to today.
2. WHEN the payment date is on or before the due date, THE System SHALL count it as on time. Otherwise THE System SHALL count it as late.
3. WHEN the user pays less than the full balance, THE System SHALL show the remaining balance and the interest it may cost in the next month.
4. THE System SHALL let the user remove a recorded payment.
5. WHEN a payment is recorded or removed, THE System SHALL update the status, the tracker and the reminders at once.

### 12.7 Credit-building tracker

1. THE System SHALL show the last 3 issued statements that had a balance, each with month, balance and a status.
2. THE System SHALL show "On-time payments: N out of 3".
3. A statement SHALL count as on time when payments made on or before the due date add up to at least the minimum payment.
4. THE System SHALL explain in one sentence that paying on time builds a good record, and that paying in full also avoids interest.

### 12.8 Reminders

1. THE System SHALL let the user switch reminders on and choose 1, 3, 5 or 7 days before the due date.
2. WHILE reminders are on and today is on or after the reminder date and the open statement is unpaid, THE System SHALL show a reminder banner at the top of the page.
3. THE System SHALL offer a download of a calendar (.ics) file with the next 3 due dates and an alert the chosen number of days before each.
4. THE System SHALL state that reminders in this prototype appear only inside the app.

### 12.9 Demo and journey

1. THE System SHALL offer "Load sample spending" that fills 4 billing cycles of sample spending and two on-time payments, with dates relative to today so that the open statement is due in about 15 days.
2. THE System SHALL offer "Clear all" with a confirmation.
3. WHEN the user adds a first spend, THE System SHALL mark the "Use it well" stage as done in the stepper.
4. THE System SHALL show the selected card on the page (REQ-11.9.4).

### 12.10 Language and accessibility

1. THE System SHALL show every label, date and message in English and Bahasa Malaysia, and keep entries when the language changes.
2. THE System SHALL NOT use colour alone for any status.
3. THE System SHALL make every control at least 44 by 44 CSS pixels and label every field.
4. WHEN a spend or payment is added or removed, THE System SHALL announce the result through a polite live region.

### 11.13 Classification by card tier

**User story:** As a first-time user, I want cards grouped by tier, so I can tell a basic card from a premium one and pick the level that fits my income.

1. THE System SHALL classify every card by tier: Classic, Gold, Platinum, Secured or Student, using the `tier` field in `cards.json`.
2. THE System SHALL show the tier as text with a symbol on every card tile, in the compare table column header, and in the card detail.
3. THE System SHALL provide tier buttons above the card list (All tiers, Classic, Gold, Platinum, Secured, Student), each with the number of cards in it, and the same filter as a drop-down in the filter panel.
4. WHEN the user selects a tier, THE System SHALL show only cards in that tier, show a one-sentence plain-language description of the tier, and mark the button as pressed.
5. WHEN the user selects the pressed tier button again, THE System SHALL clear the tier filter.
6. THE System SHALL work out each tier count from the search text and all other filters, so the numbers always match what the user would see.
7. THE System SHALL include a "Card tier" row, with the tier description, in the compare table and the detail view.
8. THE System SHALL keep the chosen tier when the user switches language or leaves and returns, and clear it with "Clear filters".
9. THE System SHALL show every tier label and description in English and Bahasa Malaysia.