import { useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import type { Bi } from '../lib/eligibility.ts';
import type { Category, DaysBefore, Payment, Txn, UseState } from '../state/types.ts';
import { RATES, UTILISATION_TARGET } from '../config/rates.ts';
import { fmtDate, fmtMonth, money, parseAmount } from '../lib/format.ts';
import { interestAvoided, lateFee, simulate, type Terms } from '../lib/cost.ts';
import { CATEGORIES, dueDate as addDue, isIsoDate, needsAction, todayIso, type Statement, type StatementStatus, type UsageSummary } from '../lib/usage.ts';
import { Badge, Button, Callout, Card, Field, inputClass } from './ui.tsx';

export const CATEGORY_LABEL: Record<Category, { icon: string; label: Bi }> = {
  food: { icon: '🍜', label: { en: 'Food', ms: 'Makanan' } },
  transport: { icon: '🚗', label: { en: 'Transport', ms: 'Pengangkutan' } },
  groceries: { icon: '🛒', label: { en: 'Groceries', ms: 'Barangan runcit' } },
  bills: { icon: '🧾', label: { en: 'Bills', ms: 'Bil' } },
  shopping: { icon: '🛍️', label: { en: 'Shopping', ms: 'Beli-belah' } },
  other: { icon: '📦', label: { en: 'Other', ms: 'Lain-lain' } },
};

const STATUS: Record<StatementStatus, { symbol: string; label: Bi; tone: 'good' | 'info' | 'warn' | 'bad' }> = {
  none: { symbol: '✔', label: { en: 'Nothing to pay', ms: 'Tiada untuk dibayar' }, tone: 'good' },
  upcoming: { symbol: '📅', label: { en: 'Upcoming', ms: 'Akan datang' }, tone: 'info' },
  due_soon: { symbol: '⏰', label: { en: 'Due soon', ms: 'Hampir tarikh akhir' }, tone: 'warn' },
  due_today: { symbol: '❗', label: { en: 'Due today', ms: 'Tarikh akhir hari ini' }, tone: 'warn' },
  overdue: { symbol: '⛔', label: { en: 'Overdue', ms: 'Lewat' }, tone: 'bad' },
  paid_full: { symbol: '✔', label: { en: 'Paid in full', ms: 'Dibayar penuh' }, tone: 'good' },
  paid_min: { symbol: '◐', label: { en: 'Paid on time (not in full)', ms: 'Dibayar tepat masa (tidak penuh)' }, tone: 'info' },
};

export function StatusBadge({ status }: { status: StatementStatus }) {
  const { t } = useLang();
  const s = STATUS[status];
  return <Badge tone={s.tone}><span aria-hidden="true" className="mr-1">{s.symbol}</span>{t(s.label)}</Badge>;
}

export function daysLeftText(n: number): Bi {
  if (n > 1) return { en: `${n} days left`, ms: `${n} hari lagi` };
  if (n === 1) return { en: '1 day left', ms: '1 hari lagi' };
  if (n === 0) return { en: 'Due today', ms: 'Tarikh akhir hari ini' };
  if (n === -1) return { en: '1 day late', ms: 'Lewat 1 hari' };
  return { en: `${-n} days late`, ms: `Lewat ${-n} hari` };
}

// ---------- Reminder banner ----------

export function ReminderBanner({ open }: { open: Statement }) {
  const { t, lang } = useLang();
  return (
    <div role="status" className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-amber-950">
      <p className="text-lg font-extrabold">⏰ {t(bi('Reminder: your bill is due', 'Peringatan: bil anda hampir tarikh akhir'))}</p>
      <p>{t(bi(`Pay ${money(open.balance - open.paidTotal, 2)} by ${fmtDate(open.due, 'en')}. ${daysLeftText(open.daysLeft).en}.`, `Bayar ${money(open.balance - open.paidTotal, 2)} sebelum ${fmtDate(open.due, 'ms')}. ${daysLeftText(open.daysLeft).ms}.`))}</p>
      <p className="sr-only">{fmtDate(open.due, lang)}</p>
    </div>
  );
}

// ---------- Pay by card ----------

export function PayByCard({ sum, terms, onPay, onUndo }: { sum: UsageSummary; terms: Terms; onPay: (p: Omit<Payment, 'id'>) => void; onUndo: (id: string) => void }) {
  const { t, lang } = useLang();
  const open = sum.open;
  const nextDue = fmtDate(addDue(sum.nextStatement), lang);

  return (
    <section aria-labelledby="payby-h" className="rounded-3xl border-2 border-cyan-700 bg-white p-5 sm:p-6">
      <h2 id="payby-h" className="text-2xl font-extrabold">{t(bi('When to pay', 'Bila untuk bayar'))}</h2>

      {!open && (
        <div className="mt-2 space-y-1 text-lg">
          <p>{t(bi('No statement yet. Your card only bills you once a month, on your statement date.', 'Belum ada penyata. Kad anda hanya mengebil sekali sebulan, pada tarikh penyata.'))}</p>
          <p>{t(bi(`Your first statement is on ${fmtDate(sum.nextStatement, 'en')}. You will then pay by ${nextDue}.`, `Penyata pertama anda pada ${fmtDate(sum.nextStatement, 'ms')}. Anda kemudian bayar sebelum ${nextDue}.`))}</p>
        </div>
      )}

      {open && open.balance <= 0 && (
        <p className="mt-2 text-lg">{t(bi(`Your statement on ${fmtDate(open.cycle.end, 'en')} was RM0. Nothing to pay.`, `Penyata anda pada ${fmtDate(open.cycle.end, 'ms')} ialah RM0. Tiada untuk dibayar.`))}</p>
      )}

      {open && open.balance > 0 && (
        <div className="mt-3 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={open.status} />
            {needsAction(open) && <span className="text-lg font-bold">{t(daysLeftText(open.daysLeft))}</span>}
          </div>
          <dl className="grid gap-3 sm:grid-cols-3">
            <Fact label={bi('Pay by', 'Bayar sebelum')} value={fmtDate(open.due, lang)} big />
            <Fact label={bi('Statement balance', 'Baki penyata')} value={money(open.balance, 2)} big />
            <Fact label={bi('Statement date', 'Tarikh penyata')} value={fmtDate(open.cycle.end, lang)} />
          </dl>

          {open.paidTotal > 0 && open.paidTotal < open.balance - 0.005 && (
            <Callout tone="info" title={t(bi('You paid part of it', 'Anda telah bayar sebahagian'))}>
              {t(bi(
                `Left to pay: ${money(open.balance - open.paidTotal, 2)}. If left over, it may cost about ${money(interestAvoided(open.balance - open.paidTotal, terms), 2)} in interest next month.`,
                `Baki untuk dibayar: ${money(open.balance - open.paidTotal, 2)}. Jika dibiarkan, ia mungkin menelan kira-kira ${money(interestAvoided(open.balance - open.paidTotal, terms), 2)} faedah bulan depan.`,
              ))}
            </Callout>
          )}
          {open.status === 'overdue' && (
            <Callout tone="bad" title={t(bi('This bill is overdue', 'Bil ini sudah lewat'))}>
              {t(bi(`Pay as soon as you can. A late fee of ${money(lateFee(open.balance, terms), 2)} may apply. Call us if you need help.`, `Bayar secepat mungkin. Fi lewat ${money(lateFee(open.balance, terms), 2)} mungkin dikenakan. Hubungi kami jika perlukan bantuan.`))}
            </Callout>
          )}

          {open.payments.length > 0 && (
            <ul className="space-y-1">
              {open.payments.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-1">
                  <span>{t(bi('Paid', 'Dibayar'))} {money(p.amount, 2)} · {fmtDate(p.paidOn, lang)} · {p.paidOn <= open.due ? t(bi('on time', 'tepat masa')) : t(bi('late', 'lewat'))}</span>
                  <Button variant="ghost" onClick={() => onUndo(p.id)} aria-label={`${t(bi('Remove payment', 'Buang bayaran'))} ${money(p.amount, 2)}`}>{t(bi('Remove', 'Buang'))}</Button>
                </li>
              ))}
            </ul>
          )}

          {!open.settled && <PaymentForm statement={open} onPay={onPay} />}
          {open.settled && <Callout tone="good" title={t(bi('All done for this statement', 'Siap untuk penyata ini'))}>{t(bi('Nice. Paying on time builds a good credit record.', 'Bagus. Membayar tepat masa membina rekod kredit yang baik.'))}</Callout>}
        </div>
      )}

      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-base">
        📌 {t(bi(
          `Next statement: ${fmtDate(sum.nextStatement, 'en')}. Anything you spend until then is due by ${fmtDate(addDue(sum.nextStatement), 'en')}.`,
          `Penyata seterusnya: ${fmtDate(sum.nextStatement, 'ms')}. Apa yang anda belanjakan sehingga itu perlu dibayar sebelum ${fmtDate(addDue(sum.nextStatement), 'ms')}.`,
        ))}
      </p>
    </section>
  );
}

