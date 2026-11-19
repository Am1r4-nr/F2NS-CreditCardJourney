// Quick check of the pure logic. Run with: npm run check:logic
import { simulate, minimumPayment } from '../src/lib/cost.ts';
import { checkReadiness } from '../src/lib/eligibility.ts';

let failed = 0;
function expect(name: string, ok: boolean, detail?: unknown) {
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + JSON.stringify(detail)}`);
}

expect('min payment of RM500 is RM50 (floor beats 5%)', minimumPayment(500) === 50);
expect('min payment of RM2000 is RM100 (5%)', minimumPayment(2000) === 100);
expect('min payment never above balance', minimumPayment(30) === 30);

const full = simulate({ spend: 500, mode: 'full', fixed: 0 });
expect('pay in full: no interest, total = spend', full.interest === 0 && full.total === 500, full);

const min = simulate({ spend: 500, mode: 'minimum', fixed: 0 });
expect('minimum only on RM500 costs interest and takes about 11 months', min.interest > 0 && min.months >= 10 && min.months <= 12, min);
console.log('   minimum-only RM500:', min);

const fixedLow = simulate({ spend: 500, mode: 'fixed', fixed: 20 });
expect('fixed below minimum falls back to minimum', fixedLow.usedMinimum && fixedLow.months === min.months, fixedLow);

const fixedHigh = simulate({ spend: 500, mode: 'fixed', fixed: 250 });
expect('fixed RM250 finishes in 3 months', fixedHigh.months === 3, fixedHigh);

const hafiz = checkReadiness({ age: '25', incomeType: 'gig', income: '2800', commitments: '500' });
expect('Hafiz is Likely', hafiz.verdict === 'likely', hafiz);
const aina = checkReadiness({ age: '23', incomeType: 'salaried', income: '3500', commitments: '300' });
expect('Aina is Likely', aina.verdict === 'likely', aina);
const daniel = checkReadiness({ age: '24', incomeType: 'student', income: '1200', commitments: '200' });
expect('Daniel is Not yet with a plan', daniel.verdict === 'notyet' && daniel.plan.length > 0, daniel);
const young = checkReadiness({ age: '19', incomeType: 'salaried', income: '3000', commitments: '0' });
expect('Under 21 is Not yet', young.verdict === 'notyet');
const tight = checkReadiness({ age: '30', incomeType: 'salaried', income: '3000', commitments: '1500' });
expect('50% commitments is Maybe', tight.verdict === 'maybe', tight);

// ---- REQ-11: card data and comparison logic ----
import cardsJson from '../src/data/cards.json' with { type: 'json' };
import { validateCards } from '../src/data/validate.ts';
import { DEFAULT_FILTERS, bestMatches, compareRows, derive, filterCards, sortCards, termsFromCard } from '../src/lib/cards.ts';
import type { CardRecord } from '../src/data/cardTypes.ts';

const problems = validateCards(cardsJson);
expect('cards.json is valid', problems.length === 0, problems);
const bad = validateCards({ meta: cardsJson.meta, cards: [{ ...cardsJson.cards[0], network: 'Discover' }, ...cardsJson.cards.slice(1)] });
expect('validator names the card and field when data is wrong', bad.some((m) => m.includes('Starter Visa') && m.includes('network')), bad);

const cards = cardsJson.cards as unknown as CardRecord[];
const byId = (id: string) => cards.find((c) => c.id === id)!;
expect('HSBC secured card scores 5', derive(byId('hsbc-secured-visa')).friendliness === 5);
expect('Standard Chartered platinum scores low (2)', derive(byId('standard-chartered-smart-platinum')).friendliness === 2, derive(byId('standard-chartered-smart-platinum')));
expect('Public Bank is not gig-worker friendly', !derive(byId('public-bank-simple-visa')).gigFriendly);
expect('Maybank Starter is gig-worker friendly', derive(byId('maybank-starter-visa')).gigFriendly);

const gigOnly = filterCards(cards, '', { ...DEFAULT_FILTERS, gig: true });
expect('gig filter keeps only cards with bank statement or gig statement', gigOnly.length > 0 && gigOnly.every((c) => c.incomeProof.includes('bank_statement') || c.incomeProof.includes('gig_statement')));
expect('gig filter removes Public Bank', !gigOnly.some((c) => c.id === 'public-bank-simple-visa'));
expect('search matches bank or card name, ignoring case', filterCards(cards, 'hsbc', DEFAULT_FILTERS).length === 1 && filterCards(cards, 'WISE', DEFAULT_FILTERS).length === 1);
expect('filters combine (Islamic + digital)', filterCards(cards, '', { ...DEFAULT_FILTERS, kind: 'islamic', digital: true }).every((c) => c.kind === 'islamic' && c.digitalApplication));
expect('no match gives an empty list', filterCards(cards, 'zzzz', DEFAULT_FILTERS).length === 0);
expect('income slider limits by monthly income', filterCards(cards, '', { ...DEFAULT_FILTERS, maxMonthlyIncome: 1500 }).every((c) => c.minAnnualIncome / 12 <= 1500));

const best = sortCards(cards, 'best');
expect('default sort puts the highest friendliness first', derive(best[0]).friendliness === 5);
expect('fee sort starts with a RM0 card', sortCards(cards, 'fee')[0].annualFee === 0);
expect('rate sort starts with the lowest rate', sortCards(cards, 'rate')[0].interestPa === Math.min(...cards.map((c) => c.interestPa)));
expect('income sort starts with the lowest income', sortCards(cards, 'income')[0].minAnnualIncome === Math.min(...cards.map((c) => c.minAnnualIncome)));
expect('rewards sort starts with the best return', sortCards(cards, 'rewards')[0].rewards.valuePercent === Math.max(...cards.map((c) => c.rewards.valuePercent)));

const hafizMatch = bestMatches(cards, { age: '25', incomeType: 'gig', income: '2800', commitments: '500' });
expect('Hafiz gets 3 matches, all gig-friendly', hafizMatch.matches.length === 3 && hafizMatch.matches.every((m) => derive(m.card).gigFriendly), hafizMatch.matches.map((m) => m.card.id));
expect('every match has at least 2 reasons', hafizMatch.matches.every((m) => m.reasons.length >= 2));
const ainaMatch = bestMatches(cards, { age: '23', incomeType: 'salaried', income: '3500', commitments: '300' });
expect('Aina gets 3 matches she can afford', ainaMatch.matches.length === 3 && ainaMatch.matches.every((m) => m.card.minAnnualIncome <= 42000));
const nobody = bestMatches(cards, { age: '19', incomeType: 'salaried', income: '500', commitments: '0' });
expect('under-age, low income gets no matches and a reason', nobody.matches.length === 0 && nobody.excluded.tooYoung > 0);

const trio = [byId('maybank-starter-visa'), byId('public-bank-simple-visa'), byId('hsbc-secured-visa')];
const rows = compareRows(trio);
const feeRow = rows.find((r) => r.row.id === 'annualFee')!;
expect('best annual fee is marked on both RM0 cards', feeRow.best.join() === '0,2' && feeRow.differs, feeRow);
const rateRow = rows.find((r) => r.row.id === 'rate')!;
expect('best rate is the lowest (HSBC 12%)', rateRow.best.join() === '2', rateRow);
const sameRow = compareRows([byId('maybank-starter-visa'), byId('maybank-starter-visa')]).find((r) => r.row.id === 'rate')!;
expect('identical values do not differ and have no best', !sameRow.differs && sameRow.best.length === 0);
const t = termsFromCard(byId('affin-gig-start-mastercard'));
const cardSim = simulate({ spend: 500, mode: 'minimum', fixed: 0 }, t);
expect('simulator uses a card rate (Affin 18% costs more than default 15%)', t.aprPercent === 18 && cardSim.interest > min.interest, cardSim);

// ---- Tier classification (REQ-11.13) ----
import { TIER_ORDER, tierCounts } from '../src/lib/cards.ts';
const tcounts = tierCounts(cards, '', DEFAULT_FILTERS);
expect('every card falls in exactly one tier', TIER_ORDER.reduce((a, k) => a + tcounts[k], 0) === cards.length, tcounts);
expect('tier filter keeps only that tier', filterCards(cards, '', { ...DEFAULT_FILTERS, tier: 'gold' }).every((c) => c.tier === 'gold') && filterCards(cards, '', { ...DEFAULT_FILTERS, tier: 'gold' }).length === tcounts.gold);
expect('secured tier finds the HSBC secured card', filterCards(cards, '', { ...DEFAULT_FILTERS, tier: 'secured' }).map((c) => c.id).join() === 'hsbc-secured-visa');
expect('tier combines with other filters (gold + Islamic)', filterCards(cards, '', { ...DEFAULT_FILTERS, tier: 'gold', kind: 'islamic' }).every((c) => c.tier === 'gold' && c.kind === 'islamic'));
expect('tier counts ignore the tier filter itself but respect others', tierCounts(cards, '', { ...DEFAULT_FILTERS, tier: 'gold', kind: 'islamic' }).gold === filterCards(cards, '', { ...DEFAULT_FILTERS, tier: 'gold', kind: 'islamic' }).length && tierCounts(cards, '', { ...DEFAULT_FILTERS, tier: 'gold', kind: 'islamic' }).classic === filterCards(cards, '', { ...DEFAULT_FILTERS, tier: 'classic', kind: 'islamic' }).length);
expect('compare table has a tier row', compareRows(trio).some((r) => r.row.id === 'tier' && r.differs));

// ---- REQ-12: usage and payment tracker ----
import { addDays, buildStatement, cycleOf, daysBetween, dueDate, reminderDue, sampleData, statementBefore, statementOnOrAfter, summarise } from '../src/lib/usage.ts';
import { buildReminderIcs } from '../src/lib/ics.ts';
import type { Payment, Txn } from '../src/state/types.ts';

expect('statement on or after (day 15)', statementOnOrAfter('2026-11-10', 15) === '2026-11-15' && statementOnOrAfter('2026-11-15', 15) === '2026-11-15' && statementOnOrAfter('2026-11-16', 15) === '2026-12-15');
expect('statement before is strictly before', statementBefore('2026-11-15', 15) === '2026-10-15' && statementBefore('2026-11-16', 15) === '2026-11-15');
expect('year rollover works', statementOnOrAfter('2026-12-20', 15) === '2027-01-15' && statementBefore('2027-01-10', 15) === '2026-12-15');
expect('due date is statement date + 20 days', dueDate('2026-10-15') === '2026-11-04');
expect('days between and addDays agree', daysBetween('2026-11-19', addDays('2026-11-19', 15)) === 15);
const cyc = cycleOf('2026-11-19', 15);
expect('cycle of 19 Nov (day 15) is 16 Nov to 15 Dec', cyc.start === '2026-11-16' && cyc.end === '2026-12-15', cyc);

const tx = (date: string, amount: number): Txn => ({ id: date + amount, date, amount, category: 'food', note: '' });
const txns: Txn[] = [tx('2026-10-16', 100), tx('2026-10-15', 40), tx('2026-11-10', 200), tx('2026-11-16', 30)];
const sOct = buildStatement('2026-11-15', txns, [], 15, '2026-11-19');
expect('statement 15 Nov balance = 16 Oct to 15 Nov spend (100 + 200)', sOct.balance === 300 && sOct.due === '2026-12-05', sOct);
expect('upcoming with 16 days left', sOct.status === 'upcoming' && sOct.daysLeft === 16, sOct);
expect('minimum on RM300 is RM50', sOct.minimum === 50);
expect('due soon at 5 days', buildStatement('2026-11-15', txns, [], 15, '2026-11-30').status === 'due_soon');
expect('due today at 0 days', buildStatement('2026-11-15', txns, [], 15, '2026-12-05').status === 'due_today');
expect('overdue the day after', buildStatement('2026-11-15', txns, [], 15, '2026-12-06').status === 'overdue');
const payFull: Payment = { id: 'a', statementEnd: '2026-11-15', paidOn: '2026-12-05', amount: 300 };
expect('paid in full on the due date counts as on time', buildStatement('2026-11-15', txns, [payFull], 15, '2026-12-06').status === 'paid_full');
const payMin: Payment = { id: 'b', statementEnd: '2026-11-15', paidOn: '2026-12-01', amount: 50 };
expect('minimum on time is paid_min', buildStatement('2026-11-15', txns, [payMin], 15, '2026-12-06').status === 'paid_min');
const payLate: Payment = { id: 'c', statementEnd: '2026-11-15', paidOn: '2026-12-06', amount: 300 };
expect('paying a day late is not on time', buildStatement('2026-11-15', txns, [payLate], 15, '2026-12-07').status === 'overdue');
const split: Payment[] = [{ id: 'd', statementEnd: '2026-11-15', paidOn: '2026-11-20', amount: 30 }, { id: 'e', statementEnd: '2026-11-15', paidOn: '2026-11-25', amount: 25 }];
expect('part payments add up to the minimum', buildStatement('2026-11-15', txns, split, 15, '2026-12-01').status === 'paid_min');
expect('no spend means nothing to pay', buildStatement('2026-09-15', txns, [], 15, '2026-11-19').status === 'none');

const sum = summarise(txns, [], 15, 1500, '2026-11-19');
expect('current spend and utilisation (RM30 of RM1500 = 2%)', sum.currentSpend === 30 && Math.round(sum.utilisation) === 2 && sum.band === 'good', sum);
expect('open statement is 15 Nov', sum.open?.cycle.end === '2026-11-15');
expect('bands: 30 good, 31 high, 71 too high', summarise([tx('2026-11-17', 450)], [], 15, 1500, '2026-11-19').band === 'good' && summarise([tx('2026-11-17', 465)], [], 15, 1500, '2026-11-19').band === 'high' && summarise([tx('2026-11-17', 1100)], [], 15, 1500, '2026-11-19').band === 'too_high');
expect('over limit is flagged', summarise([tx('2026-11-17', 1600)], [], 15, 1500, '2026-11-19').overLimit);
expect('no statement before the first spend', summarise([], [], 15, 1500, '2026-11-19').open === null);
expect('category breakdown sums to 100% for one category', summarise([tx('2026-11-17', 50)], [], 15, 1500, '2026-11-19').byCategory[0].percent === 100);
expect('reminder shows 3 days before due, not earlier, not once paid', !reminderDue(sOct, '2026-12-01', 3) && reminderDue(sOct, '2026-12-02', 3) && !reminderDue(buildStatement('2026-11-15', txns, [payFull], 15, '2026-12-02'), '2026-12-02', 3));

const today = '2026-11-19';
const sample = sampleData(today);
const sm = summarise(sample.txns, sample.payments, sample.statementDay, 1500, today);
expect('sample: open statement is due in about 15 days and unpaid', !!sm.open && sm.open.daysLeft >= 14 && sm.open.daysLeft <= 16 && sm.open.status === 'upcoming', sm.open);
expect('sample: 2 on-time payments out of 3 statements', sm.recent.length === 3 && sm.onTimeCount === 2, sm.recent.map((r) => r.status));
expect('sample has spend in the current cycle too', sm.currentSpend > 0 && sm.band === 'good', sm.currentSpend);
const sample2 = sampleData('2026-12-31');
expect('sample works at month end (day capped at 28)', sample2.statementDay <= 28 && summarise(sample2.txns, sample2.payments, sample2.statementDay, 1500, '2026-12-31').open !== null);

const ics = buildReminderIcs(['2026-12-05', '2027-01-05'], 3, 'Maybank Starter Visa', new Date('2026-11-19T00:00:00Z'));
expect('ics has 2 events, all-day dates and a 3-day alert', (ics.match(/BEGIN:VEVENT/g) || []).length === 2 && ics.includes('DTSTART;VALUE=DATE:20261205') && ics.includes('DTEND;VALUE=DATE:20261206') && ics.includes('TRIGGER:-P3D') && ics.includes('\r\n'));

// ---- Apply wizard logic (REQ-2, REQ-4) ----
import { QUESTIONS, STEPS, ageFromDob, firstQuestionOfStep, isMalaysianMobile, minutesLeft, validateQuestion } from '../src/lib/apply.ts';
import type { Draft } from '../src/state/types.ts';

expect('wizard has at most 5 steps', STEPS.length === 5 && Math.max(...QUESTIONS.map((q) => q.step)) === 5);
expect('first question of step 3 is employment', QUESTIONS[firstQuestionOfStep(3)].id === 'employment');
expect('time left is at least 1 minute and shrinks', minutesLeft(0) >= minutesLeft(QUESTIONS.length - 1) && minutesLeft(QUESTIONS.length - 1) === 1);
expect('accepts 012-345 6789 and +60123456789', isMalaysianMobile('012-345 6789') && isMalaysianMobile('+60123456789'));
expect('rejects a landline and short numbers', !isMalaysianMobile('03-1234 5678') && !isMalaysianMobile('012-345'));
expect('age from DOB (12 April 2001 on 19 Nov 2026 is 25)', ageFromDob('12 April 2001', new Date('2026-11-19')) === 25);
expect('age from ISO date works', ageFromDob('2005-12-01', new Date('2026-11-19')) === 20);
const base: Draft = { q: 0, scanned: false, manualIdentity: false, identity: { name: '', ic: '', dob: '', address: '' }, phone: '', email: '', employment: 'gig', income: '', commitments: '', proofMethod: 'bank', consent: false, proof: null, costRead: false, savedAt: null, started: false };
expect('phone error is friendly and bilingual', !!validateQuestion('phone', { ...base, phone: '123' })?.ms);
expect('good phone passes', validateQuestion('phone', { ...base, phone: '012-345 6789' }) === undefined);
expect('bad email is rejected', !!validateQuestion('email', { ...base, email: 'hafiz@' }));
expect('income needs a number', !!validateQuestion('income', { ...base, income: '' }) && validateQuestion('income', { ...base, income: '0' }) === undefined);
expect('proof is blocked until completed', !!validateQuestion('proof', { ...base, proofMethod: 'bank', proof: null }));
expect('proof from a different method does not count', !!validateQuestion('proof', { ...base, proofMethod: 'lhdn', proof: { method: 'bank', avgMonthly: 1, lowest: 1, highest: 1, source: '' } }));
expect('review needs the cost confirmation', !!validateQuestion('review', base) && validateQuestion('review', { ...base, costRead: true }) === undefined);
expect('scan blocks until scanned or manual', !!validateQuestion('scan', base) && validateQuestion('scan', { ...base, scanned: true }) === undefined);

process.exit(failed ? 1 : 0);
