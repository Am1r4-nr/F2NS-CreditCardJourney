import { bi, useLang } from '../i18n/index.tsx';
import { href } from '../lib/router.ts';
import { Badge, Callout, Card, LinkButton, PageTitle } from '../components/ui.tsx';
import { ScamNote } from '../components/layout.tsx';
import { PLACEHOLDERS } from '../config/rates.ts';

export function TrustPage() {
  const { t } = useLang();
  return (
    <div className="space-y-8">
      <PageTitle
        title={t(bi('Trust and your data', 'Kepercayaan dan data anda'))}
        intro={t(bi('You should know who we are, how safe your money is, and what we do with your details.', 'Anda patut tahu siapa kami, betapa selamatnya wang anda, dan apa yang kami buat dengan butiran anda.'))}
      />

      <Callout tone="warn" title={t(bi('Placeholders in this prototype', 'Placeholder dalam prototaip ini'))}>
        {t(bi('The licence, PIDM and phone details below are placeholders. They are not real.', 'Butiran lesen, PIDM dan telefon di bawah ialah placeholder. Ia tidak sebenar.'))}
      </Callout>

      <section aria-labelledby="badges-h" className="grid gap-4 md:grid-cols-2">
        <h2 id="badges-h" className="sr-only">{t(bi('Licence and protection', 'Lesen dan perlindungan'))}</h2>
        <Card className="space-y-2">
          <p className="text-4xl" aria-hidden="true">🏛️</p>
          <h3 className="text-xl font-extrabold">{t(bi('Licensed by Bank Negara Malaysia', 'Dilesenkan oleh Bank Negara Malaysia'))}</h3>
          <Badge tone="warn">{t(bi('Placeholder badge', 'Lencana placeholder'))}</Badge>
          <p className="text-base">{PLACEHOLDERS.license}</p>
          <p className="text-base text-slate-700">{t(bi('A licensed bank must follow Bank Negara Malaysia’s rules on how it treats customers.', 'Bank berlesen mesti mengikut peraturan Bank Negara Malaysia tentang cara ia melayan pelanggan.'))}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-4xl" aria-hidden="true">🛡️</p>
          <h3 className="text-xl font-extrabold">{t(bi('Deposits protected by PIDM', 'Deposit dilindungi PIDM'))}</h3>
          <Badge tone="warn">{t(bi('Placeholder note', 'Nota placeholder'))}</Badge>
          <p className="text-base text-slate-700">{t(bi('PIDM protects eligible deposits up to the legal limit. A credit card is a loan, not a deposit, so it is not covered. Ask PIDM or the bank what is covered.', 'PIDM melindungi deposit layak sehingga had yang ditetapkan. Kad kredit ialah pinjaman, bukan deposit, jadi ia tidak dilindungi. Tanya PIDM atau bank apa yang dilindungi.'))}</p>
        </Card>
      </section>

      <section aria-labelledby="data-h">
        <h2 id="data-h" className="mb-3 text-2xl font-extrabold">{t(bi('How we use and protect your data', 'Bagaimana kami menggunakan dan melindungi data anda'))}</h2>
        <Card>
          <ul className="list-disc space-y-3 pl-6 text-lg">
            <li>{t(bi('We use your details only to check your application and to run your card.', 'Kami menggunakan butiran anda hanya untuk menyemak permohonan anda dan mengendalikan kad anda.'))}</li>
            <li>{t(bi('We keep them safe with encryption, and only the people who need them can see them.', 'Kami menyimpannya dengan selamat menggunakan penyulitan, dan hanya orang yang memerlukannya boleh melihatnya.'))}</li>
            <li>{t(bi('We never sell your data, and you can ask us to delete it.', 'Kami tidak pernah menjual data anda, dan anda boleh meminta kami memadamnya.'))}</li>
          </ul>
        </Card>
        <p className="mt-3 text-base text-slate-700">
          {t(bi('In this prototype, nothing leaves your device. Your answers are saved only in your browser. Each sensitive question also has a “Why we ask this” note.', 'Dalam prototaip ini, tiada apa-apa meninggalkan peranti anda. Jawapan anda hanya disimpan dalam pelayar anda. Setiap soalan sensitif juga mempunyai nota “Mengapa kami tanya”.'))}
        </p>
      </section>

      <section aria-labelledby="scam-h" className="space-y-3">
        <h2 id="scam-h" className="text-2xl font-extrabold">{t(bi('Scam safety', 'Keselamatan daripada penipuan'))}</h2>
        <ScamNote />
        <LinkButton href="#/learn/stay-safe" variant="secondary">{t(bi('Learn how to spot a scam', 'Belajar cara mengesan penipuan'))}</LinkButton>
      </section>

      <section aria-labelledby="help-h">
        <h2 id="help-h" className="mb-3 text-2xl font-extrabold">{t(bi('Talk to a person', 'Bercakap dengan seseorang'))}</h2>
        <Card className="space-y-2 text-lg">
          <p>{t(bi('Help is on every screen. Use the “Help: chat or call” button at the bottom right.', 'Bantuan ada pada setiap skrin. Guna butang “Bantuan: chat atau panggil” di bahagian bawah kanan.'))}</p>
          <p>📞 {PLACEHOLDERS.phone} <span className="text-sm text-slate-600">({t(bi('placeholder number', 'nombor placeholder'))})</span></p>
        </Card>
      </section>

      <section aria-labelledby="price-h" className="rounded-3xl bg-cyan-50 p-5">
        <h2 id="price-h" className="text-xl font-extrabold">{t(bi('No hidden fees', 'Tiada yuran tersembunyi'))}</h2>
        <p className="mb-3 text-lg">{t(bi('Every fee is on our pricing page.', 'Setiap yuran ada pada halaman harga kami.'))}</p>
        <LinkButton href={href('pricing')}>{t(bi('See all fees', 'Lihat semua yuran'))}</LinkButton>
      </section>
    </div>
  );
}
