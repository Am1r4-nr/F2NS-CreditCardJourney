import { bi, card, perk, rw } from './lib.mjs';

export const bank = {
  id: 'public-bank',
  name: 'Public Bank',
  short: 'PB',
  cardsUrl: 'https://www.publicbank.com.my/Personal-Banking/Credit-Cards',
  feesUrl: null,
  sources: [{ name: 'RinggitPlus: Public Bank credit cards (checked against Public Bank terms, Nov 2026)', url: 'https://ringgitplus.com/en/credit-card/public-bank/' }],
  interest: { min: 15, max: 18, note: bi('15% if you paid at least the minimum on time for 12 months in a row, 17% if on time in 10 or more of 12 months, otherwise 18%. Cash advances are 18%.', '15% jika anda membayar sekurang-kurangnya minimum tepat masa selama 12 bulan berturut-turut, 17% jika tepat masa dalam 10 atau lebih daripada 12 bulan, jika tidak 18%. Pendahuluan tunai 18%.') },
  minPayment: { percent: 5, floor: 50 },
  lateFee: { flat: 10, percent: 1, max: 100 },
  cashAdvance: { percent: 0.39, flat: 4.9 },
  fxPercent: 1.25,
  serviceTax: 25,
  minAge: 21,
  maxAge: null,
  incomeProof: ['payslip', 'lhdn'],
  approvalTime: null,
  instalment0: bi('FlexiPay: 0% promotions from time to time. Otherwise a one-time fee of 2% to 8% by tenure', 'FlexiPay: promosi 0% dari semasa ke semasa. Jika tidak, yuran sekali bayar 2% hingga 8% mengikut tempoh'),
};

const CM = (en, ms) => rw('cashback', null, en, ms);

export const cards = [
  card('public-bank', { n: 'Visa Gold', net: 'Visa', tier: 'gold', inc: 2000, fee: 150, rw: rw('cashback', 0.1, '0.1% Cash MegaBonus cashback on retail spending.', 'Tunai balik Cash MegaBonus 0.1% untuk perbelanjaan runcit.') }),
  card('public-bank', { n: 'Gold Mastercard', ca: { percent: 0.01, flat: 1.2 }, net: 'Mastercard', tier: 'gold', inc: 2000, fee: 150, rw: rw('cashback', 0.1, '0.1% Cash MegaBonus cashback on retail spending.', 'Tunai balik Cash MegaBonus 0.1% untuk perbelanjaan runcit.') }),
  card('public-bank', { n: 'Petron Visa Gold', net: 'Visa', tier: 'gold', inc: 2000, fee: 0, fw: { life: true },
    rw: rw('cashback', 5, 'Up to 5% cashback at Petron stations, by monthly Petron spend (RM50 cap a statement cycle). 0.1% on other retail.', 'Tunai balik sehingga 5% di stesen Petron, mengikut perbelanjaan Petron bulanan (had RM50 setiap kitaran penyata). 0.1% untuk runcit lain.') }),
  card('public-bank', { n: 'AIA Visa Gold', net: 'Visa', tier: 'gold', inc: 2000, fee: 0, fw: { life: true },
    rw: rw('cashback', 0.2, '0.2% cash rebate on AIA insurance premiums. Not supported on Apple Pay.', 'Rebat tunai 0.2% untuk premium insurans AIA. Tidak disokong pada Apple Pay.') }),
  card('public-bank', { n: 'Quantum Visa', net: 'Visa', tier: 'classic', inc: 3000, fee: 0, fw: { life: true },
    rw: rw('cashback', 1, '1% cashback on contactless payments of RM100 or more (RM20 cap a statement cycle). 1 VIP Point per RM1 locally and 2 overseas.', 'Tunai balik 1% untuk bayaran tanpa sentuh RM100 atau lebih (had RM20 setiap kitaran penyata). 1 Mata VIP setiap RM1 di dalam negara dan 2 di luar negara.') }),
  card('public-bank', { n: 'Quantum Mastercard', ca: { percent: 0.01, flat: 1.2 }, net: 'Mastercard', tier: 'classic', inc: 3000, fee: 0, fw: { life: true }, perks: [],
    rw: rw('cashback', 2, '2% cashback on overseas retail of RM100 or more (RM20 cap a statement cycle). 1 VIP Point per RM1 on local spending.', 'Tunai balik 2% untuk runcit luar negara RM100 atau lebih (had RM20 setiap kitaran penyata). 1 Mata VIP setiap RM1 untuk perbelanjaan tempatan.') }),
  card('public-bank', { n: 'Visa Platinum', net: 'Visa', tier: 'platinum', inc: 4166.67, fee: 333, fw: { first: true, txn: 12 }, perks: [perk('travelIns')],
    rw: rw('cashback', 0.2, '0.2% unlimited Cash MegaBonus cashback on retail spending.', 'Tunai balik Cash MegaBonus 0.2% tanpa had untuk perbelanjaan runcit.') }),
  card('public-bank', { n: 'Platinum Mastercard', ca: { percent: 0.01, flat: 1.2 }, net: 'Mastercard', tier: 'platinum', inc: 4166.67, fee: 333, fw: { first: true, txn: 12 }, perks: [perk('travelIns')],
    rw: rw('points', null, '1 VIP Point per RM1 on retail purchases.', '1 Mata VIP setiap RM1 untuk pembelian runcit.') }),
  card('public-bank', { n: 'Visa Signature', net: 'Visa', tier: 'premium', inc: 6666.67, fee: 388, fw: { first: true, txn: 12 }, perks: [perk('lounge', 2), perk('concierge'), perk('travelIns')],
    rw: rw('cashback', 2, '2% cashback on dining and online spending of RM100 or more (RM30 cap a statement cycle). 1 VIP Point per RM1 and 3 overseas.', 'Tunai balik 2% untuk makan dan perbelanjaan dalam talian RM100 atau lebih (had RM30 setiap kitaran penyata). 1 Mata VIP setiap RM1 dan 3 di luar negara.') }),
  card('public-bank', { n: 'World Mastercard', ca: { percent: 0.01, flat: 1.2 }, net: 'Mastercard', tier: 'premium', inc: 8333.33, fee: 0, fw: { life: true }, perks: [perk('lounge', 5), perk('travelIns')],
    rw: rw('miles', null, '5 Air Miles per RM1 overseas and 1 per RM1 locally. Converts to Enrich or AirAsia points.', '5 Air Miles setiap RM1 di luar negara dan 1 setiap RM1 di dalam negara. Boleh ditukar kepada mata Enrich atau AirAsia.') }),
  card('public-bank', { n: 'Visa Infinite', net: 'Visa', tier: 'premium', inc: 8333.33, fee: 0, fw: { life: true }, perks: [perk('lounge', 5), perk('concierge'), perk('travelIns')],
    rw: rw('cashback', 1, '1% cashback overseas and 0.3% on local retail, with no cap.', 'Tunai balik 1% di luar negara dan 0.3% untuk runcit tempatan, tanpa had.') }),
];
