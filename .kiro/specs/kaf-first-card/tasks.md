# Tasks: KAF First Card

- [x] 1. Clean the workspace (old project removed, backup kept outside the repo)
- [x] 2. Write requirements, design and tasks
- [x] 3. Scaffold Vite + React + TypeScript + Tailwind (NFR-4)
- [x] 4. Config and pure logic: `config/rates.ts`, `lib/cost.ts`, `lib/eligibility.ts`, `lib/format.ts` (REQ-8, REQ-1)
- [x] 5. Verify logic with a script against known values
- [x] 6. i18n provider, hash router, state store with persistence, mock API (NFR-1, NFR-3)
- [x] 7. UI kit and layout: banner, header, stepper, help widget, trust strip, footer (REQ-1, REQ-6, NFR-2)
- [x] 8. Home and Trust and Pricing pages (REQ-6)
- [x] 9. Stage 1 Am I ready (REQ-1)
- [x] 10. Stage 2 Cost simulator (REQ-8)
- [x] 11. Stage 3 Apply: checklist, wizard, income proof, cost summary, save and resume (REQ-2, 3, 4)
- [x] 12. Stage 4 Track with demo controls (REQ-5)
- [x] 13. Learn cards and quiz (REQ-7)
- [x] 14. Stage 5 Use it well (REQ-1, REQ-7)
- [x] 15. Workshop page: preference card, feedback, summary, export (REQ-9)
- [x] 16. Demo mode and walkthrough (REQ-10)
- [x] 17. Type check, build, and walk through both languages
- [x] 18. README with run steps

## REQ-11 Credit Card Comparison Hub

Existing screens already built: Home, Ready, Cost. Not built yet: Apply, Track, Use it well, Learn, Pricing, Trust, Workshop, Walkthrough. REQ-11 pieces that touch those screens are listed as "pending" below.

- [x] 19. Update requirements.md, design.md and tasks.md for REQ-11
- [x] 20. Card type and `src/data/cards.json` with 12 sample cards (11.1)
- [x] 21. Typed loader and `lib/cards.ts`: scores, badges, filters, sort, best match, compare rows (11.3, 11.4, 11.5, 11.6, 11.8)
- [x] 22. Extend `scripts/check-logic.ts`: data validation and scoring checks (11.1.6)
- [x] 23. Parameterise `lib/cost.ts` with `Terms` and keep defaults (11.9.1)
- [x] 24. Store: compare state, selected card, log, persistence (11.5.5, 11.5.6, 11.10)
- [x] 25. Router, header navigation, optional stepper step, "coming soon" screen (11.9.6)
- [x] 26. Comparison hub UI: tiles, filters, sort, search, empty state, disclaimer (11.2, 11.4, 11.5)
- [x] 27. Compare bar and compare table with sticky header and fixed first column (11.6)
- [x] 28. Card detail drawer with focus trap (11.7)
- [x] 29. Best match panel (11.8)
- [x] 30. Cost simulator loads the card's terms, shows card fees, "Use standard rates" (11.9.1, 11.9.2)
- [x] 31. Selected card chip on Cost and Ready link to hub; tips strip (11.9, 11.11)
- [x] 32. Type check, build, logic check and server-render check of the hub in EN and BM
- [ ] 32b. Manual click-through in a browser (4th-card limit, language switch keeps filters, drawer focus, 320 px layout)
- [x] 33. Selected card chip on Apply, Track and Use it well (11.9.4), workshop field and card log (11.10), tip links to Learn cards (11.11.2); Workshop field, tester log summary and export (11.10); tip links to Learn cards (11.11.2)

## REQ-12 Monthly usage and payment tracker

