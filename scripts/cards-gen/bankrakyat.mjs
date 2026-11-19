import { bi, card, perk, rw } from './lib.mjs';

// Lower-confidence bank: the RinggitPlus page is not dated.
export const bank = {
  id: 'bank-rakyat',
  name: 'Bank Rakyat',
  short: 'BR',
  cardsUrl: null,
  feesUrl: null,
  sources: [{ name: 'RinggitPlus: Bank Rakyat credit cards (page is not dated)', url: 'https://ringgitplus.com/en/credit-card/bank-rakyat/' }],
  interest: { min: 13.5, max: 17, note: bi('A profit rate of 13.5% to 17% a year. All Bank Rakyat cards are Islamic.', 'Kadar keuntungan 13.5% hingga 17% setahun. Semua kad Bank Rakyat ialah kad Islamik.') },
  minPayment: null,
  lateFee: null,
  cashAdvance: null,
  fxPercent: 0,
  fxNote: bi('No markup on overseas currency conversion', 'Tiada tambahan pada penukaran mata wang luar negara'),
  serviceTax: null,
  minAge: 21,
  maxAge: 65,
  incomeProof: ['payslip', 'lhdn', 'bank_statement'],
  approvalTime: null,
  instalment0: bi('0% Easy Payment Plan on the Gold card', 'Pelan Bayaran Mudah 0% pada kad Gold'),
};

const rewards = rw('points', null, '1 Rakyat Reward for every RM10 spent, convertible to cash, plus a profit rebate of up to 3%.', '1 Ganjaran Rakyat untuk setiap RM10 dibelanjakan, boleh ditukar kepada tunai, serta rebat keuntungan sehingga 3%.');
const takaful = [perk('familyTakaful', 200000)];

export const cards = [
  card('bank-rakyat', { n: 'Perodua Credit Card-i', net: null, tier: 'classic', islamic: true, inc: 2000, fee: 0, fw: { life: true }, perks: takaful, rate: { min: 13.5, max: 13.5 }, url: 'https://ringgitplus.com/en/credit-card/Bank-Rakyat-Perodua-Credit-Card-i.html',
    rw: rw('points', null, '5X Rakyat Rewards on fuel, car servicing, Takaful and EV charging, and 1 point per RM10 on other spending. Redeemed on the Perodua loyalty platform.', '5X Ganjaran Rakyat untuk minyak, servis kereta, Takaful dan pengecasan EV, dan 1 mata setiap RM10 untuk perbelanjaan lain. Ditebus di platform kesetiaan Perodua.') }),
  card('bank-rakyat', { n: 'World Mastercard Credit Card-i', net: 'Mastercard', tier: 'premium', islamic: true, inc: null, incNote: ['Not stated. Ask the bank. Launched June 2026', 'Tidak dinyatakan. Tanya bank. Dilancarkan Jun 2026'], fee: null, url: 'https://www.sinardaily.my/article/736071/focus/money/bank-rakyat-launches-world-mastercard-credit-card-i-with-travel-perks-and-shariah-compliant-benefits',
    rw: rw('cashback', 5, 'A premium card for travel and retail spending, with 5% travel cashback and no foreign exchange fees.', 'Kad premium untuk perbelanjaan perjalanan dan runcit, dengan tunai balik perjalanan 5% dan tiada yuran pertukaran asing.') }),
  card('bank-rakyat', { n: 'Muslimah Credit Card-i', net: 'Mastercard', tier: 'classic', islamic: true, inc: 2000, fee: 0, fw: { life: true }, perks: takaful,
    rw: rw('points', null, 'Up to 10% discount at selected merchants, with Mastercard privileges. Designed for women.', 'Diskaun sehingga 10% di peniaga terpilih, dengan keistimewaan Mastercard. Direka untuk wanita.') }),
  card('bank-rakyat', { n: 'Gold Credit Card-i', net: null, tier: 'gold', islamic: true, inc: 3000, fee: 0, fw: { life: true }, perks: takaful, rw: rewards }),
  card('bank-rakyat', { n: 'Platinum Credit Card-i', net: null, tier: 'platinum', islamic: true, inc: 5000, fee: 0, fw: { text: ['Free in the first year. After that, free with at least one transaction a year', 'Percuma pada tahun pertama. Selepas itu, percuma dengan sekurang-kurangnya satu transaksi setahun'] }, perks: takaful, rw: rewards }),
  card('bank-rakyat', { n: 'Platinum Explorer Credit Card-i', net: null, tier: 'platinum', islamic: true, inc: 5000, fee: 0, fw: { life: true }, perks: [perk('lounge', 3), ...takaful],
    rw: rw('cashback', 5, '5% cashback on airline and hotel bookings with no minimum spend. 1 Rakyat Reward for every RM10 spent.', 'Tunai balik 5% untuk tempahan penerbangan dan hotel tanpa perbelanjaan minimum. 1 Ganjaran Rakyat untuk setiap RM10 dibelanjakan.') }),
];
