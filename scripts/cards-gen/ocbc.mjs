import { bi, card, perk, rw } from './lib.mjs';

export const bank = {
  id: 'ocbc',
  name: 'OCBC',
  short: 'OC',
  cardsUrl: null,
  feesUrl: null,
  sources: [{ name: 'RinggitPlus: OCBC credit cards (Nov 2026)', url: 'https://ringgitplus.com/en/credit-card/ocbc/' }],
  interest: { min: 15, max: 18, note: bi('15% after 12 on-time months, 17% after 10 or 11, otherwise 18%. Cash advances are 18%.', '15% selepas 12 bulan tepat masa, 17% selepas 10 atau 11, jika tidak 18%. Pendahuluan tunai 18%.') },
  minPayment: { percent: 5, floor: 50 },
  lateFee: { flat: 10, percent: 1, max: 100 },
  cashAdvance: { percent: 5, min: 20 },
  fxPercent: 1.25,
  fxNote: bi('A 1.25% OCBC administration fee (1.00% on the 365), plus the Mastercard or Visa network fee', 'Yuran pentadbiran OCBC 1.25% (1.00% untuk 365), serta yuran rangkaian Mastercard atau Visa'),
  serviceTax: 25,
  minAge: 21,
  maxAge: null,
  incomeProof: ['payslip', 'lhdn', 'bank_statement'],
  approvalTime: null,
  instalment0: bi('Easy Payment Plan: 0% for 5, 10 or 20 months, with a one-time handling fee of 2% to 5%', 'Pelan Bayaran Mudah: 0% selama 5, 10 atau 20 bulan, dengan yuran pengendalian sekali bayar 2% hingga 5%'),
};

export const cards = [
  card('ocbc', { n: '365 Mastercard', net: 'Mastercard', tier: 'classic', inc: 4000, fee: 100, url: 'https://www.ocbc.com.my/personal-banking/cards/365-mastercard',
    rw: rw('points', null, '10x OCBC$ on weekend dining, groceries and shopping and 5x on weekdays. 1x on utilities, petrol and insurance.', '10x OCBC$ untuk makan, barangan runcit dan beli-belah hujung minggu dan 5x pada hari bekerja. 1x untuk utiliti, minyak dan insurans.') }),
  card('ocbc', { n: 'Titanium Mastercard', net: 'Mastercard', tier: 'classic', inc: 4000, fee: 75, fw: { first: true, spend: 20000 }, url: 'https://www.ocbc.com.my/personal-banking/cards/titanium-mastercard',
    rw: rw('points', null, '6x OCBC$ on online and e-wallet spending, and 12x on Double Date and Pay Day sales. 1x on other spending. Free supplementary card.', '6x OCBC$ untuk perbelanjaan dalam talian dan e-dompet, dan 12x pada jualan Double Date dan Pay Day. 1x untuk perbelanjaan lain. Kad tambahan percuma.') }),
  card('ocbc', { n: 'Cashflo Mastercard', net: 'Mastercard', tier: 'classic', inc: 4000, fee: 188,
    rw: rw('none', null, 'Large purchases turn into 0% instalments automatically: 3 months for RM500 to RM1,000 and 6 months above RM1,000.', 'Pembelian besar ditukar kepada ansuran 0% secara automatik: 3 bulan untuk RM500 hingga RM1,000 dan 6 bulan melebihi RM1,000.') }),
  card('ocbc', { n: '90°N Visa Card', net: 'Visa', tier: 'platinum', inc: 5000, fee: 288, fw: { first: true }, url: 'https://www.ocbc.com.my/personal-banking/cards/ocbc-90-degrees-north-travel-card', perks: [perk('lounge', 2), perk('travelIns', 1000000)],
    rw: rw('points', null, '5 Travel$ per RM1 on overseas retail and foreign currency online spending, and 1 Travel$ per RM1 locally. 2 lounge visits in the first year.', '5 Travel$ setiap RM1 untuk runcit luar negara dan perbelanjaan dalam talian mata wang asing, dan 1 Travel$ setiap RM1 di dalam negara. 2 lawatan lounge pada tahun pertama.') }),
  card('ocbc', { url: 'https://www.ocbc.com.my/personal-banking/cards/world-mastercard', n: 'World Mastercard', net: 'Mastercard', tier: 'premium', inc: null, incNote: ['OCBC does not publish a minimum income', 'OCBC tidak menerbitkan pendapatan minimum'], fee: 388, perks: [perk('lounge', 2), perk('travelIns', 2000000)],
    rw: rw('cashback', 1, '1% cashback on overseas spending in foreign currency and 0.5% on local spending, with no cap. Not paid in the UK and EU.', 'Tunai balik 1% untuk perbelanjaan luar negara dalam mata wang asing dan 0.5% untuk perbelanjaan tempatan, tanpa had. Tidak dibayar di UK dan EU.') }),
  card('ocbc', { n: 'Great Eastern Platinum Mastercard', net: 'Mastercard', tier: 'platinum', inc: 4000, incNote: ['For Great Eastern Life policyholders', 'Untuk pemegang polisi Great Eastern Life'], fee: 0, fw: { life: true },
    rw: rw('cashback', 2.5, '2.5% cashback on Great Eastern insurance premiums (RM100 cap a year) and 0.1% on other retail spending.', 'Tunai balik 2.5% untuk premium insurans Great Eastern (had RM100 setahun) dan 0.1% untuk perbelanjaan runcit lain.') }),
  card('ocbc', { n: 'Premier Voyage Mastercard', net: 'Mastercard', tier: 'premium', inc: null, incNote: ['For OCBC Premier Banking customers only', 'Untuk pelanggan OCBC Premier Banking sahaja'], fee: 750, perks: [perk('lounge', 4)],
    rw: rw('miles', null, 'Earns Voyage Miles that do not expire. 3,000 Voyage Miles convert to 1,000 KrisFlyer miles.', 'Memperoleh Batu Voyage yang tidak luput. 3,000 Batu Voyage ditukar kepada 1,000 batu KrisFlyer.') }),
];
