'use client';
import { VIEWS, type ViewId } from '@/data/systems';
import { useAtlasStore } from '@/lib/store';
import { useLocale } from '@/lib/i18n';
import { RotateCcw, User, UserRound } from 'lucide-react';

export default function ViewControls() {
  const locale = useLocale();
  const currentView = useAtlasStore(s => s.currentView);
  const setView = useAtlasStore(s => s.setView);
  const resetView = useAtlasStore(s => s.resetView);

  return (
    <div className="flex items-center gap-1 p-1 bg-card rounded-lg shadow-sm border border-border">
      {(VIEWS ?? []).map((v: any) => (
        <button
          key={v?.id}
          onClick={() => setView(v?.id as ViewId)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            currentView === v?.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
          aria-pressed={currentView === v?.id}
        >
          {locale === 'es' ? v?.nombre_es : v?.nombre_en}
        </button>
      ))}
      <button
        onClick={resetView}
        className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="Restablecer vista"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}
