'use client';
import Link from 'next/link';
import { useAtlasStore, type PanelTab } from '@/lib/store';
import SearchBar from '@/components/panels/search-bar';
import ColorLegend from '@/components/panels/color-legend';
import ThemeToggle from '@/components/theme-toggle';
import LanguageToggle from '@/components/language-toggle';
import { useT } from '@/lib/i18n';
import { Menu } from 'lucide-react';

const NAV: { id: PanelTab; labelKey: string }[] = [
  { id: 'detail', labelKey: 'nav.explore' },
  { id: 'tours', labelKey: 'nav.tours_short' },
  { id: 'quiz', labelKey: 'nav.practice' },
  { id: 'cards', labelKey: 'nav.cards' },
  { id: 'bookmarks', labelKey: 'nav.my_structures' },
];

export default function AppHeader() {
  const tr = useT();
  const sidebarOpen = useAtlasStore(s => s.sidebarOpen);
  const setSidebarOpen = useAtlasStore(s => s.setSidebarOpen);
  const panelTab = useAtlasStore(s => s.panelTab);
  const setPanelTab = useAtlasStore(s => s.setPanelTab);

  return (
    <header className="relative z-40 flex-shrink-0">
      <div className="flex items-center gap-2 px-3 pb-1 pt-3 md:gap-4 md:px-7 md:py-5">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          aria-label={tr('header.systems_menu')}
        >
          <Menu size={18} />
        </button>

        <Link href="/" className="flex-shrink-0 font-display text-xl font-light tracking-tight md:text-[22px]" aria-label={tr('header.home')}>
          {tr('app.brand')} <em className="font-normal italic text-primary">{tr('app.brand_em')}</em>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label={tr('nav.sections')}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setPanelTab(n.id)}
              aria-current={panelTab === n.id ? 'page' : undefined}
              className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                panelTab === n.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tr(n.labelKey)}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center justify-end gap-1 md:flex-1 md:gap-2">
          <div className="hidden w-full min-w-0 max-w-[300px] md:block">
            <SearchBar />
          </div>
          <ColorLegend />
          <div className="hidden md:block">
            <LanguageToggle />
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile: search gets its own full-width row */}
      <div className="px-3 pb-2 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
