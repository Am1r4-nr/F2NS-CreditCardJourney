// Temporary generator helpers. Builds src/data/cards.json from per-bank source files.
const RM = (n) => `RM${Number(n).toLocaleString('en-MY')}`;

/** Annual fee waiver text in English and Malay. Returns null when there is nothing to say. */
export function waiver(spec) {
  if (!spec) return null;
  if (spec.text) return { en: spec.text[0], ms: spec.text[1] };
  const en = [];
  const ms = [];
  if (spec.first) { en.push('Free in the first year'); ms.push('Percuma pada tahun pertama'); }
  if (spec.spend) { en.push(`${spec.first ? 'After that, free' : 'Free'} if you spend ${RM(spec.spend)} a year`); ms.push(`${spec.first ? 'Selepas itu, percuma' : 'Percuma'} jika anda berbelanja ${RM(spec.spend)} setahun`); }
  if (spec.txn) { en.push(`${spec.first ? 'After that, free' : 'Free'} with ${spec.txn} transactions a year`); ms.push(`${spec.first ? 'Selepas itu, percuma' : 'Percuma'} dengan ${spec.txn} transaksi setahun`); }
  if (spec.life) { en.push('Free for life'); ms.push('Percuma sepanjang hayat'); }
  return { en: en.join('. '), ms: ms.join('. ') };
}

export const bi = (en, ms) => ({ en, ms });

/** Rewards. type is cashback, points, miles or none. top is the highest advertised cashback rate in percent, or null. */
export const rw = (type, top, en, ms) => ({ type, valuePercent: top ?? null, summary: { en, ms } });

export const perk = (k, n) => (n === undefined ? { k } : { k, n });

const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * One card. Fields not published are left out and become null in the file.
 * inc is monthly income in RM. The file stores annual income.
 */
export function card(bankId, c) {
  const annualIncome = c.inc == null ? null : Math.round(c.inc * 12);
  return {
    id: `${bankId}-${slug(c.n)}`,
    bank: bankId,
    name: c.n,
    network: c.net ?? null,
    kind: c.islamic ? 'islamic' : 'conventional',
    tier: c.tier,
    annualFee: c.fee ?? null,
    annualFeeWaiver: waiver(c.fw),
    minAnnualIncome: annualIncome,
    ...(c.incNote ? { incomeNote: { en: c.incNote[0], ms: c.incNote[1] } } : {}),
    ...(c.rate ? { interestOverride: c.rate } : {}),
    ...(c.age ? { minAge: c.age } : {}),
    ...(c.proof ? { incomeProof: c.proof } : {}),
    ...(c.supp ? { supplementary: c.supp } : {}),
    rewards: c.rw,
    perks: c.perks ?? [],
    welcomeOffer: c.welcome ?? null,
    secured: !!c.secured,
    ...(c.dep ? { securedDeposit: c.dep } : {}),
    ...(c.late !== undefined ? { lateFeeOverride: c.late } : {}),
    ...(c.ca ? { cashAdvanceOverride: c.ca } : {}),
    sourceUrl: c.url ?? null,
  };
}
