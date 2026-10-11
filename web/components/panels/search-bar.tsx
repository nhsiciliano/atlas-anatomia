'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { searchStructures, type SearchResult } from '@/lib/search';
import { SYSTEM_MAP, type SystemId } from '@/data/systems';
import { useAtlasStore } from '@/lib/store';
import { useLocale, useT } from '@/lib/i18n';
import { pick } from '@/lib/l10n';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar() {
  const locale = useLocale();
  const tr = useT();
  const setSelected = useAtlasStore(s => s.setSelectedStructure);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.trim().length >= 2) {
      setResults(searchStructures(q));
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
  }, []);

  const selectResult = useCallback((r: SearchResult) => {
    setSelected(r?.structure?.id ?? null);
    setQuery('');
    setResults([]);
    setOpen(false);
  }, [setSelected]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document?.addEventListener?.('mousedown', handler);
    return () => document?.removeEventListener?.('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full md:max-w-sm">
      <div className="flex items-center gap-2 rounded-full border border-foreground/[0.08] bg-card/70 px-4 py-2 backdrop-blur-md transition-shadow focus-within:ring-2 focus-within:ring-ring md:py-1.5">
        <Search size={14} className="text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={tr('search.placeholder')}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
          aria-label={tr('search.placeholder')}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false); }} aria-label={tr('search.clear')}>
            <X size={14} className="text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (results ?? []).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[50dvh] overflow-y-auto rounded-2xl border border-border bg-card shadow-lg"
          >
            {(results ?? []).map((r: SearchResult) => {
              const sys = SYSTEM_MAP?.[r?.structure?.systemId as SystemId];
              return (
                <button
                  key={r?.structure?.id}
                  onClick={() => selectResult(r)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-accent transition-colors border-b border-border/30 last:border-0"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sys?.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {pick(r.structure, 'nombre', locale)}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {sys && pick(sys, 'nombre', locale)}
                    </p>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
        {open && query?.length >= 2 && (results ?? []).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-3 z-50"
          >
            <p className="text-sm text-muted-foreground text-center">{tr('search.no_results')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
