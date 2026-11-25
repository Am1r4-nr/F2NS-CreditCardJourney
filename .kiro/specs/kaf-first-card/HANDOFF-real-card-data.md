# STATUS: DONE on 19 Nov 2026 (second session)

All the "To do" steps below were completed. The app type checks and builds, and 110 logic checks pass. A browser-like test of the compare hub, detail drawer, filters, the 3-card limit, language switch, best match and the simulator with a chosen card also passed. Open items are in tasks.md item 52.

---

# Handoff: replace sample cards with real Malaysian card data

Written 19 Nov 2026. Read this first when you continue.

## What you asked for
- No decoy data in the compare hub. Use real cards.
- Put website links wherever we have them.
- Include all credit cards, not only first-card ones.

## State right now: the app does NOT type check
The data layer was switched to the new real-data format, but the screens still use the old sample-card fields. `npm run typecheck` shows about 190 errors in:

| File | Errors |
|---|---|
| `src/lib/cards.ts` | 100 |
| `src/components/compare.tsx` | 49 |
| `src/components/apply.tsx` | 17 |
| `src/pages/Cost.tsx` | 12 |
| `scripts/check-logic.ts` | 7 |
| `src/components/cards.tsx` | 4 |
| `src/data/validate.ts` | 1 |

The dev server may show a blank or broken Compare page until this is fixed. Other pages that do not touch card fields (Home, Ready, Apply intro, Use it well) should still work, but check after the fix.

## Done
1. **Real data collected: 168 cards from 15 banks** in `src/data/cards.json` (47 Islamic, 8 deposit-backed).
   Banks: Maybank 27, Public Bank 11, CIMB 14, RHB 13, Hong Leong 9, AmBank 14, UOB 11, Standard Chartered 3, HSBC 8, Alliance 6, AFFIN 13, OCBC 7, Bank Islam 6, BSN 20, Bank Rakyat 6.
