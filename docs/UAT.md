# User acceptance testing (UAT)

Start the site, then run the automated routes in real Chrome:

    npm run dev          # terminal 1 (http://127.0.0.1:5173)
    npm run uat          # terminal 2

Set `UAT_URL` to test another address. A failed step saves a screenshot in `scripts/uat/shots/`.
The routes below can also be followed by hand.

| ID | Route | Who | Expected result |
|---|---|---|---|
| UAT-01 | Home → Get started → Ready (Hafiz) → Compare (tier filter, add 2 cards, details with bank link) → Cost (slider, pay in full) → Apply (MyKad scan, contact, work, bank proof, review) → Submit → Track → Use it well (sample spend, .ics reminder) → Learn | Gig worker, no payslip | Every page works. "Likely" with reasons. Costs shown before submit. Submit blocked until costs are confirmed. Reference number issued. Track no longer says "demo". Decision has reasons. .ics file downloads |
| UAT-02 | Ready with age 19, then an empty form | Under-age or empty | "Not yet" or "Maybe" with the age reason. Empty form shows no result |
| UAT-03 | Apply → "Type my details" → empty Next → save and continue later → reload | No camera | Typed entry works, empty step is blocked, progress survives reload |
| UAT-04 | Track → Rejected → Skip to decision | Declined applicant | Reasons, next steps, and a way to reach a person |
| UAT-05 | Menu → Track from a fresh start; Stay here; Yes, skip; Home; skip link; unknown URL | Any | Skip-ahead asks first, going back is free, skip link is first, unknown URL shows Home |
| UAT-06 | EN/BM switch, reload | Malay speaker | BM text shown and kept after reload |
| UAT-07 | Guide button → Next ×7 → Back → Finish | New visitor | 8 steps, each opens its page, panel closes |
| UAT-08 | Workshop → fill card → Save → Summary | Facilitator | Entry saved and counted |
| UAT-09 | All 11 pages | Any | Each loads with a heading and no browser errors |
| UAT-10 | Main pages at 375 px wide | Phone user | No sideways scroll |
| UAT-11 | Help button | Any | Opens chat/call options, closes with Esc |
| UAT-12 | Apply → Start without an account → sign-up (errors, valid) → fill step 1–2 → save → Log out → Log in (wrong then right password) → resume; sign up again with the same email | New applicant | Applying needs an account. Sign-up checks name, email, password and the tick box. Answers come back after log-in. Wrong password and duplicate email give clear errors |

## Not covered by the automated run (check by hand)

- Screen reader reading order and announcements.
- Colour contrast of every pair (the theme was checked by calculation only).
- Safari, Firefox and a real phone.
- Accounts are a prototype: they live in this browser only, with no email check or password reset. A real build needs a server.
- Placeholders still to replace: BNM licence number, PIDM text, phone number.
- Card data accuracy against each bank's own page.
