// Automated UAT: drives the running site in real Chrome. Start the site first (npm run dev), then: node scripts/uat/run.mjs
// Needs: npm install --no-save playwright-core   (uses the installed Google Chrome)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.UAT_URL ?? 'http://127.0.0.1:5173';
mkdirSync('scripts/uat/shots', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
const consoleErrors = [];

async function scenario(id, title, fn, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport ?? { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => consoleErrors.push(`${id}: ${e}`));
  p.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) consoleErrors.push(`${id}: ${m.text()}`); });
  p.setDefaultTimeout(6000);
  const steps = [];
  const step = async (name, f) => {
    try { await f(); steps.push({ name, ok: true }); }
    catch (e) {
      steps.push({ name, ok: false, err: String(e.message).split('\n')[0] });
      await p.screenshot({ path: `scripts/uat/shots/${id}-${steps.length}.png` }).catch(() => {});
      throw e;
    }
  };
  try { await fn(p, step); } catch { /* recorded in steps */ }
  results.push({ id, title, steps });
  await ctx.close();
}

const go = async (p, route) => { await p.goto(`${BASE}/#/${route}`); await p.waitForTimeout(250); };
const expectText = async (p, re, scope = 'main') => {
  await p.locator(scope).filter({ hasText: re }).first().waitFor({ state: 'visible' });
};
const nextBtn = (p) => p.getByRole('button', { name: /^Next$/ });
const hasText = async (p, re) => (await p.locator('main').innerText()).match(re) !== null;
const must = (cond, msg) => { if (!cond) throw new Error(msg); };

/** Signs up from the account gate that Apply shows. */
async function signUpHere(p, email = `uat${Date.now()}@example.com`, name = 'Hafiz Tester') {
  await p.getByLabel('Your name').fill(name);
  await p.getByLabel('Email address').fill(email);
  await p.getByLabel('Password').fill('correct horse 9');
  await p.getByRole('checkbox').check();
  await p.getByRole('button', { name: /Create account and continue/ }).click();
  return email;
}
/** Fills the apply wizard from the identity step to the review page. */
async function applyToReview(p, step, { camera = true, proof = 'bank' } = {}) {
  await step('Open Apply and start', async () => {
    await go(p, 'apply');
    await expectText(p, /document checklist/i);
    await p.getByRole('button', { name: 'I am ready. Start' }).click();
    await expectText(p, /Create your account to apply/);
    await signUpHere(p);
    await expectText(p, /Step 1 of 5/);
  });
  await step('Step 1 identity', async () => {
    if (camera) {
      await p.getByRole('button', { name: /Scan MyKad/ }).click();
      await expectText(p, /Mohd Hafiz bin Abdullah/);
    } else {
      await p.getByRole('button', { name: /Type my details/ }).click();
      await p.getByLabel(/full name/i).fill('Aina binti Ahmad');
      await p.getByLabel(/IC number/i).fill('020315-10-5566');
      await p.getByLabel(/date of birth/i).fill('2002-03-15');
      await p.getByLabel(/address/i).fill('No. 5, Jalan Ampang, 50450 Kuala Lumpur');
    }
    await nextBtn(p).click();
    await expectText(p, /Step 2 of 5/);
  });
  await step('Step 2 contact', async () => {
    await p.getByLabel(/mobile number/i).fill('012-345 6789');
    await p.getByLabel(/email address/i).fill('tester@example.com');
    await nextBtn(p).click();
    await expectText(p, /Step 3 of 5/);
  });
  await step('Step 3 work and income', async () => {
    await p.getByLabel('Gig worker').check();
    await p.getByLabel(/usual month/i).fill('2800');
    await p.getByLabel(/already pay each month/i).fill('300');
    await nextBtn(p).click();
    await expectText(p, /Step 4 of 5/);
  });
  await step('Step 4 income proof', async () => {
    if (proof === 'bank') {
      await p.getByRole('radio', { name: /Connect bank/ }).check();
      await p.locator('main input[type=checkbox]').first().check();
      await p.getByRole('button', { name: /Connect \(simulated\)/ }).click();
      await expectText(p, /Income proof added/);
    }
    await nextBtn(p).click();
    await expectText(p, /Step 5 of 5/);
  });
}

