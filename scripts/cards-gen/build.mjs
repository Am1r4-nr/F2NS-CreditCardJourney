// Temporary generator: builds src/data/cards.json from the per-bank source files.
import { writeFileSync } from 'node:fs';
import * as maybank from './maybank.mjs';
import * as publicbank from './publicbank.mjs';
import * as cimb from './cimb.mjs';
import * as rhb from './rhb.mjs';
import * as hongleong from './hongleong.mjs';
import * as ambank from './ambank.mjs';
import * as uob from './uob.mjs';
import * as sc from './standardchartered.mjs';
import * as hsbc from './hsbc.mjs';
import * as alliance from './alliance.mjs';
import * as affin from './affin.mjs';
import * as ocbc from './ocbc.mjs';
import * as bankislam from './bankislam.mjs';
import * as bsn from './bsn.mjs';
import * as bankrakyat from './bankrakyat.mjs';

const TODAY = '2026-11-19';

const ALL = [maybank, publicbank, cimb, rhb, hongleong, ambank, uob, sc, hsbc, alliance, affin, ocbc, bankislam, bsn, bankrakyat];

// Official bank pages found by search. Only addresses that came back from the bank's own domain are listed.
const OFFICIAL = {
  maybank: { website: 'https://www.maybank2u.com.my', cardsUrl: 'https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/visa_card_scheme_listing.page', feesUrl: 'https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/banking_fees/credit_card.page' },
  'public-bank': { website: 'https://www.pbebank.com', cardsUrl: 'https://pbebank.com/en/cards/', pdsUrl: 'https://pbebank.com/media/rczb0ouh/pds-credit-card-en.pdf' },
  cimb: { website: 'https://www.cimb.com.my', cardsUrl: 'https://www.cimb.com.my/en/personal/day-to-day-banking/cards/credit-card.html' },
  rhb: { website: 'https://www.rhbgroup.com', cardsUrl: 'https://www.rhbgroup.com/personal/cards/credit-cards/overview/index.html' },
  'hong-leong': { website: 'https://www.hlb.com.my', cardsUrl: null, feesUrl: 'https://hlb.com.my/en/personal-banking/help-support/fees-and-charges/credit-cards.html', pdsUrl: 'https://www.hlb.com.my/content/dam/hlb/my/docs/pdf/Personal/CreditCard/pds/hlb-credit-card-pds-en.pdf' },
  ambank: { website: 'https://www.ambank.com.my', cardsUrl: 'https://www.ambank.com.my/cards/credit-cards', feesUrl: 'https://www.ambank.com.my/docs/default-source/default-document-library/rates/feesnchargescreditcard.pdf', pdsUrl: 'https://www.ambank.com.my/docs/ambankretaillibraries/product-disclosure-sheet/ambankandislamicpdscreditcards.pdf?sfvrsn=b8869a26_3' },
  uob: { website: 'https://uob.com.my', cardsUrl: 'https://uob.com.my/personal/cards/all-cards.page' },
  'standard-chartered': { website: 'https://www.sc.com/my', cardsUrl: 'https://www.sc.com/my/credit-cards/' },
  hsbc: { website: 'https://hsbc.com.my', cardsUrl: 'https://hsbc.com.my/credit-cards/' },
  alliance: { website: 'https://www.alliancebank.com.my', cardsUrl: null, pdsUrl: 'https://www.alliancebank.com.my/Alliance/media/Documents/Cards/Personal/Credit-Cards/Credit-Card-Terms-Conditions-TNC-EN.pdf' },
  affin: { website: 'https://www.affinalways.com', cardsUrl: null },
  ocbc: { website: 'https://www.ocbc.com.my', cardsUrl: 'https://www.ocbc.com.my/personal-banking/cards/credit-cards' },
  'bank-islam': { website: 'https://www.bankislam.com', cardsUrl: 'https://www.bankislam.com/personal-banking/bank-islam-cards/bank-islam-credit-card-i/', feesUrl: 'https://www.bankislam.com/wp-content/uploads/Credit-Card-i-Fee-Charges-August-2026.pdf', pdsUrl: 'https://www.bankislam.com/wp-content/uploads/BICC-PDS-Eng-Aug2026.pdf' },
  bsn: { website: 'https://www.bsn.com.my', cardsUrl: null, pdsUrl: 'https://www.bsn.com.my/cms/upload/pdf/personal/cards/product-disclosure-sheet-pds-conventional-pds-eng_1.pdf' },
  'bank-rakyat': { website: 'https://www.bankrakyat.com.my', cardsUrl: null },
};