- [x] 34. Update requirements.md, design.md and tasks.md for REQ-12
- [x] 35. State: replace `UseState`, add types, safe load of old data (12.1)
- [x] 36. `lib/usage.ts`: cycles, due dates, statements, status, utilisation, sample data (12.3 to 12.7)
- [x] 37. `lib/ics.ts`: reminder calendar file (12.8)
- [x] 38. Logic checks for dates, statuses and the sample data
- [x] 39. Usage page: Pay by card, pay options, usage meter (12.3, 12.4, 12.5)
- [x] 40. Spend form and list, payment form, tracker (12.2, 12.6, 12.7)
- [x] 41. Settings, reminders, sample data, stepper done mark (12.1, 12.8, 12.9)
- [x] 42. Browser-style test of the flow in EN and BM, type check, build

## REQ-11.13 Card tier classification

- [x] 43. Spec updates for tier classification
- [x] 44. Tier filter, counts, labels and compare row in lib/cards.ts; tests in check-logic.ts
- [x] 45. Tier tag, tier buttons and filter drop-down in the hub, compare table and detail

## REQ-11 real data (done 19 Nov 2026)

- [x] 46. Collect real card data for 15 banks into `cards.json` (banks + cards, nulls for unknowns, links and sources)
- [x] 47. New types, resolver, validator
- [x] 48. Rewrite `lib/cards.ts` and add `lib/cardText.ts` for nulls, ranges, premium tier, deposit route, paging-friendly sorts
- [x] 49. Update tiles, filters, detail drawer (facts-based good-for and cautions, links and sources), compare table, Cost page, application cost summary, Home text
- [x] 50. Clean saved state from older versions
- [x] 51. Rewrite logic checks (validator, nulls, filters, sorts, tiers, best match, compare, simulator terms) and test the hub in a browser-like run
- [ ] 52. Open items: verify more cards on bank sites (most bank sites blocked automated reads), add missing banks (Citibank, Bank Muamalat, Agrobank, AEON Credit, MBSB), fill `null` values, and refresh the data regularly

## Stage 4 Track (REQ-5) - done

- [x] 53. \lib/track.ts\: four stages, working-day dates, reasons and next steps built from the user's own answers (at least 2 reasons)
- [x] 54. Track page: reference number, in-principle answer, decision time, timeline with text status, Approved and Rejected decisions, demo controls (outcome toggle, step back and forward, skip, restart), help and scam note
- [x] 55. Logic checks and a browser-like test (21 checks) in both languages
- [x] 56. Pending: Demo mode walkthrough should drive this page (outcome and stage) when it is built

## Learn and quiz (REQ-7) - done

- [x] 57. \data/learn.ts\: 6 learning cards (credit score and CCRIS, minimum vs full, utilisation, dos and don'ts, myths, scam safety), reading time worked out from word count (30 to 60 seconds, checked in both languages), 5-question quiz and scoring
- [x] 58. Learn page with topic filter, expandable cards and deep links (#/learn/myths); quiz on the Learn page and at the end of Use it well; compare tips link to the right card
- [x] 59. Logic checks and a browser-like test (18 checks) in both languages

## Pricing, Trust, Workshop, Demo mode, first-3-months guide - done

- [x] 60. Pricing page (every fee from config, what we never charge, worked example) and Trust page (placeholder licence and PIDM badges, exactly 3 data bullets, scam note, human help)
- [x] 61. First-3-months checklist on Use it well (3 months, 4 actions each, saved)
- [x] 62. Workshop page: Journey Preference Card (5 fields + card features, up to 3 picks), feedback form (rating required, where stuck), tester log of compared, viewed and chosen cards, summary of testers with counts, average and comments, CSV and JSON export (spreadsheet-formula safe), delete all with confirmation, start next tester
- [x] 63. Demo mode: Hafiz pre-filled, 8-step walkthrough totalling 5:00 with talking points, timer against the 5-minute target, Back and Next set the right screen state, Reset demo, turn off keeps data
- [x] 64. Logic checks (142) and browser-like tests for each page, in both languages
- [ ] 65. Still to do by a person: click through every screen in a real browser on a phone and a laptop, run a screen-reader and contrast check, and replace placeholders (licence number, PIDM text, phone number) before showing outside the workshop
