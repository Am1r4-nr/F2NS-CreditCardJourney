import { useState, type ReactNode } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import type { Bi } from '../lib/eligibility.ts';
import type { Draft, IncomeType, ProofMethod, Submission } from '../state/types.ts';
import { EMPLOYMENT_LABEL } from '../state/personas.ts';
import { DECISION_TIME, RATES } from '../config/rates.ts';
import { BANK_ACCESS, DOCUMENTS, PROOF_OPTIONS } from '../data/documents.ts';
import type { CardRecord } from '../data/cardTypes.ts';
import { money, parseAmount } from '../lib/format.ts';
import { scanMyKad, verifyIncome } from '../lib/mockApi.ts';
import { Badge, Button, Callout, Card, Field, inputClass, Spinner, WhyAsk } from './ui.tsx';

export interface QProps {
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  error?: Bi;
  onBlur: () => void;
}

// ---------- Document checklist (shown before any question) ----------

export function DocChecklist() {
  const { t } = useLang();
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {DOCUMENTS.map((d) => (
        <li key={d.id}>
          <Card className="h-full">
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="text-3xl">{d.icon}</span>
              <div>
                <h3 className="text-lg font-extrabold">{t(d.name)}</h3>
                <p className="text-base text-slate-700">{t(d.why)}</p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-slate-50 p-3">
              <p className="text-sm font-bold text-cyan-900">{t(bi('Do not have it? You can:', 'Tiada? Anda boleh:'))}</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-base">
                {d.alternatives.map((a, i) => <li key={i}>{t(a)}</li>)}
              </ul>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

// ---------- Step 1: identity ----------

const why = {
  ic: bi('Your IC number is how banks tell you apart from other people. In this prototype we only show a masked sample and never collect a real one.', 'Nombor IC ialah cara bank membezakan anda daripada orang lain. Dalam prototaip ini kami hanya tunjuk sampel bertopeng dan tidak mengumpul yang sebenar.'),
  dob: bi('We need your date of birth to check you are old enough to hold a credit card.', 'Kami perlukan tarikh lahir anda untuk menyemak anda cukup umur memegang kad kredit.'),
  address: bi('We send your card and statements here, and the law asks us to know where you live.', 'Kami hantar kad dan penyata anda ke sini, dan undang-undang meminta kami tahu di mana anda tinggal.'),
  phone: bi('We text you a code to confirm it is you, and call if something looks wrong on your account. We never ask for your TAC.', 'Kami hantar kod melalui SMS untuk mengesahkan ia anda, dan menelefon jika ada yang tidak kena. Kami tidak pernah meminta TAC anda.'),
  email: bi('We send your agreement and statements here.', 'Kami hantar perjanjian dan penyata anda ke sini.'),
  employment: bi('Different kinds of work have different ways to prove income. This helps us suggest the right one.', 'Jenis kerja berbeza ada cara berbeza untuk membuktikan pendapatan. Ini membantu kami mencadangkan yang sesuai.'),
  income: bi('We check you can afford the monthly payments. A rough average is fine. We confirm it in the next step.', 'Kami semak anda mampu membayar ansuran bulanan. Purata kasar pun boleh. Kami sahkan dalam langkah seterusnya.'),
  commitments: bi('We compare what you already pay with what you earn, so you do not take on more than you can handle.', 'Kami bandingkan apa yang sudah anda bayar dengan pendapatan, supaya anda tidak menanggung lebih daripada kemampuan.'),
  proof: bi('We need to see that money comes in regularly. We only look at totals, never at who you paid.', 'Kami perlu lihat wang masuk secara tetap. Kami hanya lihat jumlah, tidak pernah kepada siapa anda bayar.'),
};

export function IdentityQ({ draft, patch, error }: QProps) {
  const { t } = useLang();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const has = draft.scanned || draft.manualIdentity;

  async function scan() {
    setBusy(true);
    setFailed(false);
    try {
      const identity = await scanMyKad();
      patch({ scanned: true, manualIdentity: false, identity });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="q-scan" className="space-y-4">
      <h3 id="q-scan" className="text-2xl font-extrabold">{t(bi('Let’s confirm who you are', 'Mari sahkan siapa anda'))}</h3>

      {!has && (
        <>
          <p className="text-lg text-slate-700">{t(bi('Scan your MyKad with your phone. We fill in the rest, so you do not need to type.', 'Imbas MyKad anda dengan telefon. Kami isikan selebihnya, jadi anda tidak perlu menaip.'))}</p>
          <div className="grid gap-4 rounded-3xl border-2 border-dashed border-cyan-400 bg-cyan-50 p-6 text-center">
            <p className="text-5xl" aria-hidden="true">🪪</p>
            <Button onClick={() => void scan()} disabled={busy} className="mx-auto w-full max-w-xs">
              {busy ? <Spinner label={t(bi('Reading your MyKad…', 'Membaca MyKad anda…'))} /> : t(bi('Scan MyKad (simulated)', 'Imbas MyKad (simulasi)'))}
            </Button>
            <p className="text-sm text-slate-600">{t(bi('In this prototype the scan fills in a fake sample person.', 'Dalam prototaip ini imbasan mengisi seorang individu sampel palsu.'))}</p>
          </div>
          {failed && <Callout tone="bad" title={t(bi('We could not read your MyKad', 'Kami tidak dapat membaca MyKad anda'))}>{t(bi('Try again in better light, or type your details instead.', 'Cuba lagi dalam cahaya yang lebih baik, atau taip butiran anda.'))}</Callout>}
          <Button variant="ghost" onClick={() => patch({ manualIdentity: true, scanned: false })}>{t(bi('Camera not working? Type my details instead', 'Kamera tidak berfungsi? Taip butiran saya'))}</Button>
        </>
      )}

      {draft.scanned && (
        <>
          <Callout tone="good" title={t(bi('Done. We filled this in for you.', 'Siap. Kami telah mengisinya untuk anda.'))}>
            {t(bi('Please check it looks right. You do not need to type anything.', 'Sila semak ia betul. Anda tidak perlu menaip apa-apa.'))}
          </Callout>
          <dl className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            <Row label={bi('Full name', 'Nama penuh')} value={draft.identity.name} />
            <Row label={bi('IC number (masked sample)', 'Nombor IC (sampel bertopeng)')} value={draft.identity.ic} why={why.ic} />
            <Row label={bi('Date of birth', 'Tarikh lahir')} value={draft.identity.dob} why={why.dob} />
            <Row label={bi('Home address', 'Alamat rumah')} value={draft.identity.address} why={why.address} />
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => patch({ scanned: false, manualIdentity: true })}>{t(bi('Something is wrong. Edit by hand', 'Ada yang salah. Edit secara manual'))}</Button>
            <Button variant="ghost" onClick={() => void scan()} disabled={busy}>{busy ? t(bi('Scanning…', 'Mengimbas…')) : t(bi('Scan again', 'Imbas semula'))}</Button>
          </div>
        </>
      )}

      {draft.manualIdentity && !draft.scanned && (
        <div className="space-y-5">
          <Callout tone="info">{t(bi('Type your details as they are on your MyKad. We do not collect your IC number in this prototype.', 'Taip butiran anda seperti pada MyKad. Kami tidak mengumpul nombor IC anda dalam prototaip ini.'))}</Callout>
          <Field label={bi('Full name', 'Nama penuh')}>
            {({ id }) => <input id={id} autoComplete="name" value={draft.identity.name} onChange={(e) => patch({ identity: { ...draft.identity, name: e.target.value } })} className={inputClass(false)} />}
          </Field>
          <Field label={bi('Date of birth', 'Tarikh lahir')} why={why.dob}>
            {({ id }) => <input id={id} type="date" autoComplete="bday" value={draft.identity.dob} onChange={(e) => patch({ identity: { ...draft.identity, dob: e.target.value } })} className={inputClass(false)} />}
          </Field>
          <Field label={bi('Home address', 'Alamat rumah')} why={why.address}>
            {({ id }) => <textarea id={id} rows={3} autoComplete="street-address" value={draft.identity.address} onChange={(e) => patch({ identity: { ...draft.identity, address: e.target.value } })} className={inputClass(false)} />}
          </Field>
          <Button variant="ghost" onClick={() => patch({ manualIdentity: false })}>{t(bi('Use the MyKad scan instead', 'Guna imbasan MyKad sebaliknya'))}</Button>
        </div>
      )}

      {error && <p role="alert" className="text-base font-semibold text-rose-700">{t(error)}</p>}
    </section>
  );
}

function Row({ label, value, why: w }: { label: Bi; value: string; why?: Bi }) {
  const { t } = useLang();
  return (
    <div className="p-3">
      <dt className="text-sm text-slate-600">{t(label)}</dt>
      <dd className="text-lg font-bold">{value}</dd>
      {w && <WhyAsk reason={w} />}
    </div>
  );
}

// ---------- Step 2 and 3: simple fields ----------

export function PhoneQ({ draft, patch, error, onBlur }: QProps) {
  return (
    <Field label={bi('What is your mobile number?', 'Apakah nombor telefon bimbit anda?')} hint={bi('For example 012-345 6789', 'Contohnya 012-345 6789')} error={error} why={why.phone}>
      {({ id, describedBy, invalid }) => (
        <input id={id} type="tel" inputMode="tel" autoComplete="tel" value={draft.phone} aria-invalid={invalid} aria-describedby={describedBy} onBlur={onBlur} onChange={(e) => patch({ phone: e.target.value })} className={inputClass(invalid)} />
      )}
    </Field>
  );
}

export function EmailQ({ draft, patch, error, onBlur }: QProps) {
  return (
    <Field label={bi('What is your email address?', 'Apakah alamat e-mel anda?')} error={error} why={why.email}>
      {({ id, describedBy, invalid }) => (
        <input id={id} type="email" inputMode="email" autoComplete="email" value={draft.email} aria-invalid={invalid} aria-describedby={describedBy} onBlur={onBlur} onChange={(e) => patch({ email: e.target.value })} className={inputClass(invalid)} />
      )}
    </Field>
  );
}

export function EmploymentQ({ draft, patch }: QProps) {
  const { t } = useLang();
  const types: IncomeType[] = ['salaried', 'gig', 'parttime', 'student'];
  return (
    <fieldset>
      <legend className="mb-1 text-lg font-semibold">{t(bi('How do you earn money?', 'Bagaimana anda mendapat wang?'))}</legend>
      <div className="grid grid-cols-2 gap-2">
        {types.map((k) => (
          <label key={k} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 text-base font-semibold ${draft.employment === k ? 'border-cyan-700 bg-cyan-50' : 'border-slate-300 bg-white'}`}>
            <input type="radio" name="employment" className="h-5 w-5" checked={draft.employment === k} onChange={() => patch({ employment: k })} />
            {t(EMPLOYMENT_LABEL[k])}
          </label>
        ))}
      </div>
      <div className="mt-1"><WhyAsk reason={why.employment} /></div>
    </fieldset>
  );
}

export function IncomeQ({ draft, patch, error, onBlur }: QProps) {
  return (
    <Field
      label={bi('About how much do you earn in a usual month? (RM)', 'Kira-kira berapa pendapatan anda dalam bulan biasa? (RM)')}
      hint={bi('A rough average is fine. Gig workers: think of a typical month.', 'Purata kasar pun boleh. Pekerja gig: fikirkan bulan biasa.')}
      error={error}
      why={why.income}
    >
      {({ id, describedBy, invalid }) => (
        <input id={id} inputMode="decimal" value={draft.income} aria-invalid={invalid} aria-describedby={describedBy} onBlur={onBlur} onChange={(e) => patch({ income: e.target.value })} className={inputClass(invalid)} placeholder="2800" />
      )}
    </Field>
  );
}

export function CommitmentsQ({ draft, patch, error, onBlur }: QProps) {
  return (
    <Field
      label={bi('How much do you already pay each month on loans or bills? (RM)', 'Berapa yang sudah anda bayar sebulan untuk pinjaman atau bil? (RM)')}
      hint={bi('For example car or phone instalments, PTPTN, BNPL. Leave blank if none.', 'Contohnya ansuran kereta atau telefon, PTPTN, BNPL. Biarkan kosong jika tiada.')}
      error={error}
      why={why.commitments}
    >
      {({ id, describedBy, invalid }) => (
        <input id={id} inputMode="decimal" value={draft.commitments} aria-invalid={invalid} aria-describedby={describedBy} onBlur={onBlur} onChange={(e) => patch({ commitments: e.target.value })} className={inputClass(invalid)} placeholder="500" />
      )}
    </Field>
  );
}

// ---------- Step 4: income proof ----------

export function ProofQ({ draft, patch, error }: QProps) {
  const { t } = useLang();
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState<'bank' | 'wallet'>('bank');
  const done = draft.proof && draft.proof.method === draft.proofMethod ? draft.proof : null;

  function choose(m: ProofMethod) {
    if (m === draft.proofMethod) return;
    patch({ proofMethod: m, proof: null, consent: false });
  }

  async function run(fileName?: string) {
    setBusy(true);
    try {
      const label = draft.proofMethod === 'bank' ? (provider === 'bank' ? 'My bank account (sample)' : 'My e-wallet (sample)') : fileName;
      const proof = await verifyIncome(draft.proofMethod, parseAmount(draft.income), label);
      patch({ proof });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="q-proof" className="space-y-4">
      <h3 id="q-proof" className="text-2xl font-extrabold">{t(bi('How would you like to prove your income?', 'Bagaimana anda mahu membuktikan pendapatan?'))}</h3>
      <p className="text-lg text-slate-700">{t(bi('Pick one. No payslip? That is fine.', 'Pilih satu. Tiada slip gaji? Tidak mengapa.'))}</p>
      <WhyAsk reason={why.proof} />

      <fieldset>
        <legend className="sr-only">{t(bi('Income proof options', 'Pilihan bukti pendapatan'))}</legend>
        <div className="grid gap-3 lg:grid-cols-3">
          {PROOF_OPTIONS.map((o) => {
            const on = draft.proofMethod === o.id;
            return (
              <label key={o.id} className={`flex cursor-pointer flex-col gap-2 rounded-3xl border-2 p-4 ${on ? 'border-cyan-700 bg-cyan-50' : 'border-slate-300 bg-white'}`}>
                <span className="flex items-center gap-2">
                  <input type="radio" name="proof" className="h-5 w-5" checked={on} onChange={() => choose(o.id)} />
                  <span aria-hidden="true" className="text-2xl">{o.icon}</span>
                  <span className="text-lg font-extrabold leading-tight">{t(o.title)}</span>
                </span>
                {o.id === 'bank' && <span><Badge tone="good">★ {t(bi('Recommended', 'Disyorkan'))}</Badge></span>}
                <span className="text-base">{t(o.summary)}</span>
                <span className="rounded-xl bg-white/70 p-2 text-sm text-slate-800">🛵 <strong>{t(bi('For gig workers: ', 'Untuk pekerja gig: '))}</strong>{t(o.helpsGig)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {!done && draft.proofMethod === 'bank' && (
        <Card className="space-y-4">
          <h4 className="text-xl font-extrabold">{t(bi('What we can and cannot see', 'Apa yang kami boleh dan tidak boleh lihat'))}</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3">
              <p className="font-extrabold text-emerald-900">✔ {t(bi('We can see (last 6 months)', 'Kami boleh lihat (6 bulan terakhir)'))}</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">{BANK_ACCESS.yes.map((x, i) => <li key={i}>{t(x)}</li>)}</ul>
            </div>
            <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3">
              <p className="font-extrabold text-rose-900">✘ {t(bi('We can never see', 'Kami tidak boleh lihat sama sekali'))}</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">{BANK_ACCESS.no.map((x, i) => <li key={i}>{t(x)}</li>)}</ul>
            </div>
          </div>
          <p className="text-base">🔒 {t(bi('This is read-only. You can take back permission at any time in your bank or e-wallet app.', 'Ini baca sahaja. Anda boleh tarik balik kebenaran bila-bila masa dalam aplikasi bank atau e-dompet anda.'))}</p>
          <div>
            <label htmlFor="provider" className="mb-1 block font-semibold">{t(bi('Which account?', 'Akaun yang mana?'))}</label>
            <select id="provider" value={provider} onChange={(e) => setProvider(e.target.value as 'bank' | 'wallet')} className="min-h-12 w-full max-w-sm rounded-xl border-2 border-slate-400 bg-white px-3 text-base">
              <option value="bank">{t(bi('My bank account (sample)', 'Akaun bank saya (sampel)'))}</option>
              <option value="wallet">{t(bi('My e-wallet (sample)', 'E-dompet saya (sampel)'))}</option>
            </select>
          </div>
          <ConsentAndGo consent={draft.consent} onConsent={(v) => patch({ consent: v })} busy={busy} onGo={() => void run()} label={bi('I agree to a read-only look at my last 6 months.', 'Saya bersetuju untuk paparan baca sahaja 6 bulan terakhir saya.')} go={bi('Connect (simulated)', 'Hubungkan (simulasi)')} busyText={bi('Connecting safely…', 'Menyambung dengan selamat…')} />
        </Card>
      )}

      {!done && draft.proofMethod === 'lhdn' && (
        <Card className="space-y-4">
          <h4 className="text-xl font-extrabold">{t(bi('Check your LHDN record', 'Semak rekod LHDN anda'))}</h4>
          <p>{t(bi('We ask LHDN for the yearly income you declared. We do not see your tax returns in full, only the income figure.', 'Kami minta LHDN untuk pendapatan tahunan yang anda isytiharkan. Kami tidak melihat penyata cukai penuh, hanya angka pendapatan.'))}</p>
          <ConsentAndGo consent={draft.consent} onConsent={(v) => patch({ consent: v })} busy={busy} onGo={() => void run()} label={bi('I agree to let KAF check my declared income with LHDN.', 'Saya bersetuju KAF menyemak pendapatan yang saya isytiharkan dengan LHDN.')} go={bi('Check LHDN record (simulated)', 'Semak rekod LHDN (simulasi)')} busyText={bi('Checking…', 'Menyemak…')} />
        </Card>
      )}

      {!done && draft.proofMethod === 'upload' && (
        <Card className="space-y-3">
          <h4 className="text-xl font-extrabold">{t(bi('Add your file', 'Tambah fail anda'))}</h4>
          <p>{t(bi('A payslip, or an earnings statement from your delivery or e-hailing app. Up to 6 months is best.', 'Slip gaji, atau penyata pendapatan daripada aplikasi penghantaran atau e-hailing anda. Sehingga 6 bulan adalah terbaik.'))}</p>
          <Field label={bi('Choose a file', 'Pilih fail')} hint={bi('PDF, photo or spreadsheet. In this prototype the file never leaves your device.', 'PDF, foto atau hamparan. Dalam prototaip ini fail tidak meninggalkan peranti anda.')}>
            {({ id, describedBy }) => (
              <input id={id} type="file" accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx" aria-describedby={describedBy} disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void run(f.name); }} className="min-h-12 w-full rounded-xl border-2 border-slate-400 bg-white p-2 text-base file:mr-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-cyan-700 file:px-4 file:font-semibold file:text-white" />
            )}
          </Field>
          {busy && <Spinner label={t(bi('Checking your file…', 'Menyemak fail anda…'))} />}
        </Card>
      )}

      {done && (
        <Card className="space-y-3 border-emerald-300 bg-emerald-50">
          <h4 className="text-xl font-extrabold text-emerald-900">✔ {t(bi('Income proof added', 'Bukti pendapatan ditambah'))}</h4>
          <p className="text-sm text-slate-700">{done.source}</p>
          <dl className="grid grid-cols-3 gap-2 text-center">
            <Stat label={bi('Average a month', 'Purata sebulan')} value={money(done.avgMonthly)} strong />
            <Stat label={bi('Lowest month', 'Bulan terendah')} value={money(done.lowest)} />
            <Stat label={bi('Highest month', 'Bulan tertinggi')} value={money(done.highest)} />
          </dl>
          <p className="text-base">{t(bi('Some months were lower than others. That is normal for gig work. We use the 6-month average.', 'Sesetengah bulan lebih rendah daripada yang lain. Itu biasa untuk kerja gig. Kami guna purata 6 bulan.'))}</p>
          <div><Button variant="secondary" onClick={() => patch({ proof: null, consent: false })}>{t(bi('Remove and choose again', 'Buang dan pilih semula'))}</Button></div>
        </Card>
      )}

      {error && <p role="alert" className="text-base font-semibold text-rose-700">{t(error)}</p>}
    </section>
  );
}

function Stat({ label, value, strong }: { label: Bi; value: string; strong?: boolean }) {
  const { t } = useLang();
  return (
    <div className="rounded-xl bg-white p-2">
      <dt className="text-xs text-slate-600">{t(label)}</dt>
      <dd className={strong ? 'text-xl font-extrabold' : 'text-lg font-bold'}>{value}</dd>
    </div>
  );
}

function ConsentAndGo({ consent, onConsent, busy, onGo, label, go, busyText }: { consent: boolean; onConsent: (v: boolean) => void; busy: boolean; onGo: () => void; label: Bi; go: Bi; busyText: Bi }) {
  const { t } = useLang();
  return (
    <div className="space-y-3">
      <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border-2 border-slate-300 p-3 font-semibold">
        <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0" checked={consent} onChange={(e) => onConsent(e.target.checked)} />
        {t(label)}
      </label>
      <Button onClick={onGo} disabled={!consent || busy} className="w-full sm:w-auto">
        {busy ? <Spinner label={t(busyText)} /> : t(go)}
      </Button>
      {!consent && <p className="text-sm text-slate-600">{t(bi('Tick the box to continue.', 'Tandakan kotak untuk meneruskan.'))}</p>}
    </div>
  );
}

// ---------- Step 5: review and cost summary ----------

export function CostSummary({ card }: { card?: CardRecord }) {
  const { t } = useLang();
  const R = RATES;
  const rate = card?.interestPa ?? R.aprPercent;
  const rows: { label: Bi; value: Bi }[] = [
    { label: bi('Card', 'Kad'), value: card ? { en: `${card.bank} ${card.name}`, ms: `${card.bank} ${card.name}` } : { en: 'KAF First Card (standard example terms)', ms: 'KAF First Card (terma contoh standard)' } },
    { label: bi('Interest rate', 'Kadar faedah'), value: { en: `${rate}% a year, only on what you do not pay by the due date`, ms: `${rate}% setahun, hanya atas yang tidak dibayar sebelum tarikh akhir` } },
    { label: bi('Minimum payment', 'Bayaran minimum'), value: { en: `${card?.minPayment.percent ?? R.minPaymentPercent}% of what you owe or ${money(card?.minPayment.floor ?? R.minPaymentFloor)}, whichever is higher`, ms: `${card?.minPayment.percent ?? R.minPaymentPercent}% daripada hutang atau ${money(card?.minPayment.floor ?? R.minPaymentFloor)}, mana yang lebih tinggi` } },
    { label: bi('Late payment fee', 'Fi bayaran lewat'), value: { en: `${money(card?.lateFee.flat ?? R.lateFeeFlat)} or ${card?.lateFee.percent ?? R.lateFeePercent}% of what you owe, whichever is higher`, ms: `${money(card?.lateFee.flat ?? R.lateFeeFlat)} atau ${card?.lateFee.percent ?? R.lateFeePercent}% daripada hutang, mana yang lebih tinggi` } },
    {
      label: bi('Annual fee', 'Yuran tahunan'),
      value: card
        ? card.annualFee === 0
          ? { en: 'RM0', ms: 'RM0' }
          : { en: `${money(card.annualFee)}. ${card.annualFeeWaiver?.en ?? ''}`, ms: `${money(card.annualFee)}. ${card.annualFeeWaiver?.ms ?? ''}` }
        : { en: `${money(R.annualFeeFirstYear)} in year 1, then ${money(R.annualFeeAfter)}`, ms: `${money(R.annualFeeFirstYear)} pada tahun 1, kemudian ${money(R.annualFeeAfter)}` },
    },
    { label: bi('Service tax', 'Cukai perkhidmatan'), value: { en: `${money(R.serviceTaxPerYear)} a year (government tax)`, ms: `${money(R.serviceTaxPerYear)} setahun (cukai kerajaan)` } },
    { label: bi('Cash advance fee', 'Fi pendahuluan tunai'), value: { en: `${card?.cashAdvance.percent ?? R.cashAdvancePercent}% (at least ${money(card?.cashAdvance.min ?? R.cashAdvanceMin)}). Interest starts at once.`, ms: `${card?.cashAdvance.percent ?? R.cashAdvancePercent}% (sekurang-kurangnya ${money(card?.cashAdvance.min ?? R.cashAdvanceMin)}). Faedah bermula serta-merta.` } },
    { label: bi('Foreign currency fee', 'Fi mata wang asing'), value: { en: `${card?.fxFeePercent ?? R.fxFeePercent}% on purchases in another currency`, ms: `${card?.fxFeePercent ?? R.fxFeePercent}% untuk pembelian dalam mata wang lain` } },
    { label: bi('Credit limit', 'Had kredit'), value: { en: `${money(R.limitMin)} to ${money(R.limitMax)}, set after review`, ms: `${money(R.limitMin)} hingga ${money(R.limitMax)}, ditetapkan selepas semakan` } },
    { label: bi('Decision time', 'Masa keputusan'), value: { en: `In-principle answer now. Final approval ${DECISION_TIME.en}.`, ms: `Jawapan dalam prinsip sekarang. Kelulusan akhir ${DECISION_TIME.ms}.` } },
  ];
  return (
    <Card className="space-y-2">
      <h4 className="text-xl font-extrabold">{t(bi('Every cost, before you submit', 'Setiap kos, sebelum anda hantar'))}</h4>
      <dl className="divide-y divide-slate-200">
        {rows.map((r) => (
          <div key={r.label.en} className="grid gap-1 py-2 sm:grid-cols-[12rem_1fr]">
            <dt className="font-semibold">{t(r.label)}</dt>
            <dd>{t(r.value)}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-slate-600">{t(bi('No other fees. Figures are illustrative only, not a real bank offer.', 'Tiada yuran lain. Angka hanya sebagai contoh, bukan tawaran bank sebenar.'))}</p>
    </Card>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: Bi; onEdit: () => void; children: ReactNode }) {
  const { t } = useLang();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-extrabold">{t(title)}</h4>
        <Button variant="ghost" onClick={onEdit} aria-label={`${t(bi('Edit', 'Edit'))}: ${t(title)}`}>{t(bi('Edit', 'Edit'))}</Button>
      </div>
      <div className="text-base text-slate-800">{children}</div>
    </div>
  );
}

export function ReviewQ({ draft, patch, error, card, onEditStep }: QProps & { card?: CardRecord; onEditStep: (step: number) => void }) {
  const { t } = useLang();
  const income = parseAmount(draft.income);
  return (
    <section aria-labelledby="q-review" className="space-y-4">
      <h3 id="q-review" className="text-2xl font-extrabold">{t(bi('Check everything, then submit', 'Semak semuanya, kemudian hantar'))}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <ReviewBlock title={bi('Identity', 'Identiti')} onEdit={() => onEditStep(1)}>
          <p>{draft.identity.name}</p>
          <p className="text-sm text-slate-600">{draft.scanned ? draft.identity.ic : t(bi('Typed by hand', 'Ditaip secara manual'))}</p>
        </ReviewBlock>
        <ReviewBlock title={bi('Contact', 'Hubungan')} onEdit={() => onEditStep(2)}>
          <p>{draft.phone}</p>
          <p>{draft.email}</p>
        </ReviewBlock>
        <ReviewBlock title={bi('Work and income', 'Kerja dan pendapatan')} onEdit={() => onEditStep(3)}>
          <p>{t(EMPLOYMENT_LABEL[draft.employment])}</p>
          <p>{Number.isNaN(income) ? '' : `${money(income)} ${t(bi('a month', 'sebulan'))}`}</p>
        </ReviewBlock>
        <ReviewBlock title={bi('Income proof', 'Bukti pendapatan')} onEdit={() => onEditStep(4)}>
          <p>{t(PROOF_OPTIONS.find((o) => o.id === draft.proofMethod)!.title)}</p>
          {draft.proof && <p className="text-sm text-slate-600">{t(bi('Average', 'Purata'))} {money(draft.proof.avgMonthly)} {t(bi('a month', 'sebulan'))}</p>}
        </ReviewBlock>
      </div>

      <CostSummary card={card} />

      <label className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border-2 p-3 font-semibold ${error ? 'border-rose-600' : 'border-slate-300'}`}>
        <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0" checked={draft.costRead} onChange={(e) => patch({ costRead: e.target.checked })} aria-invalid={!!error} />
        {t(bi('I have read the costs above and I understand them.', 'Saya telah membaca kos di atas dan saya faham.'))}
      </label>
      {error && <p role="alert" className="text-base font-semibold text-rose-700">{t(error)}</p>}
    </section>
  );
}

// ---------- After submit ----------

export function SubmittedView({ submission, onTrack, onNew }: { submission: Submission; onTrack: () => void; onNew: () => void }) {
  const { t } = useLang();
  const v = {
    likely: { tone: 'good' as const, title: bi('Good news: you look likely to be approved', 'Berita baik: anda berkemungkinan diluluskan'), text: bi('This is an in-principle answer. We still need to verify your documents.', 'Ini jawapan dalam prinsip. Kami masih perlu mengesahkan dokumen anda.') },
    maybe: { tone: 'warn' as const, title: bi('Your application needs a closer look', 'Permohonan anda perlu disemak dengan lebih teliti'), text: bi('This is an in-principle answer. A team member will review your details.', 'Ini jawapan dalam prinsip. Seorang ahli pasukan akan menyemak butiran anda.') },
    notyet: { tone: 'bad' as const, title: bi('It may be hard to approve this time', 'Mungkin sukar diluluskan kali ini'), text: bi('This is an in-principle answer. You will get clear reasons and next steps, and you can try again later.', 'Ini jawapan dalam prinsip. Anda akan dapat sebab yang jelas dan langkah seterusnya, dan boleh cuba lagi kemudian.') },
  }[submission.inPrinciple];
  return (
    <div className="space-y-4">
      <Callout tone={v.tone} title={t(v.title)}>{t(v.text)}</Callout>
      <Card className="space-y-2">
        <p className="text-sm text-slate-600">{t(bi('Your reference number', 'Nombor rujukan anda'))}</p>
        <p className="text-3xl font-extrabold tracking-wide">{submission.ref}</p>
        <p className="text-base">{t(bi('Final approval: ', 'Kelulusan akhir: '))}<strong>{t(bi(DECISION_TIME.en, DECISION_TIME.ms))}</strong>.</p>
        <p className="text-base">{t(bi('We will message you. Remember: we never ask for your TAC or password via WhatsApp or call.', 'Kami akan menghantar mesej kepada anda. Ingat: kami tidak pernah meminta TAC atau kata laluan anda melalui WhatsApp atau panggilan.'))}</p>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button onClick={onTrack}>{t(bi('Track my application', 'Jejak permohonan saya'))}</Button>
        <Button variant="secondary" onClick={onNew}>{t(bi('Start a new application', 'Mulakan permohonan baharu'))}</Button>
      </div>
    </div>
  );
}
