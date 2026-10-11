'use client';
import { useState, useCallback } from 'react';
import { GUIDED_TOURS, type GuidedTour, type TourStep } from '@/data/tours';
import { SYSTEM_MAP, type SystemId } from '@/data/systems';
import { useAtlasStore } from '@/lib/store';
import { useLocale, t } from '@/lib/i18n';
import { Route, ChevronLeft, ChevronRight, CheckCircle2, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TourEngine() {
  const locale = useLocale();
  const setSelected = useAtlasStore(s => s.setSelectedStructure);
  const isolateSystem = useAtlasStore(s => s.isolateSystem);
  const setAllSystems = useAtlasStore(s => s.setAllSystems);
  const completedTours = useAtlasStore(s => s.completedTours);
  const completeTour = useAtlasStore(s => s.completeTour);
  const setActiveMode = useAtlasStore(s => s.setActiveMode);

  const [activeTour, setActiveTour] = useState<GuidedTour | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [finished, setFinished] = useState(false);

  const startTour = useCallback((tour: GuidedTour) => {
    setActiveTour(tour);
    setStepIdx(0);
    setFinished(false);
    setActiveMode('tour');
    const firstStep = tour?.steps?.[0];
    if (firstStep) {
      isolateSystem(firstStep.systemId);
      setSelected(firstStep.structureId);
    }
  }, [isolateSystem, setSelected, setActiveMode]);

  const goStep = useCallback((idx: number) => {
    if (!activeTour) return;
    const step = activeTour?.steps?.[idx];
    if (!step) return;
    setStepIdx(idx);
    isolateSystem(step.systemId);
    setSelected(step.structureId);
  }, [activeTour, isolateSystem, setSelected]);

  const finishTour = useCallback(() => {
    if (activeTour) {
      completeTour(activeTour.id);
    }
    setFinished(true);
  }, [activeTour, completeTour]);

  const closeTour = useCallback(() => {
    setActiveTour(null);
    setFinished(false);
    setAllSystems(true);
    setSelected(null);
    setActiveMode('atlas');
  }, [setAllSystems, setSelected, setActiveMode]);

  // Tour list
  if (!activeTour) {
    return (
      <div className="space-y-3 p-3">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Route size={13} className="text-primary" />
          {t('nav.tours', locale)}
        </h3>
        {(GUIDED_TOURS ?? []).map((tour: any) => {
          const done = (completedTours ?? []).includes(tour?.id ?? '');
          return (
            <div key={tour?.id} className="bg-card rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold">{locale === 'es' ? tour?.titulo_es : tour?.titulo_en}</h4>
                  <p className="text-xs text-muted-foreground">{locale === 'es' ? tour?.descripcion_es : tour?.descripcion_en}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{tour?.steps?.length ?? 0} {t('tour.step', locale).toLowerCase()}s</p>
                </div>
                {done && <CheckCircle2 size={16} className="text-primary flex-shrink-0" />}
              </div>
              <button
                onClick={() => startTour(tour)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <Play size={12} />
                {t('tour.start', locale)}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  // Active tour
  const currentStep = activeTour?.steps?.[stepIdx];
  const totalSteps = activeTour?.steps?.length ?? 0;
  const isLast = stepIdx >= totalSteps - 1;
  const sys = currentStep ? SYSTEM_MAP?.[currentStep?.systemId as SystemId] : null;

  return (
    <div className="glass-panel rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{locale === 'es' ? activeTour?.titulo_es : activeTour?.titulo_en}</h3>
        <button onClick={closeTour} className="p-1 rounded hover:bg-destructive/10 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex gap-0.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${
              i <= stepIdx ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {finished ? (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <CheckCircle2 size={32} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold">{t('tour.completed', locale)}</p>
            <button
              onClick={closeTour}
              className="mt-3 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              {t('tour.finish', locale)}
            </button>
          </motion.div>
        ) : currentStep ? (
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sys?.color }} />
              <span className="text-[10px] text-muted-foreground">
                {t('tour.step', locale)} {stepIdx + 1} {t('tour.of', locale)} {totalSteps}
              </span>
            </div>
            <h4 className="text-sm font-semibold">{locale === 'es' ? currentStep?.titulo_es : currentStep?.titulo_en}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              {locale === 'es' ? currentStep?.explicacion_es : currentStep?.explicacion_en}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!finished && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => goStep(stepIdx - 1)}
            disabled={stepIdx === 0}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={12} />
            {t('tour.prev', locale)}
          </button>
          <button
            onClick={() => isLast ? finishTour() : goStep(stepIdx + 1)}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            {isLast ? t('tour.finish', locale) : t('tour.next', locale)}
            {!isLast && <ChevronRight size={12} />}
          </button>
        </div>
      )}
    </div>
  );
}
