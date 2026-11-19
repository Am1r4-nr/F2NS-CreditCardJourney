import { bi, card, perk, rw } from './lib.mjs';

// Lower-confidence bank: the RinggitPlus page for Hong Leong is not dated and lists no interest or fee schedule.
// Anything not stated there is left as null so the app says "check with the bank".
export const bank = {
  id: 'hong-leong',
  name: 'Hong Leong',
  short: 'HL',
  cardsUrl: null,
  feesUrl: null,
  sources: [{ name: 'RinggitPlus: Hong Leong Bank credit cards (page is not dated)', url: 'https://ringgitplus.com/en/credit-card/Hong-Leong-Bank/' }],
  interest: null,
  minPayment: null,
  lateFee: null,
  cashAdvance: null,
  fxPercent: null,
  serviceTax: null,
  minAge: 21,
  maxAge: 65,
  incomeProof: ['payslip', 'lhdn', 'bank_statement'],
  approvalTime: bi('About 7 working days after Hong Leong receives your documents', 'Kira-kira 7 hari bekerja selepas Hong Leong menerima dokumen anda'),
  instalment0: null,
};

const travel = [perk('travelIns', 500000)];

export const cards = [
  card('hong-leong', { secured: true, dep: 2000, url: 'https://hlb.com.my/en/personal-banking/credit-cards/cash-back/wise-card.html', n: 'Wise Credit Card', net: 'Visa', tier: 'classic', inc: 2000, fee: 98,
    rw: rw('cashback', 15, 'Up to 15% cashback on weekend dining and 10% on weekend petrol, groceries and online, if you spend RM1,000 a month. 0.5% on those on weekdays, 0.2% on everything else.', 'Tunai balik sehingga 15% untuk makan hujung minggu dan 10% untuk minyak, barangan runcit dan dalam talian hujung minggu, jika anda berbelanja RM1,000 sebulan. 0.5% pada hari bekerja, 0.2% untuk yang lain.') }),
  card('hong-leong', { secured: true, dep: 2000, url: 'https://hlb.com.my/en/personal-banking/credit-cards/no-frills/im-card.html', n: 'I’m Credit Card', net: null, tier: 'classic', inc: 2000, fee: 0, fw: { life: true },
    rw: rw('none', null, 'No rewards. Free for life and no markup on foreign currency conversion.', 'Tiada ganjaran. Percuma sepanjang hayat dan tiada tambahan pada penukaran mata wang asing.') }),
  card('hong-leong', { secured: true, dep: 2000, url: 'https://hlb.com.my/en/personal-banking/credit-cards/cash-back/essential-card.html', n: 'Essential Credit Card', net: null, tier: 'classic', inc: 2000, fee: null,
    rw: rw('cashback', 1, 'Up to 1% cashback all the time.', 'Tunai balik sehingga 1% sepanjang masa.') }),
  card('hong-leong', { secured: true, dep: 2000, n: 'GSC - Hong Leong Gold Visa Credit Card', net: 'Visa', tier: 'gold', inc: 2000, fee: 150, perks: [perk('cinema')],
    rw: rw('points', null, '5 free movie tickets on approval, 10% off Golden Screen Cinemas tickets and 30% off snacks. 3x points on other spending and 5x overseas.', '5 tiket wayang percuma apabila diluluskan, diskaun 10% tiket Golden Screen Cinemas dan 30% snek. 3x mata untuk perbelanjaan lain dan 5x di luar negara.') }),
  card('hong-leong', { secured: true, dep: 12000, n: 'GSC - Hong Leong Platinum Visa Credit Card', net: 'Visa', tier: 'platinum', inc: 5000, fee: null, perks: [perk('cinema')],
    rw: rw('points', null, 'Golden Screen Cinemas benefits and GSC reward points.', 'Faedah Golden Screen Cinemas dan mata ganjaran GSC.') }),
  card('hong-leong', { secured: true, dep: 3000, n: 'Sutera Platinum Credit Card', net: null, tier: 'platinum', inc: 3000, fee: 120,
    rw: rw('points', null, 'Up to 8x reward points on online spending, groceries, essentials, dining and travel. 1 point per RM1 on other spending. Points do not expire while the card is active.', 'Sehingga 8x mata ganjaran untuk perbelanjaan dalam talian, barangan runcit, keperluan, makan dan perjalanan. 1 mata setiap RM1 untuk perbelanjaan lain. Mata tidak luput selagi kad aktif.') }),
  card('hong-leong', { secured: true, dep: 30000, url: 'https://hlb.com.my/en/personal-banking/credit-cards/travel/infinite.html', n: 'Visa Infinite Credit Card', net: 'Visa', tier: 'premium', inc: 8333, fee: 0, fw: { life: true }, perks: [perk('lounge', 4), perk('concierge'), ...travel],
    rw: rw('miles', null, 'Converts to Enrich miles automatically: RM3.50 spent locally or RM2.20 overseas gives 1 mile.', 'Ditukar kepada batu Enrich secara automatik: RM3.50 dibelanjakan di dalam negara atau RM2.20 di luar negara memberi 1 batu.') }),
  card('hong-leong', { n: 'Visa Infinite P Credit Card', net: 'Visa', tier: 'premium', inc: null, incNote: ['By invitation only', 'Dengan jemputan sahaja'], fee: null, perks: [perk('loungeUnlimited'), ...travel],
    rw: rw('miles', null, 'Earns Enrich miles with no monthly cap.', 'Memperoleh batu Enrich tanpa had bulanan.') }),
  card('hong-leong', { n: 'Visa Infinite Doctor’s Edition', net: 'Visa', tier: 'premium', inc: 8333, incNote: ['For registered medical doctors and dentists only', 'Untuk doktor perubatan dan doktor gigi berdaftar sahaja'], fee: null, perks: [perk('lounge', 4), ...travel],
    rw: rw('miles', null, 'Earns Enrich miles: 1 per RM1 on dining, 1 per RM4 on travel and retail, 1 per RM6 on other spending.', 'Memperoleh batu Enrich: 1 setiap RM1 untuk makan, 1 setiap RM4 untuk perjalanan dan runcit, 1 setiap RM6 untuk perbelanjaan lain.') }),
];
