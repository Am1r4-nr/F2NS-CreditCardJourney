import { KINDS, NETWORKS, PERK_KEYS, PROOFS, REWARD_TYPES, TIERS } from './cardTypes.ts';

const isBi = (v: unknown): boolean =>
  typeof v === 'object' && v !== null && typeof (v as { en?: unknown }).en === 'string' && typeof (v as { ms?: unknown }).ms === 'string' &&
  (v as { en: string }).en.length > 0 && (v as { ms: string }).ms.length > 0;
const isNum = (v: unknown): boolean => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const isNumOrNull = (v: unknown): boolean => v === null || isNum(v);
const isStr = (v: unknown): boolean => typeof v === 'string' && v.length > 0;
const isUrl = (v: unknown): boolean => typeof v === 'string' && /^https?:\/\/[^\s]+$/.test(v);
const isUrlOrNull = (v: unknown): boolean => v === null || isUrl(v);
const isDate = (v: unknown): boolean => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/** Returns a list of problems. An empty list means the data is valid. Each message names the bank or card and the field. */
export function validateCards(input: unknown): string[] {
  const problems: string[] = [];
  const file = input as { meta?: unknown; banks?: unknown[]; cards?: unknown[] };
  if (!file || !Array.isArray(file.cards) || !Array.isArray(file.banks)) return ['cards.json: "banks" and "cards" must both be lists'];
  const meta = file.meta as { note?: unknown; lastUpdated?: unknown } | undefined;
  if (!isBi(meta?.note)) problems.push('meta.note: needs en and ms text');
  if (!isDate(meta?.lastUpdated)) problems.push('meta.lastUpdated: must look like 2026-11-19');

  // Banks
  const bankIds = new Set<string>();
  file.banks.forEach((raw, i) => {
    const b = raw as Record<string, unknown>;
    const name = `bank ${String(b.name ?? '?')} (#${i + 1})`;
    const bad = (field: string, why = 'missing or wrong type') => problems.push(`${name}: ${field} ${why}`);
    for (const f of ['id', 'name', 'short']) if (!isStr(b[f])) bad(f);
    if (isStr(b.id)) { if (bankIds.has(b.id as string)) bad('id', 'is duplicated'); bankIds.add(b.id as string); }
    if (!isUrl(b.website)) bad('website', 'must be a web address starting with http');
    for (const f of ['cardsUrl', 'feesUrl', 'pdsUrl']) if (!isUrlOrNull(b[f])) bad(f, 'must be null or a web address');
    const src = b.sources;
    if (!Array.isArray(src) || src.length === 0 || src.some((s) => !isStr((s as { name?: unknown }).name) || !isUrl((s as { url?: unknown }).url))) bad('sources', 'needs at least one { name, url }');
    const it = b.interest as Record<string, unknown> | null;
    if (it !== null && (!it || !isNum(it.min) || !isNumOrNull(it.max) || !isBi(it.note))) bad('interest', 'must be null or { min, max, note }');
    const mp = b.minPayment as Record<string, unknown> | null;
    if (mp !== null && (!mp || !isNum(mp.percent) || !isNum(mp.floor))) bad('minPayment', 'must be null or { percent, floor }');
    const lf = b.lateFee as Record<string, unknown> | null;
    if (lf !== null && (!lf || !isNum(lf.flat) || !isNum(lf.percent) || !isNumOrNull(lf.max))) bad('lateFee', 'must be null or { flat, percent, max }');
    const ca = b.cashAdvance as Record<string, unknown> | null;
    if (ca !== null && (!ca || ['percent', 'flat', 'min'].some((k) => ca[k] !== undefined && !isNum(ca[k])))) bad('cashAdvance', 'must be null or numbers only');
    if (!isNumOrNull(b.fxPercent)) bad('fxPercent');
    if (b.fxNote !== null && !isBi(b.fxNote)) bad('fxNote', 'must be null or { en, ms }');
    if (!isNumOrNull(b.serviceTax) || !isNumOrNull(b.minAge) || !isNumOrNull(b.maxAge)) bad('serviceTax, minAge or maxAge');
    if (!Array.isArray(b.incomeProof) || b.incomeProof.some((p) => !PROOFS.includes(p as never))) bad('incomeProof', 'must list payslip, bank_statement, lhdn or gig_statement');
    if (b.approvalTime !== null && !isBi(b.approvalTime)) bad('approvalTime', 'must be null or { en, ms }');
    if (b.instalment0 !== null && !isBi(b.instalment0)) bad('instalment0', 'must be null or { en, ms }');
  });

  // Cards
  const ids = new Set<string>();
  file.cards.forEach((raw, i) => {
    const c = raw as Record<string, unknown>;
    const name = `${String(c.bank ?? '?')} ${String(c.name ?? '?')} (#${i + 1})`;
    const bad = (field: string, why = 'missing or wrong type') => problems.push(`${name}: ${field} ${why}`);

    for (const f of ['id', 'bank', 'name']) if (!isStr(c[f])) bad(f);
    if (isStr(c.id)) { if (ids.has(c.id as string)) bad('id', 'is duplicated'); ids.add(c.id as string); }
    if (isStr(c.bank) && !bankIds.has(c.bank as string)) bad('bank', 'does not match any bank id in "banks"');
    if (!isDate(c.lastChecked)) bad('lastChecked', 'must look like 2026-11-19');
    if (!isUrlOrNull(c.sourceUrl)) bad('sourceUrl', 'must be null or a web address');
    if (c.network !== null && !NETWORKS.includes(c.network as never)) bad('network', 'must be Visa, Mastercard, Amex, UnionPay or null');
    if (!KINDS.includes(c.kind as never)) bad('kind', 'must be conventional or islamic');
    if (!TIERS.includes(c.tier as never)) bad('tier', 'must be classic, gold, platinum, premium, secured or student');
    if (!isNumOrNull(c.annualFee)) bad('annualFee', 'must be a number or null');
    if (c.annualFeeWaiver !== null && !isBi(c.annualFeeWaiver)) bad('annualFeeWaiver', 'must be null or { en, ms }');
    if (!isNumOrNull(c.minAnnualIncome)) bad('minAnnualIncome', 'must be a number or null');
    if (c.minAnnualIncome === null && !isBi(c.incomeNote)) bad('incomeNote', 'is needed when minAnnualIncome is null');
    if (c.incomeNote !== undefined && !isBi(c.incomeNote)) bad('incomeNote', 'must be { en, ms }');
    if (typeof c.secured !== 'boolean') bad('secured', 'must be true or false');
    if (c.securedDeposit !== undefined && !isNum(c.securedDeposit)) bad('securedDeposit', 'must be a number');
    const rw = c.rewards as Record<string, unknown> | undefined;
    if (!rw || !REWARD_TYPES.includes(rw.type as never) || !isBi(rw.summary) || !isNumOrNull(rw.valuePercent)) bad('rewards', 'needs type, summary and valuePercent (a number or null)');
    const perks = c.perks;
    if (!Array.isArray(perks) || perks.some((p) => !PERK_KEYS.includes((p as { k?: never }).k) || ((p as { n?: unknown }).n !== undefined && !isNum((p as { n?: unknown }).n)))) bad('perks', 'must be a list of { k, n? } with a known k');
    const io = c.interestOverride as Record<string, unknown> | undefined;
    if (io !== undefined && (!isNum(io.min) || !isNumOrNull(io.max))) bad('interestOverride', 'needs min and max');
    if (c.incomeProof !== undefined && (!Array.isArray(c.incomeProof) || c.incomeProof.some((p) => !PROOFS.includes(p as never)))) bad('incomeProof', 'must list known proof types');
  });

  const kinds = new Set((file.cards as { kind?: string }[]).map((c) => c.kind));
  if (!kinds.has('conventional') || !kinds.has('islamic')) problems.push('cards: need both conventional and Islamic cards');
  if (bankIds.size < 10) problems.push(`banks: expected at least 10 banks, found ${bankIds.size}`);
  if (file.cards.length < 100) problems.push(`cards: expected at least 100 cards, found ${file.cards.length}`);
  return problems;
}
