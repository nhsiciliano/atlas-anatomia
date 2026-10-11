'use client';
import { useMemo, useState } from 'react';
import { STRUCTURES, type AnatomicalStructure } from '@/data/anatomy-data';
import { SYSTEMS, type SystemId } from '@/data/systems';
import { useAtlasStore } from '@/lib/store';
import { useLocale, useT } from '@/lib/i18n';
import { pick } from '@/lib/l10n';
import { ChevronRight, ChevronDown, TreeDeciduous } from 'lucide-react';

export default function StructureTree() {
  const locale = useLocale();
  const tr = useT();
  const setSelected = useAtlasStore(s => s.setSelectedStructure);
  const selectedId = useAtlasStore(s => s.selectedStructureId);
  const [expandedSystems, setExpandedSystems] = useState<Set<SystemId>>(new Set());

  const grouped = useMemo(() => {
    const map: Record<string, AnatomicalStructure[]> = {};
    for (const s of STRUCTURES ?? []) {
      const key = s?.systemId ?? 'unknown';
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, []);

  const toggleExpand = (id: SystemId) => {
    setExpandedSystems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-3 space-y-1">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        <TreeDeciduous size={13} className="text-primary" />
        {tr('tree.title')}
      </h3>

      {(SYSTEMS ?? []).map((sys: any) => {
        const isExpanded = expandedSystems.has(sys?.id as SystemId);
        const items = grouped?.[sys?.id] ?? [];
        const Icon = sys?.icon;

        return (
          <div key={sys?.id}>
            <button
              onClick={() => toggleExpand(sys?.id as SystemId)}
              className="flex items-center gap-1.5 w-full px-2 py-1 rounded-md hover:bg-accent transition-colors text-left"
              aria-expanded={isExpanded}
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sys?.color }} />
              {Icon && <Icon size={12} className="text-muted-foreground" />}
              <span className="text-xs font-medium">{pick(sys, 'nombre', locale)}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{items?.length ?? 0}</span>
            </button>

            {isExpanded && (
              <div className="ml-6 border-l border-border/50 space-y-0.5 pl-2 py-0.5">
                {items.map((item: any) => (
                  <button
                    key={item?.id}
                    onClick={() => setSelected(item?.id ?? null)}
                    className={`flex items-center gap-1.5 w-full px-2 py-0.5 rounded-md text-left text-xs transition-colors ${
                      selectedId === item?.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {pick(item, 'nombre', locale)}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