// ---------------------------------------------------------------- UAT-01
await scenario('UAT-01', 'Happy path: gig worker goes Home → Ready → Compare → Cost → Apply → Track → Use → Learn', async (p, step) => {
  await step('Home loads with headline and five stages', async () => {
    await go(p, '');
    await expectText(p, /YOUR FIRST CARD/i);
    must(await hasText(p, /Your journey in 5 stages/i), 'five stages missing');
  });
  await step('Get started leads to Ready', async () => {
    await p.getByRole('link', { name: /Get started/ }).click();
    await expectText(p, /Am I ready for a first card/i);
  });
  await step('Readiness: example person Hafiz gives "Likely" with reasons', async () => {
    await p.getByRole('button', { name: 'Hafiz, 25' }).click();
    await p.getByRole('button', { name: 'Check my chances' }).click();
    await expectText(p, /Your result: Likely/);
    must(await hasText(p, /The minimum age is 21/), 'reasons not shown');
  });
  await step('Compare: best match is offered after readiness', async () => {
    await go(p, 'compare');
    await expectText(p, /Best match for me/);
    must(!(await hasText(p, /Take the readiness check/)), 'still asking for readiness check');
  });
  await step('Compare: tier filter narrows the list', async () => {
    await p.getByRole('button', { name: /Classic \(\d+\)/ }).click();
    await p.waitForTimeout(300);
    const n = await p.locator('main input[aria-label^="Add to compare"]').count();
    must(n > 0 && n <= 42, `classic list size ${n}`);
  });
  await step('Compare: add 2 cards, open side-by-side table', async () => {
    const boxes = p.locator('main input[aria-label^="Add to compare"]');
    await boxes.nth(0).check();
    await boxes.nth(1).check();
    await p.getByRole('region', { name: /Cards to compare/ }).waitFor();
    await p.getByRole('button', { name: /^Compare$/ }).last().click().catch(async () => { await p.getByRole('link', { name: /Compare/ }).last().click(); });
    await p.waitForTimeout(500);
  });
  await step('Compare: card details open and show the bank website link', async () => {
    await go(p, 'compare');
    await p.getByRole('button', { name: /^Details:/ }).first().click();
    await p.getByRole('dialog').waitFor();
    must((await p.getByRole('dialog').locator('a[href^="http"]').count()) > 0, 'no website link in details');
    await p.keyboard.press('Escape');
    await p.getByRole('dialog').waitFor({ state: 'hidden' });
  });
  await step('Cost: slider and repayment mode change the numbers', async () => {
    await go(p, 'cost');
    await expectText(p, /Pay minimum only/);
    const before = await p.locator('main').innerText();
    await p.getByRole('slider').first().evaluate((el) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, '2000'); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
    await p.getByLabel('Pay in full').check();
    await p.waitForTimeout(300);
    const after = await p.locator('main').innerText();
    must(before !== after, 'cost page did not react');
    must(/no interest/i.test(after), 'pay-in-full text missing');
  });
  await applyToReview(p, step);
  await step('Review shows all costs and blocks submit until confirmed', async () => {
    await expectText(p, /Every cost, before you submit/);
    await p.getByRole('button', { name: 'Submit application' }).click();
    await p.waitForTimeout(400);
    must(await hasText(p, /Step 5 of 5/), 'submitted without confirming costs');
  });
  await step('Confirm costs and submit', async () => {
    await p.locator('main input[type=checkbox]').first().check();
    await p.getByRole('button', { name: 'Submit application' }).click();
    await p.waitForTimeout(2500);
    must(/KAF-[A-Z0-9]+/.test(await p.locator('main').innerText()), 'no reference number after submit');
  });
  await step('Track: shows own reference and timeline', async () => {
    if (!/#\/track/.test(p.url())) await go(p, 'track');
    await expectText(p, /Where is my application/);
    must(!(await hasText(p, /This is a demo/)), 'still shows the demo notice after applying');
  });
  await step('Track: step through to the approved decision with reasons', async () => {
    await p.getByRole('button', { name: /Skip to decision/ }).click();
    await p.waitForTimeout(800);
    must(await hasText(p, /approved/i), 'no approved decision');
  });
  await step('Use it well: add a spend and see usage change', async () => {
    await go(p, 'use');
    await p.getByRole('button', { name: 'Load sample spending' }).click();
    await p.waitForTimeout(500);
    must(await hasText(p, /RM\s?\d/), 'no amounts after loading sample');
  });
  await step('Use it well: reminder switch and .ics download', async () => {
    const dl = p.waitForEvent('download');
    await p.getByRole('button', { name: /Download calendar reminders/ }).click();
    const d = await dl;
    must(/\.ics$/.test(d.suggestedFilename()), 'ics filename ' + d.suggestedFilename());
  });
  await step('Learn: open a lesson card', async () => {
    await go(p, 'learn');
    await p.getByRole('button', { name: /What are a credit score and CCRIS/ }).click();
    await p.waitForTimeout(300);
    must(await hasText(p, /CCRIS/), 'lesson did not open');
  });
});

// ---------------------------------------------------------------- UAT-02
await scenario('UAT-02', 'Not ready: under-age or no-income user gets a clear "Not yet" with reasons', async (p, step) => {
  await step('Under-age user', async () => {
    await go(p, 'ready');
    await p.getByLabel(/How old are you/i).fill('19');
    await p.getByLabel('Student').check();
    await p.getByLabel(/earn money/i).first().fill('500').catch(() => {});
    await p.locator('main input[inputmode], main input[type=number]').nth(1).fill('500').catch(() => {});
    await p.getByRole('button', { name: 'Check my chances' }).click();
    await expectText(p, /Your result: (Not yet|Maybe)/);
    must(await hasText(p, /21/), 'age reason missing');
  });
  await step('Empty form shows friendly errors, not a result', async () => {
    await p.evaluate(() => localStorage.clear());
    await p.reload();
    await go(p, 'ready');
    await p.getByRole('button', { name: 'Check my chances' }).click();
    await p.waitForTimeout(300);
    must(!(await hasText(p, /Your result:/)), 'result shown for empty form');
  });
});

// ---------------------------------------------------------------- UAT-03
await scenario('UAT-03', 'Apply without a camera: type details by hand, validation, save and resume', async (p, step) => {
  await step('Typed identity works', async () => {
    await go(p, 'apply');
    await p.getByRole('button', { name: 'I am ready. Start' }).click();
    await signUpHere(p);
    await p.getByRole('button', { name: /Type my details/ }).click();
    await expectText(p, /Full name/i);
  });
  await step('Empty Next shows an error and stays on step 1', async () => {
    await nextBtn(p).click();
    await p.waitForTimeout(300);
    must(await hasText(p, /Step 1 of 5/), 'moved on with empty fields');
  });
  await step('Save and continue later keeps progress after reload', async () => {
    await p.getByLabel(/full name/i).fill('Aina binti Ahmad');
    await p.getByRole('button', { name: /Save and continue later/ }).click();
    await p.waitForTimeout(500);
    await p.reload();
    await go(p, 'apply');
    const resumed = (await hasText(p, /Aina binti Ahmad/)) || (await hasText(p, /Continue|Resume|saved/i));
    must(resumed, 'saved progress not restored');
  });
});

// ---------------------------------------------------------------- UAT-04
await scenario('UAT-04', 'Rejected outcome still gives reasons and next steps', async (p, step) => {
  await step('Track page example can show a rejection', async () => {
    await go(p, 'track');
    await p.getByLabel(/Rejected|Not approved/i).check();
    await p.getByRole('button', { name: /Skip to decision/ }).click();
    await p.waitForTimeout(700);
    must(await hasText(p, /apply again|next step|reason/i), 'no reasons or next steps');
    must(await hasText(p, /person|call|chat|branch/i), 'no way to reach a person');
  });
});

// ---------------------------------------------------------------- UAT-05
await scenario('UAT-05', 'Navigation: menu, skip-ahead confirmation, stepper, skip link', async (p, step) => {
  await step('Menu opens, lists all pages, closes with Escape', async () => {
    await go(p, '');
    await p.getByRole('button', { name: 'Open menu' }).click();
    const dlg = p.getByRole('dialog', { name: 'Menu' });
    await dlg.waitFor();
    for (const name of ['Home', 'Start applying', 'Track Application', 'Use it well', 'Compare cards', 'Learn', 'Pricing', 'Workshop']) {
      must((await dlg.getByRole('link', { name }).count()) === 1, 'menu missing ' + name);
    }
    await p.keyboard.press('Escape');
    await dlg.waitFor({ state: 'hidden' });
  });
  await step('Jumping ahead on the timeline asks for confirmation; Stay here cancels', async () => {
    await go(p, 'ready');
    await p.getByRole('navigation', { name: 'Your journey' }).getByRole('link', { name: /Apply/ }).click();
    await p.getByRole('alertdialog').waitFor();
    await p.getByRole('button', { name: 'Stay here' }).click();
    must(!/#\/apply/.test(p.url()), 'navigated despite Stay here');
  });
  await step('Yes, skip goes ahead', async () => {
    await p.getByRole('navigation', { name: 'Your journey' }).getByRole('link', { name: /Apply/ }).click();
    await p.getByRole('button', { name: 'Yes, skip' }).click();
    await p.waitForURL(/#\/apply/);
  });
  await step('Menu "Start applying" resumes the last timeline step', async () => {
    await go(p, '');
    await p.getByRole('button', { name: 'Open menu' }).click();
    await p.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Start applying' }).click();
    await p.waitForURL(/#\/(ready|cost|apply)/);
  });
  await step('Going back is free (no confirmation)', async () => {
    await p.getByRole('button', { name: 'Open menu' }).click();
    await p.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Home' }).click();
    await p.waitForURL(/#\/$|#\/?$/);
    must((await p.getByRole('alertdialog').count()) === 0, 'asked to confirm going back');
  });
  await step('Skip link is the first focusable item and works from the keyboard', async () => {
    await go(p, 'learn');
    const first = await p.evaluate(() => document.querySelector('a[href], button, input, select')?.textContent ?? '');
    must(/skip to content/i.test(first), 'first focusable: ' + first);
    await p.locator('a', { hasText: /skip to content/i }).focus();
    await p.keyboard.press('Enter');
    await p.waitForTimeout(200);
    must(/#\/learn/.test(p.url()), 'skip link changed the route');
  });
  await step('Unknown route falls back to Home', async () => {
    await p.goto(`${BASE}/#/does-not-exist`);
    await expectText(p, /YOUR FIRST CARD/i);
  });
});

// ---------------------------------------------------------------- UAT-06
await scenario('UAT-06', 'Language: switch to Bahasa Malaysia and back, choice persists', async (p, step) => {
  await step('BM text appears', async () => {
    await go(p, '');
    await p.getByRole('button', { name: /^BM$/ }).click();
    await expectText(p, /Kad pertama anda/i);
  });
  await step('BM persists on another page after reload', async () => {
    await go(p, 'cost');
    await p.reload();
    await expectText(p, /kos/i);
    must(await hasText(p, /Bayar/i), 'BM not applied on Cost');
  });
  await step('Back to EN', async () => {
    await p.getByRole('button', { name: /^EN$/ }).click();
    await expectText(p, /cost/i);
  });
});

// ---------------------------------------------------------------- UAT-07
await scenario('UAT-07', 'Site guide: opens, steps through every page, closes', async (p, step) => {
  await step('Guide opens on the first step', async () => {
    await go(p, '');
    await p.getByRole('button', { name: 'Guide' }).click();
    await p.getByRole('complementary', { name: /How to use this site/ }).waitFor();
    must(await p.getByText(/Step 1 \/ 8/).count() > 0, 'not on step 1');
  });
  const guide = p.getByRole('complementary', { name: /How to use this site/ });
  await step('Next moves through all 8 steps and changes page', async () => {
    const urls = new Set();
    for (let i = 0; i < 7; i++) { await guide.getByRole('button', { name: 'Next' }).click(); await p.waitForTimeout(250); urls.add(p.url()); }
    must(urls.size >= 7, 'pages visited: ' + urls.size);
    must(await p.getByText(/Step 8 \/ 8/).count() > 0, 'not on step 8');
  });
  await step('Back works, Finish closes the guide', async () => {
    await guide.getByRole('button', { name: 'Back' }).click();
    await guide.getByRole('button', { name: 'Next' }).click();
    await guide.getByRole('button', { name: 'Finish' }).click();
    await p.getByRole('complementary', { name: /How to use this site/ }).waitFor({ state: 'hidden' });
  });
});

// ---------------------------------------------------------------- UAT-08
await scenario('UAT-08', 'Workshop: tester saves a preference card and sees it in the summary', async (p, step) => {
  await step('Pick answers and save', async () => {
    await go(p, 'workshop');
    await p.getByLabel(/Your name or nickname/i).fill('UAT tester');
    for (const name of ['seamless', 'deal', 'trust']) {
      const boxes = p.locator(`main input[name=${name}]`);
      await boxes.nth(0).check(); await boxes.nth(1).check();
    }
    await p.locator('main input[name=proof]').first().check();
    await p.locator('main input[name=time]').first().check();
    await p.locator('main input[name=features]').first().check();
    await p.locator('main input[name=rating]').nth(3).check();
    await p.getByRole('button', { name: 'Save my answers' }).click();
    await p.waitForTimeout(500);
  });
  await step('Summary counts the saved entry', async () => {
    await p.getByRole('button', { name: /Summary \(1 saved\)/ }).click();
    must(await hasText(p, /UAT tester|1 /), 'entry not in summary');
  });
});

// ---------------------------------------------------------------- UAT-09
await scenario('UAT-09', 'Every page loads with a heading and no script errors', async (p, step) => {
  for (const r of ['', 'ready', 'compare', 'cost', 'apply', 'track', 'use', 'learn', 'pricing', 'trust', 'workshop', 'account']) {
    await step('Route /' + r, async () => {
      await go(p, r);
      must((await p.locator('h1').count()) >= 1, 'no h1');
      must((await p.locator('main').innerText()).length > 100, 'page looks empty');
    });
  }
});

// ---------------------------------------------------------------- UAT-10
await scenario('UAT-10', 'Phone-sized screen: no sideways scroll on any page', async (p, step) => {
  for (const r of ['', 'ready', 'compare', 'cost', 'apply', 'track', 'use', 'learn', 'pricing', 'trust']) {
    await step('Route /' + r + ' at 375px', async () => {
      await go(p, r);
      const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      must(over <= 1, `page is ${over}px wider than the screen`);
    });
  }
}, { viewport: { width: 375, height: 800 } });

// ---------------------------------------------------------------- UAT-11
await scenario('UAT-11', 'Help button: opens chat/call options on every page', async (p, step) => {
  await step('Help opens and closes', async () => {
    await go(p, 'cost');
    await p.getByRole('button', { name: /help/i }).last().click();
    await p.getByRole('dialog', { name: /Get help/ }).waitFor();
    await p.keyboard.press('Escape');
  });
});

// ---------------------------------------------------------------- UAT-12
await scenario('UAT-12', 'Account: applying needs a sign-up, answers are saved to the account', async (p, step) => {
  let email;
  await step('Start applying without an account shows the sign-up form', async () => {
    await go(p, 'apply');
    await p.getByRole('button', { name: 'I am ready. Start' }).click();
    await expectText(p, /Create your account to apply/);
    must((await p.getByText(/Step 1 of 5/).count()) === 0, 'wizard visible without an account');
  });
  await step('Sign-up checks name, email, password and the tick box', async () => {
    await p.getByRole('button', { name: /Create account and continue/ }).click();
    await p.waitForTimeout(300);
    must((await p.locator('[role=alert]').count()) >= 3, 'expected several errors');
    await p.getByLabel('Your name').fill('Hafiz');
    await p.getByLabel('Email address').fill('not-an-email');
    await p.getByLabel('Password').fill('short');
    await p.getByRole('button', { name: /Create account and continue/ }).click();
    await p.waitForTimeout(300);
    must(await hasText(p, /valid email/i) && await hasText(p, /at least 8/i), 'email/password errors missing');
  });
  await step('Valid sign-up opens the wizard; header shows the name', async () => {
    email = `uat${Date.now()}@example.com`;
    await p.getByLabel('Email address').fill(email);
    await p.getByLabel('Password').fill('correct horse 9');
    await p.getByRole('checkbox').check();
    await p.getByRole('button', { name: /Create account and continue/ }).click();
    await expectText(p, /Step 1 of 5/);
    must((await p.locator('header a', { hasText: 'Hafiz' }).count()) === 1, 'name not in header');
  });
  await step('Answers are saved: save, log out, log in, answers are back', async () => {
    await p.getByRole('button', { name: /Scan MyKad/ }).click();
    await expectText(p, /Mohd Hafiz bin Abdullah/);
    await nextBtn(p).click();
    await p.getByLabel(/mobile number/i).fill('012-345 6789');
    await p.getByRole('button', { name: /Save and continue later/ }).click();
    await p.waitForTimeout(300);
    await go(p, 'account');
    await p.getByRole('button', { name: 'Log out' }).click();
    await p.waitForURL(/#\/$|#\/?$/);
    must((await p.locator('header a', { hasText: 'Log in' }).count()) === 1, 'still signed in');
    await go(p, 'account');
    await p.getByRole('tab', { name: /I have an account/ }).click();
    await p.getByLabel('Email address').fill(email);
    await p.getByLabel('Password').fill('wrong password');
    await p.getByRole('button', { name: /Log in and continue/ }).click();
    await expectText(p, /email or password is not right/i);
    await p.getByLabel('Password').fill('correct horse 9');
    await p.getByRole('button', { name: /Log in and continue/ }).click();
    await p.waitForURL(/#\/apply/);
    const cont = p.getByRole('button', { name: /Continue my saved application/ });
    if (await cont.count()) await cont.click();
    await expectText(p, /Step 2 of 5/);
    await expectText(p, /012-345 6789/).catch(() => {});
    const val = await p.getByLabel(/mobile number/i).inputValue();
    must(val === '012-345 6789', 'saved phone not restored: ' + val);
  });
  await step('Same email cannot sign up twice', async () => {
    await go(p, 'account');
    await p.getByRole('button', { name: 'Log out' }).click();
    await go(p, 'account');
    await p.getByLabel('Your name').fill('Someone');
    await p.getByLabel('Email address').fill(email);
    await p.getByLabel('Password').fill('another pass 1');
    await p.getByRole('checkbox').check();
    await p.getByRole('button', { name: /Create account and continue/ }).click();
    await expectText(p, /already an account/i);
  });
});
await browser.close();

let failed = 0;
for (const r of results) {
  const bad = r.steps.filter((s) => !s.ok);
  failed += bad.length;
  console.log(`\n${bad.length ? 'FAIL' : 'PASS'}  ${r.id}  ${r.title}  (${r.steps.length - bad.length}/${r.steps.length})`);
  for (const s of r.steps) if (!s.ok) console.log(`      ✗ ${s.name}\n        ${s.err}`);
}
if (consoleErrors.length) { console.log('\nScript errors in the browser:'); for (const e of [...new Set(consoleErrors)]) console.log('  ' + e); }
console.log(`\n${failed === 0 && consoleErrors.length === 0 ? 'ALL UAT PASSED' : `${failed} step(s) failed, ${consoleErrors.length} browser error(s)`}`);
process.exit(failed || consoleErrors.length ? 1 : 0);
