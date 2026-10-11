'use client';
import { useAtlasStore, type PanelTab } from '@/lib/store';
import DetailPanel from '@/components/panels/detail-panel';
import { motion, AnimatePresence, useDragControls, type PanInfo } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Route, HelpCircle, Bookmark, TreeDeciduous, BookOpen, X, MousePointerClick } from 'lucide-react';
import TourEngine from '@/components/learning/tour-engine';
import QuizEngine from '@/components/learning/quiz-engine';
import BookmarksPanel from '@/components/learning/bookmarks-panel';
import StructureTree from '@/components/learning/structure-tree';

const TABS: { id: PanelTab; icon: typeof BookOpen; label: string; title: string }[] = [
  { id: 'detail', icon: BookOpen, label: 'Explorar', title: 'Estructura' },
  { id: 'tours', icon: Route, label: 'Recorridos', title: 'Recorridos guiados' },
  { id: 'quiz', icon: HelpCircle, label: 'Practicar', title: 'Practicar' },
  { id: 'bookmarks', icon: Bookmark, label: 'Guardadas', title: 'Mis estructuras' },
  { id: 'tree', icon: TreeDeciduous, label: 'Índice', title: 'Índice de estructuras' },
];

export default function MobileDetailSheet() {
  const selectedId = useAtlasStore(s => s.selectedStructureId);
  const tab = useAtlasStore(s => s.panelTab);
  const setTab = useAtlasStore(s => s.setPanelTab);
  const [expanded, setExpanded] = useState(false);
  const [prevSelectedId, setPrevSelectedId] = useState(selectedId);
  const dragControls = useDragControls();

  // Open the sheet when a structure is picked on the model.
  if (selectedId !== prevSelectedId) {
    setPrevSelectedId(selectedId);
    if (selectedId) setExpanded(true);
  }
  // The tab lives in the shared store, so it can't be set during render.
  useEffect(() => {
    if (selectedId) setTab('detail');
  }, [selectedId, setTab]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 90 || info.velocity.y > 500) setExpanded(false);
  };

  const current = TABS.find(t => t.id === tab) ?? TABS[0];

  return (
    <div className="md:hidden">
      {/* Bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/[0.06] bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
        aria-label="Secciones"
      >
        <div className="flex px-1">
          {TABS.map(tb => {
            const Icon = tb.icon;
            const active = tab === tb.id && expanded;
            return (
              <button
                key={tb.id}
                onClick={() => {
                  if (active) { setExpanded(false); return; }
                  setTab(tb.id);
                  setExpanded(true);
                }}
                aria-current={active ? 'page' : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${active ? 'bg-primary/15' : ''}`}>
                  <Icon size={17} />
                </span>
                <span className="w-full truncate text-center">{tb.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Expandable sheet */}
      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/40"
              onClick={() => setExpanded(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              drag="y"
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={onDragEnd}
              className="glass-panel fixed inset-x-0 bottom-[calc(62px+env(safe-area-inset-bottom))] z-30 flex max-h-[72dvh] flex-col rounded-t-[24px] bg-card/95"
              role="dialog"
              aria-label={current.title}
            >
              {/* Drag handle + header */}
              <div
                className="flex-shrink-0 cursor-grab touch-none px-5 pb-2 pt-2.5 active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{current.title}</span>
                  <button
                    onClick={() => setExpanded(false)}
                    className="-mr-2 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                    aria-label="Cerrar panel"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3">
                {tab === 'detail' && (
                  selectedId ? <DetailPanel /> : (
                    <div className="flex flex-col gap-3 px-6 pb-8 pt-2">
                      <h2 className="font-display text-[26px] font-light leading-tight">
                        Toca una estructura <em className="italic text-primary">para conocerla</em>
                      </h2>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Arrastra para girar el modelo, pellizca para acercar y elige sistemas desde el menú.
                      </p>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MousePointerClick size={14} className="text-primary" /> También puedes usar el buscador superior.
                      </span>
                    </div>
                  )
                )}
                {tab === 'tours' && <TourEngine />}
                {tab === 'quiz' && <QuizEngine />}
                {tab === 'bookmarks' && <BookmarksPanel />}
                {tab === 'tree' && <StructureTree />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for bottom bar */}
      <div className="h-[calc(62px+env(safe-area-inset-bottom))]" />
    </div>
  );
}
