# KAF First Card

A prototype of a responsible first credit card journey for young adults in Malaysia, built for the MDEC-KAF Digital Bank Launchpad Accelerator (Use Case 2). It is not a real bank offer and sends nothing to any server.

## Run it

```bash
npm install
npm run dev          # http://127.0.0.1:5173
npm run build        # type check and build
npm run typecheck
npm run check:logic  # data and logic checks
```

Needs Node.js 22 or later.

## What is built

Every screen in the plan: Home, Am I ready?, Compare cards, What will it cost?, Apply (5-step wizard), Track (timeline and decision demos), Use it well (monthly usage, when to pay, first-3-months checklist, quiz), Learn (short lessons and a quiz), Pricing, Trust, and Workshop (preference card, feedback, summary and export for testers).

Turn on **Demo mode** in the header to load Hafiz and get a guided 5-minute walkthrough. Use the EN / BM switch for English or Bahasa Malaysia. See `.kiro/specs/kaf-first-card/` for requirements, design and tasks.

## Card data

`src/data/cards.json` holds real Malaysian credit cards (15 banks) collected on 19 November 2026 from bank websites and from RinggitPlus, which checks them against bank pages. Anything a source did not state is left empty and shown as "Not stated". The numbers change often, so confirm with the bank.

- Edit the JSON by hand, or edit the per-bank files in `scripts/cards-gen/` and run `node scripts/cards-gen/build.mjs`.
- Run `npm run check:logic` after any change. It names the card and field if something is wrong.
- Rates and fees used by the cost simulator when no card is chosen live in `src/config/rates.ts`.
