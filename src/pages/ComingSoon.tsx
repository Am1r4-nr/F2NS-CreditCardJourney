import { bi, useLang } from '../i18n/index.tsx';
import { href } from '../lib/router.ts';
import { Callout, LinkButton, PageTitle } from '../components/ui.tsx';
import { SelectedCardChip } from '../components/cards.tsx';

/** Shown for screens that are in the plan but not built yet, so a link never lands on the wrong screen. */
export function ComingSoonPage({ name }: { name: ReturnType<typeof bi> }) {
  const { t } = useLang();
  return (
    <div className="space-y-4">
      <PageTitle title={t(name)} intro={t(bi('This screen is part of the prototype plan but is not built yet.', 'Skrin ini sebahagian daripada pelan prototaip tetapi belum dibina.'))} />
      <SelectedCardChip />
      <Callout tone="info" title={t(bi('Coming soon', 'Akan datang'))}>
        {t(bi('Your choices are saved. You can carry on with the screens that are ready.', 'Pilihan anda disimpan. Anda boleh teruskan dengan skrin yang sudah siap.'))}
      </Callout>
      <div className="flex flex-wrap gap-3">
        <LinkButton href={href('compare')}>{t(bi('Compare cards', 'Banding kad'))}</LinkButton>
        <LinkButton href={href('cost')} variant="secondary">{t(bi('What will it cost?', 'Berapa kosnya?'))}</LinkButton>
        <LinkButton href={href('home')} variant="secondary">{t(bi('Home', 'Utama'))}</LinkButton>
      </div>
    </div>
  );
}
