import { KINDS, NETWORKS, PROOFS, REWARD_TYPES, TIERS } from './cardTypes.ts';

const isBi = (v: unknown): boolean =>
  typeof v === 'object' && v !== null && typeof (v as { en?: unknown }).en === 'string' && typeof (v as { ms?: unknown }).ms === 'string' &&
  (v as { en: string }).en.length > 0 && (v as { ms: string }).ms.length > 0;
const isNum = (v: unknown): boolean => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const isStr = (v: unknown): boolean => typeof v === 'string' && v.length > 0;

/** Returns a list of problems. An empty list means the data is valid. Each message names the card and the field. */
export function validateCards(input: unknown): string[] {
  const problems: string[] = [];
  const file = input as { cards?: unknown[]; meta?: unknown };
  if (!file || !Array.isArray(file.cards)) return ['cards.json: "cards" must be a list'];
  if (!isBi((file.meta as { note?: unknown } | undefined)?.note)) problems.push('meta.note: needs en and ms text');
  if (file.cards.length < 10 || file.cards.length > 12) problems.push(`cards: expected 10 to 12 cards, found ${file.cards.length}`);

  const ids = new Set<string>();
  file.cards.forEach((raw, i) => {
    const c = raw as Record<string, unknown>;
    const name = `${String(c.bank ?? '?')} ${String(c.name ?? '?')} (#${i + 1})`;
    const bad = (field: string, why = 'missing or wrong type') => problems.push(`${name}: ${field} ${why}`);

    for (const f of ['id', 'bank', 'bankShort', 'name', 'lastUpdated', 'sourceUrl']) if (!isStr(c[f])) bad(f);
    if (isStr(c.id)) { if (ids.has(c.id as string)) bad('id', 'is duplicated'); ids.add(c.id as string); }
    if (isStr(c.lastUpdated) && !/^\d{4}-\d{2}-\d{2}$/.test(c.lastUpdated as string)) bad('lastUpdated', 'must look like 2026-11-19');
    if (!NETWORKS.includes(c.network as never)) bad('network', 'must be Visa, Mastercard or Amex');
    if (!KINDS.includes(c.kind as never)) bad('kind', 'must be conventional or islamic');
    if (!TIERS.includes(c.tier as never)) bad('tier', 'must be classic, gold, platinum, secured or student');
    for (const f of ['annualFee', 'interestPa', 'fxFeePercent', 'minAge', 'minAnnualIncome']) if (!isNum(c[f])) bad(f);
    if (c.annualFeeWaiver !== null && !isBi(c.annualFeeWaiver)) bad('annualFeeWaiver', 'must be null or { en, ms }');

    const mp = c.minPayment as Record<string, unknown> | undefined;
    if (!mp || !isNum(mp.percent) || !isNum(mp.floor)) bad('minPayment', 'needs percent and floor');
    const lf = c.lateFee as Record<string, unknown> | undefined;
    if (!lf || !isNum(lf.flat) || !isNum(lf.percent)) bad('lateFee', 'needs flat and percent');
    const ca = c.cashAdvance as Record<string, unknown> | undefined;
    if (!ca || !isNum(ca.percent) || !isNum(ca.min)) bad('cashAdvance', 'needs percent and min');
    const sp = c.supplementary as Record<string, unknown> | undefined;
    if (!sp || !isNum(sp.max) || !isNum(sp.annualFee)) bad('supplementary', 'needs max and annualFee');

    const proofs = c.incomeProof;
    if (!Array.isArray(proofs) || proofs.length === 0 || proofs.some((p) => !PROOFS.includes(p as never))) bad('incomeProof', 'must list payslip, bank_statement, lhdn or gig_statement');

    const rw = c.rewards as Record<string, unknown> | undefined;
    if (!rw || !REWARD_TYPES.includes(rw.type as never) || !isBi(rw.summary) || !isNum(rw.valuePercent)) bad('rewards', 'needs type, summary and valuePercent');

    if (c.welcomeOffer !== null && !isBi(c.welcomeOffer)) bad('welcomeOffer', 'must be null or { en, ms }');
    if (c.instalment0 !== null && !isBi(c.instalment0)) bad('instalment0', 'must be null or { en, ms }');
    if (typeof c.digitalApplication !== 'boolean') bad('digitalApplication', 'must be true or false');
    if (typeof c.secured !== 'boolean') bad('secured', 'must be true or false');
    if (!isBi(c.approvalTime)) bad('approvalTime', 'needs en and ms');
    if (!isBi(c.bestFor)) bad('bestFor', 'needs en and ms');
    if (!isBi(c.notFor)) bad('notFor', 'needs en and ms');
    for (const f of ['pros', 'cons']) {
      const list = c[f];
      if (!Array.isArray(list) || list.length === 0 || list.some((x) => !isBi(x))) bad(f, 'needs at least one { en, ms }');
    }
  });

  const kinds = new Set((file.cards as { kind?: string }[]).map((c) => c.kind));
  if (!kinds.has('conventional') || !kinds.has('islamic')) problems.push('cards: need both conventional and Islamic cards');
  const banks = new Set((file.cards as { bank?: string }[]).map((c) => c.bank));
  if (banks.size < 10) problems.push(`cards: expected cards from at least 10 different banks, found ${banks.size}`);
  return problems;
}
