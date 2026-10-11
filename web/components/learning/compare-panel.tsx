'use client';
import { STRUCTURE_MAP, type AnatomicalStructure } from '@/data/anatomy-data';
import { SYSTEM_MAP, type SystemId } from '@/data/systems';
import { useAtlasStore } from '@/lib/store';
import { useLocale, useT } from '@/lib/i18n';
import { pick, pickList } from '@/lib/l10n';
import { GitCompare, X } from 'lucide-react';

export default function ComparePanel() {
  const locale = useLocale();
  const tr = useT();
  const compareIds = useAtlasStore(s => s.compareIds);
  const removeCompare = useAtlasStore(s => s.removeCompare);
  const clearCompare = useAtlasStore(s => s.clearCompare);
  const detailLevel = useAtlasStore(s => s.detailLevel);

  if ((compareIds ?? []).length < 2) return null;

  const structures = (compareIds ?? []).map((id: string) => STRUCTURE_MAP?.[id]).filter(Boolean) as AnatomicalStructure[];
  if (structures.length < 2) return null;

  const fields: { key: string; labelKey: string; get: (s: AnatomicalStructure) => string }[] = [
    { key: 'desc', labelKey: 'compare.description', get: (s) => detailLevel === 'avanzado' ? pick(s, 'explicacion_avanzada', locale) : pick(s, 'explicacion', locale) },
    { key: 'loc', labelKey: 'compare.location', get: (s) => pick(s, 'ubicacion', locale) },
    { key: 'func', labelKey: 'panel.funciones', get: (s) => pickList(s, 'funciones', locale).join('; ') },
  ];

  return (
    <div className="glass-panel rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <GitCompare size={13} className="text-primary" />
          {tr('compare.title')}
        </h3>
        <button
          onClick={clearCompare}
          className="text-[10px] px-2 py-0.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          {tr('compare.clear')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {structures.map((s: any) => {
          const sys = SYSTEM_MAP?.[s?.systemId as SystemId];
          return (
            <div key={s?.id} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sys?.color }} />
                <span className="text-sm font-semibold">{pick(s, 'nombre', locale)}</span>
                <button onClick={() => removeCompare(s?.id)} className="ml-auto p-0.5 rounded hover:bg-destructive/10" aria-label={tr('compare.remove', { name: pick(s, 'nombre', locale) })}>
                  <X size={11} />
                </button>
              </div>
              {fields.map((f: any) => (
                <div key={f.key}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">{tr(f.labelKey)}</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{f.get(s) ?? '—'}</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