function Fact({ label, value, big }: { label: Bi; value: string; big?: boolean }) {
  const { t } = useLang();
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <dt className="text-sm text-slate-600">{t(label)}</dt>
      <dd className={big ? 'text-xl font-extrabold' : 'text-lg font-bold'}>{value}</dd>
    </div>
  );
}

function PaymentForm({ statement, onPay }: { statement: Statement; onPay: (p: Omit<Payment, 'id'>) => void }) {
  const { t } = useLang();
  const left = Math.round((statement.balance - statement.paidTotal) * 100) / 100;
  const [kind, setKind] = useState<'full' | 'min' | 'other'>('full');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => todayIso());
  const [err, setErr] = useState<Bi | undefined>();
  const today = todayIso();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = kind === 'full' ? left : kind === 'min' ? Math.min(statement.minimum, left) : parseAmount(amount);
    if (kind === 'other' && (Number.isNaN(value) || value <= 0)) return setErr({ en: 'Please type how much you paid, more than RM0.', ms: 'Sila taip jumlah yang dibayar, lebih daripada RM0.' });
    if (value > left + 0.005) return setErr({ en: `That is more than the ${money(left, 2)} left on this statement.`, ms: `Itu melebihi ${money(left, 2)} yang tinggal pada penyata ini.` });
    if (!isIsoDate(date) || date > today) return setErr({ en: 'Please pick today or an earlier date.', ms: 'Sila pilih hari ini atau tarikh sebelumnya.' });
    setErr(undefined);
    onPay({ statementEnd: statement.cycle.end, paidOn: date, amount: Math.round(value * 100) / 100 });
    setAmount('');
  }

  const opts: { id: 'full' | 'min' | 'other'; label: Bi }[] = [
    { id: 'full', label: { en: `Paid in full (${money(left, 2)})`, ms: `Dibayar penuh (${money(left, 2)})` } },
    { id: 'min', label: { en: `Paid the minimum (${money(Math.min(statement.minimum, left), 2)})`, ms: `Dibayar minimum (${money(Math.min(statement.minimum, left), 2)})` } },
    { id: 'other', label: { en: 'Paid another amount', ms: 'Dibayar jumlah lain' } },
  ];

  return (
    <form onSubmit={submit} noValidate className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <h3 className="text-lg font-extrabold">{t(bi('Already paid? Record it', 'Sudah bayar? Rekodkan'))}</h3>
      <fieldset>
        <legend className="sr-only">{t(bi('How much did you pay?', 'Berapa yang anda bayar?'))}</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {opts.map((o) => (
            <label key={o.id} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 font-semibold ${kind === o.id ? 'border-cyan-700 bg-cyan-50' : 'border-slate-300'}`}>
              <input type="radio" name="paykind" className="h-5 w-5" checked={kind === o.id} onChange={() => setKind(o.id)} />
              {t(o.label)}
            </label>
          ))}
        </div>
      </fieldset>
      {kind === 'other' && (
        <Field label={bi('Amount paid (RM)', 'Jumlah dibayar (RM)')} error={err}>
          {({ id, describedBy, invalid }) => <input id={id} inputMode="decimal" value={amount} aria-invalid={invalid} aria-describedby={describedBy} onChange={(e) => setAmount(e.target.value)} className={inputClass(invalid)} />}
        </Field>
      )}
      <Field label={bi('Date you paid', 'Tarikh anda bayar')} error={kind === 'other' ? undefined : err}>
        {({ id, describedBy, invalid }) => <input id={id} type="date" max={today} value={date} aria-invalid={invalid} aria-describedby={describedBy} onChange={(e) => setDate(e.target.value)} className={inputClass(invalid)} />}
      </Field>
      <Button type="submit">{t(bi('Record payment', 'Rekod bayaran'))}</Button>
    </form>
  );
}

// ---------- Pay in full or minimum ----------

export function PayOptions({ sum, terms, termsName }: { sum: UsageSummary; terms: Terms; termsName: string }) {
  const { t } = useLang();
  const open = sum.open;
  const live = needsAction(open);
  const base = live ? Math.round((open.balance - open.paidTotal) * 100) / 100 : sum.currentSpend;
  const full = simulate({ spend: base, mode: 'full', fixed: 0 }, terms);
  const min = simulate({ spend: base, mode: 'minimum', fixed: 0 }, terms);
  const extra = Math.round((min.total - full.total) * 100) / 100;

  return (
    <section aria-labelledby="opts-h" className="space-y-3">
      <h2 id="opts-h" className="text-2xl font-extrabold">{t(bi('Pay in full or the minimum?', 'Bayar penuh atau minimum?'))}</h2>
      <p className="text-base text-slate-700">
        {live
          ? t(bi(`Based on what you still owe on your last statement (${money(base, 2)}).`, `Berdasarkan baki yang masih anda hutang pada penyata terakhir (${money(base, 2)}).`))
          : t(bi(`Based on what you have spent so far this month (${money(base, 2)}).`, `Berdasarkan perbelanjaan anda setakat ini bulan ini (${money(base, 2)}).`))}
      </p>
      {base <= 0 ? (
        <p className="rounded-2xl bg-slate-50 p-4">{t(bi('Nothing to compare yet. Add a spend below.', 'Belum ada untuk dibandingkan. Tambah perbelanjaan di bawah.'))}</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-emerald-300 bg-emerald-50/50">
              <h3 className="text-xl font-extrabold">✔ {t(bi('Pay in full', 'Bayar penuh'))}</h3>
              <dl className="mt-2 space-y-1">
                <Line k={bi('You pay', 'Anda bayar')} v={money(base, 2)} />
                <Line k={bi('Interest', 'Faedah')} v="RM0" />
                <Line k={bi('Done in', 'Selesai dalam')} v={t(bi('1 month', '1 bulan'))} />
              </dl>
            </Card>
            <Card>
              <h3 className="text-xl font-extrabold">◐ {t(bi('Pay the minimum only', 'Bayar minimum sahaja'))}</h3>
              <dl className="mt-2 space-y-1">
                <Line k={bi('First payment', 'Bayaran pertama')} v={money(min.firstMinPayment, 2)} />
                <Line k={bi('Interest in total', 'Jumlah faedah')} v={money(min.interest, 2)} />
                <Line k={bi('Done in', 'Selesai dalam')} v={`${min.months} ${t(bi('months', 'bulan'))}`} />
              </dl>
            </Card>
          </div>
          <Callout tone="good" title={t(bi('Tip: pay in full', 'Tip: bayar penuh'))}>
            <p className="text-lg">
              {t(bi(
                `Paying in full avoids ${money(extra, 2)} in interest on ${money(base, 2)}. Even this month alone, it saves about ${money(interestAvoided(base, terms), 2)}.`,
                `Membayar penuh mengelakkan ${money(extra, 2)} faedah atas ${money(base, 2)}. Bulan ini sahaja, ia menjimatkan kira-kira ${money(interestAvoided(base, terms), 2)}.`,
              ))}
            </p>
          </Callout>
          <p className="text-base">⚠️ {t(bi(`Miss the due date and a late fee of ${money(lateFee(base, terms), 2)} may apply.`, `Terlepas tarikh akhir dan fi lewat ${money(lateFee(base, terms), 2)} mungkin dikenakan.`))}</p>
        </>
      )}
      <p className="text-sm text-slate-600">{t(bi(`Rates used: ${termsName}: ${terms.aprPercent}% a year, minimum ${terms.minPercent}% or ${money(terms.minFloor)}. ${RATES.graceDays} days from statement to due date. Illustrative only.`, `Kadar digunakan: ${termsName}: ${terms.aprPercent}% setahun, minimum ${terms.minPercent}% atau ${money(terms.minFloor)}. ${RATES.graceDays} hari dari penyata ke tarikh akhir. Untuk ilustrasi sahaja.`))}</p>
    </section>
  );
}

function Line({ k, v }: { k: Bi; v: string }) {
  const { t } = useLang();
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-slate-700">{t(k)}</dt>
      <dd className="text-lg font-bold">{v}</dd>
    </div>
  );
}

// ---------- Usage meter ----------

export function UsageMeter({ sum, limit }: { sum: UsageSummary; limit: number }) {
  const { t, lang } = useLang();
  const pct = Math.round(sum.utilisation);
  const shown = Math.min(100, sum.utilisation);
  const band = {
    good: { symbol: '✔', label: bi('Good', 'Baik'), tip: bi('You are using a small part of your limit. Keep it up.', 'Anda menggunakan sebahagian kecil had anda. Teruskan.'), tone: 'good' as const },
    high: { symbol: '⚠', label: bi('Getting high', 'Semakin tinggi'), tip: bi(`Try to stay under ${UTILISATION_TARGET}% of your limit. Pay some of it early, before the statement date.`, `Cuba kekal di bawah ${UTILISATION_TARGET}% daripada had anda. Bayar sebahagian awal, sebelum tarikh penyata.`), tone: 'warn' as const },
    too_high: { symbol: '⛔', label: bi('Too high', 'Terlalu tinggi'), tip: bi('You are close to your limit. Pay down before the statement date, and avoid new spending.', 'Anda hampir had anda. Bayar sebelum tarikh penyata, dan elakkan perbelanjaan baharu.'), tone: 'bad' as const },
  }[sum.band];
  const barColour = sum.band === 'good' ? 'bg-emerald-600' : sum.band === 'high' ? 'bg-amber-500' : 'bg-rose-600';

  return (
    <section aria-labelledby="meter-h" className="space-y-4">
      <h2 id="meter-h" className="text-2xl font-extrabold">{t(bi('This month’s usage', 'Penggunaan bulan ini'))}</h2>
      <p className="text-base text-slate-700">{fmtDate(sum.current.start, lang)} → {fmtDate(sum.current.end, lang)}</p>
      <Card className="space-y-3">
        <p className="text-3xl font-extrabold">{money(sum.currentSpend, 2)} <span className="text-lg font-semibold text-slate-600">{t(bi('of', 'daripada'))} {money(limit)}</span></p>
        <div className="relative">
          <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={t(bi('Share of your limit used', 'Peratusan had yang digunakan'))} className="h-5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full rounded-full ${barColour}`} style={{ width: `${shown}%` }} />
          </div>
          <div aria-hidden="true" className="absolute -top-1 h-7 border-l-2 border-dashed border-slate-900" style={{ left: `${UTILISATION_TARGET}%` }} />
          <p aria-hidden="true" className="absolute top-7 -translate-x-1/2 text-xs font-semibold text-slate-700" style={{ left: `${UTILISATION_TARGET}%` }}>{UTILISATION_TARGET}% {t(bi('target', 'sasaran'))}</p>
        </div>
        <p className="pt-4 text-xl font-extrabold">
          <span aria-hidden="true">{band.symbol} </span>{pct}% {t(bi('used', 'digunakan'))}: {t(band.label)}
        </p>
        <Callout tone={band.tone}>{t(band.tip)}</Callout>
        {sum.overLimit && (
          <Callout tone="bad" title={t(bi('Above your limit', 'Melebihi had anda'))}>
            {t(bi('Your spending is more than your limit. A card can be declined and extra fees may apply.', 'Perbelanjaan anda melebihi had. Kad boleh ditolak dan yuran tambahan mungkin dikenakan.'))}
          </Callout>
        )}
      </Card>

      {sum.byCategory.length > 0 && (
        <Card>
          <h3 className="mb-2 text-lg font-extrabold">{t(bi('Where it went', 'Ke mana perginya'))}</h3>
          <ul className="space-y-2">
            {sum.byCategory.map((c) => (
              <li key={c.category}>
                <div className="flex items-baseline justify-between gap-2">
                  <span><span aria-hidden="true">{CATEGORY_LABEL[c.category].icon} </span>{t(CATEGORY_LABEL[c.category].label)}</span>
                  <span className="font-bold">{money(c.total, 2)} · {c.percent}%</span>
                </div>
                <div aria-hidden="true" className="h-2 rounded-full bg-slate-200"><div className="h-full rounded-full bg-cyan-600" style={{ width: `${c.percent}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}

// ---------- Spend form and list ----------

export function SpendForm({ onAdd }: { onAdd: (t: Omit<Txn, 'id'>) => void }) {
  const { t } = useLang();
  const today = todayIso();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState<Category>('food');
  const [note, setNote] = useState('');
  const [errs, setErrs] = useState<{ amount?: Bi; date?: Bi }>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseAmount(amount);
    const next: typeof errs = {};
    if (Number.isNaN(n) || n <= 0) next.amount = { en: 'Please type how much you spent, more than RM0.', ms: 'Sila taip jumlah yang dibelanjakan, lebih daripada RM0.' };
    else if (n > 100_000) next.amount = { en: 'That looks too high. Please check the amount.', ms: 'Jumlah ini nampak terlalu tinggi. Sila semak.' };
    if (!isIsoDate(date)) next.date = { en: 'Please pick a date.', ms: 'Sila pilih tarikh.' };
    else if (date > today) next.date = { en: 'Please pick today or an earlier date.', ms: 'Sila pilih hari ini atau tarikh sebelumnya.' };
    setErrs(next);
    if (Object.keys(next).length > 0) {
      setTimeout(() => document.querySelector<HTMLElement>('form[data-spend] [aria-invalid="true"]')?.focus(), 30);
      return;
    }
    onAdd({ date, amount: Math.round(n * 100) / 100, category, note: note.trim().slice(0, 60) });
    setAmount('');
    setNote('');
  }

  return (
    <form data-spend onSubmit={submit} noValidate className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={bi('How much did you spend? (RM)', 'Berapa yang anda belanjakan? (RM)')} error={errs.amount}>
          {({ id, describedBy, invalid }) => <input id={id} inputMode="decimal" value={amount} aria-invalid={invalid} aria-describedby={describedBy} onChange={(e) => setAmount(e.target.value)} className={inputClass(invalid)} placeholder="45.50" />}
        </Field>
        <Field label={bi('Date', 'Tarikh')} error={errs.date}>
          {({ id, describedBy, invalid }) => <input id={id} type="date" max={today} value={date} aria-invalid={invalid} aria-describedby={describedBy} onChange={(e) => setDate(e.target.value)} className={inputClass(invalid)} />}
        </Field>
        <Field label={bi('What was it for?', 'Untuk apa?')}>
          {({ id }) => (
            <select id={id} value={category} onChange={(e) => setCategory(e.target.value as Category)} className="min-h-12 w-full rounded-xl border-2 border-slate-400 bg-white px-3 text-lg">
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c].icon} {t(CATEGORY_LABEL[c].label)}</option>)}
            </select>
          )}
        </Field>
        <Field label={bi('Note (optional)', 'Nota (pilihan)')}>
          {({ id }) => <input id={id} value={note} maxLength={60} onChange={(e) => setNote(e.target.value)} className={inputClass(false)} />}
        </Field>
      </div>
      <Button type="submit">{t(bi('Add spend', 'Tambah perbelanjaan'))}</Button>
    </form>
  );
}

export function SpendList({ txns, onDelete }: { txns: Txn[]; onDelete: (id: string) => void }) {
  const { t, lang } = useLang();
  if (txns.length === 0) return <p className="rounded-2xl bg-slate-50 p-4 text-lg">{t(bi('No spending logged in this month yet.', 'Belum ada perbelanjaan direkod bulan ini.'))}</p>;
  return (
    <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {[...txns].sort((a, b) => b.date.localeCompare(a.date)).map((x) => (
        <li key={x.id} className="flex items-center justify-between gap-3 p-3">
          <div className="min-w-0">
            <p className="font-bold">
              <span aria-hidden="true">{CATEGORY_LABEL[x.category].icon} </span>{money(x.amount, 2)} · {t(CATEGORY_LABEL[x.category].label)}
            </p>
            <p className="truncate text-sm text-slate-600">{fmtDate(x.date, lang)}{x.note ? ` · ${x.note}` : ''}</p>
          </div>
          <Button variant="ghost" onClick={() => onDelete(x.id)} aria-label={`${t(bi('Delete', 'Padam'))} ${money(x.amount, 2)} ${fmtDate(x.date, lang)}`}>{t(bi('Delete', 'Padam'))}</Button>
        </li>
      ))}
    </ul>
  );
}

// ---------- Tracker ----------

export function Tracker({ sum }: { sum: UsageSummary }) {
  const { t, lang } = useLang();
  return (
    <section aria-labelledby="track-h" className="space-y-3">
      <h2 id="track-h" className="text-2xl font-extrabold">{t(bi('Your credit-building tracker', 'Penjejak pembinaan kredit anda'))}</h2>
      <Card className="space-y-3">
        <p className="text-3xl font-extrabold">{t(bi('On-time payments', 'Bayaran tepat masa'))}: {sum.onTimeCount} {t(bi('out of 3', 'daripada 3'))}</p>
        {sum.recent.length === 0 ? (
          <p className="text-lg text-slate-700">{t(bi('Your statements will show up here after your first statement date.', 'Penyata anda akan dipaparkan di sini selepas tarikh penyata pertama anda.'))}</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {sum.recent.map((s) => (
              <li key={s.cycle.end} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="font-semibold">{fmtMonth(s.cycle.end, lang)} · {money(s.balance, 2)}</span>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        )}
        <p className="text-base text-slate-700">
          {t(bi('Paying at least the minimum by the due date builds a good record. Paying in full also saves you interest.', 'Membayar sekurang-kurangnya minimum sebelum tarikh akhir membina rekod yang baik. Membayar penuh juga menjimatkan faedah anda.'))}
        </p>
      </Card>
    </section>
  );
}

// ---------- Settings and reminders ----------

export function Settings({ use, onChange, onDownload, onSample, onClear, canDownload }: { use: UseState; onChange: (p: Partial<UseState>) => void; onDownload: () => void; onSample: () => void; onClear: () => void; canDownload: boolean }) {
  const { t } = useLang();
  const [limitText, setLimitText] = useState(String(use.limit));
  const [limitErr, setLimitErr] = useState<Bi | undefined>();
  const [confirm, setConfirm] = useState(false);
  const days: DaysBefore[] = [1, 3, 5, 7];

  function changeLimit(v: string) {
    setLimitText(v);
    const n = parseAmount(v);
    if (Number.isNaN(n) || n <= 0) {
      setLimitErr({ en: 'Please type your credit limit, more than RM0. We keep using the last good value.', ms: 'Sila taip had kredit anda, lebih daripada RM0. Kami terus guna nilai baik terakhir.' });
      return;
    }
    setLimitErr(undefined);
    onChange({ limit: n });
  }

  return (
    <section aria-labelledby="set-h" className="space-y-4">
      <h2 id="set-h" className="text-2xl font-extrabold">{t(bi('Settings and reminders', 'Tetapan dan peringatan'))}</h2>
      <Card className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={bi('Your credit limit (RM)', 'Had kredit anda (RM)')} hint={bi('You find this in your approval message.', 'Anda boleh jumpa ini dalam mesej kelulusan.')} error={limitErr}>
            {({ id, describedBy, invalid }) => <input id={id} inputMode="decimal" value={limitText} aria-invalid={invalid} aria-describedby={describedBy} onChange={(e) => changeLimit(e.target.value)} className={inputClass(invalid)} />}
          </Field>
          <Field label={bi('Statement day of the month', 'Hari penyata dalam sebulan')} hint={bi('The day your card closes the month. Find it on your statement.', 'Hari kad anda menutup bulan. Anda boleh jumpa pada penyata.')}>
            {({ id, describedBy }) => (
              <select id={id} aria-describedby={describedBy} value={use.statementDay} onChange={(e) => onChange({ statementDay: Number(e.target.value) })} className="min-h-12 w-full rounded-xl border-2 border-slate-400 bg-white px-3 text-lg">
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </Field>
        </div>

        <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
          <label className="flex min-h-12 cursor-pointer items-center gap-3 font-semibold">
            <input type="checkbox" className="h-5 w-5" checked={use.reminderOn} onChange={(e) => onChange({ reminderOn: e.target.checked })} />
            {t(bi('Remind me before my bill is due', 'Ingatkan saya sebelum bil saya tamat tempoh'))}
          </label>
          {use.reminderOn && (
            <div>
              <label htmlFor="days" className="mb-1 block font-semibold">{t(bi('How many days before?', 'Berapa hari sebelum?'))}</label>
              <select id="days" value={use.daysBefore} onChange={(e) => onChange({ daysBefore: Number(e.target.value) as DaysBefore })} className="min-h-12 w-full max-w-xs rounded-xl border-2 border-slate-400 bg-white px-3 text-lg">
                {days.map((d) => <option key={d} value={d}>{d} {d === 1 ? t(bi('day', 'hari')) : t(bi('days', 'hari'))}</option>)}
              </select>
            </div>
          )}
          <p className="text-sm text-slate-700">{t(bi('In this prototype, reminders show up inside the app only. To get a phone alert, download the calendar file below.', 'Dalam prototaip ini, peringatan hanya dipaparkan dalam aplikasi. Untuk amaran telefon, muat turun fail kalendar di bawah.'))}</p>
          <Button variant="secondary" onClick={onDownload} disabled={!canDownload}>{t(bi('Download calendar reminders (.ics)', 'Muat turun peringatan kalendar (.ics)'))}</Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
          <Button variant="secondary" onClick={onSample}>{t(bi('Load sample spending', 'Muatkan perbelanjaan sampel'))}</Button>
          {!confirm ? (
            <Button variant="ghost" onClick={() => setConfirm(true)}>{t(bi('Clear all', 'Kosongkan semua'))}</Button>
          ) : (
            <span className="flex flex-wrap items-center gap-2" role="group" aria-label={t(bi('Confirm clear', 'Sahkan kosongkan'))}>
              <span className="font-semibold">{t(bi('Delete all spending and payments?', 'Padam semua perbelanjaan dan bayaran?'))}</span>
              <Button onClick={() => { setConfirm(false); onClear(); }}>{t(bi('Yes, clear', 'Ya, kosongkan'))}</Button>
              <Button variant="secondary" onClick={() => setConfirm(false)}>{t(bi('Cancel', 'Batal'))}</Button>
            </span>
          )}
        </div>
      </Card>
    </section>
  );
}
