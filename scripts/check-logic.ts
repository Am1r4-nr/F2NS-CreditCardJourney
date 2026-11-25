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
import { resolveCards } from '../src/data/resolve.ts';
import { DEFAULT_FILTERS, TIER_ORDER, bestMatches, compareRows, derive, filterCards, missingTerms, nullLast, sortCards, termsFromCard, tierCounts } from '../src/lib/cards.ts';
import type { CardRecord, CardsFile } from '../src/data/cardTypes.ts';

const problems = validateCards(cardsJson);
expect('cards.json is valid', problems.length === 0, problems.slice(0, 5));

const badNetwork = validateCards({ ...cardsJson, cards: [{ ...cardsJson.cards[0], network: 'Discover' }, ...cardsJson.cards.slice(1)] });
expect('validator names the card and the field when data is wrong', badNetwork.some((m) => m.includes('network')), badNetwork);
const badBank = validateCards({ ...cardsJson, cards: [{ ...cardsJson.cards[0], bank: 'no-such-bank' }, ...cardsJson.cards.slice(1)] });
expect('validator catches a card that points to an unknown bank', badBank.some((m) => m.includes('bank') && m.includes('no-such-bank')), badBank);
const badLink = validateCards({ ...cardsJson, banks: [{ ...cardsJson.banks[0], website: 'maybank.com' }, ...cardsJson.banks.slice(1)] });
expect('validator catches a web address without http', badLink.some((m) => m.includes('website')), badLink);

