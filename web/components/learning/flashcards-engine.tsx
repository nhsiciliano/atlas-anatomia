'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { GalleryVerticalEnd, RotateCcw, X } from 'lucide-react';
import { STRUCTURES, STRUCTURE_MAP } from '@/data/anatomy-data';
import { MANUAL_CARDS } from '@/data/flashcards';
import { SYSTEMS, type SystemId } from '@/data/systems';
import { buildDeck, dueCards, nextIntervals, srsStats, type Card, type Grade } from '@/lib/srs';
import { useAtlasStore } from '@/lib/store';
import { useLocale, useT } from '@/lib/i18n';
import { pick } from '@/lib/l10n';

const NEW_OPTIONS = [5, 10, 20] as const;
const GRADES: Grade[] = [0, 1, 2, 3];
const GRADE_KEY: Record<Grade, string> = { 0: 'cards.again', 1: 'cards.hard', 2: 'cards.good', 3: 'cards.easy' };
const GRADE_STYLE: Record<Grade, string> = {
  0: 'border-red-500/40 text-red-700 dark:text-red-400 hover:bg-red-500/10',
  1: 'border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10',
  2: 'border-green-500/40 text-green-700 dark:text-green-400 hover:bg-green-500/10',
  3: 'border-sky-500/40 text-sky-700 dark:text-sky-400 hover:bg-sky-500/10',
};

type Phase = 'home' | 'session' | 'summary';

