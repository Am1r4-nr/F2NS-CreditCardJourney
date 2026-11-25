import { useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { href } from '../lib/router.ts';
import { Badge, Button, Callout, Card, Field, inputClass, LinkButton, PageTitle, Spinner } from '../components/ui.tsx';
import { checkReadiness, validateReady, type IncomeType, type ReadyErrors, type ReadyResult, type Verdict } from '../lib/eligibility.ts';
import { PERSONAS, EMPLOYMENT_LABEL } from '../state/personas.ts';
import { delay } from '../lib/mockApi.ts';
import { C } from '../i18n/index.tsx';

const VERDICT: Record<Verdict, { label: ReturnType<typeof bi>; tone: 'good' | 'warn' | 'bad'; line: ReturnType<typeof bi> }> = {
  likely: { label: bi('Likely', 'Berkemungkinan'), tone: 'good', line: bi('You look ready to apply.', 'Anda nampak sedia untuk memohon.') },
  maybe: { label: bi('Maybe', 'Mungkin'), tone: 'warn', line: bi('You have a fair chance. A few things need a closer look.', 'Anda ada peluang yang baik. Beberapa perkara perlu disemak lebih lanjut.') },
  notyet: { label: bi('Not yet', 'Belum lagi'), tone: 'bad', line: bi('You are not quite there yet. Here is how to get there.', 'Anda belum cukup layak. Ini cara untuk sampai ke sana.') },
};

const ICON = { good: '✅', check: '⚠️', problem: '❌' } as const;

export function ReadyPage() {
  const { t } = useLang();
  const { state, update } = useApp();
  const input = state.ready;
  const [errors, setErrors] = useState<ReadyErrors>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ReadyResult | null>(state.readyDone ? checkReadiness(input) : null);

  const set = (p: Partial<typeof input>) => update((s) => ({ ...s, ready: { ...s.ready, ...p } }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateReady(input);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    setBusy(true);
    await delay(900);
    setBusy(false);
    setResult(checkReadiness(input));
    update((s) => ({ ...s, readyDone: true, done: { ...s.done, ready: true } }));
    setTimeout(() => document.getElementById('ready-result')?.focus(), 50);
  }

  const types: IncomeType[] = ['salaried', 'gig', 'parttime', 'student'];

  return (
    <div>
      <PageTitle
        title={t(bi('Am I ready for a first card?', 'Adakah saya sedia untuk kad pertama?'))}
        intro={t(bi('Answer 4 quick questions. We will tell you if you are likely to qualify, and why.', 'Jawab 4 soalan ringkas. Kami akan beritahu jika anda berkemungkinan layak, dan sebabnya.'))}
      />
      <Callout tone="info" title={t(bi('Safe to try', 'Selamat untuk dicuba'))}>
        {t(C.noCreditImpact)} {t(bi('We do not save this on a server.', 'Kami tidak menyimpannya di pelayan.'))}
      </Callout>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="mb-2 font-semibold">{t(bi('Quick fill with an example person:', 'Isi pantas dengan contoh individu:'))}</p>
          <div className="mb-5 flex flex-wrap gap-2">
            {PERSONAS.map((p) => (
              <button key={p.id} type="button" onClick={() => { set(p.ready); setErrors({}); setResult(null); }} className="min-h-11 rounded-full border-2 border-slate-300 px-4 text-sm font-semibold hover:border-cyan-600">
                {p.name}
              </button>
            ))}
          </div>

          <form onSubmit={submit} noValidate className="space-y-5">
            <Field label={bi('How old are you?', 'Berapa umur anda?')} error={errors.age} why={bi('We can only offer cards to people who are old enough to sign a credit agreement.', 'Kami hanya boleh menawarkan kad kepada mereka yang cukup umur untuk menandatangani perjanjian kredit.')}>
              {({ id, describedBy, invalid }) => (
                <input id={id} inputMode="numeric" autoComplete="off" value={input.age} aria-invalid={invalid} aria-describedby={describedBy} onChange={(e) => set({ age: e.target.value })} className={inputClass(invalid)} placeholder="24" />
              )}
            </Field>

            <fieldset>
              <legend className="mb-1 text-lg font-semibold">{t(bi('How do you earn money?', 'Bagaimana anda mendapat wang?'))}</legend>
              <div className="grid grid-cols-2 gap-2">
                {types.map((k) => (
                  <label key={k} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 text-base font-semibold ${input.incomeType === k ? 'border-cyan-700 bg-cyan-50' : 'border-slate-300 bg-white'}`}>
                    <input type="radio" name="incomeType" className="h-5 w-5" checked={input.incomeType === k} onChange={() => set({ incomeType: k })} />
                    {t(EMPLOYMENT_LABEL[k])}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field
              label={bi('About how much do you earn each month? (RM)', 'Kira-kira berapa pendapatan bulanan anda? (RM)')}
              hint={bi('A rough average is fine. Gig workers: think of a typical month.', 'Purata kasar pun boleh. Pekerja gig: fikirkan bulan biasa.')}
              error={errors.income}
              why={bi('Income helps us check that you can afford the monthly payments. We do not need exact figures here.', 'Pendapatan membantu kami menyemak sama ada anda mampu membayar ansuran bulanan. Kami tidak perlukan angka tepat di sini.')}
            >
              {({ id, describedBy, invalid }) => (
                <input id={id} inputMode="decimal" value={input.income} aria-invalid={invalid} aria-describedby={describedBy} onChange={(e) => set({ income: e.target.value })} className={inputClass(invalid)} placeholder="2800" />
              )}
            </Field>

            <Field
              label={bi('How much do you already pay each month on loans or bills you owe? (RM)', 'Berapa yang sudah anda bayar sebulan untuk pinjaman atau bil? (RM)')}
              hint={bi('For example: car or phone instalments, PTPTN, BNPL. Leave blank or type 0 if none.', 'Contoh: ansuran kereta atau telefon, PTPTN, BNPL. Biarkan kosong atau taip 0 jika tiada.')}
              error={errors.commitments}
              why={bi('We compare what you owe with what you earn. This protects you from taking on more than you can handle.', 'Kami bandingkan apa yang anda hutang dengan pendapatan. Ini melindungi anda daripada menanggung lebih daripada kemampuan.')}
            >
              {({ id, describedBy, invalid }) => (
                <input id={id} inputMode="decimal" value={input.commitments} aria-invalid={invalid} aria-describedby={describedBy} onChange={(e) => set({ commitments: e.target.value })} className={inputClass(invalid)} placeholder="500" />
              )}
            </Field>

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Spinner label={t(bi('Checking…', 'Menyemak…'))} /> : t(bi('Check my chances', 'Semak peluang saya'))}
            </Button>
          </form>
        </Card>

        <div aria-live="polite">
          {!result && (
            <Card className="text-slate-700">
              <p className="text-lg font-bold">{t(bi('Your result will show here', 'Keputusan anda akan dipaparkan di sini'))}</p>
              <p className="mt-2">{t(bi('You will see Likely, Maybe or Not yet, with plain reasons.', 'Anda akan lihat Berkemungkinan, Mungkin atau Belum lagi, dengan sebab yang jelas.'))}</p>
            </Card>
          )}
          {result && (
            <Card className="space-y-4">
              <h2 id="ready-result" tabIndex={-1} className="text-2xl font-extrabold">
                {t(bi('Your result: ', 'Keputusan anda: '))}
                <Badge tone={VERDICT[result.verdict].tone}>{t(VERDICT[result.verdict].label)}</Badge>
              </h2>
              <p className="text-lg">{t(VERDICT[result.verdict].line)}</p>
              <div>
                <h3 className="mb-2 text-lg font-extrabold">{t(bi('Why', 'Sebabnya'))}</h3>
                <ul className="space-y-2">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="flex gap-2 text-base">
                      <span aria-hidden="true">{ICON[r.status]}</span>
                      <span><span className="sr-only">{r.status}: </span>{t(r.text)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {result.verdict === 'notyet' && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <h3 className="mb-2 text-lg font-extrabold">{t(bi('How to qualify', 'Cara untuk layak'))}</h3>
                  <ol className="list-decimal space-y-2 pl-5">
                    {result.plan.map((p, i) => <li key={i}>{t(p)}</li>)}
                  </ol>
                </div>
              )}
              <Callout tone="info">{t(C.noCreditImpact)}</Callout>
              <div className="flex flex-wrap gap-3">
                <LinkButton href={href('compare')}>{t(bi('Compare cards for me', 'Banding kad untuk saya'))}</LinkButton>
                <LinkButton href={href('cost')} variant="secondary">{t(bi('Next: What will it cost?', 'Seterusnya: Berapa kosnya?'))}</LinkButton>
                {result.verdict !== 'notyet' && <LinkButton href={href('apply')} variant="secondary">{t(bi('Go to apply', 'Terus ke permohonan'))}</LinkButton>}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