const CIMB = 'https://www.cimb.com.my/en/personal/day-to-day-banking/cards/credit-card/';
const RHB = 'https://www.rhbgroup.com/personal/cards/credit-cards/';
const ALB = 'https://www.alliancebank.com.my/Alliance/media/Documents/Cards/Personal/Credit-Cards/';
const CARD_URL = {
  'cimb-lite-i': `${CIMB}cimb-lite-i-credit-card.html`,
  'cimb-e-credit-card': `${CIMB}cimb-e-credit-card.html`,
  'cimb-visa-signature': `${CIMB}cimb-visa-signature-credit-card.html`,
  'cimb-visa-infinite': `${CIMB}cimb-visa-infinite-credit-card.html`,
  'cimb-preferred-visa-infinite': `${CIMB}cimb-preferred-visa-infinite-credit-card.html`,
  'cimb-world-mastercard': `${CIMB}cimb-world-mastercard-credit-card.html`,
  'cimb-travel-platinum': `${CIMB}cimb-travel-platinum-credit-card.html`,
  'public-bank-visa-signature': 'https://pbebank.com/en/cards/our-cards/pb-visa-signature-credit-card/',
  'rhb-visa-myeg-credit-card': `${RHB}rhb-visa-myeg-credit-card/index.html`,
  'rhb-visa-infinite-credit-card': `${RHB}rhb-visa-infinite-credit-card/index.html`,
  'rhb-rewards-credit-card': `${RHB}rhb-rewards-credit-card/index.html`,
  'rhb-rewards-credit-card-i': `${RHB}rhb-rewards-credit-card/index.html`,
  'rhb-world-mastercard-credit-card': `${RHB}rhb-world-mastercard-credit-card/index.html`,
  'rhb-world-mastercard-credit-card-i': `${RHB}rhb-world-mastercard-credit-card/index.html`,
  'rhb-premier-visa-infinite-credit-card': `${RHB}rhb-premier-visa-infinite-credit-card/index.html`,
  'rhb-premier-visa-infinite-credit-card-i': `${RHB}rhb-premier-visa-infinite-credit-card/index.html`,
  'uob-world-card': 'https://uob.com.my/personal/cards/credit-cards/uob-world-mastercard.page',
  'uob-simple-card': 'https://uob.com.my/personal/cards/credit-cards/uob-simple.page',
  'hsbc-visa-signature-credit-card': 'https://sp.hsbc.com.my/vs',
  'hsbc-live-credit-card': 'http://www.hsbc.com.my/LivePlus',
  'hsbc-travelone-credit-card': 'http://www.hsbc.com.my/TravelOne',
  'standard-chartered-journey-credit-card': 'https://www.sc.com/my/credit-cards/journey',
  'standard-chartered-beyond-credit-card': 'https://www.sc.com/my/credit-cards/beyond',
  'standard-chartered-platinum-mastercard-basic': 'https://www.sc.com/my/credit-cards/gold-mastercard/',
  'alliance-visa-basic': `${ALB}CC-PDS-Sep2026.pdf`,
  'alliance-visa-virtual': `${ALB}CC-PDS_Visa_VCC-Sep2026.pdf`,
  'alliance-visa-signature': `${ALB}CC-PDS_Visa_Signature-Sep2026.pdf`,
  'alliance-visa-signature-for-alliance-privilege': `${ALB}CC-PDS_Visa_AP_Signature-Sep2026.pdf`,
  'alliance-visa-infinite': `${ALB}CC-PDS_Visa_Infinite-Sep2026.pdf`,
  'affin-duo-visa-cash-back': 'https://www.affinalways.com/en/affin-duo',
  'affin-duo-mastercard-rewards': 'https://www.affinalways.com/en/affin-duo',
  'affin-duo-visa': 'https://www.affinalways.com/affin-duo-plus',
  'affin-duo-mastercard': 'https://www.affinalways.com/affin-duo-plus',
  'affin-visa-gold': 'https://www.affinalways.com/en/affin-visa-mastercard-gold',
  'affin-mastercard-gold': 'https://www.affinalways.com/en/affin-visa-mastercard-gold',
  'affin-world-mastercard': 'https://www.affinalways.com/affin-world-mastercard',
  'affin-invikta-visa-infinite': 'https://www.affinalways.com/en/invikta-visa',
  'affin-avance-visa': 'https://www.affinalways.com/en/affin-avance-visa',
};

const banks = ALL.map((m) => {
  const o = OFFICIAL[m.bank.id];
  const b = { ...m.bank, ...o };
  if (b.interest) b.interest = { min: b.interest.min, max: b.interest.max ?? null, note: b.interest.note };
  return {
    id: b.id,
    name: b.name,
    short: b.short,
    website: b.website,
    cardsUrl: b.cardsUrl ?? null,
    feesUrl: b.feesUrl ?? null,
    pdsUrl: b.pdsUrl ?? null,
    sources: b.sources,
    interest: b.interest ?? null,
    minPayment: b.minPayment ?? null,
    lateFee: b.lateFee ?? null,
    cashAdvance: b.cashAdvance ?? null,
    fxPercent: b.fxPercent ?? null,
    fxNote: b.fxNote ?? null,
    serviceTax: b.serviceTax ?? null,
    minAge: b.minAge ?? null,
    maxAge: b.maxAge ?? null,
    incomeProof: b.incomeProof,
    supplementary: b.supplementary ?? null,
    approvalTime: b.approvalTime ?? null,
    instalment0: b.instalment0 ?? null,
  };
});

const cards = ALL.flatMap((m) => m.cards).map((c) => {
  const url = CARD_URL[c.id] ?? c.sourceUrl ?? null;
  const { sourceUrl, ...rest } = c;
  return { ...rest, sourceUrl: url, lastChecked: TODAY };
});

const ids = new Set();
for (const c of cards) {
  if (ids.has(c.id)) throw new Error(`duplicate id ${c.id}`);
  ids.add(c.id);
}
for (const k of Object.keys(CARD_URL)) if (!ids.has(k)) console.warn('URL mapped to an unknown card id:', k);

const file = {
  meta: {
    lastUpdated: TODAY,
    note: {
      en: 'Card details were collected from bank websites and from RinggitPlus, which checks them against bank pages, on 19 November 2026. They change often. Banks decide every application. Always confirm the terms with the bank.',
      ms: 'Butiran kad dikumpul daripada laman web bank dan daripada RinggitPlus, yang menyemaknya dengan laman bank, pada 19 November 2026. Ia kerap berubah. Bank memutuskan setiap permohonan. Sentiasa sahkan terma dengan bank.',
    },
  },
  banks,
  cards,
};

writeFileSync('src/data/cards.json', JSON.stringify(file, null, 1) + '\n', 'utf8');
console.log(`banks: ${banks.length}, cards: ${cards.length}`);
