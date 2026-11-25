import { useMemo, useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { PageTitle } from '../components/ui.tsx';
import { Quiz } from '../components/learn.tsx';
import { Guide } from '../components/guide.tsx';
import { SelectedCardChip } from '../components/cards.tsx';
import { PayByCard, PayOptions, ReminderBanner, Settings, SpendForm, SpendList, Tracker, UsageMeter } from '../components/usage.tsx';
import { findCard } from '../data/cards.ts';
import { termsFromCard } from '../lib/cards.ts';
import { DEFAULT_TERMS } from '../lib/cost.ts';
import { buildReminderIcs } from '../lib/ics.ts';
import { addDays, dueDate, needsAction, newId, reminderDue, sampleData, statementOnOrAfter, summarise, todayIso } from '../lib/usage.ts';
import type { Payment, Txn, UseState } from '../state/types.ts';
import { money } from '../lib/format.ts';

export function UsePage() {
  const { t } = useLang();
  const { state, update } = useApp();
  const u = state.use;
  const card = findCard(state.selectedCardId);
  const terms = card ? termsFromCard(card) : DEFAULT_TERMS;
  const termsName = card ? `${card.bank} ${card.name}` : t(bi('standard example rates', 'kadar contoh standard'));
  const today = todayIso();
  const [announce, setAnnounce] = useState('');

  const sum = useMemo(
    () => summarise(u.txns, u.payments, u.statementDay, u.limit, today, terms),
    // terms come from the selected card, so its id is a dependency
    [u.txns, u.payments, u.statementDay, u.limit, today, state.selectedCardId],
  );

  const setUse = (p: Partial<UseState>) => update((s) => ({ ...s, use: { ...s.use, ...p } }));

  function addSpend(x: Omit<Txn, 'id'>) {
    update((s) => ({ ...s, use: { ...s.use, txns: [...s.use.txns, { ...x, id: newId('t') }] }, done: { ...s.done, use: true } }));
    setAnnounce(t(bi(`Added ${money(x.amount, 2)}.`, `Ditambah ${money(x.amount, 2)}.`)));
  }

  function deleteSpend(id: string) {
    const x = u.txns.find((a) => a.id === id);
    update((s) => ({ ...s, use: { ...s.use, txns: s.use.txns.filter((a) => a.id !== id) } }));
    if (x) setAnnounce(t(bi(`Deleted ${money(x.amount, 2)}.`, `Dipadam ${money(x.amount, 2)}.`)));
  }

  function addPayment(p: Omit<Payment, 'id'>) {
    update((s) => ({ ...s, use: { ...s.use, payments: [...s.use.payments, { ...p, id: newId('p') }] }, done: { ...s.done, use: true } }));
    setAnnounce(t(bi(`Payment of ${money(p.amount, 2)} recorded.`, `Bayaran ${money(p.amount, 2)} direkodkan.`)));
  }

  function undoPayment(id: string) {
    update((s) => ({ ...s, use: { ...s.use, payments: s.use.payments.filter((p) => p.id !== id) } }));
    setAnnounce(t(bi('Payment removed.', 'Bayaran dibuang.')));
  }

  function loadSample() {
    const d = sampleData(today);
    update((s) => ({ ...s, use: { ...s.use, statementDay: d.statementDay, txns: d.txns, payments: d.payments }, done: { ...s.done, use: true } }));
    setAnnounce(t(bi('Sample spending loaded.', 'Perbelanjaan sampel dimuatkan.')));
  }

  function clearAll() {
    update((s) => ({ ...s, use: { ...s.use, txns: [], payments: [] }, done: { ...s.done, use: false } }));
    setAnnounce(t(bi('All spending and payments cleared.', 'Semua perbelanjaan dan bayaran dikosongkan.')));
  }

  // The next 3 due dates, for the calendar file.
  function nextDueDates(): string[] {
    const list: string[] = [];
    if (needsAction(sum.open)) list.push(sum.open.due);
    let end = sum.nextStatement;
    for (let i = 0; i < 3; i++) {
      list.push(dueDate(end));
      end = statementOnOrAfter(addDays(end, 1), u.statementDay);
    }
    return [...new Set(list)].filter((d) => d >= today).slice(0, 3);
  }

  function download() {
    const name = card ? `${card.bank} ${card.name}` : 'KAF First Card';
    const blob = new Blob([buildReminderIcs(nextDueDates(), u.daysBefore, name)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'credit-card-reminders.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setAnnounce(t(bi('Calendar file downloaded.', 'Fail kalendar dimuat turun.')));
  }

  const cycleTxns = u.txns.filter((x) => x.date >= sum.current.start && x.date <= sum.current.end);
  const showBanner = u.reminderOn && sum.open && reminderDue(sum.open, today, u.daysBefore);

  return (
    <div className="space-y-8">
      <PageTitle
        title={t(bi('Use it well: your month on the card', 'Guna dengan bijak: bulan anda dengan kad'))}
        intro={t(bi('Log what you spend, see how much of your limit you use, and know exactly when to pay.', 'Rekod apa yang anda belanjakan, lihat berapa had anda digunakan, dan tahu bila tepatnya untuk bayar.'))}
      />

      <SelectedCardChip />
      {showBanner && sum.open && <ReminderBanner open={sum.open} />}

      <PayByCard sum={sum} terms={terms} onPay={addPayment} onUndo={undoPayment} />
      <PayOptions sum={sum} terms={terms} termsName={termsName} />
      <UsageMeter sum={sum} limit={u.limit} />

      <section aria-labelledby="log-h" className="space-y-3">
        <h2 id="log-h" className="text-2xl font-extrabold">{t(bi('Log a spend', 'Rekod perbelanjaan'))}</h2>
        <SpendForm onAdd={addSpend} />
        <h3 className="pt-2 text-lg font-extrabold">{t(bi('This month’s spending', 'Perbelanjaan bulan ini'))}</h3>
        <SpendList txns={cycleTxns} onDelete={deleteSpend} />
      </section>

      <Tracker sum={sum} />

      <Settings use={u} onChange={setUse} onDownload={download} onSample={loadSample} onClear={clearAll} canDownload={nextDueDates().length > 0} />

      <Guide />

      <Quiz />

      <p className="sr-only" role="status" aria-live="polite">{announce}</p>
    </div>
  );
}
