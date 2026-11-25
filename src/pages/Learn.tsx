import { useEffect, useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useRouteArg } from '../lib/router.ts';
import { LEARN_CARDS, TOPICS, findLearnCard, type Topic } from '../data/learn.ts';
import { PageTitle } from '../components/ui.tsx';
import { LearnCardView, Quiz } from '../components/learn.tsx';

export function LearnPage() {
  const { t } = useLang();
  const arg = useRouteArg();
  const [topic, setTopic] = useState<'' | Topic>('');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [announce, setAnnounce] = useState('');

  // #/learn/myths opens that card and scrolls to it.
  useEffect(() => {
    const card = findLearnCard(arg);
    if (!card) return;
    setTopic('');
    setOpen((o) => new Set(o).add(card.id));
    const id = window.setTimeout(() => document.getElementById(`card-${card.id}`)?.scrollIntoView({ block: 'start' }), 60);
    return () => window.clearTimeout(id);
  }, [arg]);

  const shown = LEARN_CARDS.filter((c) => !topic || c.topic === topic);

  function toggle(id: string) {
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  function pick(next: '' | Topic) {
    setTopic(next);
    const count = LEARN_CARDS.filter((c) => !next || c.topic === next).length;
    setAnnounce(t(bi(`${count} cards shown.`, `${count} kad dipaparkan.`)));
  }

  return (
    <div className="space-y-8">
      <PageTitle
        title={t(bi('Learn: how credit works', 'Belajar: cara kredit berfungsi'))}
        intro={t(bi('Short, friendly cards. Each takes about 30 to 60 seconds. Open any one, in any order.', 'Kad pendek dan mesra. Setiap satu mengambil masa kira-kira 30 hingga 60 saat. Buka mana-mana satu, dalam sebarang susunan.'))}
      />

      <div role="group" aria-label={t(bi('Filter by topic', 'Tapis mengikut topik'))} className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={topic === ''} onClick={() => pick('')} className={`min-h-11 rounded-full border-2 px-4 text-sm font-bold ${topic === '' ? 'border-cyan-700 bg-cyan-700 text-white' : 'border-slate-300 bg-white text-slate-800'}`}>
          {t(bi('All', 'Semua'))} ({LEARN_CARDS.length})
        </button>
        {TOPICS.map((x) => {
          const n = LEARN_CARDS.filter((c) => c.topic === x.id).length;
          if (n === 0) return null;
          const on = topic === x.id;
          return (
            <button key={x.id} type="button" aria-pressed={on} onClick={() => pick(on ? '' : x.id)} className={`min-h-11 rounded-full border-2 px-4 text-sm font-bold ${on ? 'border-cyan-700 bg-cyan-700 text-white' : 'border-slate-300 bg-white text-slate-800'}`}>
              {t(x.label)} ({n})
            </button>
          );
        })}
      </div>

      <ul className="space-y-3">
        {shown.map((c) => <LearnCardView key={c.id} card={c} open={open.has(c.id)} onToggle={() => toggle(c.id)} />)}
      </ul>

      <Quiz />
      <p className="sr-only" role="status" aria-live="polite">{announce}</p>
    </div>
  );
}
