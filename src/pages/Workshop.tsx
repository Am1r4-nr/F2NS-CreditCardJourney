import { useEffect, useState, type ReactNode } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { navigate } from '../lib/router.ts';
import { newId } from '../lib/usage.ts';
import { fmtDate } from '../lib/format.ts';
import { Button, Callout, Card, Field, PageTitle, inputClass } from '../components/ui.tsx';
import {
  CARD_FEATURES, DEAL_BREAKERS, MAX_PICKS, PROOF_CHOICES, SEAMLESS, TARGET_TESTERS, TIME_CHOICES, TRUST_BUILDERS, type Option,
} from '../data/workshop.ts';
import { averageRating, cardName, entriesToCsv, entriesToJson, labelOf, tally, togglePick } from '../lib/workshop.ts';
import type { WorkshopEntry } from '../state/types.ts';

interface Form {
  tester: string;
  seamless: string[];
  dealBreakers: string[];
  proof: string;
  time: string;
  trust: string[];
  cardFeatures: string[];
  rating: number;
  stuck: string;
}

const EMPTY: Form = { tester: '', seamless: [], dealBreakers: [], proof: '', time: '', trust: [], cardFeatures: [], rating: 0, stuck: '' };
const DRAFT_KEY = 'kaf-workshop-draft-v1';

function loadDraft(): Form {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Form>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function download(name: string, mime: string, content: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function WorkshopPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<'fill' | 'summary'>('fill');
  const { state } = useApp();
  return (
    <div className="space-y-6">
      <PageTitle
        title={t(bi('Workshop: preferences and feedback', 'Bengkel: pilihan dan maklum balas'))}
        intro={t(bi('For testers and the facilitator. Fill in the Journey Preference Card, tell us how it went, then see the results of everyone who tried it.', 'Untuk penguji dan fasilitator. Isi Kad Pilihan Perjalanan, beritahu kami bagaimana ia berjalan, kemudian lihat keputusan semua yang mencubanya.'))}
      />
      <div role="group" aria-label={t(bi('Workshop views', 'Paparan bengkel'))} className="flex flex-wrap gap-2">
        {([['fill', bi('Fill in (tester)', 'Isi (penguji)')], ['summary', bi(`Summary (${state.entries.length} saved)`, `Ringkasan (${state.entries.length} disimpan)`)]] as const).map(([id, label]) => (
          <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)} className={`min-h-12 rounded-full border-2 px-5 text-base font-bold ${tab === id ? 'border-cyan-700 bg-cyan-700 text-white' : 'border-slate-300 bg-white text-slate-800'}`}>
            {t(label)}
          </button>
        ))}
      </div>
      {tab === 'fill' ? <FillIn onSaved={() => setTab('fill')} onSummary={() => setTab('summary')} /> : <Summary />}
    </div>
  );
}

// ---------- Fill in ----------

