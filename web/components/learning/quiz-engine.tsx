'use client';
import { useState, useMemo, useCallback } from 'react';
import { QUIZ_QUESTIONS, type QuizDifficulty } from '@/data/quizzes';
import { SYSTEMS, type SystemId } from '@/data/systems';
import { useAtlasStore } from '@/lib/store';
import { useLocale, useT } from '@/lib/i18n';
import { pick, pickList } from '@/lib/l10n';
import { HelpCircle, CheckCircle2, XCircle, Play, RotateCcw, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizEngine() {
  const locale = useLocale();
  const tr = useT();
  const setSelected = useAtlasStore(s => s.setSelectedStructure);
  const saveQuizScore = useAtlasStore(s => s.saveQuizScore);

  const [filterSystem, setFilterSystem] = useState<SystemId | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<QuizDifficulty | 'all'>('all');
  const [active, setActive] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const filteredQuestions = useMemo(() => {
    return (QUIZ_QUESTIONS ?? []).filter((q: any) => {
      if (filterSystem !== 'all' && q?.sistemaId !== filterSystem) return false;
      if (filterDifficulty !== 'all' && q?.dificultad !== filterDifficulty) return false;
      return true;
    });
  }, [filterSystem, filterDifficulty]);

  const startQuiz = useCallback(() => {
    setActive(true);
    setCurrentIdx(0);
    setAnswered(null);
    setScore(0);
    setShowResults(false);
  }, []);

  const answerQuestion = useCallback((optIdx: number) => {
    if (answered !== null) return;
    setAnswered(optIdx);
    const q = filteredQuestions?.[currentIdx];
    if (q && optIdx === q.respuestaCorrecta) {
      setScore(prev => prev + 1);
    }
    if (q?.structureId) {
      setSelected(q.structureId);
    }
  }, [answered, filteredQuestions, currentIdx, setSelected]);

  const nextQuestion = useCallback(() => {
    const isLast = currentIdx >= (filteredQuestions?.length ?? 0) - 1;
    if (isLast) {
      const key = `${filterSystem}-${filterDifficulty}`;
      // `score` already counts the last answer (answerQuestion runs before "next").
      saveQuizScore(key, score, filteredQuestions?.length ?? 0);
      setShowResults(true);
    } else {
      setCurrentIdx(prev => prev + 1);
      setAnswered(null);
    }
  }, [currentIdx, filteredQuestions, filterSystem, filterDifficulty, score, saveQuizScore]);

  // Results screen
  if (showResults) {
    const total = filteredQuestions?.length ?? 0;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="p-4 text-center space-y-3">
        <Award size={36} className="text-primary mx-auto" />
        <h3 className="text-lg font-bold">{tr('quiz.score')}</h3>
        <p className="text-3xl font-display font-bold text-primary">{score}/{total}</p>
        <p className="text-sm text-muted-foreground">{pct}%</p>
        <button
          onClick={() => { setActive(false); setShowResults(false); }}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <RotateCcw size={14} />
          {tr('quiz.start')}
        </button>
      </div>
    );
  }

  // Quiz list / filters
  if (!active) {
    return (
      <div className="space-y-3 p-3">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <HelpCircle size={13} className="text-primary" />
          {tr('nav.quiz')}
        </h3>

        {/* System filter */}
        <div>
          <label className="text-[10px] text-muted-foreground">{tr('quiz.system_filter')}</label>
          <select
            value={filterSystem}
            onChange={(e) => setFilterSystem(e.target.value as SystemId | 'all')}
            className="w-full mt-0.5 text-xs px-2 py-1.5 rounded-md bg-card border border-border"
          >
            <option value="all">{tr('quiz.all_systems')}</option>
            {(SYSTEMS ?? []).map((s: any) => (
              <option key={s?.id} value={s?.id}>{pick(s, 'nombre', locale)}</option>
            ))}
          </select>
        </div>

        {/* Difficulty filter */}
        <div>
          <label className="text-[10px] text-muted-foreground">{tr('quiz.difficulty')}</label>
          <div className="flex gap-1 mt-0.5">
            {(['all', 'basico', 'intermedio', 'avanzado'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setFilterDifficulty(d as any)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  filterDifficulty === d
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {d === 'all' ? tr('quiz.all_difficulties') : tr(`quiz.${d}`)}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{filteredQuestions?.length ?? 0} preguntas disponibles</p>

        <button
          onClick={startQuiz}
          disabled={(filteredQuestions?.length ?? 0) === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          <Play size={14} />
          {tr('quiz.start')}
        </button>
      </div>
    );
  }

  // Active quiz question
  const question = filteredQuestions?.[currentIdx];
  if (!question) return null;

  const opciones = pickList(question, 'opciones', locale);
  const isLast = currentIdx >= (filteredQuestions?.length ?? 0) - 1;

  return (
    <div className="p-3 space-y-3">
      {/* Progress */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{currentIdx + 1} / {filteredQuestions?.length ?? 0}</span>
        <span className="px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
          {tr(`quiz.${question?.dificultad}`)}
        </span>
      </div>

      <div className="flex gap-0.5">
        {Array.from({ length: filteredQuestions?.length ?? 0 }).map((_, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full ${
            i < currentIdx ? 'bg-primary' : i === currentIdx ? 'bg-primary/50' : 'bg-muted'
          }`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-3"
        >
          <p className="text-sm font-medium">{pick(question, 'pregunta', locale)}</p>

          <div className="space-y-1.5">
            {(opciones ?? []).map((opt: string, i: number) => {
              let styles = 'bg-card border border-border hover:bg-accent';
              if (answered !== null) {
                if (i === question?.respuestaCorrecta) styles = 'bg-green-500/10 border border-green-500/50 text-green-700 dark:text-green-400';
                else if (i === answered) styles = 'bg-red-500/10 border border-red-500/50 text-red-700 dark:text-red-400';
                else styles = 'bg-muted border border-border opacity-50';
              }

              return (
                <button
                  key={i}
                  onClick={() => answerQuestion(i)}
                  disabled={answered !== null}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${styles}`}
                >
                  <span className="font-mono mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {answered !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-1.5">
                {answered === question?.respuestaCorrecta
                  ? <><CheckCircle2 size={14} className="text-green-600" /><span className="text-xs font-semibold text-green-700 dark:text-green-400">{tr('quiz.correct')}</span></>
                  : <><XCircle size={14} className="text-red-600" /><span className="text-xs font-semibold text-red-700 dark:text-red-400">{tr('quiz.incorrect')}</span></>
                }
              </div>
              <p className="text-xs text-muted-foreground bg-accent/50 rounded-lg p-2">
                {pick(question, 'explicacion', locale)}
              </p>
              <button
                onClick={nextQuestion}
                className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                {isLast ? tr('quiz.finish') : tr('quiz.next')}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
