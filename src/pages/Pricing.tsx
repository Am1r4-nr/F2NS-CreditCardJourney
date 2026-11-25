import { bi, useLang } from '../i18n/index.tsx';
import { href } from '../lib/router.ts';
import { Callout, Card, LinkButton, PageTitle } from '../components/ui.tsx';
import { RATES } from '../config/rates.ts';
import { money } from '../lib/format.ts';
import { simulate } from '../lib/cost.ts';
import type { Bi } from '../lib/eligibility.ts';

interface Row {
  label: Bi;
  value: Bi;
  note: Bi;
}

export function PricingPage() {
  const { t } = useLang();
  const R = RATES;
  const spend = 500;
  const min = simulate({ spend, mode: 'minimum', fixed: 0 });
  const extra = Math.round((min.total - spend) * 100) / 100;

  const rows: Row[] = [
    { label: bi('Annual fee', 'Yuran tahunan'), value: bi(`${money(R.annualFeeFirstYear)} in year 1, then ${money(R.annualFeeAfter)} a year`, `${money(R.annualFeeFirstYear)} pada tahun 1, kemudian ${money(R.annualFeeAfter)} setahun`), note: bi('Charged once a year, even if you do not use the card.', 'Dikenakan sekali setahun, walaupun anda tidak guna kad.') },
    { label: bi('Service tax', 'Cukai perkhidmatan'), value: bi(`${money(R.serviceTaxPerYear)} a year`, `${money(R.serviceTaxPerYear)} setahun`), note: bi('A government tax on each card.', 'Cukai kerajaan bagi setiap kad.') },
    { label: bi('Interest', 'Faedah'), value: bi(`${R.aprPercent}% a year`, `${R.aprPercent}% setahun`), note: bi('Only on what you do not pay by the due date. Pay in full and it is RM0.', 'Hanya atas yang tidak dibayar sebelum tarikh akhir. Bayar penuh dan ia RM0.') },
    { label: bi('Interest-free period', 'Tempoh bebas faedah'), value: bi(`${R.graceDays} days after your statement date`, `${R.graceDays} hari selepas tarikh penyata anda`), note: bi('You have this time to pay the full bill with no interest.', 'Anda ada masa ini untuk membayar bil penuh tanpa faedah.') },
    { label: bi('Minimum payment', 'Bayaran minimum'), value: bi(`${R.minPaymentPercent}% of what you owe or ${money(R.minPaymentFloor)}, whichever is higher`, `${R.minPaymentPercent}% daripada hutang atau ${money(R.minPaymentFloor)}, mana yang lebih tinggi`), note: bi('The smallest amount that keeps you out of the late fee.', 'Jumlah paling sedikit yang menjauhkan anda daripada fi lewat.') },
    { label: bi('Late payment fee', 'Fi bayaran lewat'), value: bi(`${money(R.lateFeeFlat)} or ${R.lateFeePercent}% of what you owe, whichever is higher`, `${money(R.lateFeeFlat)} atau ${R.lateFeePercent}% daripada hutang, mana yang lebih tinggi`), note: bi('Only if you miss the due date.', 'Hanya jika anda terlepas tarikh akhir.') },
    { label: bi('Cash advance fee', 'Fi pendahuluan tunai'), value: bi(`${R.cashAdvancePercent}% of the amount, at least ${money(R.cashAdvanceMin)}`, `${R.cashAdvancePercent}% daripada jumlah, sekurang-kurangnya ${money(R.cashAdvanceMin)}`), note: bi('Interest starts the same day. We suggest you avoid cash advances.', 'Faedah bermula pada hari yang sama. Kami cadangkan anda elakkan pendahuluan tunai.') },
    { label: bi('Foreign currency fee', 'Fi mata wang asing'), value: bi(`${R.fxFeePercent}% of the amount`, `${R.fxFeePercent}% daripada jumlah`), note: bi('When you buy in a currency other than ringgit.', 'Apabila anda membeli dalam mata wang selain ringgit.') },
    { label: bi('Credit limit', 'Had kredit'), value: bi(`${money(R.limitMin)} to ${money(R.limitMax)} for a first card`, `${money(R.limitMin)} hingga ${money(R.limitMax)} untuk kad pertama`), note: bi('Set after we review your application.', 'Ditetapkan selepas kami menyemak permohonan anda.') },
  ];

  const never: Bi[] = [
    bi('A joining or application fee', 'Yuran penyertaan atau permohonan'),
    bi('A fee for the “Am I ready?” check', 'Yuran untuk semakan “Sedia kah saya?”'),
    bi('A fee for paying your bill early or in full', 'Yuran untuk membayar bil anda awal atau penuh'),
    bi('A fee to close your card', 'Yuran untuk menutup kad anda'),
    bi('A fee for the paper-free statement', 'Yuran untuk penyata tanpa kertas'),
  ];

  return (
    <div className="space-y-8">
      <PageTitle
        title={t(bi('Transparent pricing', 'Harga yang telus'))}
        intro={t(bi('Every fee is on this page. If a fee is not here, we do not charge it. No hidden fees.', 'Setiap yuran ada di halaman ini. Jika yuran tiada di sini, kami tidak mengenakannya. Tiada yuran tersembunyi.'))}
      />

      <Callout tone="warn" title={t(bi('Illustrative figures', 'Angka ilustrasi'))}>
        {t(bi('KAF First Card is a prototype. These numbers are examples and are kept in one settings file. They are not a real bank offer.', 'KAF First Card ialah prototaip. Angka ini contoh dan disimpan dalam satu fail tetapan. Ia bukan tawaran bank sebenar.'))}
      </Callout>

      <section aria-labelledby="fees-h">
        <h2 id="fees-h" className="mb-3 text-2xl font-extrabold">{t(bi('What you pay', 'Apa yang anda bayar'))}</h2>
        <Card>
          <dl className="divide-y divide-slate-200">
            {rows.map((r) => (
              <div key={r.label.en} className="grid gap-1 py-3 md:grid-cols-[14rem_1fr]">
                <dt className="text-lg font-bold">{t(r.label)}</dt>
                <dd>
                  <span className="block text-lg">{t(r.value)}</span>
                  <span className="block text-base text-slate-700">{t(r.note)}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <section aria-labelledby="never-h">
        <h2 id="never-h" className="mb-3 text-2xl font-extrabold">{t(bi('What we never charge', 'Apa yang tidak pernah kami caj'))}</h2>
        <Card>
          <ul className="space-y-2 text-lg">
            {never.map((n) => <li key={n.en}><span aria-hidden="true">✔ </span>{t(n)}</li>)}
          </ul>
        </Card>
      </section>

      <section aria-labelledby="eg-h">
        <h2 id="eg-h" className="mb-3 text-2xl font-extrabold">{t(bi('An example', 'Satu contoh'))}</h2>
        <Card className="space-y-2 text-lg">
          <p>{t(bi(`You spend ${money(spend)}. If you pay in full by the due date, you pay ${money(spend)}. No interest.`, `Anda berbelanja ${money(spend)}. Jika anda bayar penuh sebelum tarikh akhir, anda bayar ${money(spend)}. Tiada faedah.`))}</p>
          <p>{t(bi(`If you pay only the minimum, you pay about ${money(extra, 2)} extra over ${min.months} months.`, `Jika anda bayar minimum sahaja, anda bayar kira-kira ${money(extra, 2)} lebih dalam ${min.months} bulan.`))}</p>
          <div className="pt-2 flex flex-wrap gap-3">
            <LinkButton href={href('cost')}>{t(bi('Try the cost simulator', 'Cuba simulator kos'))}</LinkButton>
            <LinkButton href={href('compare')} variant="secondary">{t(bi('Compare real cards from banks', 'Banding kad sebenar daripada bank'))}</LinkButton>
          </div>
        </Card>
      </section>
    </div>
  );
}
