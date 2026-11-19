import { useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { money, parseAmount } from '../lib/format.ts';
import type { CardRecord } from '../data/cardTypes.ts';
import { findCard, CARDS_META } from '../data/cards.ts';
import { COMPARE_ROWS, GROUP_LABEL, compareRows, derive, proofLabel, type RowGroup } from '../lib/cards.ts';
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
    <section aria-label={t(bi('Cards to compare', 'Kad untuk dibanding'))} className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-cyan-700 bg-white p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.12)]">
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
                        <p className="font-extrabold leading-snug">{c.name}</p>
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
        <th scope="colgroup" colSpan={cols + 1} className="sticky left-0 bg-cyan-700 px-2 py-2 text-left text-sm font-extrabold uppercase tracking-wide text-white">
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
                {best && <span className="mb-1 block text-xs font-extrabold text-emerald-800">★ {t(bi('Best', 'Terbaik'))}</span>}
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

export function CardDetail({ cardId, onClose, onToggleCompare }: { cardId: string; onClose: () => void; onToggleCompare: (id: string) => void }) {
  const { t } = useLang();
  const { state } = useApp();
  const actions = useCardActions();
  const ref = useDialog<HTMLDivElement>(true, onClose);
  const card = findCard(cardId);
  if (!card) return null;
  const d = derive(card);
  const inCompare = state.compare.selected.includes(card.id);
  const rows = compareRows([card]);

  // "Why this might not suit you"
  const cautions: ReturnType<typeof bi>[] = [];
  if (!d.gigFriendly) cautions.push(bi('It does not accept bank statements or gig earnings statements. Without a payslip or LHDN record, applying may be hard.', 'Ia tidak menerima penyata bank atau penyata pendapatan gig. Tanpa slip gaji atau rekod LHDN, permohonan mungkin sukar.'));
  if (card.annualFee > 0) cautions.push(bi(`The annual fee is ${money(card.annualFee)}${card.annualFeeWaiver ? ' unless you meet the waiver condition' : ''}.`, `Yuran tahunan ialah ${money(card.annualFee)}${card.annualFeeWaiver ? ' kecuali anda memenuhi syarat pengecualian' : ''}.`));
  if (card.interestPa >= 17) cautions.push(bi(`The ${card.interestPa}% rate is costly if you do not pay in full.`, `Kadar ${card.interestPa}% adalah mahal jika anda tidak bayar penuh.`));
  if (!card.digitalApplication) cautions.push(bi('You cannot apply fully online. It may take longer.', 'Anda tidak boleh memohon sepenuhnya dalam talian. Ia mungkin mengambil masa lebih lama.'));
  if (card.minAnnualIncome / 12 >= 3000) cautions.push(bi(`It asks for ${money(Math.round(card.minAnnualIncome / 12))} a month in income, which is high for a first card.`, `Ia meminta pendapatan ${money(Math.round(card.minAnnualIncome / 12))} sebulan, yang tinggi untuk kad pertama.`));
  const myMonthly = parseAmount(state.ready.income);
  if (state.readyDone && !Number.isNaN(myMonthly) && myMonthly * 12 < card.minAnnualIncome) {
    cautions.push(bi(`Based on your check, your income (${money(myMonthly)} a month) is below what this card asks for.`, `Berdasarkan semakan anda, pendapatan anda (${money(myMonthly)} sebulan) di bawah yang diminta kad ini.`));
  }
  cautions.push(card.notFor);

  const explain: { title: ReturnType<typeof bi>; text: ReturnType<typeof bi> }[] = [
    {
      title: bi('Annual fee', 'Yuran tahunan'),
      text: card.annualFee === 0
        ? bi('You pay nothing each year to keep this card.', 'Anda tidak membayar apa-apa setiap tahun untuk memegang kad ini.')
        : bi(`You are charged ${money(card.annualFee)} each year, even if you do not use the card.${card.annualFeeWaiver ? ' ' + card.annualFeeWaiver.en + '.' : ''}`, `Anda dicaj ${money(card.annualFee)} setiap tahun, walaupun anda tidak guna kad.${card.annualFeeWaiver ? ' ' + card.annualFeeWaiver.ms + '.' : ''}`),
    },
    {
      title: bi('Interest', 'Faedah'),
      text: bi(`Pay the full bill on time and you pay no interest. If you leave a balance, you pay ${card.interestPa}% a year on it.`, `Bayar bil penuh tepat pada masanya dan anda tidak bayar faedah. Jika anda tinggalkan baki, anda bayar ${card.interestPa}% setahun ke atasnya.`),
    },
    {
      title: bi('Minimum payment', 'Bayaran minimum'),
      text: bi(`The smallest you must pay each month is ${card.minPayment.percent}% of what you owe or ${money(card.minPayment.floor)}, whichever is higher. Paying only this keeps you in debt for a long time.`, `Jumlah paling sedikit yang perlu dibayar setiap bulan ialah ${card.minPayment.percent}% daripada hutang atau ${money(card.minPayment.floor)}, mana yang lebih tinggi. Membayar jumlah ini sahaja menyebabkan anda berhutang lama.`),
    },
    {
      title: bi('Late payment fee', 'Fi bayaran lewat'),
      text: bi(`If you miss the due date, you pay ${money(card.lateFee.flat)} or ${card.lateFee.percent}% of what you owe, whichever is higher. Late payments can also hurt your record.`, `Jika anda terlepas tarikh akhir, anda bayar ${money(card.lateFee.flat)} atau ${card.lateFee.percent}% daripada hutang, mana yang lebih tinggi. Bayaran lewat juga boleh menjejaskan rekod anda.`),
    },
    {
      title: bi('Cash advance', 'Pendahuluan tunai'),
      text: bi(`Taking cash out with the card costs ${card.cashAdvance.percent}% (at least ${money(card.cashAdvance.min)}) and interest starts at once. Best to avoid it.`, `Mengeluarkan wang tunai dengan kad berharga ${card.cashAdvance.percent}% (sekurang-kurangnya ${money(card.cashAdvance.min)}) dan faedah bermula serta-merta. Elakkan.`),
    },
    {
      title: bi('Spending abroad', 'Berbelanja di luar negara'),
      text: bi(`Buying in another currency adds ${card.fxFeePercent}% to the price.`, `Membeli dalam mata wang lain menambah ${card.fxFeePercent}% pada harga.`),
    },
  ];

  const groups = (Object.keys(GROUP_LABEL) as RowGroup[]).filter((g) => COMPARE_ROWS.some((r) => r.group === g));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="detail-title" tabIndex={-1} className="flex h-full w-full flex-col bg-white shadow-2xl md:max-w-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <BankLogo card={card} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700">{card.bank} · {card.network} · {card.kind === 'islamic' ? t(bi('Islamic', 'Islamik')) : t(bi('Conventional', 'Konvensional'))}</p>
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
            <p className="mt-1 text-base">{t(card.bestFor)}</p>
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

          <section aria-labelledby="d-pc" className="grid gap-3 sm:grid-cols-2">
            <h3 id="d-pc" className="sr-only">{t(bi('Pros and cons', 'Kelebihan dan kekurangan'))}</h3>
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3">
              <p className="font-extrabold text-emerald-900">✔ {t(bi('Pros', 'Kelebihan'))}</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">{card.pros.map((p, i) => <li key={i}>{t(p)}</li>)}</ul>
            </div>
            <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3">
              <p className="font-extrabold text-rose-900">✘ {t(bi('Cons', 'Kekurangan'))}</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">{card.cons.map((p, i) => <li key={i}>{t(p)}</li>)}</ul>
            </div>
          </section>

          <section aria-label={t(bi('Why this might not suit you', 'Mengapa kad ini mungkin tidak sesuai'))}>
            <Callout tone="warn" title={t(bi('Why this might not suit you', 'Mengapa kad ini mungkin tidak sesuai'))}>
              <ul className="list-disc space-y-1 pl-5">{cautions.map((c, i) => <li key={i}>{t(c)}</li>)}</ul>
            </Callout>
          </section>

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
            <p className="mt-3 text-base"><strong>{t(bi('Accepted income proof', 'Bukti pendapatan diterima'))}:</strong> {card.incomeProof.map((p) => t(proofLabel(p))).join(', ')}</p>
            <p className="mt-1 text-base"><strong>{t(bi('Extra cards', 'Kad tambahan'))}:</strong> {card.supplementary.max === 0 ? t(bi('Not offered', 'Tidak ditawarkan')) : t(bi(`Up to ${card.supplementary.max}, ${money(card.supplementary.annualFee)} a year each`, `Sehingga ${card.supplementary.max}, ${money(card.supplementary.annualFee)} setahun setiap satu`))}</p>
          </section>

          <section aria-labelledby="d-score">
            <h3 id="d-score" className="mb-2 text-lg font-extrabold">{t(bi('First-card friendliness', 'Kemesraan kad pertama'))}</h3>
            <FriendlinessBreakdown card={card} />
            <p className="mt-2 text-sm text-slate-600">{t(bi('Ranking is based on suitability for first-time users, not sponsorship.', 'Kedudukan berdasarkan kesesuaian untuk pengguna kali pertama, bukan penajaan.'))}</p>
          </section>

          <p className="text-sm text-slate-600">
            {t(bi('Last updated', 'Dikemas kini'))}: {card.lastUpdated}.{' '}
            <a href={card.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-cyan-800 underline">
              {t(bi('Source: bank official website (placeholder link)', 'Sumber: laman web rasmi bank (pautan placeholder)'))}
            </a>
            . {t(CARDS_META.note)}
          </p>
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