function FillIn({ onSummary }: { onSaved: () => void; onSummary: () => void }) {
  const { t } = useLang();
  const { state, update, resetAll } = useApp();
  const [form, setForm] = useState<Form>(loadDraft);
  const [limitFor, setLimitFor] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ rating?: boolean }>({});
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* the form still works without saving */ }
  }, [form]);

  const set = (p: Partial<Form>) => setForm((f) => ({ ...f, ...p }));
  const pick = (field: 'seamless' | 'dealBreakers' | 'cardFeatures', key: string) => {
    const r = togglePick(form[field], key, MAX_PICKS);
    setLimitFor(r.blocked ? field : null);
    if (!r.blocked) set({ [field]: r.list } as Partial<Form>);
  };
  const pickTrust = (key: string) => set({ trust: form.trust.includes(key) ? form.trust.filter((k) => k !== key) : [...form.trust, key] });

  const log = state.compare.log;
  const selected = state.selectedCardId;

  function save() {
    if (form.rating < 1) {
      setErrors({ rating: true });
      setTimeout(() => document.getElementById('rating-legend')?.focus(), 30);
      return;
    }
    setErrors({});
    const entry: WorkshopEntry = {
      id: newId('w'),
      at: new Date().toISOString(),
      tester: form.tester.trim().slice(0, 40),
      seamless: form.seamless,
      dealBreakers: form.dealBreakers,
      proof: form.proof,
      time: form.time,
      trust: form.trust,
      rating: form.rating,
      stuck: form.stuck.trim().slice(0, 600),
      cardFeatures: form.cardFeatures,
      cardsCompared: log.compared,
      cardsViewed: log.viewed,
      cardSelected: selected,
    };
    update((s) => ({ ...s, entries: [...s.entries, entry] }));
    setSavedId(entry.id);
    setForm(EMPTY);
  }

  function nextTester() {
    resetAll();
    setSavedId(null);
    setForm(EMPTY);
    navigate('home');
  }

  if (savedId) {
    const n = state.entries.length;
    return (
      <div className="space-y-4">
        <Callout tone="good" title={t(bi('Saved. Thank you!', 'Disimpan. Terima kasih!'))}>
          <p>{t(bi(`That is ${n} of ${TARGET_TESTERS} testers saved.`, `Itu ${n} daripada ${TARGET_TESTERS} penguji disimpan.`))}{n < TARGET_TESTERS && ` ${t(bi(`${TARGET_TESTERS - n} more needed.`, `${TARGET_TESTERS - n} lagi diperlukan.`))}`}</p>
        </Callout>
        <div className="flex flex-wrap gap-3">
          <Button onClick={nextTester}>{t(bi('Start the next tester', 'Mulakan penguji seterusnya'))}</Button>
          <Button variant="secondary" onClick={onSummary}>{t(bi('See the summary', 'Lihat ringkasan'))}</Button>
        </div>
        <p className="text-sm text-slate-700">{t(bi('“Start the next tester” clears the journey so the next person starts fresh. Saved entries are kept.', '“Mulakan penguji seterusnya” mengosongkan perjalanan supaya orang seterusnya bermula baharu. Entri yang disimpan dikekalkan.'))}</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} noValidate className="space-y-8">
      <Field label={bi('Your name or nickname (optional)', 'Nama atau nama panggilan anda (pilihan)')} hint={bi('So the facilitator can tell testers apart. Leave it blank if you like.', 'Supaya fasilitator boleh membezakan penguji. Biarkan kosong jika mahu.')}>
        {({ id }) => <input id={id} value={form.tester} maxLength={40} onChange={(e) => set({ tester: e.target.value })} className={inputClass(false)} />}
      </Field>

      <Callout tone="info" title={t(bi('Journey Preference Card', 'Kad Pilihan Perjalanan'))}>
        {t(bi('Think about applying for your first card. Pick what matters to you.', 'Fikirkan tentang memohon kad pertama anda. Pilih apa yang penting kepada anda.'))}
      </Callout>

      <PickGroup id="seamless" title={bi('1. Top 3 things that make applying seamless', '1. 3 perkara teratas yang menjadikan permohonan lancar')} options={SEAMLESS} value={form.seamless} onPick={(k) => pick('seamless', k)} limit={MAX_PICKS} blocked={limitFor === 'seamless'} />
      <PickGroup id="deal" title={bi('2. Top 3 deal-breakers', '2. 3 pemecah perjanjian teratas')} options={DEAL_BREAKERS} value={form.dealBreakers} onPick={(k) => pick('dealBreakers', k)} limit={MAX_PICKS} blocked={limitFor === 'dealBreakers'} />
      <Single id="proof" title={bi('3. Which income proof would you prefer?', '3. Bukti pendapatan mana yang anda lebih suka?')} options={PROOF_CHOICES} value={form.proof} onChange={(v) => set({ proof: v })} />
      <Single id="time" title={bi('4. How long is OK to wait for a decision?', '4. Berapa lama menunggu keputusan yang boleh diterima?')} options={TIME_CHOICES} value={form.time} onChange={(v) => set({ time: v })} />
      <PickGroup id="trust" title={bi('5. What builds your trust? (pick any)', '5. Apa yang membina kepercayaan anda? (pilih mana-mana)')} options={TRUST_BUILDERS} value={form.trust} onPick={pickTrust} />
      <PickGroup id="features" title={bi('6. Which card features mattered most when comparing? (up to 3)', '6. Ciri kad mana yang paling penting semasa membanding? (sehingga 3)')} options={CARD_FEATURES} value={form.cardFeatures} onPick={(k) => pick('cardFeatures', k)} limit={MAX_PICKS} blocked={limitFor === 'cardFeatures'} />

      <section aria-labelledby="seen-h" className="rounded-2xl bg-slate-50 p-4">
        <h3 id="seen-h" className="text-lg font-extrabold">{t(bi('Cards you looked at (saved automatically)', 'Kad yang anda lihat (disimpan secara automatik)'))}</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-base">
          <li>{t(bi('Compared', 'Dibanding'))}: {log.compared.length ? log.compared.map(cardName).join(', ') : t(bi('none', 'tiada'))}</li>
          <li>{t(bi('Opened details', 'Buka butiran'))}: {log.viewed.length ? log.viewed.map(cardName).join(', ') : t(bi('none', 'tiada'))}</li>
          <li>{t(bi('Chose', 'Memilih'))}: {selected ? cardName(selected) : t(bi('none', 'tiada'))}</li>
        </ul>
      </section>

      <fieldset aria-describedby={errors.rating ? 'rating-err' : undefined}>
        <legend id="rating-legend" tabIndex={-1} className="mb-2 text-lg font-extrabold">{t(bi('7. How easy was it? (1 = hard, 5 = very easy)', '7. Sejauh mana mudah? (1 = susah, 5 = sangat mudah)'))}</legend>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className={`flex min-h-12 min-w-14 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 text-lg font-bold ${form.rating === n ? 'border-cyan-700 bg-cyan-50' : 'border-slate-300 bg-white'}`}>
              <input type="radio" name="rating" className="h-5 w-5" checked={form.rating === n} onChange={() => set({ rating: n })} />
              {n}
            </label>
          ))}
        </div>
        {errors.rating && <p id="rating-err" role="alert" className="mt-1 font-semibold text-rose-700">{t(bi('Please pick a number from 1 to 5.', 'Sila pilih nombor dari 1 hingga 5.'))}</p>}
      </fieldset>

      <Field label={bi('8. Where did you get stuck?', '8. Di mana anda tersekat?')} hint={bi('Anything confusing, slow or worrying. “Nothing” is a fine answer.', 'Apa-apa yang mengelirukan, perlahan atau membimbangkan. “Tiada” ialah jawapan yang baik.')}>
        {({ id }) => <textarea id={id} rows={4} maxLength={600} value={form.stuck} onChange={(e) => set({ stuck: e.target.value })} className={inputClass(false)} />}
      </Field>

      <div className="flex flex-wrap gap-3">
        <Button type="submit">{t(bi('Save my answers', 'Simpan jawapan saya'))}</Button>
        <Button variant="ghost" onClick={() => setForm(EMPTY)}>{t(bi('Clear the form', 'Kosongkan borang'))}</Button>
      </div>
    </form>
  );
}

