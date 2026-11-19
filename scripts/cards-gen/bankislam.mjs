import { bi, card, perk, rw } from './lib.mjs';

// Fees and profit rate checked against Bank Islam's fee sheet (Aug 2026). Other details come from an undated RinggitPlus page.
export const bank = {
  id: 'bank-islam',
  name: 'Bank Islam',
  short: 'BI',
  cardsUrl: 'https://www.bankislam.com/personal-banking/bank-islam-cards/bank-islam-credit-card-i/',
  feesUrl: null,
  sources: [{ name: 'Bank Islam: Credit Card-i fees and charges (Aug 2026)', url: 'https://www.bankislam.com/wp-content/uploads/Credit-Card-i-Fee-Charges-August-2026.pdf' }, { name: 'Bank Islam: product disclosure sheet (Aug 2026)', url: 'https://www.bankislam.com/wp-content/uploads/BICC-PDS-Eng-Aug2026.pdf' }, { name: 'RinggitPlus: Bank Islam credit cards (page is not dated)', url: 'https://ringgitplus.com/en/credit-card/bank-islam/' }],
  interest: { min: 15, max: null, note: bi('A tiered profit rate. Tier 1 is 15% a year with prompt minimum payments for 12 months in a row, and 17% is the next tier. See the fee sheet for the other tiers.', 'Kadar keuntungan berperingkat. Peringkat 1 ialah 15% setahun dengan bayaran minimum segera selama 12 bulan berturut-turut, dan 17% ialah peringkat seterusnya. Lihat helaian yuran untuk peringkat lain.') },
  minPayment: { percent: 5, floor: 50 },
  lateFee: { flat: 5, percent: 1, max: 50 },
  cashAdvance: null,
  fxPercent: null,
  serviceTax: null,
  minAge: 21,
  maxAge: null,
  incomeProof: ['payslip', 'lhdn', 'bank_statement'],
  approvalTime: null,
  instalment0: null,
};

const fw12 = { text: ['Waived with 12 transactions a year, or RM120 of retail spending a year', 'Dikecualikan dengan 12 transaksi setahun, atau perbelanjaan runcit RM120 setahun'] };
const tru = rw('points', null, '1 TruPoint for every RM1 on local and overseas retail spending. Only accepts halal merchants.', '1 TruMata untuk setiap RM1 perbelanjaan runcit tempatan dan luar negara. Hanya menerima peniaga halal.');

export const cards = [
  card('bank-islam', { n: 'Visa Gold Card-i', net: 'Visa', tier: 'gold', islamic: true, inc: 2000, fee: null, fw: fw12, rw: tru }),
  card('bank-islam', { n: 'Mastercard Gold Card-i', net: 'Mastercard', tier: 'gold', islamic: true, inc: 2000, fee: null, fw: fw12, rw: tru }),
  card('bank-islam', { n: 'Visa Platinum Credit Card-i', net: 'Visa', tier: 'platinum', islamic: true, inc: 3000, fee: 388, fw: fw12, url: 'https://www.bankislam.com/bank-islam-visa-platinum-mastercard-platinum-credit-card-i/',
    rw: rw('cashback', 5, '3% cashback on online, auto-billing, grocery and dining spend if you spend RM500 to RM1,499.99 a month, and 5% from RM1,500. Also earns TruPoints.', 'Tunai balik 3% untuk perbelanjaan dalam talian, pengebilan automatik, barangan runcit dan makan jika anda berbelanja RM500 hingga RM1,499.99 sebulan, dan 5% dari RM1,500. Juga memperoleh TruMata.') }),
  card('bank-islam', { n: 'Mastercard Platinum Card-i', net: 'Mastercard', tier: 'platinum', islamic: true, inc: 3000, fee: null, fw: fw12, url: 'https://www.bankislam.com/bank-islam-visa-platinum-mastercard-platinum-credit-card-i/',
    rw: rw('points', null, 'Up to 2X TruPoints on contactless and petrol spending, and 2X on overseas spending. 1 TruPoint for every RM1 otherwise.', 'Sehingga 2X TruMata untuk perbelanjaan tanpa sentuh dan minyak, dan 2X untuk perbelanjaan luar negara. Jika tidak, 1 TruMata untuk setiap RM1.') }),
  card('bank-islam', { n: 'Visa Infinite Credit Card-i', net: 'Visa', tier: 'premium', islamic: true, inc: 8333, fee: null, fw: fw12, perks: [perk('travelIns', 2000000)], rw: tru }),
  card('bank-islam', { n: 'Mastercard World Card-i', net: 'Mastercard', tier: 'premium', islamic: true, inc: 8333, fee: null, fw: fw12, perks: [perk('travelIns', 2000000)], rw: tru }),
];
