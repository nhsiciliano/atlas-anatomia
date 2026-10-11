'use client';
import { useAtlasStore, type PanelTab } from '@/lib/store';
import { useT } from '@/lib/i18n';
import DetailPanel from '@/components/panels/detail-panel';
import ComparePanel from '@/components/learning/compare-panel';
import TourEngine from '@/components/learning/tour-engine';
import QuizEngine from '@/components/learning/quiz-engine';
import FlashcardsEngine from '@/components/learning/flashcards-engine';
import BookmarksPanel from '@/components/learning/bookmarks-panel';
import StructureTree from '@/components/learning/structure-tree';
import { BookOpen, Route, HelpCircle, GalleryVerticalEnd, Bookmark, TreeDeciduous, MousePointerClick } from 'lucide-react';

export default function RightPanel() {
  const tr = useT();
  const selectedId = useAtlasStore(s => s.selectedStructureId);
  const compareIds = useAtlasStore(s => s.compareIds);
  const tab = useAtlasStore(s => s.panelTab);
  const setTab = useAtlasStore(s => s.setPanelTab);

  const tabs: { id: PanelTab; icon: any; label: string }[] = [
    { id: 'detail', icon: BookOpen, label: tr('nav.atlas') },
    { id: 'tours', icon: Route, label: tr('nav.tours') },
    { id: 'quiz', icon: HelpCircle, label: tr('nav.quiz') },
    { id: 'cards', icon: GalleryVerticalEnd, label: tr('nav.cards') },
    { id: 'bookmarks', icon: Bookmark, label: tr('nav.bookmarks') },
    { id: 'tree', icon: TreeDeciduous, label: tr('nav.arbol') },
  ];

  return (
    <div className="glass-panel flex h-full w-full flex-col overflow-hidden rounded-[20px]">
      <div className="flex gap-0.5 overflow-x-auto px-2 pt-2 scrollbar-none" role="tablist">
        {tabs.map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button
              key={tb.id}
              role="tab"
              aria-selected={active}
              title={tb.label}
              onClick={() => setTab(tb.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] transition-colors ${
                active ? 'bg-foreground/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={12} />
              <span className={active ? '' : 'sr-only'}>{tb.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {(compareIds ?? []).length >= 2 && tab === 'detail' && (
          <div className="p-2">
            <ComparePanel />
          </div>
        )}

        {tab === 'detail' && (
          selectedId ? (
            <DetailPanel />
          ) : (
            <div className="flex flex-col items-start gap-3 px-6 py-10">
              <span className="eyebrow">{tr('nav.explore')}</span>
              <h2 className="font-display text-[28px] font-light leading-tight">
                {tr('panel.empty_title')} <em className="italic text-primary">{tr('panel.empty_title_em')}</em>
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tr('panel.empty_desktop')}
              </p>
              <span className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
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
    </div>
  );
}
