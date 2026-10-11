'use client';
import { useAtlasStore, type PanelTab } from '@/lib/store';
import DetailPanel from '@/components/panels/detail-panel';
import { motion, AnimatePresence, useDragControls, type PanInfo } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Route, HelpCircle, GalleryVerticalEnd, Bookmark, TreeDeciduous, BookOpen, X, MousePointerClick } from 'lucide-react';
import TourEngine from '@/components/learning/tour-engine';
import QuizEngine from '@/components/learning/quiz-engine';
import FlashcardsEngine from '@/components/learning/flashcards-engine';
import BookmarksPanel from '@/components/learning/bookmarks-panel';
import StructureTree from '@/components/learning/structure-tree';
import { useT } from '@/lib/i18n';

const TABS: { id: PanelTab; icon: typeof BookOpen; labelKey: string; titleKey: string }[] = [
  { id: 'detail', icon: BookOpen, labelKey: 'nav.explore', titleKey: 'sheet.structure' },
  { id: 'tours', icon: Route, labelKey: 'nav.tours_short', titleKey: 'nav.tours' },
  { id: 'quiz', icon: HelpCircle, labelKey: 'nav.practice', titleKey: 'nav.practice' },
  { id: 'cards', icon: GalleryVerticalEnd, labelKey: 'nav.cards', titleKey: 'nav.cards' },
  { id: 'bookmarks', icon: Bookmark, labelKey: 'nav.saved', titleKey: 'nav.my_structures' },
  { id: 'tree', icon: TreeDeciduous, labelKey: 'nav.index', titleKey: 'sheet.structure_index' },
];

export default function MobileDetailSheet() {
  const tr = useT();
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
  // The tab lives in the shared store, so it can't be set during render. Tours, quizzes and the
  // review screen select structures themselves: switching away would unmount them and lose progress.
  useEffect(() => {
    const current = useAtlasStore.getState().panelTab;
    if (selectedId && current !== 'tours' && current !== 'quiz' && current !== 'cards') setTab('detail');
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
        aria-label={tr('nav.sections')}
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
                <span className="w-full truncate text-center">{tr(tb.labelKey)}</span>
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
              aria-label={tr(current.titleKey)}
            >
              {/* Drag handle + header */}
              <div
                className="flex-shrink-0 cursor-grab touch-none px-5 pb-2 pt-2.5 active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{tr(current.titleKey)}</span>
                  <button
                    onClick={() => setExpanded(false)}
                    className="-mr-2 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                    aria-label={tr('sheet.close')}
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
                        {tr('panel.empty_title')} <em className="italic text-primary">{tr('panel.empty_title_em')}</em>
                      </h2>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {tr('panel.empty_mobile')}
                      </p>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MousePointerClick size={14} className="text-primary" /> {tr('panel.search_hint')}
                      </span>
                    </div>
                  )
                )}
                {tab === 'tours' && <TourEngine />}
                {tab === 'quiz' && <QuizEngine />}
                {tab === 'cards' && <FlashcardsEngine />}
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