2. **Sources.** Most card details come from RinggitPlus bank pages, which say they check each card against the bank's own pages. Dated Nov 2026: Maybank, CIMB, RHB, AmBank, UOB, HSBC, Alliance, AFFIN, OCBC, Public Bank. **Undated, lower confidence:** Hong Leong, Standard Chartered, Bank Islam, BSN, Bank Rakyat. Their gaps are `null`.
3. **Checked directly on bank sites** (the rest of the bank sites timed out or blocked us):
   - OCBC Titanium page: RM75 fee, waived in year 1 and then with RM20,000 spend, income RM48,000 a year. Matches the data.
   - Hong Leong secured-card page: fixed-deposit-backed cards for new-to-card applicants only. Pledge RM2,000 (Wise, Essential, GSC Gold, I'm), RM3,000 (Sutera Platinum), RM12,000 (GSC Platinum), RM30,000 (Infinite). Added as `secured` + `securedDeposit`.
   - Bank Islam fee sheet and product sheet (Aug 2026): fee waived with 12 transactions or RM120 spend, late charge RM5 or 1% up to RM50, Platinum cashback 3%/5%.
   - BSN product sheets: cash advance 5% or RM10 (conventional), 2.69% or RM12.75 (Islamic), deposit-pledge option on the Visa Cash Back card.
4. **Official links.** Each bank has a website. Many have a cards page, fees page or product disclosure sheet. 62 cards have their own official page. All other cards fall back to the bank's cards page or website. Only addresses that came back from search results on the bank's own domain were used.
5. **New data format** (in `src/data/cardTypes.ts`): `banks[]` holds rules shared by a bank (interest tiers, minimum payment, late fee, cash advance, foreign fee, service tax, income documents). `cards[]` holds each card and may override them. Unknown values are `null`, never invented.
6. **New files written:** `src/data/cardTypes.ts`, `src/data/resolve.ts` (joins a card with its bank into `CardRecord`), `src/data/cards.ts` (loader), `src/data/validate.ts` (new validator).
7. **Generator (temporary):** `scripts/cards-gen/*.mjs`. Run `node scripts/cards-gen/build.mjs` to rebuild `cards.json` from the per-bank files. Delete this folder when the data is stable, or keep it if you prefer editing the data there. `cards.json` is still hand-editable.

## To do (in order)
1. **`src/lib/cards.ts`**: rewrite for the new `CardRecord`.
   - Nullable fields: `annualFee`, `minAnnualIncome`, `network`, `interest`, `lateFee`, `cashAdvance`, `fxPercent`, `supplementary`, `approvalTime`. Null sorts last. Null never counts as "best".
   - Interest is now `{ min, max|null }`. `max: null` means "from X%". For the simulator use the **highest** tier (new cardholders start at 18%), else the standard rate.
   - Remove the `digitalApplication`, `welcomeOffer` and `pros/cons/bestFor/notFor` use. Real data has none of them.
   - Friendliness score: drop the "digital application" criterion. Score = clamp(round(1 + income + proof + fee + secured), 1, 5) with each criterion 0 to 1.
   - Add `premium` tier (Signature, Infinite, World). Hide tiers with zero cards in the tier buttons.
   - `feeKind`: add `unknown` when the fee is null. Fee filter excludes unknown.
   - "Student-friendly" has no student cards now. Rename the filter to "Low income or deposit-backed" (income of RM2,000 a month or less, or `secured`).
   - Compare rows: remove Welcome offer and Apply online rows. Add Service tax, Perks, Deposit-backed. Show "Not stated" for nulls.
   - `termsFromCard`: use highest interest tier, bank minimum payment and late fee, falling back to standard terms when null.
   - Add `lib/cardText.ts` with text helpers (interest, minimum payment, late fee, cash advance with "flat + percent" or "percent or RM min", foreign fee, income, perks). Perk labels in English and Malay: lounge (n visits), loungeUnlimited, skyLounge, travelIns (RM amount), golf, dining, fastTrack, concierge, noLateFee, cinema, airportTransfer, grabRides, familyTakaful.
2. **`src/components/cards.tsx` and `compare.tsx`**:
   - Detail: replace Pros/Cons and "Who is this card best for?" with text derived from facts. Keep "Why this might not suit you" from derived cautions only.
   - Show links: card page ("Official card page" if `hasOwnPage`, else "Bank's cards page"), fees page, product disclosure sheet, and the data sources list with the date.
   - Replace "sample data" wording with: "Collected from bank websites and RinggitPlus on 19 Nov 2026. Details change often. Confirm with the bank." Keep the required disclaimer text.
   - Add a note under the Gig-worker badge: it means the bank lists bank statements as proof. Most banks also ask for business registration or tax forms.
   - Network filter: add UnionPay and "Not stated".
   - Bank filter now has 15 entries. Cards list is long: add paging or "show more" (for example 24 at a time) and keep the count line.
3. **`src/components/apply.tsx` (CostSummary), `src/pages/Cost.tsx`, Home text**: use the text helpers and handle nulls. Home says "12 Malaysian banks": use the real counts.
4. **`src/state/store.tsx`**: on load, drop `compare.selected`, `compare.log` and `selectedCardId` values that are not in the new card list (old sample ids such as `maybank-starter-visa`).
5. **`scripts/check-logic.ts`**: rewrite the REQ-11 checks for the new data (validator passes, 15 banks, 168 cards, gig filter, tier counts, sort order with nulls, best match, compare rows). Note `check-logic.ts` imports `cards.json` with `with { type: 'json' }`, then must call `resolveCards` from `src/data/resolve.ts`.
6. **Spec docs** (`requirements.md`, `design.md`, `tasks.md`): update REQ-11.1 (real data, banks plus cards, nulls, sources and links), 11.3 (score without digital), 11.5 (renamed filter), 11.7 (no pros/cons), 11.13 (premium tier). Mention the 15 banks and the confidence levels.
7. Run: `npm run typecheck`, `npm run build`, `npm run check:logic`. Then open `#/compare` and click through in both languages.

## Known data gaps and risks to tell the user
- **Not verified against every bank site.** Most bank sites blocked or timed out, so most details rest on RinggitPlus. Treat the data as "checked once, Nov 2026".
- **Missing banks:** Citibank, Bank Muamalat, Agrobank, AEON Credit, MBSB, Bank Simpanan Nasional extra cards, and any bank not on RinggitPlus. Also cards not on those pages (for example CIMB Private Wealth World Elite, UOB Basic Card and Visa Infinite Metal, which were seen in search results only).
- **Network is `null`** for many CIMB, HLB, UOB, HSBC Live+, AFFIN AURA, Bank Rakyat cards because the sources do not say.
- **Business cards are excluded** (for example Visa Business Platinum).
- **Gig-worker badge:** public sources list bank statements for self-employed or commission earners, but do not say gig workers are accepted. Only Public Bank and RHB do not list bank statements.
- **Interest `max` is null for Bank Islam** because the fee sheet snippet showed only tiers 15% and 17%.
- **Data format change** means anyone with a saved browser state from before may have stale card ids. Step 4 handles that.

## Other open work from earlier (not started)
Track page, Learn cards, Pricing page, Trust page, Workshop page (including the "which card features mattered" field and the compared/selected cards log), and the Demo walkthrough. See `tasks.md`.