const cards: CardRecord[] = resolveCards(cardsJson as unknown as CardsFile);
const byId = (id: string) => cards.find((c) => c.id === id)!;
const banksUsed = new Set(cards.map((c) => c.bankId));
expect('15 banks and more than 150 cards', banksUsed.size === 15 && cards.length > 150, { banks: banksUsed.size, cards: cards.length });
expect('every card has a link (its own page, its bank cards page or its bank website)', cards.every((c) => /^https?:\/\//.test(c.sourceUrl)));
expect('many cards link to their own official page', cards.filter((c) => c.hasOwnPage).length >= 50);
expect('every bank lists where its data came from', cards.every((c) => c.dataSources.length > 0 && c.dataSources.every((s) => /^https?:\/\//.test(s.url))));
expect('both conventional and Islamic cards', cards.some((c) => c.kind === 'islamic') && cards.some((c) => c.kind === 'conventional'));
expect('unknown values stay null and are not invented', cards.some((c) => c.annualFee === null) && cards.some((c) => c.minAnnualIncome === null) && cards.some((c) => c.network === null));
expect('a card inherits its bank rules (Maybank Visa Infinite: 5% or RM25 minimum)', byId('maybank-visa-infinite').minPayment?.floor === 25 && byId('maybank-visa-infinite').interest?.max === 18);
expect('a card can override its bank rule (CIMB Lite-i fixed 14%)', byId('cimb-lite-i').interest?.min === 14 && byId('cimb-lite-i').interest?.max === 14);
expect('Hong Leong has deposit-backed cards with the deposit amount', cards.filter((c) => c.bankId === 'hong-leong' && c.secured).length >= 5 && byId('hong-leong-wise-credit-card').securedDeposit === 2000);

// Derived fields
expect('score is always 1 to 5', cards.every((c) => derive(c).friendliness >= 1 && derive(c).friendliness <= 5));
expect('Public Bank does not list bank statements, so not gig-ready', !derive(byId('public-bank-visa-gold')).gigFriendly);
expect('Maybank lists bank statements', derive(byId('maybank-visa-infinite')).gigFriendly);
expect('a no-fee, low-income, deposit-backed card scores 5', derive(byId('hong-leong-i-m-credit-card')).friendliness === 5, derive(byId('hong-leong-i-m-credit-card')));
expect('a high-fee, high-income premium card scores low', derive(byId('cimb-travel-world-elite')).friendliness <= 2, derive(byId('cimb-travel-world-elite')));

// Filters and search
const gigOnly = filterCards(cards, '', { ...DEFAULT_FILTERS, gig: true });
expect('bank-statement filter keeps only cards that list it', gigOnly.length > 0 && gigOnly.every((c) => c.incomeProof.includes('bank_statement') || c.incomeProof.includes('gig_statement')));
expect('bank-statement filter removes Public Bank', !gigOnly.some((c) => c.bankId === 'public-bank'));
expect('search matches bank or card name, ignoring case', filterCards(cards, 'HSBC', DEFAULT_FILTERS).every((c) => c.bankId === 'hsbc') && filterCards(cards, 'visa infinite', DEFAULT_FILTERS).length >= 5);
expect('filters combine (Islamic + Visa)', filterCards(cards, '', { ...DEFAULT_FILTERS, kind: 'islamic', network: 'Visa' }).every((c) => c.kind === 'islamic' && c.network === 'Visa'));
expect('no match gives an empty list', filterCards(cards, 'zzzz', DEFAULT_FILTERS).length === 0);
const lowSlider = filterCards(cards, '', { ...DEFAULT_FILTERS, maxMonthlyIncome: 2000 });
expect('income slider keeps only stated incomes at or under the limit', lowSlider.length > 0 && lowSlider.every((c) => c.minAnnualIncome !== null && c.minAnnualIncome / 12 <= 2000));
expect('"not stated" network filter', filterCards(cards, '', { ...DEFAULT_FILTERS, network: 'unknown' }).every((c) => c.network === null) && filterCards(cards, '', { ...DEFAULT_FILTERS, network: 'unknown' }).length > 0);
expect('"not stated" fee filter', filterCards(cards, '', { ...DEFAULT_FILTERS, fee: 'unknown' }).every((c) => c.annualFee === null));
expect('free-fee filter keeps only RM0 cards', filterCards(cards, '', { ...DEFAULT_FILTERS, fee: 'free' }).every((c) => c.annualFee === 0));
expect('deposit-backed filter', filterCards(cards, '', { ...DEFAULT_FILTERS, secured: true }).every((c) => c.secured) && filterCards(cards, '', { ...DEFAULT_FILTERS, secured: true }).length >= 5);
expect('low-income filter includes deposit-backed and RM2,000 cards', filterCards(cards, '', { ...DEFAULT_FILTERS, lowIncome: true }).every((c) => c.secured || (c.minAnnualIncome !== null && c.minAnnualIncome <= 24000)));

// Sorting, with "not stated" always last
const isMonotonic = (list: (number | null)[]) => list.every((v, i) => i === 0 || nullLast(list[i - 1], v) <= 0);
expect('fee sort: RM0 first, "not stated" last', sortCards(cards, 'fee')[0].annualFee === 0 && isMonotonic(sortCards(cards, 'fee').map((c) => c.annualFee)));
expect('rate sort starts with the lowest rate (BSN government cards at 11%)', sortCards(cards, 'rate')[0].interest?.min === Math.min(...cards.map((c) => c.interest?.min ?? 99)) && isMonotonic(sortCards(cards, 'rate').map((c) => c.interest?.min ?? null)));
expect('income sort: lowest first, "not stated" last', isMonotonic(sortCards(cards, 'income').map((c) => c.minAnnualIncome)) && sortCards(cards, 'income').at(-1)!.minAnnualIncome === null);
expect('cashback sort puts the highest rate first', sortCards(cards, 'rewards')[0].rewards.valuePercent === Math.max(...cards.map((c) => c.rewards.valuePercent ?? 0)));
expect('default sort puts the most beginner-friendly first', derive(sortCards(cards, 'best')[0]).friendliness === 5);

// Tiers
const tcounts = tierCounts(cards, '', DEFAULT_FILTERS);
expect('every card falls in exactly one tier', TIER_ORDER.reduce((a, k) => a + tcounts[k], 0) === cards.length, tcounts);
expect('there are classic, gold, platinum and premium cards', tcounts.classic > 0 && tcounts.gold > 0 && tcounts.platinum > 0 && tcounts.premium > 0, tcounts);
expect('tier filter keeps only that tier', filterCards(cards, '', { ...DEFAULT_FILTERS, tier: 'premium' }).every((c) => c.tier === 'premium'));
expect('tier counts ignore the tier filter itself but respect others', tierCounts(cards, '', { ...DEFAULT_FILTERS, tier: 'gold', kind: 'islamic' }).classic === filterCards(cards, '', { ...DEFAULT_FILTERS, tier: 'classic', kind: 'islamic' }).length);

// Best match for me
const hafizMatch = bestMatches(cards, { age: '25', incomeType: 'gig', income: '2800', commitments: '500' });
expect('Hafiz gets 3 matches from 3 different banks', hafizMatch.matches.length === 3 && new Set(hafizMatch.matches.map((m) => m.card.bankId)).size === 3, hafizMatch.matches.map((m) => m.card.id));
expect('Hafiz matches are within his income or deposit-backed, and list bank statements', hafizMatch.matches.every((m) => (m.card.secured || (m.card.minAnnualIncome !== null && m.card.minAnnualIncome <= 33600)) && derive(m.card).gigFriendly));
expect('every match has at least 2 reasons', hafizMatch.matches.every((m) => m.reasons.length >= 2));
const ainaMatch = bestMatches(cards, { age: '23', incomeType: 'salaried', income: '3500', commitments: '300' });
expect('Aina gets 3 matches she can afford', ainaMatch.matches.length === 3 && ainaMatch.matches.every((m) => m.card.secured || (m.card.minAnnualIncome !== null && m.card.minAnnualIncome <= 42000)));
const danielMatch = bestMatches(cards, { age: '24', incomeType: 'student', income: '1200', commitments: '200' });
expect('Daniel (RM1,200 a month) only gets deposit-backed cards, and is told to pledge a deposit', danielMatch.matches.length > 0 && danielMatch.matches.every((m) => m.card.secured) && danielMatch.matches[0].reasons[0].en.includes('pledge a fixed deposit'), danielMatch.matches.map((m) => m.card.id));
const tooYoung = bestMatches(cards, { age: '17', incomeType: 'salaried', income: '9000', commitments: '0' });
expect('under 21 gets no matches and a reason', tooYoung.matches.length === 0 && tooYoung.excluded.tooYoung > 100, tooYoung.excluded);
const noMoney = bestMatches(cards.filter((c) => !c.secured), { age: '30', incomeType: 'salaried', income: '500', commitments: '0' });
expect('very low income and no deposit cards gives no matches', noMoney.matches.length === 0 && noMoney.excluded.lowIncome > 50, noMoney.excluded);

// Compare table
const trio = [byId('maybank-visa-infinite'), byId('public-bank-visa-gold'), byId('hong-leong-i-m-credit-card')];
const rows = compareRows(trio);
const feeRow = rows.find((r) => r.row.id === 'annualFee')!;
expect('best annual fee is the RM0 card', feeRow.best.join() === '2' && feeRow.differs, feeRow.best);
const incomeRow = rows.find((r) => r.row.id === 'minIncome')!;
expect('best income is the lowest stated', incomeRow.best.length >= 1 && incomeRow.best.every((i) => trio[i].minAnnualIncome === Math.min(...trio.map((c) => c.minAnnualIncome ?? Infinity))), incomeRow.best);
const nullRow = compareRows([byId('hong-leong-essential-credit-card'), byId('hong-leong-wise-credit-card')]).find((r) => r.row.id === 'annualFee')!;
expect('a "not stated" value is never marked best', !nullRow.best.includes(0), nullRow.best);
const sameRow = compareRows([byId('maybank-visa-infinite'), byId('maybank-visa-infinite')]).find((r) => r.row.id === 'rate')!;
expect('identical values do not differ and have no best', !sameRow.differs && sameRow.best.length === 0);
expect('compare table has a tier row', rows.some((r) => r.row.id === 'tier'));

// Simulator terms
const t = termsFromCard(byId('affin-world-mastercard'));
const cardSim = simulate({ spend: 500, mode: 'minimum', fixed: 0 }, t);
expect('simulator uses the card’s highest rate (AFFIN 18% costs more than default 15%)', t.aprPercent === 18 && cardSim.interest > min.interest, cardSim);
expect('late fee cap passes through to the simulator', termsFromCard(byId('public-bank-visa-gold')).lateMax === 100);
const miss = missingTerms(byId('hong-leong-wise-credit-card'));
expect('missing terms are reported, and standard figures are used', miss.interest && miss.minPayment && miss.lateFee && termsFromCard(byId('hong-leong-wise-credit-card')).aprPercent === 15);
expect('Islamic Nadi uses 14%', termsFromCard(byId('maybank-islamic-nadi-mastercard-credit-card-i')).aprPercent === 14);

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

// ---- REQ-5: tracking and decision (Track stage) ----
import { addWorkingDays, decisionReached, decisionText, latestDecisionDate, stageStatus } from '../src/lib/track.ts';

expect('working days skip weekends (Thu 19 Nov + 3 = Tue 24 Nov)', addWorkingDays('2026-11-19', 3) === '2026-11-24');
expect('Friday + 1 working day is Monday', addWorkingDays('2026-11-20', 1) === '2026-11-23');
expect('final decision date is 3 working days after submitting', latestDecisionDate('2026-11-19') === '2026-11-24');
expect('timeline: done, current, waiting', stageStatus(0, 1) === 'done' && stageStatus(1, 1) === 'current' && stageStatus(2, 1) === 'waiting');
expect('timeline: at the decision stage every stage is done', [0, 1, 2, 3].every((i) => stageStatus(i, 3) === 'done') && decisionReached(3) && !decisionReached(2));
const goodDraft: Draft = { q: 0, scanned: true, manualIdentity: false, identity: { name: 'A', ic: '', dob: '12 April 2001', address: 'x' }, phone: '', email: '', employment: 'gig', income: '2800', commitments: '500', proofMethod: 'bank', consent: true, proof: { method: 'bank', avgMonthly: 2800, lowest: 2200, highest: 3400, source: 'Bank' }, costRead: true, savedAt: null, started: true };
const poorDraft: Draft = { ...goodDraft, income: '900', commitments: '800', proof: { ...goodDraft.proof!, avgMonthly: 900 } };
expect('approved decision has reasons and next steps', decisionText('approved', goodDraft).reasons.length >= 2 && decisionText('approved', goodDraft).nextSteps.length >= 3);
expect('rejected decision always has at least 2 reasons', decisionText('rejected', goodDraft).reasons.length >= 2 && decisionText('rejected', poorDraft).reasons.length >= 2);
expect('rejected reasons use the user’s own numbers first (income below RM2,000)', decisionText('rejected', poorDraft).reasons[0].en.includes('below'), decisionText('rejected', poorDraft).reasons);
expect('rejected next steps say you can apply again and how to reach a person', decisionText('rejected', poorDraft).nextSteps.some((s) => s.en.includes('apply again')) && decisionText('rejected', poorDraft).nextSteps.some((s) => s.en.includes('Talk to a person')));
expect('reasons and steps are in both languages', [...decisionText('rejected', poorDraft).reasons, ...decisionText('approved', goodDraft).nextSteps].every((b) => b.en.length > 0 && b.ms.length > 0));
// ---- REQ-7: credit education ----
import { LEARN_CARDS, QUIZ, TOPICS, cardText, findLearnCard, readingSeconds, scoreQuiz } from '../src/data/learn.ts';

const times = LEARN_CARDS.map((c) => ({ id: c.id, en: readingSeconds(c, 'en'), ms: readingSeconds(c, 'ms') }));
console.log('   reading times (seconds):', JSON.stringify(times));
expect('every learning card reads in 30 to 60 seconds in both languages', times.every((x) => x.en >= 30 && x.en <= 60 && x.ms >= 30 && x.ms <= 60), times);
expect('the five required topics are covered', ['credit-score', 'min-vs-full', 'utilisation', 'dos-donts', 'myths'].every((id) => !!findLearnCard(id)));
expect('the "applying always hurts my score" myth is explained', cardText(findLearnCard('myths')!, 'en').includes('Applying for a card always hurts my score'));
expect('every card has a topic, English and Malay text, a takeaway', LEARN_CARDS.every((c) => TOPICS.some((t) => t.id === c.topic) && cardText(c, 'en').length > 100 && cardText(c, 'ms').length > 100 && c.takeaway.en && c.takeaway.ms));
expect('minimum-vs-full numbers match the simulator (RM37.52 extra, 11 months on RM500)', cardText(findLearnCard('min-vs-full')!, 'en').includes('RM37.52') && cardText(findLearnCard('min-vs-full')!, 'en').includes('11 months'));
expect('quiz has 5 questions, each with a valid answer and a card to review', QUIZ.length === 5 && QUIZ.every((q) => q.answer >= 0 && q.answer < q.options.length && !!findLearnCard(q.review) && q.explain.en && q.explain.ms && q.options.length >= 3));
expect('quiz scoring: all right is 5/5', scoreQuiz(QUIZ.map((q) => q.answer)).score === 5 && scoreQuiz(QUIZ.map((q) => q.answer)).wrong.length === 0);
const partial = scoreQuiz([QUIZ[0].answer, 99, null, null, null]);
expect('quiz scoring: partial answers, wrong ones are listed for review', partial.answered === 2 && partial.score === 1 && partial.wrong.length === 1 && partial.wrong[0].id === QUIZ[1].id);
// ---- REQ-9, REQ-10, REQ-1: workshop, demo walkthrough, first-3-months guide ----
import { csvCell, entriesToCsv, averageRating, tally, togglePick, CSV_HEADER } from '../src/lib/workshop.ts';
import { WALKTHROUGH, WALK_TOTAL_SECONDS, TARGET_SECONDS, formatClock } from '../src/data/walkthrough.ts';
import { GUIDE } from '../src/data/guide.ts';
import { ROUTES } from '../src/lib/router.ts';
import type { WorkshopEntry } from '../src/state/types.ts';

const entry = (o: Partial<WorkshopEntry>): WorkshopEntry => ({ id: 'w1', at: '2026-11-19T01:00:00.000Z', tester: 'A', seamless: ['prefill'], dealBreakers: ['hiddenFees'], proof: 'bank', time: 'sameDay', trust: ['bnm'], rating: 4, stuck: '', cardFeatures: ['fee'], cardsCompared: ['maybank-visa-infinite'], cardsViewed: [], cardSelected: null, ...o });
const testers = [
  entry({ id: 'a', seamless: ['prefill', 'save'], rating: 5, cardFeatures: ['fee', 'rate'], cardSelected: 'cimb-lite-i' }),
  entry({ id: 'b', seamless: ['prefill'], dealBreakers: ['hiddenFees', 'noReason'], proof: 'upload', rating: 3, stuck: 'The scan was slow' }),
  entry({ id: 'c', seamless: ['help'], dealBreakers: ['hiddenFees'], proof: 'bank', rating: 4, cardFeatures: ['fee'] }),
];
expect('tally counts testers, most picked first', JSON.stringify(tally(testers, (e) => e.seamless)) === JSON.stringify([{ key: 'prefill', count: 2 }, { key: 'help', count: 1 }, { key: 'save', count: 1 }]), tally(testers, (e) => e.seamless));
expect('tally of a single choice (income proof)', tally(testers, (e) => [e.proof])[0].key === 'bank' && tally(testers, (e) => [e.proof])[0].count === 2);
expect('tally counts a tester once per option', tally([entry({ seamless: ['prefill', 'prefill'] })], (e) => e.seamless)[0].count === 1);
expect('average rating (5, 3, 4 = 4)', averageRating(testers) === 4 && averageRating([]) === null);
expect('pick up to 3: the 4th is blocked, unticking works', togglePick(['a', 'b', 'c'], 'd', 3).blocked && !togglePick(['a', 'b'], 'c', 3).blocked && togglePick(['a', 'b', 'c'], 'b', 3).list.join() === 'a,c');
expect('CSV makes spreadsheet formulas harmless', csvCell('=HYPERLINK("x")') === '"\'=HYPERLINK(""x"")"' && csvCell('+1') === '"\'+1"' && csvCell('say "hi"') === '"say ""hi"""');
const csv = entriesToCsv(testers);
expect('CSV has a header and one row per tester, with the card features and chosen card', csv.split('\r\n').length === 5 && csv.startsWith(CSV_HEADER.map((h) => `"${h}"`).join(',')) && csv.includes('Annual fee; Interest rate') && csv.includes('CIMB Lite-i'), csv.slice(0, 200));

expect('walkthrough has at most 8 steps and fits in 5 minutes', WALKTHROUGH.length <= 8 && WALK_TOTAL_SECONDS <= TARGET_SECONDS, { steps: WALKTHROUGH.length, seconds: WALK_TOTAL_SECONDS });
expect('walkthrough covers all five stages in order', ['ready', 'cost', 'apply', 'track', 'use'].every((r, i, arr) => WALKTHROUGH.findIndex((s) => s.route === r) >= 0 && (i === 0 || WALKTHROUGH.findIndex((s) => s.route === r) > WALKTHROUGH.findIndex((s) => s.route === arr[i - 1]))));
expect('walkthrough steps have a real screen, talking points in both languages and a time', WALKTHROUGH.every((s) => (ROUTES as string[]).includes(s.route) && s.points.length >= 1 && s.points.every((p) => p.en && p.ms) && s.title.en && s.title.ms && s.seconds > 0));
expect('walkthrough shows both an approved and a rejected decision', WALKTHROUGH.some((s) => s.patch && s.patch.toString().includes("'approved'")) && WALKTHROUGH.some((s) => s.patch && s.patch.toString().includes("'rejected'")));
expect('clock text', formatClock(0) === '0:00' && formatClock(75) === '1:15' && formatClock(300) === '5:00');

expect('guide has 3 months with at least 3 actions each, in both languages', GUIDE.length === 3 && GUIDE.every((m) => m.actions.length >= 3 && m.actions.every((a) => a.text.en && a.text.ms)));
expect('guide action ids are unique', new Set(GUIDE.flatMap((m) => m.actions.map((a) => a.id))).size === GUIDE.reduce((n, m) => n + m.actions.length, 0));
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
