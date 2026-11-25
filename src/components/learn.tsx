import { useState } from 'react';
import { bi, useLang } from '../i18n/index.tsx';
import { useApp } from '../state/store.tsx';
import { href, learnHref } from '../lib/router.ts';
import { LEARN_CARDS, QUIZ, TOPICS, findLearnCard, readingSeconds, scoreQuiz, type LearnCard } from '../data/learn.ts';
import { Badge, Button, Callout, Card, LinkButton } from './ui.tsx';

export function ReadTime({ card }: { card: LearnCard }) {
  const { t, lang } = useLang();
  const s = readingSeconds(card, lang);
  return <span className="text-sm text-slate-700">⏱ {t(bi(`About ${s} seconds`, `Kira-kira ${s} saat`))}</span>;
}

export function LearnCardView({ card, open, onToggle }: { card: LearnCard; open: boolean; onToggle: () => void }) {
  const { t } = useLang();
  const topic = TOPICS.find((x) => x.id === card.topic)!;
  const bodyId = `learn-${card.id}`;
  return (
    <li id={`card-${card.id}`}>
      <Card className={open ? 'border-cyan-600' : ''}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={onToggle}
          className="flex min-h-14 w-full items-start gap-3 rounded-xl text-left"
        >
          <span aria-hidden="true" className="text-3xl">{card.icon}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-cyan-800">{t(topic.label)}</span>
            <span className="block text-xl font-bold leading-snug">{t(card.title)}</span>
            <ReadTime card={card} />
          </span>
          <span aria-hidden="true" className="mt-1 text-xl">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div id={bodyId} className="mt-4 space-y-3 text-lg leading-relaxed">
            {card.paragraphs.map((p, i) => <p key={i}>{t(p)}</p>)}
            {card.bullets.length > 0 && (
              <ul className="list-disc space-y-1 pl-6 text-base">
                {card.bullets.map((b, i) => <li key={i}>{t(b)}</li>)}
              </ul>
            )}
            <Callout tone="good" title={t(bi('Remember', 'Ingat'))}>{t(card.takeaway)}</Callout>
            {card.link && (
              <div><LinkButton href={href(card.link.route)} variant="secondary">{t(card.link.label)} →</LinkButton></div>
            )}
          </div>
        )}
      </Card>
    </li>
  );
}

/** A 5-question quiz. Answers are saved so the user can come back. */
export function Quiz() {
  const { t } = useLang();
  const { state, update } = useApp();
  const answers = state.use.quiz;
  const result = scoreQuiz(answers);
  const [announce, setAnnounce] = useState('');
  const finished = result.answered === result.total;
  const firstOpen = answers.findIndex((a) => a === null || a === undefined);
  const current = firstOpen === -1 ? QUIZ.length - 1 : firstOpen;

  function answer(qIndex: number, optionIndex: number) {
    if (answers[qIndex] !== null && answers[qIndex] !== undefined) return;
    const q = QUIZ[qIndex];
    const next = answers.map((a, i) => (i === qIndex ? optionIndex : a));
    const done = next.every((a) => a !== null && a !== undefined);
    update((s) => ({ ...s, use: { ...s.use, quiz: next }, done: done ? { ...s.done, use: true } : s.done }));
    setAnnounce(optionIndex === q.answer ? t(bi('Correct.', 'Betul.')) : t(bi('Not quite.', 'Belum tepat.')));
  }

  function restart() {
    update((s) => ({ ...s, use: { ...s.use, quiz: QUIZ.map(() => null) } }));
    setAnnounce(t(bi('Quiz restarted.', 'Kuiz dimulakan semula.')));
  }

  const seen = QUIZ.slice(0, current + 1);

  return (
    <section aria-labelledby="quiz-h" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="quiz-h" className="text-2xl font-extrabold">{t(bi('Quick quiz: 5 questions', 'Kuiz pantas: 5 soalan'))}</h2>
        <p className="font-semibold">{t(bi('Answered', 'Dijawab'))} {result.answered} / {result.total}</p>
      </div>
      <p className="text-base text-slate-700">{t(bi('No pressure. This is just for you. Nothing is marked on your record.', 'Tiada tekanan. Ini untuk anda sahaja. Tiada apa-apa dicatat pada rekod anda.'))}</p>

      {seen.map((q, qi) => {
        const picked = answers[qi];
        const answered = picked !== null && picked !== undefined;
        return (
          <Card key={q.id} className="space-y-3">
            <fieldset>
              <legend className="mb-2 text-lg font-extrabold">{qi + 1}. {t(q.question)}</legend>
              <div className="grid gap-2">
                {q.options.map((o, oi) => {
                  const isPick = picked === oi;
                  const isRight = oi === q.answer;
                  const tone = !answered ? 'border-slate-300 bg-white' : isRight ? 'border-emerald-600 bg-emerald-50' : isPick ? 'border-rose-600 bg-rose-50' : 'border-slate-200 bg-white opacity-70';
                  return (
                    <label key={oi} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2 text-base font-semibold ${tone}`}>
                      <input type="radio" name={q.id} className="h-5 w-5" checked={isPick} disabled={answered} onChange={() => answer(qi, oi)} />
                      <span>{t(o)}</span>
                      {answered && isRight && <span className="ml-auto font-bold text-emerald-800"><span aria-hidden="true">✔ </span>{t(bi('Right answer', 'Jawapan betul'))}</span>}
                      {answered && isPick && !isRight && <span className="ml-auto font-bold text-rose-800"><span aria-hidden="true">✘ </span>{t(bi('Your answer', 'Jawapan anda'))}</span>}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {answered && (
              <p className="text-base" role="status">
                <strong>{picked === q.answer ? t(bi('Correct. ', 'Betul. ')) : t(bi('Not quite. ', 'Belum tepat. '))}</strong>
                {t(q.explain)}
              </p>
            )}
          </Card>
        );
      })}

      {finished && (
        <Card className="space-y-3 border-cyan-600 bg-cyan-50/60">
          <p className="text-3xl font-bold">{t(bi('Your score', 'Skor anda'))}: {result.score} {t(bi('out of', 'daripada'))} {result.total}</p>
          <p className="text-lg">
            {result.score === result.total
              ? t(bi('Great job. You know the basics of using a first card well.', 'Syabas. Anda tahu asas menggunakan kad pertama dengan baik.'))
              : result.score >= 3
                ? t(bi('Good start. Have a look at the cards below to fill the gaps.', 'Permulaan yang baik. Lihat kad di bawah untuk melengkapkan kekurangan.'))
                : t(bi('That is okay. These cards are short and will help.', 'Tidak mengapa. Kad ini pendek dan akan membantu.'))}
          </p>
          {result.wrong.length > 0 && (
            <div>
              <p className="font-bold">{t(bi('Review these:', 'Semak ini:'))}</p>
              <ul className="list-disc space-y-1 pl-6">
                {[...new Set(result.wrong.map((w) => w.review))].map((id) => {
                  const c = findLearnCard(id)!;
                  return <li key={id}><a href={learnHref(id)} className="inline-flex min-h-11 items-center font-semibold text-cyan-800 underline">{t(c.title)}</a></li>;
                })}
              </ul>
            </div>
          )}
          <Button variant="secondary" onClick={restart}>{t(bi('Try again', 'Cuba lagi'))}</Button>
        </Card>
      )}
      {!finished && result.answered > 0 && <Badge tone="info">{t(bi('Keep going. Answer the next question.', 'Teruskan. Jawab soalan seterusnya.'))}</Badge>}
      <p className="sr-only" role="status" aria-live="polite">{announce}</p>
    </section>
  );
}

export { LEARN_CARDS };
