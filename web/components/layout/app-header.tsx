'use client';
import { useAtlasStore, type PanelTab } from '@/lib/store';
import SearchBar from '@/components/panels/search-bar';
import ColorLegend from '@/components/panels/color-legend';
import ThemeToggle from '@/components/theme-toggle';
import { Menu } from 'lucide-react';

const NAV: { id: PanelTab; label: string }[] = [
  { id: 'detail', label: 'Explorar' },
  { id: 'tours', label: 'Recorridos' },
  { id: 'quiz', label: 'Practicar' },
  { id: 'bookmarks', label: 'Mis estructuras' },
];

export default function AppHeader() {
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
          aria-label="Menú de sistemas"
        >
          <Menu size={18} />
        </button>

        <a href="/" className="flex-shrink-0 font-display text-xl font-light tracking-tight md:text-[22px]" aria-label="Atlas del cuerpo — inicio">
          Atlas <em className="font-normal italic text-primary">del cuerpo</em>
        </a>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Secciones">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setPanelTab(n.id)}
              aria-current={panelTab === n.id ? 'page' : undefined}
              className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                panelTab === n.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center justify-end gap-1 md:flex-1 md:gap-2">
          <div className="hidden w-full min-w-0 max-w-[300px] md:block">
            <SearchBar />
          </div>
          <ColorLegend />
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
