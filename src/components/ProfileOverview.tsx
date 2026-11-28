import { useMemo, useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { href } from '../lib/router.ts';
import { Card, LinkButton } from './ui.tsx';
import { findCard } from '../data/cards.ts';
import { annualFeeText } from '../lib/cardText.ts';
import { fmtDate, money } from '../lib/format.ts';
import { dueDate, summarise, todayIso } from '../lib/usage.ts';
import { QUESTIONS } from '../lib/apply.ts';
import { CreditScore } from './CreditScore.tsx';

type Tab = 'all' | 'payments' | 'application' | 'score';

interface Item {
  id: string;
  date: string;
  title: string;
  sub: string;
  amount?: string;
  tone?: 'out' | 'in';
  kind: 'payments' | 'application';
  mark: string;
}
export function ProfileOverview({ name }: { name: string }) {
  const { t, lang } = useLang();
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>('all');
  const card = findCard(state.selectedCardId);
  const today = todayIso();
  const u = state.use;
  const d = state.draft;

  const sum = useMemo(() => summarise(u.txns, u.payments, u.statementDay, u.limit, today), [u.txns, u.payments, u.statementDay, u.limit, today]);

  // Where the application is, in plain words.
  const status = state.submission
    ? state.track.stage === 3
      ? state.track.outcome === 'approved' ? bi('Approved', 'Diluluskan') : bi('Not approved', 'Tidak diluluskan')
      : bi('Under review', 'Dalam semakan')
    : d.started || d.savedAt !== null
      ? bi(`In progress, question ${Math.min(d.q + 1, QUESTIONS.length)} of ${QUESTIONS.length}`, `Sedang diisi, soalan ${Math.min(d.q + 1, QUESTIONS.length)} daripada ${QUESTIONS.length}`)
      : bi('Not started', 'Belum bermula');
  const approved = !!state.submission && state.track.stage === 3 && state.track.outcome === 'approved';
  const started = state.submission !== null || d.started || d.savedAt !== null;

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];
    if (state.submission) {
      list.push({
        id: 'sub', date: state.submission.at.slice(0, 10), kind: 'application', mark: 'A',
        title: lang === 'ms' ? 'Permohonan dihantar' : 'Application sent',
        sub: `${lang === 'ms' ? 'Rujukan' : 'Reference'} ${state.submission.ref}`,
      });
    }
    for (const x of u.txns) {
      list.push({ id: x.id, date: x.date, kind: 'payments', mark: x.category[0].toUpperCase(), title: x.note || x.category, sub: x.category, amount: `- ${money(x.amount, 2)}`, tone: 'out' });
    }
    for (const p of u.payments) {
      list.push({ id: p.id, date: p.paidOn, kind: 'payments', mark: '✓', title: lang === 'ms' ? 'Bayaran kad' : 'Card payment', sub: `${lang === 'ms' ? 'Untuk penyata' : 'For statement'} ${fmtDate(p.statementEnd, lang)}`, amount: `+ ${money(p.amount, 2)}`, tone: 'in' });
    }
    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [state.submission, u.txns, u.payments, lang]);

  const shown = items.filter((i) => tab === 'all' || i.kind === tab).slice(0, 12);

  const open = sum.open;
  const nextDue = open && !open.settled && open.balance > 0 ? { date: open.due, amount: open.balance } : null;
  const nextStatement = sum.nextStatement;

  const tabBtn = (k: Tab, label: ReturnType<typeof bi>) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === k}
      onClick={() => setTab(k)}
      className={`min-h-11 border-b-2 px-1 text-base font-semibold ${tab === k ? 'border-cyan-700 text-cyan-800' : 'border-transparent text-slate-700 hover:text-cyan-800'}`}
    >
      {t(label)}
    </button>
  );

  return (
    <div className="space-y-6">

      <div className="grid gap-8 2xl:grid-cols-[20rem_minmax(0,1fr)]">
        {/* Left: the card and the facts about it */}
        <section aria-label={t(bi('My card', 'Kad saya'))} className="space-y-5">
          <div className="relative h-60" aria-hidden="true">
            <div className="absolute inset-x-0 top-0 h-36 rounded-3xl bg-gradient-to-br from-[#2a1f1c] to-[#000] p-4 text-white shadow-lg">
              <p className="text-sm font-semibold tracking-wide">KAF <span className="text-white/60">| {t(bi('First Card', 'Kad Pertama'))}</span></p>
              <p className="mt-6 text-lg tracking-[0.25em]">•••• •••• •••• ••••</p>
            </div>
            <div className="absolute inset-x-3 top-24 h-36 rounded-3xl bg-gradient-to-br from-white to-[#fde3d3] p-4 shadow-xl ring-1 ring-black/5">
              <p className="text-sm font-semibold">{card ? `${card.bank}` : 'KAF'} <span className="text-slate-600">| {card ? card.name : t(bi('Standard example terms', 'Terma contoh standard'))}</span></p>
              <div className="mt-4 h-6 w-9 rounded bg-gradient-to-br from-amber-200 to-amber-400" />
              <div className="mt-3 flex items-end justify-between">
                <p className="text-sm font-semibold uppercase tracking-wider">{name}</p>
                <p className="text-sm font-bold text-cyan-700">{card?.network ?? ''}</p>
              </div>
            </div>
          </div>

          <Card className="space-y-4">
            <dl className="space-y-3 text-base">
              <div>
                <dt className="text-sm text-slate-600">{t(bi('Application', 'Permohonan'))}</dt>
                <dd className="font-semibold">{t(status)}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-sm text-slate-600">{t(bi('Card', 'Kad'))}</dt>
                  <dd className="font-semibold">{card ? card.name : t(bi('Not picked yet', 'Belum dipilih'))}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600">{t(bi('Annual fee', 'Yuran tahunan'))}</dt>
                  <dd className="font-semibold">{card ? t(annualFeeText(card)) : t(bi('RM0 in year 1, then RM50', 'RM0 tahun 1, kemudian RM50'))}</dd>
                </div>
              </div>
              {approved && (
                <div className="grid grid-cols-2 gap-3 border-t border-black/10 pt-3">
                  <div>
                    <dt className="text-sm text-slate-600">{t(bi('Credit limit', 'Had kredit'))}</dt>
                    <dd className="font-semibold">{money(u.limit)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-600">{t(bi('Used this month', 'Digunakan bulan ini'))}</dt>
                    <dd className="font-semibold">{Math.round(sum.utilisation)}%</dd>
                  </div>
                </div>
              )}
            </dl>
          </Card>

          <a href={href('compare')} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cyan-700/50 bg-[#fff1e8] px-4 text-base font-semibold text-cyan-800 hover:bg-white">
            <span aria-hidden="true">+</span> {card ? t(bi('Change card', 'Tukar kad')) : t(bi('Choose a card', 'Pilih kad'))}
          </a>

          <div className="flex flex-wrap gap-3">
            <LinkButton href={href(state.submission ? 'track' : 'apply')}>{state.submission ? t(bi('Track my application', 'Jejak permohonan saya')) : started ? t(bi('Continue my application', 'Sambung permohonan saya')) : t(bi('Start applying', 'Mula memohon'))}</LinkButton>
          </div>
        </section>

        {/* Right: activity and what is coming */}
        <section aria-label={t(bi('My activity', 'Aktiviti saya'))} className="space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold">{t(bi('My activity', 'Aktiviti saya'))}</h2>
            <div role="tablist" aria-label={t(bi('Activity filter', 'Tapis aktiviti'))} className="mt-2 flex gap-6 border-b border-slate-300">
              {tabBtn('all', bi('All activity', 'Semua aktiviti'))}
              {tabBtn('payments', bi('Spending and payments', 'Perbelanjaan dan bayaran'))}
              {tabBtn('application', bi('Application', 'Permohonan'))}
              {tabBtn('score', bi('Credit score', 'Skor kredit'))}
            </div>
            {tab === 'score' ? (
              <CreditScore />
            ) : shown.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-[#fff1e8] p-4 text-base text-slate-700">
                {t(bi('Nothing here yet. Your application and, once you have a card, your spending and payments show up here.', 'Belum ada apa-apa. Permohonan anda dan, selepas anda ada kad, perbelanjaan dan bayaran anda dipaparkan di sini.'))}
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-200">
                {shown.map((i) => (
                  <li key={i.id} className="flex items-center gap-4 py-3">
                    <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff1e8] font-bold text-cyan-800">{i.mark}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{i.title}</span>
                      <span className="block text-sm text-slate-600">{fmtDate(i.date, lang)} · {i.sub}</span>
                    </span>
                    {i.amount && <span className={`shrink-0 font-semibold ${i.tone === 'in' ? 'text-emerald-800' : 'text-slate-900'}`}>{i.amount}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-extrabold">{t(bi('Coming up', 'Akan datang'))}</h2>
            {approved ? (
              <ul className="mt-2 divide-y divide-slate-200">
                {nextDue && (
                  <li className="flex items-center gap-4 py-3">
                    <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff1e8] font-bold text-cyan-800">!</span>
                    <span className="flex-1">
                      <span className="block font-semibold">{t(bi('Card bill due', 'Bil kad perlu dibayar'))}</span>
                      <span className="block text-sm text-slate-600">{fmtDate(nextDue.date, lang)}</span>
                    </span>
                    <span className="font-semibold">{money(nextDue.amount, 2)}</span>
                  </li>
                )}
                <li className="flex items-center gap-4 py-3">
                  <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff1e8] font-bold text-cyan-800">S</span>
                  <span className="flex-1">
                    <span className="block font-semibold">{t(bi('Next statement', 'Penyata seterusnya'))}</span>
                    <span className="block text-sm text-slate-600">{fmtDate(nextStatement, lang)} · {t(bi('due by', 'bayar sebelum'))} {fmtDate(dueDate(nextStatement), lang)}</span>
                  </span>
                </li>
              </ul>
            ) : (
              <p className="mt-2 rounded-2xl bg-[#fff1e8] p-4 text-base text-slate-700">
                {t(bi('Payment dates show here once your card is approved.', 'Tarikh bayaran dipaparkan di sini selepas kad anda diluluskan.'))}
              </p>
            )}
          </div>

          <p className="text-sm text-slate-600">
            {t(bi('Your details are saved on this device only. Log out when you share a computer: it clears your answers from the screen, and they stay saved under your account.', 'Butiran anda disimpan pada peranti ini sahaja. Log keluar jika anda berkongsi komputer: ia mengosongkan jawapan anda dari skrin, dan ia kekal disimpan di bawah akaun anda.'))}
          </p>
        </section>
      </div>
    </div>
  );
}
