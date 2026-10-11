'use client';
import { SYSTEMS, type SystemId } from '@/data/systems';
import { useAtlasStore } from '@/lib/store';
import { useLocale, useT } from '@/lib/i18n';
import { pick } from '@/lib/l10n';
import { Focus, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SystemSidebar() {
  const locale = useLocale();
  const tr = useT();
  const visibleSystems = useAtlasStore(s => s.visibleSystems);
  const systemOpacity = useAtlasStore(s => s.systemOpacity);
  const toggleSystem = useAtlasStore(s => s.toggleSystem);
  const setAllSystems = useAtlasStore(s => s.setAllSystems);
  const setSystemOpacity = useAtlasStore(s => s.setSystemOpacity);
  const isolateSystem = useAtlasStore(s => s.isolateSystem);
  const [expandedId, setExpandedId] = useState<SystemId | null>(null);
  const visibleCount = Object.values(visibleSystems).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-0.5 px-3 py-2">
      <div className="mb-2 flex items-center justify-between px-2">
        <span className="eyebrow">{tr('sidebar.heading', { count: visibleCount })}</span>
      </div>
      <div className="mb-2 flex gap-1 px-1">
        <button
          onClick={() => setAllSystems(true)}
          className="rounded-full px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          {tr('sidebar.toggle_all')}
        </button>
        <button
          onClick={() => setAllSystems(false)}
          className="rounded-full px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          {tr('sidebar.hide_all')}
        </button>
      </div>

      {SYSTEMS.map(sys => {
        const id = sys.id as SystemId;
        const isVisible = visibleSystems?.[id] ?? false;
        const opacity = systemOpacity?.[id] ?? 1;
        const isExpanded = expandedId === id;
        const name = pick(sys, 'nombre', locale);

        return (
          <div key={id} className={`group rounded-xl transition-colors ${isVisible ? 'bg-foreground/[0.05]' : 'hover:bg-foreground/[0.03]'}`}>
            <div className="flex items-center gap-1 pr-1.5">
              <button
                onClick={() => toggleSystem(id)}
                className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left md:py-2"
                aria-pressed={isVisible}
                aria-label={tr(isVisible ? 'sidebar.hide_system' : 'sidebar.show_system', { name })}
              >
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full transition-all"
                  style={{
                    backgroundColor: isVisible ? sys.color : 'transparent',
                    boxShadow: isVisible ? `0 0 10px ${sys.color}66` : `inset 0 0 0 1.5px ${sys.colorDark}`,
                  }}
                />
                <span className={`truncate text-[13px] ${isVisible ? 'text-foreground' : 'text-muted-foreground'}`}>{name}</span>
              </button>
              <button
                onClick={() => isolateSystem(id)}
                className="rounded-full p-2 text-muted-foreground opacity-60 transition hover:bg-foreground/5 hover:text-primary group-hover:opacity-100 md:p-1.5"
                aria-label={tr('sidebar.isolate_system', { name })}
                title={tr('sidebar.isolate')}
              >
                <Focus size={12} />
              </button>
              <button
                onClick={() => setExpandedId(isExpanded ? null : id)}
                className={`rounded-full p-2 transition hover:bg-foreground/5 md:p-1.5 ${isExpanded ? 'text-primary' : 'text-muted-foreground opacity-60 group-hover:opacity-100'}`}
                aria-label={tr('sidebar.opacity_system', { name })}
                aria-expanded={isExpanded}
              >
                <SlidersHorizontal size={12} />
              </button>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-0.5">
                    <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      {tr('sidebar.opacity')}
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={opacity}
                        onChange={(e) => setSystemOpacity(id, parseFloat(e.target.value))}
                        className="h-1 flex-1 accent-primary"
                      />
                      <span className="w-8 text-right tabular-nums">{Math.round(opacity * 100)}%</span>
                    </label>
                    <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                      {pick(sys, 'descripcion', locale)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