export default function FlashcardsEngine() {
  const locale = useLocale();
  const tr = useT();
  const srs = useAtlasStore(s => s.srs);
  const prefs = useAtlasStore(s => s.srsPrefs);
  const setSrsPrefs = useAtlasStore(s => s.setSrsPrefs);
  const gradeCard = useAtlasStore(s => s.gradeCard);
  const setSelected = useAtlasStore(s => s.setSelectedStructure);
  const setQuizHighlight = useAtlasStore(s => s.setQuizHighlight);
  const isolateSystem = useAtlasStore(s => s.isolateSystem);
  const reduceMotion = useReducedMotion();

  // "Now" is taken when the screen opens and refreshed when a session ends, so render stays pure.
  const [now, setNow] = useState(() => new Date());
  const [phase, setPhase] = useState<Phase>('home');
  const [queue, setQueue] = useState<Card[]>([]);
  const [done, setDone] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState<Record<Grade, number>>({ 0: 0, 1: 0, 2: 0, 3: 0 });

  // Leaving the screen must never leave a structure hidden (same rule as the quiz).
  useEffect(() => () => useAtlasStore.getState().setQuizHighlight(null), []);

  const deck = useMemo(
    () => buildDeck(STRUCTURES, MANUAL_CARDS, { systems: prefs.systems === 'all' ? undefined : prefs.systems }),
    [prefs.systems],
  );
  const stats = useMemo(() => srsStats(deck, srs, now), [deck, srs, now]);
  const pending = useMemo(
    () => dueCards(deck, srs, now, { maxDue: prefs.maxDue, maxNew: prefs.maxNew }),
    [deck, srs, now, prefs.maxDue, prefs.maxNew],
  );

  // Identification cards hide the name exactly like quiz identification questions.
  const presentCard = useCallback((card: Card | undefined) => {
    const sid = card?.kind === 'identificar' ? card.structureId : undefined;
    setQuizHighlight(sid ?? null);
    if (sid) {
      const sys = STRUCTURE_MAP[sid]?.systemId;
      if (sys) isolateSystem(sys);
      setSelected(sid, { recordRecent: false });
    }
  }, [setQuizHighlight, isolateSystem, setSelected]);

  const startSession = useCallback(() => {
    setQueue(pending);
    setDone(0);
    setFlipped(false);
    setTally({ 0: 0, 1: 0, 2: 0, 3: 0 });
    setPhase('session');
    presentCard(pending[0]);
  }, [pending, presentCard]);

  const backHome = useCallback(() => {
    setQuizHighlight(null);
    setNow(new Date());
    setPhase('home');
  }, [setQuizHighlight]);

  const reveal = useCallback(() => {
    const card = queue[0];
    setFlipped(true);
    setQuizHighlight(null);
    // Show the structure on the model once the answer is visible.
    if (card?.structureId) setSelected(card.structureId, { recordRecent: false });
  }, [queue, setQuizHighlight, setSelected]);

  const grade = useCallback((g: Grade) => {
    const card = queue[0];
    if (!card) return;
    gradeCard(card.id, g);
    setTally(t => ({ ...t, [g]: t[g] + 1 }));
    // "Otra vez" sends the card to the back of this session's queue until it gets a passing grade.
    const rest = g === 0 ? [...queue.slice(1), card] : queue.slice(1);
    if (g !== 0) setDone(d => d + 1);
    setQueue(rest);
    setFlipped(false);
    if (rest.length) presentCard(rest[0]);
    else {
      setQuizHighlight(null);
      setPhase('summary');
    }
  }, [queue, gradeCard, presentCard, setQuizHighlight]);

  const toggleSystem = (id: SystemId) => {
    const current = prefs.systems === 'all' ? [] : prefs.systems;
    const next = current.includes(id) ? current.filter(s => s !== id) : [...current, id];
    setSrsPrefs({ systems: next.length ? next : 'all' });
  };

  const chip = (active: boolean) =>
    `px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
      active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
    }`;

  // ── Summary ──
  if (phase === 'summary') {
    return (
      <div className="space-y-3 p-4 text-center">
        <GalleryVerticalEnd size={32} className="mx-auto text-primary" />
        <h3 className="text-lg font-bold">{tr('cards.summary_title')}</h3>
        <p className="text-sm text-muted-foreground">{tr('cards.summary_done', { count: done })}</p>
        <div className="grid grid-cols-4 gap-1.5">
          {GRADES.map(g => (
            <div key={g} className={`rounded-lg border px-1 py-2 ${GRADE_STYLE[g]}`}>
              <p className="text-lg font-semibold tabular-nums">{tally[g]}</p>
              <p className="text-[10px]">{tr(GRADE_KEY[g])}</p>
            </div>
          ))}
        </div>
        <button
          onClick={backHome}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <RotateCcw size={14} />
          {tr('cards.back')}
        </button>
      </div>
    );
  }

  // ── Session ──
  if (phase === 'session') {
    const card = queue[0];
    if (!card) return null;
    const intervals = nextIntervals(srs[card.id]);
    const total = done + queue.length;
    const face = flipped ? 'back' : 'front';
    const flip = reduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
      : { initial: { rotateY: 90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 }, exit: { rotateY: -90, opacity: 0 } };

    return (
      <div className="space-y-3 p-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{tr('cards.progress', { done, total })}</span>
          <button onClick={backHome} className="rounded p-0.5 hover:bg-accent" aria-label={tr('cards.exit')} title={tr('cards.exit')}>
            <X size={12} />
          </button>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </div>

        <div style={{ perspective: 800 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${card.id}-${done}-${queue.length}-${face}`}
              {...flip}
              transition={{ duration: reduceMotion ? 0.12 : 0.22 }}
              className="min-h-[140px] rounded-xl border border-border bg-card p-4"
            >
              <p className="eyebrow">{tr(`cards.kind.${card.kind}`)}</p>
              <p className="mt-2 text-sm font-medium leading-relaxed">{pick(card, 'frente', locale)}</p>
              {flipped && (
                <p className="mt-3 border-t border-foreground/[0.08] pt-3 text-sm leading-relaxed text-foreground/85">
                  {pick(card, 'dorso', locale)}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {!flipped ? (
          <button
            onClick={reveal}
            className="w-full rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {tr('cards.show_answer')}
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-1.5" role="group" aria-label={tr('cards.grade_label')}>
            {GRADES.map(g => (
              <button
                key={g}
                onClick={() => grade(g)}
                className={`rounded-md border px-1 py-1.5 text-[11px] font-medium transition-colors ${GRADE_STYLE[g]}`}
              >
                <span className="block">{tr(GRADE_KEY[g])}</span>
                <span className="block text-[10px] opacity-75">{tr('cards.days', { count: intervals[g] })}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Home ──
  return (
    <div className="space-y-3 p-3">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <GalleryVerticalEnd size={13} className="text-primary" />
        {tr('nav.cards')}
      </h3>

      <div>
        <label className="text-[10px] text-muted-foreground">{tr('cards.systems')}</label>
        <div className="mt-0.5 flex flex-wrap gap-1">
          <button onClick={() => setSrsPrefs({ systems: 'all' })} aria-pressed={prefs.systems === 'all'} className={chip(prefs.systems === 'all')}>
            {tr('cards.all_systems')}
          </button>
          {SYSTEMS.map(s => {
            const active = prefs.systems !== 'all' && prefs.systems.includes(s.id);
            return (
              <button key={s.id} onClick={() => toggleSystem(s.id)} aria-pressed={active} className={chip(active)}>
                {pick(s, 'nombre', locale)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-center">
        {([
          ['cards.stat_total', stats.total],
          ['cards.stat_new', stats.nuevas],
          ['cards.stat_due', stats.vencidas],
          ['cards.stat_learned', stats.aprendidas],
        ] as const).map(([key, value]) => (
          <div key={key} className="rounded-lg bg-foreground/[0.04] px-1 py-2">
            <p className="text-base font-semibold tabular-nums">{value}</p>
            <p className="text-[10px] leading-tight text-muted-foreground">{tr(key)}</p>
          </div>
        ))}
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground">{tr('cards.new_per_session')}</label>
        <div className="mt-0.5 flex gap-1">
          {NEW_OPTIONS.map(n => (
            <button key={n} onClick={() => setSrsPrefs({ maxNew: n })} aria-pressed={prefs.maxNew === n} className={chip(prefs.maxNew === n)}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={startSession}
        disabled={pending.length === 0}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
      >
        {tr('cards.start', { count: pending.length })}
      </button>
      {pending.length === 0 && <p className="text-center text-xs text-muted-foreground">{tr('cards.nothing_due')}</p>}
    </div>
  );
}
