import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { href, navigate } from '../lib/router.ts';
import { AuthPanel } from '../components/auth.tsx';
import { Button, Callout, LinkButton, PageTitle } from '../components/ui.tsx';

export function AccountPage() {
  const { t } = useLang();
  const { state, signOut } = useApp();
  const account = state.account;

  if (!account) {
    return <AuthPanel onDone={() => navigate('apply')} />;
  }

  const started = state.draft.started || state.draft.savedAt !== null || state.submission !== null;
  return (
    <div className="max-w-xl space-y-6">
      <PageTitle title={t(bi('Your account', 'Akaun anda'))} />
      <Callout tone="good" title={`${t(bi('Signed in as', 'Log masuk sebagai'))} ${account.name}`}>
        <p>{account.email}</p>
        <p className="mt-1">
          {state.submission
            ? t(bi(`Your application ${state.submission.ref} is saved.`, `Permohonan anda ${state.submission.ref} telah disimpan.`))
            : started
              ? t(bi('Your application is saved. You can continue it any time.', 'Permohonan anda telah disimpan. Anda boleh menyambungnya bila-bila masa.'))
              : t(bi('Nothing saved yet. Start an application and it saves as you go.', 'Belum ada yang disimpan. Mulakan permohonan dan ia disimpan semasa anda isi.'))}
        </p>
      </Callout>
      <p className="text-base text-slate-700">{t(bi('Your details are saved on this device only. Log out when you share a computer: it clears your answers from the screen, and they stay saved under your account.', 'Butiran anda disimpan pada peranti ini sahaja. Log keluar jika anda berkongsi komputer: ia mengosongkan jawapan anda dari skrin, dan ia kekal disimpan di bawah akaun anda.'))}</p>
      <div className="flex flex-wrap gap-3">
        <LinkButton href={href('apply')}>{started ? t(bi('Go to my application', 'Ke permohonan saya')) : t(bi('Start applying', 'Mula memohon'))}</LinkButton>
        <Button variant="secondary" onClick={() => { signOut(); navigate('home'); }}>{t(bi('Log out', 'Log keluar'))}</Button>
      </div>
    </div>
  );
}
