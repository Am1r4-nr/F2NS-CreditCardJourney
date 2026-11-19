# Tasks: KAF First Card

- [x] 1. Clean the workspace (old project removed, backup kept outside the repo)
- [x] 2. Write requirements, design and tasks
- [ ] 3. Scaffold Vite + React + TypeScript + Tailwind (NFR-4)
- [ ] 4. Config and pure logic: `config/rates.ts`, `lib/cost.ts`, `lib/eligibility.ts`, `lib/format.ts` (REQ-8, REQ-1)
- [ ] 5. Verify logic with a script against known values
- [ ] 6. i18n provider, hash router, state store with persistence, mock API (NFR-1, NFR-3)
- [ ] 7. UI kit and layout: banner, header, stepper, help widget, trust strip, footer (REQ-1, REQ-6, NFR-2)
- [ ] 8. Home and Trust and Pricing pages (REQ-6)
- [ ] 9. Stage 1 Am I ready (REQ-1)
- [ ] 10. Stage 2 Cost simulator (REQ-8)
- [x] 11. Stage 3 Apply: checklist, wizard, income proof, cost summary, save and resume (REQ-2, 3, 4)
- [ ] 12. Stage 4 Track with demo controls (REQ-5)
- [ ] 13. Learn cards and quiz (REQ-7)
- [ ] 14. Stage 5 Use it well (REQ-1, REQ-7)
- [ ] 15. Workshop page: preference card, feedback, summary, export (REQ-9)
- [ ] 16. Demo mode and walkthrough (REQ-10)
- [ ] 17. Type check, build, and walk through both languages
- [ ] 18. README with run steps

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
- [ ] 33. Pending (blocked until these screens are built) (screens not built yet): selected card chip on Track and Use it well (11.9.4, Apply is done); Workshop field, tester log summary and export (11.10); tip links to Learn cards (11.11.2)

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
