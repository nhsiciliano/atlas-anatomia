'use client';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Download, Upload, RotateCcw, Trophy } from 'lucide-react';
import { STRUCTURES } from '@/data/anatomy-data';
import { MANUAL_CARDS } from '@/data/flashcards';
import { GUIDED_TOURS } from '@/data/tours';
import { SYSTEMS } from '@/data/systems';
import { buildDeck, srsStats } from '@/lib/srs';
import { useAtlasStore } from '@/lib/store';
import { useLocale, useT } from '@/lib/i18n';
import { pick } from '@/lib/l10n';

type Pending = { kind: 'import'; json: string; file: string } | { kind: 'reset' } | null;
type Notice = { tone: 'ok' | 'error'; text: string } | null;

/** Local date as YYYY-MM-DD, for the export file name. */
const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function ProgressPanel() {
  const locale = useLocale();
  const tr = useT();
  const srs = useAtlasStore(s => s.srs);
  const completedTours = useAtlasStore(s => s.completedTours);
  const quizScores = useAtlasStore(s => s.quizScores);
  const exportProgress = useAtlasStore(s => s.exportProgress);
  const importProgress = useAtlasStore(s => s.importProgress);
  const resetProgress = useAtlasStore(s => s.resetProgress);
  const fileRef = useRef<HTMLInputElement>(null);
  const [now] = useState(() => new Date());
  const [pending, setPending] = useState<Pending>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const deck = useMemo(() => buildDeck(STRUCTURES, MANUAL_CARDS), []);
  const stats = useMemo(() => srsStats(deck, srs, now), [deck, srs, now]);
  const toursDone = GUIDED_TOURS.filter(t => completedTours.includes(t.id)).length;

  // Quiz keys are `${system}-${difficulty}`: keep the best percentage per system ('all' included).
  const bestBySystem = useMemo(() => {
    const best = new Map<string, { best: number; total: number }>();
    for (const [key, score] of Object.entries(quizScores)) {
      const sys = key.slice(0, key.lastIndexOf('-'));
      const prev = best.get(sys);
      if (score.total > 0 && (!prev || score.best / score.total > prev.best / prev.total)) best.set(sys, score);
    }
    return [...best.entries()].sort(([a], [b]) => (a === 'all' ? -1 : b === 'all' ? 1 : a.localeCompare(b)));
  }, [quizScores]);

  const systemName = (id: string) => {
    if (id === 'all') return tr('quiz.all_systems');
    const sys = SYSTEMS.find(s => s.id === id);
    return sys ? pick(sys, 'nombre', locale) : id;
  };

  const doExport = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atlas-progreso-${isoDay(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again
    if (!file) return;
    setNotice(null);
    setPending({ kind: 'import', json: await file.text(), file: file.name });
  };

  const confirm = () => {
    if (pending?.kind === 'import') {
      const result = importProgress(pending.json);
      setNotice(result.ok
        ? { tone: 'ok', text: tr('progress.imported') }
        : { tone: 'error', text: tr('progress.import_error', { error: tr(`progress.err.${result.code}`) }) });
    } else if (pending?.kind === 'reset') {
      resetProgress();
      setNotice({ tone: 'ok', text: tr('progress.reset_done') });
    }
    setPending(null);
  };

  const btn = 'flex flex-1 items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-[11px] transition-colors hover:bg-accent';

  return (
    <div className="space-y-3 rounded-xl bg-foreground/[0.03] p-3">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Trophy size={13} className="text-primary" />
        {tr('progress.title')}
      </h3>

      <div className="grid grid-cols-3 gap-1.5 text-center">
        {([
          ['progress.due', String(stats.vencidas)],
          ['progress.learned', String(stats.aprendidas)],
          ['progress.tours', tr('progress.tours_value', { done: toursDone, total: GUIDED_TOURS.length })],
        ] as const).map(([key, value]) => (
          <div key={key} className="rounded-lg bg-card px-1 py-2">
            <p className="text-base font-semibold tabular-nums">{value}</p>
            <p className="text-[10px] leading-tight text-muted-foreground">{tr(key)}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-1 text-[10px] text-muted-foreground">{tr('progress.best_scores')}</p>
        {bestBySystem.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">{tr('progress.no_scores')}</p>
        ) : (
          <ul className="space-y-0.5">
            {bestBySystem.map(([sys, s]) => (
              <li key={sys} className="flex justify-between text-xs">
                <span className="truncate">{systemName(sys)}</span>
                <span className="tabular-nums text-muted-foreground">
                  {s.best}/{s.total} · {Math.round((s.best / s.total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pending ? (
        <div className="space-y-2 rounded-lg border border-border bg-card p-2" role="alertdialog" aria-live="polite">
          <p className="text-xs">
            {pending.kind === 'import'
              ? tr('progress.confirm_import_hint', { file: pending.file })
              : tr('progress.confirm_reset_hint')}
          </p>
          <div className="flex gap-1.5">
            <button onClick={confirm} className={`${btn} border-destructive/40 text-destructive hover:bg-destructive/10`}>
              {tr(pending.kind === 'import' ? 'progress.confirm_import' : 'progress.confirm_reset')}
            </button>
            <button onClick={() => setPending(null)} className={btn}>{tr('progress.cancel')}</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-1.5">
          <button onClick={doExport} className={btn}><Download size={12} /> {tr('progress.export')}</button>
          <button onClick={() => fileRef.current?.click()} className={btn}><Upload size={12} /> {tr('progress.import')}</button>
          <button onClick={() => { setNotice(null); setPending({ kind: 'reset' }); }} className={btn}>
            <RotateCcw size={12} /> {tr('progress.reset')}
          </button>
        </div>
      )}
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} aria-hidden tabIndex={-1} />

      {notice && (
        <p role="status" className={`text-xs ${notice.tone === 'ok' ? 'text-green-700 dark:text-green-400' : 'text-destructive'}`}>
          {notice.text}
        </p>
      )}
    </div>
  );
}
