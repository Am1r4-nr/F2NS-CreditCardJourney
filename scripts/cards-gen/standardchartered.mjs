import { bi, card, perk, rw } from './lib.mjs';

// Lower-confidence bank: the RinggitPlus page is short and not dated. Unstated values are left null.
export const bank = {
  id: 'standard-chartered',
  name: 'Standard Chartered',
  short: 'SC',
  cardsUrl: null,
  feesUrl: null,
  sources: [{ name: 'RinggitPlus: Standard Chartered credit cards (page is not dated)', url: 'https://ringgitplus.com/en/credit-card/standard-chartered/' }],
  interest: null,
  minPayment: null,
  lateFee: null,
  cashAdvance: null,
  fxPercent: null,
  serviceTax: null,
  minAge: 21,
  maxAge: null,
  incomeProof: ['payslip', 'lhdn', 'bank_statement'],
  approvalTime: null,
  instalment0: bi('0% Easy Payment Scheme for purchases of RM1,000 or more, applied for within 30 days', 'Skim Bayaran Mudah 0% untuk pembelian RM1,000 atau lebih, dipohon dalam 30 hari'),
};

export const cards = [
  card('standard-chartered', { n: 'Journey Credit Card', net: null, tier: 'premium', inc: 8000, fee: null, perks: [perk('loungeUnlimited'), perk('airportTransfer'), perk('travelIns')],
    rw: rw('miles', null, 'Earns air miles faster, with unlimited Plaza Premium lounge access, a free airport ride transfer and travel medical cover.', 'Memperoleh batu udara lebih cepat, dengan akses lounge Plaza Premium tanpa had, pengangkutan lapangan terbang percuma dan perlindungan perubatan perjalanan.') }),
  card('standard-chartered', { n: 'Platinum Mastercard Basic', net: 'Mastercard', tier: 'platinum', inc: null, incNote: ['Not stated. Ask the bank', 'Tidak dinyatakan. Tanya bank'], fee: 0, fw: { life: true },
    rw: rw('points', null, 'Earns 360° Rewards Points on every ringgit spent. Annual fee waived for life.', 'Memperoleh Mata Ganjaran 360° untuk setiap ringgit dibelanjakan. Yuran tahunan dikecualikan sepanjang hayat.') }),
  card('standard-chartered', { n: 'Beyond Credit Card', net: null, tier: 'premium', inc: null, incNote: ['For Priority Banking customers', 'Untuk pelanggan Priority Banking'], fee: null, perks: [perk('loungeUnlimited'), perk('concierge'), perk('dining')],
    rw: rw('points', null, 'Earns 360° Rewards Points, with worldwide airport lounge access, Michelin dining cashback and a 24/7 concierge.', 'Memperoleh Mata Ganjaran 360°, dengan akses lounge lapangan terbang seluruh dunia, tunai balik makan Michelin dan concierge 24/7.') }),
];
