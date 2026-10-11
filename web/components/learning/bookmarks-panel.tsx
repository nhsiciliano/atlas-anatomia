'use client';
import { STRUCTURE_MAP } from '@/data/anatomy-data';
import { SYSTEM_MAP, type SystemId } from '@/data/systems';
import { useAtlasStore } from '@/lib/store';
import { useLocale, useT } from '@/lib/i18n';
import { pick } from '@/lib/l10n';
import { Bookmark, Clock, Trash2 } from 'lucide-react';

export default function BookmarksPanel() {
  const locale = useLocale();
  const tr = useT();
  const bookmarks = useAtlasStore(s => s.bookmarks);
  const recentlyViewed = useAtlasStore(s => s.recentlyViewed);
  const setSelected = useAtlasStore(s => s.setSelectedStructure);
  const toggleBookmark = useAtlasStore(s => s.toggleBookmark);

  return (
    <div className="space-y-4 p-3">
      {/* Bookmarks */}
      <div>
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          <Bookmark size={13} className="text-primary" />
          {tr('nav.bookmarks')}
        </h3>
        {(bookmarks ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground italic">{tr('bookmark.empty')}</p>
        ) : (
          <div className="space-y-1">
            {(bookmarks ?? []).map((id: string) => {
              const s = STRUCTURE_MAP?.[id];
              const sys = s ? SYSTEM_MAP?.[s?.systemId as SystemId] : null;
              if (!s) return null;
              return (
                <div key={id} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent transition-colors">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sys?.color }} />
                  <button
                    onClick={() => setSelected(id)}
                    className="flex-1 text-left text-xs truncate"
                  >
                    {pick(s, 'nombre', locale)}
                  </button>
                  <button
                    onClick={() => toggleBookmark(id)}
                    className="p-0.5 rounded hover:bg-destructive/10 transition-colors"
                    aria-label={tr('bookmark.remove')}
                  >
                    <Trash2 size={11} className="text-muted-foreground" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Viewed */}
      <div>
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          <Clock size={13} className="text-primary" />
          {tr('recent.title')}
        </h3>
        {(recentlyViewed ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground italic">{tr('recent.empty')}</p>
        ) : (
          <div className="space-y-1">
            {(recentlyViewed ?? []).slice(0, 10).map((id: string) => {
              const s = STRUCTURE_MAP?.[id];
              const sys = s ? SYSTEM_MAP?.[s?.systemId as SystemId] : null;
              if (!s) return null;
              return (
                <button
                  key={id}
                  onClick={() => setSelected(id)}
                  className="flex items-center gap-2 w-full rounded-md px-2 py-1 hover:bg-accent transition-colors text-left"
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sys?.color }} />
                  <span className="text-xs truncate">{pick(s, 'nombre', locale)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