function PickGroup({ id, title, options, value, onPick, limit, blocked }: { id: string; title: ReturnType<typeof bi>; options: Option[]; value: string[]; onPick: (k: string) => void; limit?: number; blocked?: boolean }) {
  const { t } = useLang();
  return (
    <fieldset>
      <legend className="mb-1 text-lg font-extrabold">{t(title)}</legend>
      {limit && <p className="mb-2 text-sm text-slate-700" aria-live="polite">{value.length} / {limit} {t(bi('picked', 'dipilih'))}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const on = value.includes(o.key);
          return (
            <label key={o.key} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2 text-base font-semibold ${on ? 'border-cyan-700 bg-cyan-50' : 'border-slate-300 bg-white'}`}>
              <input type="checkbox" name={id} className="h-5 w-5 shrink-0" checked={on} onChange={() => onPick(o.key)} />
              {t(o.label)}
            </label>
          );
        })}
      </div>
      {blocked && limit && <p role="alert" className="mt-2 font-semibold text-amber-800">{t(bi(`You can pick up to ${limit}. Untick one first.`, `Anda boleh pilih sehingga ${limit}. Nyahtanda satu dahulu.`))}</p>}
    </fieldset>
  );
}

function Single({ id, title, options, value, onChange }: { id: string; title: ReturnType<typeof bi>; options: Option[]; value: string; onChange: (v: string) => void }) {
  const { t } = useLang();
  return (
    <fieldset>
      <legend className="mb-2 text-lg font-extrabold">{t(title)}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label key={o.key} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2 text-base font-semibold ${value === o.key ? 'border-cyan-700 bg-cyan-50' : 'border-slate-300 bg-white'}`}>
            <input type="radio" name={id} className="h-5 w-5 shrink-0" checked={value === o.key} onChange={() => onChange(o.key)} />
            {t(o.label)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// ---------- Summary ----------

function Summary() {
  const { t, lang } = useLang();
  const { state, update } = useApp();
  const entries = state.entries;
  const [confirm, setConfirm] = useState(false);
  const n = entries.length;
  const avg = averageRating(entries);

  if (n === 0) {
    return (
      <Callout tone="info" title={t(bi('No testers yet', 'Belum ada penguji'))}>
        {t(bi(`Fill in the form for each tester. You need at least ${TARGET_TESTERS}.`, `Isi borang untuk setiap penguji. Anda perlukan sekurang-kurangnya ${TARGET_TESTERS}.`))}
      </Callout>
    );
  }

  const ranked = (title: ReturnType<typeof bi>, options: Option[], pick: (e: WorkshopEntry) => string[]): ReactNode => {
    const rows = tally(entries, pick);
    return (
      <Card className="space-y-2">
        <h3 className="text-lg font-extrabold">{t(title)}</h3>
        {rows.length === 0 ? <p className="text-base text-slate-700">{t(bi('No answers yet.', 'Belum ada jawapan.'))}</p> : (
          <ol className="space-y-2">
            {rows.map((r) => (
              <li key={r.key}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-base font-semibold">{labelOf(options, r.key, lang)}</span>
                  <span className="font-bold">{r.count} {t(bi(r.count === 1 ? 'tester' : 'testers', 'penguji'))} ({Math.round((r.count / n) * 100)}%)</span>
                </div>
                <div aria-hidden="true" className="h-2 rounded-full bg-slate-200"><div className="h-full rounded-full bg-cyan-600" style={{ width: `${(r.count / n) * 100}%` }} /></div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    );
  };

  const cardRank = (title: ReturnType<typeof bi>, pick: (e: WorkshopEntry) => string[]): ReactNode => {
    const rows = tally(entries, pick).slice(0, 5);
    return (
      <Card className="space-y-2">
        <h3 className="text-lg font-extrabold">{t(title)}</h3>
        {rows.length === 0 ? <p className="text-base text-slate-700">{t(bi('None yet.', 'Belum ada.'))}</p> : (
          <ol className="list-decimal space-y-1 pl-6 text-base">
            {rows.map((r) => <li key={r.key}>{cardName(r.key)} <strong>({r.count})</strong></li>)}
          </ol>
        )}
      </Card>
    );
  };

  const comments = entries.filter((e) => e.stuck.trim());

  return (
    <div className="space-y-6">
      <Card className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-slate-600">{t(bi('Testers saved', 'Penguji disimpan'))}</p>
          <p className="text-3xl font-bold">{n} / {TARGET_TESTERS}</p>
          {n < TARGET_TESTERS
            ? <p className="font-semibold text-amber-800">{t(bi(`${TARGET_TESTERS - n} more needed for the target.`, `${TARGET_TESTERS - n} lagi diperlukan untuk sasaran.`))}</p>
            : <p className="font-semibold text-emerald-800">✔ {t(bi('Target reached', 'Sasaran dicapai'))}</p>}
        </div>
        <div>
          <p className="text-sm text-slate-600">{t(bi('Average ease (1 to 5)', 'Purata kemudahan (1 hingga 5)'))}</p>
          <p className="text-3xl font-bold">{avg ?? '-'}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600">{t(bi('Last saved', 'Terakhir disimpan'))}</p>
          <p className="text-lg font-bold">{fmtDate(entries[entries.length - 1].at.slice(0, 10), lang)}</p>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {ranked(bi('What makes applying seamless', 'Apa yang menjadikan permohonan lancar'), SEAMLESS, (e) => e.seamless)}
        {ranked(bi('Deal-breakers', 'Pemecah perjanjian'), DEAL_BREAKERS, (e) => e.dealBreakers)}
        {ranked(bi('Preferred income proof', 'Bukti pendapatan pilihan'), PROOF_CHOICES, (e) => (e.proof ? [e.proof] : []))}
        {ranked(bi('Acceptable decision time', 'Masa keputusan yang boleh diterima'), TIME_CHOICES, (e) => (e.time ? [e.time] : []))}
        {ranked(bi('What builds trust', 'Apa yang membina kepercayaan'), TRUST_BUILDERS, (e) => e.trust)}
        {ranked(bi('Card features that mattered most', 'Ciri kad yang paling penting'), CARD_FEATURES, (e) => e.cardFeatures ?? [])}
        {cardRank(bi('Most compared cards', 'Kad paling banyak dibanding'), (e) => e.cardsCompared ?? [])}
        {cardRank(bi('Most viewed cards (details opened)', 'Kad paling banyak dilihat (butiran dibuka)'), (e) => e.cardsViewed ?? [])}
        {cardRank(bi('Cards testers chose', 'Kad yang dipilih penguji'), (e) => (e.cardSelected ? [e.cardSelected] : []))}
      </div>

      <section aria-labelledby="stuck-h">
        <h3 id="stuck-h" className="mb-2 text-xl font-extrabold">{t(bi('Where testers got stuck', 'Di mana penguji tersekat'))}</h3>
        {comments.length === 0 ? <p className="text-base text-slate-700">{t(bi('No comments.', 'Tiada komen.'))}</p> : (
          <ul className="space-y-2">
            {comments.map((e) => (
              <li key={e.id} className="rounded-2xl border border-slate-200 bg-white p-3 text-base">
                <span className="block text-sm font-semibold text-slate-600">{e.tester || t(bi('Anonymous', 'Tanpa nama'))} · {t(bi('rating', 'penilaian'))} {e.rating}/5</span>
                {e.stuck}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="export-h" className="space-y-3 rounded-2xl border-2 border-dashed border-slate-300 p-4">
        <h3 id="export-h" className="text-xl font-extrabold">{t(bi('Export and clear', 'Eksport dan kosongkan'))}</h3>
        <p className="text-base text-slate-700">{t(bi('Results are saved in this browser only. Export them before you clear the browser or change computer.', 'Keputusan hanya disimpan dalam pelayar ini. Eksport sebelum anda mengosongkan pelayar atau menukar komputer.'))}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => download('kaf-first-card-testers.csv', 'text/csv', '\uFEFF' + entriesToCsv(entries))}>{t(bi('Download CSV', 'Muat turun CSV'))}</Button>
          <Button variant="secondary" onClick={() => download('kaf-first-card-testers.json', 'application/json', entriesToJson(entries))}>{t(bi('Download JSON', 'Muat turun JSON'))}</Button>
          {!confirm ? (
            <Button variant="ghost" onClick={() => setConfirm(true)}>{t(bi('Delete all entries', 'Padam semua entri'))}</Button>
          ) : (
            <span className="flex flex-wrap items-center gap-2" role="group" aria-label={t(bi('Confirm delete', 'Sahkan padam'))}>
              <span className="font-semibold">{t(bi(`Delete all ${n} entries?`, `Padam semua ${n} entri?`))}</span>
              <Button onClick={() => { update((s) => ({ ...s, entries: [] })); setConfirm(false); }}>{t(bi('Yes, delete', 'Ya, padam'))}</Button>
              <Button variant="secondary" onClick={() => setConfirm(false)}>{t(bi('Cancel', 'Batal'))}</Button>
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
