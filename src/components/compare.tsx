import { useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { money, parseAmount } from '../lib/format.ts';
import { NOT_STATED, annualFeeText, cashAdvanceText, depositText, fxText, interestText, lateFeeText, minPaymentText, networkText, perksList } from '../lib/cardText.ts';
import type { CardRecord } from '../data/cardTypes.ts';
import { findCard, CARDS_META } from '../data/cards.ts';
import { COMPARE_ROWS, GROUP_LABEL, compareRows, derive, proofLabel, type RowGroup } from '../lib/cards.ts';
import type { CardRecord as Card } from '../data/cardTypes.ts';
import { useDialog } from '../lib/useDialog.ts';
import { Button, Callout } from './ui.tsx';
import { BankLogo, CardBadges, TierTag, Disclaimer, FeeText, FriendlinessBreakdown, useCardActions } from './cards.tsx';

// ---------- Compare bar ----------

export function CompareBar({ onOpen, onRemove, onClear }: { onOpen: () => void; onRemove: (id: string) => void; onClear: () => void }) {
  const { t } = useLang();
  const { state } = useApp();
  const cards = state.compare.selected.map((id) => findCard(id)).filter((c): c is CardRecord => !!c);
  if (cards.length === 0) return null;
  return (
    <section aria-label={t(bi('Cards to compare', 'Kad untuk dibanding'))} className={`fixed inset-x-0 ${state.demo ? 'bottom-60' : 'bottom-0'} z-30 border-t-2 border-cyan-700 bg-white p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.12)]`}>
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-3">
        <p className="font-bold">{t(bi('Compare', 'Banding'))} ({cards.length}/3)</p>
        <ul className="flex flex-1 flex-wrap gap-2">
          {cards.map((c) => (
            <li key={c.id} className="flex items-center gap-1 rounded-full border border-cyan-300 bg-cyan-50 py-1 pl-3 pr-1 text-sm font-semibold">
              {c.bank} {c.name}
              <button type="button" onClick={() => onRemove(c.id)} className="grid min-h-11 min-w-11 place-items-center rounded-full text-lg hover:bg-cyan-100" aria-label={`${t(bi('Remove', 'Buang'))} ${c.bank} ${c.name}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
        <Button variant="ghost" onClick={onClear}>{t(bi('Clear', 'Kosongkan'))}</Button>
        <Button onClick={onOpen} disabled={cards.length < 2}>
          {cards.length < 2 ? t(bi('Pick 1 more to compare', 'Pilih 1 lagi untuk banding')) : t(bi('Compare now', 'Banding sekarang'))}
        </Button>
      </div>
    </section>
  );
}

// ---------- Compare table ----------

export function CompareTable({ ids, onClose, onRemove, onDetails }: { ids: string[]; onClose: () => void; onRemove: (id: string) => void; onDetails: (id: string, opener: HTMLElement) => void }) {
  const { t } = useLang();
  const actions = useCardActions();
  const [onlyDiff, setOnlyDiff] = useState(false);
  const ref = useDialog<HTMLDivElement>(true, onClose);
  const cards = ids.map((id) => findCard(id)).filter((c): c is CardRecord => !!c);
  const rows = compareRows(cards);
  const shown = onlyDiff ? rows.filter((r) => r.differs) : rows;
  const groups = (Object.keys(GROUP_LABEL) as RowGroup[]).filter((g) => shown.some((r) => r.row.group === g));
  const cols = cards.length;

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="cmp-title" tabIndex={-1} className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2">
        <h2 id="cmp-title" className="text-xl font-extrabold">{t(bi('Side-by-side comparison', 'Perbandingan bersebelahan'))}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold">
            <input type="checkbox" className="h-5 w-5" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} />
            {t(bi('Show only differences', 'Tunjuk perbezaan sahaja'))}
          </label>
          <Button data-autofocus onClick={onClose}>{t(bi('Close', 'Tutup'))}</Button>
        </div>
      </div>
      <div className="space-y-2 px-4 py-2">
        <Disclaimer compact />
        <p className="text-sm text-slate-700">
          {t(bi('“Best” means the lowest cost or easiest rules in that row. It is not an overall recommendation. Cards are not ranked by sponsorship.', '“Terbaik” bermaksud kos paling rendah atau syarat paling mudah dalam baris itu. Ia bukan cadangan keseluruhan. Kad tidak disusun mengikut penajaan.'))}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-2 pb-6" tabIndex={0} role="region" aria-label={t(bi('Comparison table, scrolls sideways on small screens', 'Jadual perbandingan, boleh digulung ke tepi pada skrin kecil'))}>
        {shown.length === 0 ? (
          <p className="p-6 text-lg">{t(bi('These cards have no differences in the rows we compare.', 'Kad-kad ini tiada perbezaan dalam baris yang kami banding.'))}</p>
        ) : (
          <table className="w-full min-w-[34rem] border-separate border-spacing-0 text-left text-base">
            <caption className="sr-only">{t(bi('Credit card comparison', 'Perbandingan kad kredit'))}</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 top-0 z-30 w-32 min-w-32 border-b-2 border-slate-300 bg-slate-100 p-2 sm:w-52 sm:min-w-52">
                  <span className="sr-only">{t(bi('Feature', 'Ciri'))}</span>
                </th>
                {cards.map((c) => (
                  <th key={c.id} scope="col" className="sticky top-0 z-20 min-w-44 border-b-2 border-slate-300 bg-slate-100 p-2 align-top">
                    <div className="flex items-start gap-2">
                      <BankLogo card={c} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700">{c.bank}</p>
                        <p className="font-bold leading-snug">{c.name}</p>
                        <TierTag tier={c.tier} />
                        <button type="button" onClick={() => onRemove(c.id)} className="min-h-11 text-sm font-semibold text-cyan-800 underline" aria-label={`${t(bi('Remove', 'Buang'))} ${c.bank} ${c.name}`}>
                          {t(bi('Remove', 'Buang'))}
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <GroupRows key={g} group={g} rows={shown.filter((r) => r.row.group === g)} cols={cols} />
              ))}
              <tr>
                <th scope="row" className="sticky left-0 z-10 border-t-2 border-slate-300 bg-white p-2 align-top font-bold">{t(bi('Next step', 'Langkah seterusnya'))}</th>
                {cards.map((c) => (
                  <td key={c.id} className="border-t-2 border-slate-300 p-2 align-top">
                    <div className="flex flex-col gap-2">
                      <Button variant="secondary" onClick={(e) => onDetails(c.id, e.currentTarget)} aria-label={`${t(bi('Details', 'Butiran'))}: ${c.bank} ${c.name}`}>{t(bi('Details', 'Butiran'))}</Button>
                      <Button variant="secondary" onClick={() => actions.simulate(c.id)} aria-label={`${t(bi('Simulate cost', 'Simulasi kos'))}: ${c.bank} ${c.name}`}>{t(bi('Simulate cost', 'Simulasi kos'))}</Button>
                      <Button onClick={() => actions.apply(c.id)} aria-label={`${t(bi('Apply with this card', 'Mohon dengan kad ini'))}: ${c.bank} ${c.name}`}>{t(bi('Apply with this card', 'Mohon dengan kad ini'))}</Button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
        <p className="mt-3 px-2 text-sm text-slate-600">{t(CARDS_META.note)}</p>
      </div>
    </div>
  );
}

function GroupRows({ group, rows, cols }: { group: RowGroup; rows: ReturnType<typeof compareRows>; cols: number }) {
  const { t } = useLang();
  return (
    <>
      <tr>
        <th scope="colgroup" colSpan={cols + 1} className="sticky left-0 bg-cyan-700 px-2 py-2 text-left text-sm font-bold uppercase tracking-wide text-white">
          {t(GROUP_LABEL[group])}
        </th>
      </tr>
      {rows.map((r) => (
        <tr key={r.row.id}>
          <th scope="row" className="sticky left-0 z-10 border-b border-slate-200 bg-white p-2 align-top font-semibold">
            {t(r.row.label)}
            <span className={`mt-1 block text-xs font-bold ${r.differs ? 'text-amber-800' : 'text-slate-500'}`}>
              {r.differs ? `≠ ${t(bi('Differs', 'Berbeza'))}` : `= ${t(bi('Same', 'Sama'))}`}
            </span>
          </th>
          {r.cells.map((cell, i) => {
            const best = r.best.includes(i);
            return (
              <td key={i} className={`border-b border-slate-200 p-2 align-top ${best ? 'border-l-4 border-l-emerald-600 bg-emerald-50 font-bold' : ''}`}>
                {best && <span className="mb-1 block text-xs font-bold text-emerald-800">★ {t(bi('Best', 'Terbaik'))}</span>}
                <span>{t(cell.main)}</span>
                {cell.note && <span className="block text-sm font-normal text-slate-700">{t(cell.note)}</span>}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

// ---------- Detail drawer ----------

type Text = ReturnType<typeof bi>;

/** What the card is good for, worked out from its facts (not from marketing copy). */
function goodFor(card: Card): Text[] {
  const out: Text[] = [];
  const d = derive(card);
  if (card.annualFee === 0) out.push(bi('People who want no annual fee.', 'Mereka yang mahu tanpa yuran tahunan.'));
  if (card.minAnnualIncome !== null && card.minAnnualIncome <= 24000) out.push(bi('People starting out, as it asks for the lowest income banks allow (RM2,000 a month).', 'Mereka yang baru bermula, kerana ia meminta pendapatan paling rendah yang dibenarkan bank (RM2,000 sebulan).'));
  if (card.secured) out.push(bi('People with little credit history who can set aside a fixed deposit.', 'Mereka yang sejarah kreditnya sedikit dan boleh mengetepikan simpanan tetap.'));
  if (card.rewards.type !== 'none') out.push({ en: `People who spend where it rewards and pay in full: ${card.rewards.summary.en}`, ms: `Mereka yang berbelanja di tempat ia memberi ganjaran dan membayar penuh: ${card.rewards.summary.ms}` });
  if (card.perks.some((p) => p.k === 'lounge' || p.k === 'loungeUnlimited')) out.push(bi('Frequent travellers who can meet the income and spending it needs.', 'Pengembara kerap yang boleh memenuhi pendapatan dan perbelanjaan yang diperlukan.'));
  if (card.kind === 'islamic') out.push(bi('People who want a Shariah-compliant card.', 'Mereka yang mahukan kad patuh Syariah.'));
  if (d.gigFriendly && card.minAnnualIncome !== null && card.minAnnualIncome <= 36000) out.push(bi('Gig and self-employed workers, as the bank lists bank statements as proof.', 'Pekerja gig dan bekerja sendiri, kerana bank menyenaraikan penyata bank sebagai bukti.'));
  if (out.length === 0) out.push(bi('People who meet the income and age rules below.', 'Mereka yang memenuhi peraturan pendapatan dan umur di bawah.'));
  return out.slice(0, 4);
}

function cautionsFor(card: Card, myMonthly: number, checked: boolean): Text[] {
  const out: Text[] = [];
  const d = derive(card);
  if (!d.gigFriendly) out.push(bi('The bank does not list bank statements as income proof. Without a payslip or LHDN record, applying may be hard.', 'Bank tidak menyenaraikan penyata bank sebagai bukti pendapatan. Tanpa slip gaji atau rekod LHDN, memohon mungkin sukar.'));
  else out.push(bi('The bank lists bank statements for self-employed or commission earners. It may also ask for business registration or tax forms, so a gig worker should check first.', 'Bank menyenaraikan penyata bank untuk pekerja bekerja sendiri atau pendapatan komisen. Ia juga mungkin meminta pendaftaran perniagaan atau borang cukai, jadi pekerja gig perlu menyemak dahulu.'));
  if (card.annualFee !== null && card.annualFee > 0) {
    out.push(bi(`The annual fee is ${money(card.annualFee)}${card.annualFeeWaiver ? `. ${card.annualFeeWaiver.en}` : ''}.`, `Yuran tahunan ialah ${money(card.annualFee)}${card.annualFeeWaiver ? `. ${card.annualFeeWaiver.ms}` : ''}.`));
  }
  if (card.annualFee === null) out.push(bi('The annual fee is not stated here. Ask the bank.', 'Yuran tahunan tidak dinyatakan di sini. Tanya bank.'));
  const top = card.interest ? (card.interest.max ?? card.interest.min) : null;
  if (top !== null && top >= 17) out.push(bi(`New cardholders can pay up to ${top}% a year on a balance. That is costly if you do not pay in full.`, `Pemegang kad baharu boleh membayar sehingga ${top}% setahun atas baki. Ini mahal jika anda tidak bayar penuh.`));
  if (card.minAnnualIncome !== null && card.minAnnualIncome / 12 >= 3000) out.push(bi(`It asks for ${money(Math.round(card.minAnnualIncome / 12))} a month in income, which is high for a first card.`, `Ia meminta pendapatan ${money(Math.round(card.minAnnualIncome / 12))} sebulan, yang tinggi untuk kad pertama.`));
  if (card.minAnnualIncome === null) out.push(bi('The minimum income is not stated, or the card is by invitation. Ask the bank.', 'Pendapatan minimum tidak dinyatakan, atau kad ini dengan jemputan. Tanya bank.'));
  if (checked && card.minAnnualIncome !== null && !Number.isNaN(myMonthly) && myMonthly * 12 < card.minAnnualIncome) {
    out.push(bi(`Based on your check, your income (${money(myMonthly)} a month) is below what this card asks for.`, `Berdasarkan semakan anda, pendapatan anda (${money(myMonthly)} sebulan) di bawah yang diminta kad ini.`));
  }
  out.push(bi('Meeting the minimum income does not guarantee approval. The bank also checks your credit record and what you already owe.', 'Memenuhi pendapatan minimum tidak menjamin kelulusan. Bank juga menyemak rekod kredit dan hutang sedia ada anda.'));
  return out;
}

export function CardDetail({ cardId, onClose, onToggleCompare }: { cardId: string; onClose: () => void; onToggleCompare: (id: string) => void }) {
  const { t, lang } = useLang();
  const { state } = useApp();
  const actions = useCardActions();
  const ref = useDialog<HTMLDivElement>(true, onClose);
  const card = findCard(cardId);
  if (!card) return null;
  const inCompare = state.compare.selected.includes(card.id);
  const rows = compareRows([card]);
  const cautions = cautionsFor(card, parseAmount(state.ready.income), state.readyDone);
  const rate = interestText(card);

  const explain: { title: Text; text: Text }[] = [
    {
      title: bi('Annual fee', 'Yuran tahunan'),
      text: card.annualFee === null
        ? NOT_STATED
        : card.annualFee === 0
          ? bi('You pay nothing each year to keep this card. The RM25 service tax may still apply.', 'Anda tidak membayar apa-apa setiap tahun untuk memegang kad ini. Cukai perkhidmatan RM25 mungkin masih dikenakan.')
          : { en: `You are charged ${money(card.annualFee)} each year, even if you do not use the card.${card.annualFeeWaiver ? ` ${card.annualFeeWaiver.en}.` : ''}`, ms: `Anda dicaj ${money(card.annualFee)} setiap tahun, walaupun anda tidak guna kad.${card.annualFeeWaiver ? ` ${card.annualFeeWaiver.ms}.` : ''}` },
    },
    {
      title: bi('Interest or profit rate', 'Kadar faedah atau keuntungan'),
      text: card.interest
        ? { en: `Pay the full bill on time and you pay none. If you leave a balance, the rate is ${rate.en} a year. ${card.interestNote?.en ?? ''}`.trim(), ms: `Bayar bil penuh tepat pada masanya dan anda tidak bayar. Jika anda tinggalkan baki, kadarnya ${rate.ms} setahun. ${card.interestNote?.ms ?? ''}`.trim() }
        : NOT_STATED,
    },
    {
      title: bi('Minimum payment', 'Bayaran minimum'),
      text: card.minPayment
        ? { en: `${minPaymentText(card).en}. Paying only this keeps you in debt for a long time.`, ms: `${minPaymentText(card).ms}. Membayar jumlah ini sahaja menyebabkan anda berhutang lama.` }
        : NOT_STATED,
    },
    {
      title: bi('Late payment charge', 'Caj bayaran lewat'),
      text: card.lateFee ? { en: `${lateFeeText(card).en}. Late payments can also hurt your credit record.`, ms: `${lateFeeText(card).ms}. Bayaran lewat juga boleh menjejaskan rekod kredit anda.` } : NOT_STATED,
    },
    { title: bi('Cash advance', 'Pendahuluan tunai'), text: card.cashAdvance ? { en: `${cashAdvanceText(card).en}. Best to avoid it.`, ms: `${cashAdvanceText(card).ms}. Elakkan.` } : NOT_STATED },
    { title: bi('Spending abroad', 'Berbelanja di luar negara'), text: fxText(card) },
  ];

  const groups = (Object.keys(GROUP_LABEL) as RowGroup[]).filter((g) => COMPARE_ROWS.some((r) => r.group === g));
  const perks = perksList(card);
  const pageLabel = card.hasOwnPage ? bi('Official card page', 'Laman kad rasmi') : card.sourceUrl === card.bankWebsite ? bi('Bank website', 'Laman web bank') : bi('Bank’s credit cards page', 'Laman kad kredit bank');
  const links: { label: Text; url: string }[] = [{ label: pageLabel, url: card.sourceUrl }];
  if (card.feesUrl) links.push({ label: bi('Fees and charges (bank)', 'Yuran dan caj (bank)'), url: card.feesUrl });
  if (card.pdsUrl) links.push({ label: bi('Product disclosure sheet (bank)', 'Helaian pendedahan produk (bank)'), url: card.pdsUrl });
  if (!links.some((l) => l.url === card.bankWebsite)) links.push({ label: bi('Bank website', 'Laman web bank'), url: card.bankWebsite });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="detail-title" tabIndex={-1} className="flex h-full w-full flex-col bg-white shadow-2xl md:max-w-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <BankLogo card={card} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700">{card.bank} · {t(networkText(card))} · {card.kind === 'islamic' ? t(bi('Islamic', 'Islamik')) : t(bi('Conventional', 'Konvensional'))}</p>
              <h2 id="detail-title" className="text-2xl font-extrabold leading-tight">{card.name}</h2>
              <TierTag tier={card.tier} />
            </div>
          </div>
          <Button data-autofocus variant="secondary" onClick={onClose} aria-label={t(bi('Close details', 'Tutup butiran'))}>{t(bi('Close', 'Tutup'))}</Button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <CardBadges card={card} />
          <Disclaimer compact />

          <section aria-labelledby="d-best">
            <h3 id="d-best" className="text-lg font-extrabold">{t(bi('Who is this card best for?', 'Siapa yang paling sesuai dengan kad ini?'))}</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-base">{goodFor(card).map((g, i) => <li key={i}>{t(g)}</li>)}</ul>
          </section>

          <section aria-label={t(bi('Why this might not suit you', 'Mengapa kad ini mungkin tidak sesuai'))}>
            <Callout tone="warn" title={t(bi('Why this might not suit you', 'Mengapa kad ini mungkin tidak sesuai'))}>
              <ul className="list-disc space-y-1 pl-5">{cautions.map((c, i) => <li key={i}>{t(c)}</li>)}</ul>
            </Callout>
          </section>

          <section aria-labelledby="d-fee">
            <h3 id="d-fee" className="text-lg font-extrabold">{t(bi('What the fees mean', 'Maksud yuran'))}</h3>
            <p className="mb-2 mt-1"><FeeText card={card} /></p>
            <dl className="space-y-3">
              {explain.map((e) => (
                <div key={e.title.en}>
                  <dt className="font-bold">{t(e.title)}</dt>
                  <dd className="text-base text-slate-800">{t(e.text)}</dd>
                </div>
              ))}
            </dl>
          </section>

          {perks.length > 0 && (
            <section aria-labelledby="d-perks">
              <h3 id="d-perks" className="text-lg font-extrabold">{t(bi('Perks listed by the bank', 'Faedah yang disenaraikan bank'))}</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-base">{perks.map((p, i) => <li key={i}>{t(p)}</li>)}</ul>
            </section>
          )}

          <section aria-labelledby="d-facts">
            <h3 id="d-facts" className="text-lg font-extrabold">{t(bi('Full details', 'Butiran penuh'))}</h3>
            {groups.map((g) => (
              <div key={g} className="mt-3">
                <h4 className="text-sm font-extrabold uppercase tracking-wide text-cyan-800">{t(GROUP_LABEL[g])}</h4>
                <dl className="divide-y divide-slate-200">
                  {rows.filter((r) => r.row.group === g).map((r) => (
                    <div key={r.row.id} className="grid grid-cols-2 gap-2 py-2">
                      <dt className="font-semibold">{t(r.row.label)}</dt>
                      <dd>
                        {t(r.cells[0].main)}
                        {r.cells[0].note && <span className="block text-sm text-slate-700">{t(r.cells[0].note)}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            <p className="mt-3 text-base"><strong>{t(bi('Income proof the bank lists', 'Bukti pendapatan yang disenaraikan bank'))}:</strong> {card.incomeProof.map((p) => t(proofLabel(p))).join(', ')}</p>
            <p className="mt-1 text-base"><strong>{t(bi('Deposit-backed option', 'Pilihan disandarkan simpanan'))}:</strong> {t(depositText(card))}</p>
            <p className="mt-1 text-base"><strong>{t(bi('Annual fee', 'Yuran tahunan'))}:</strong> {t(annualFeeText(card))}</p>
          </section>

          <section aria-labelledby="d-score">
            <h3 id="d-score" className="mb-2 text-lg font-extrabold">{t(bi('First-card friendliness', 'Kemesraan kad pertama'))}</h3>
            <FriendlinessBreakdown card={card} />
            <p className="mt-2 text-sm text-slate-600">{t(bi('Ranking is based on suitability for first-time users, not sponsorship.', 'Kedudukan berdasarkan kesesuaian untuk pengguna kali pertama, bukan penajaan.'))}</p>
          </section>

          <section aria-labelledby="d-links" className="rounded-2xl bg-slate-50 p-3">
            <h3 id="d-links" className="text-lg font-extrabold">{t(bi('Check it yourself', 'Semak sendiri'))}</h3>
            <ul className="mt-1 space-y-1">
              {links.map((l) => (
                <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-11 items-center font-semibold text-cyan-800 underline">{t(l.label)} ↗</a></li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-slate-700">{t(bi('Last checked', 'Disemak kali terakhir'))}: {card.lastUpdated}. {t(bi('Where this data came from:', 'Sumber data ini:'))}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {card.dataSources.map((s) => (
                <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer noopener" className="font-semibold text-cyan-800 underline">{s.name}</a></li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-slate-600">{t(CARDS_META.note)} <span className="sr-only">{lang}</span></p>
          </section>
        </div>

        <div className="grid gap-2 border-t border-slate-200 bg-white p-3 sm:grid-cols-3">
          <Button variant="secondary" onClick={() => actions.simulate(card.id)}>{t(bi('Simulate cost with this card', 'Simulasi kos dengan kad ini'))}</Button>
          <Button onClick={() => actions.apply(card.id)}>{t(bi('Apply with this card', 'Mohon dengan kad ini'))}</Button>
          <Button variant="secondary" onClick={() => onToggleCompare(card.id)} aria-pressed={inCompare}>
            {inCompare ? t(bi('✓ In compare', '✓ Dalam banding')) : t(bi('Add to compare', 'Tambah untuk banding'))}
          </Button>
        </div>
      </div>
    </div>
  );
}