'use client';
import { STRUCTURE_MAP, type AnatomicalStructure } from '@/data/anatomy-data';
import { SYSTEM_MAP, type SystemId } from '@/data/systems';
import { useAtlasStore } from '@/lib/store';
import { useLocale, t } from '@/lib/i18n';
import { GitCompare, X } from 'lucide-react';

export default function ComparePanel() {
  const locale = useLocale();
  const compareIds = useAtlasStore(s => s.compareIds);
  const removeCompare = useAtlasStore(s => s.removeCompare);
  const clearCompare = useAtlasStore(s => s.clearCompare);
  const detailLevel = useAtlasStore(s => s.detailLevel);

  if ((compareIds ?? []).length < 2) return null;

  const structures = (compareIds ?? []).map((id: string) => STRUCTURE_MAP?.[id]).filter(Boolean) as AnatomicalStructure[];
  if (structures.length < 2) return null;

  const fields: { key: string; label_es: string; label_en: string; get: (s: AnatomicalStructure) => string }[] = [
    { key: 'desc', label_es: 'Descripción', label_en: 'Description', get: (s) => detailLevel === 'avanzado' ? (locale === 'es' ? s?.explicacion_avanzada_es : s?.explicacion_avanzada_en) : (locale === 'es' ? s?.explicacion_es : s?.explicacion_en) },
    { key: 'loc', label_es: 'Ubicación', label_en: 'Location', get: (s) => locale === 'es' ? s?.ubicacion_es : s?.ubicacion_en },
    { key: 'func', label_es: 'Funciones', label_en: 'Functions', get: (s) => (locale === 'es' ? s?.funciones_es : s?.funciones_en)?.join?.('; ') ?? '' },
  ];

  return (
    <div className="glass-panel rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <GitCompare size={13} className="text-primary" />
          {t('compare.title', locale)}
        </h3>
        <button
          onClick={clearCompare}
          className="text-[10px] px-2 py-0.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          {t('compare.clear', locale)}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {structures.map((s: any) => {
          const sys = SYSTEM_MAP?.[s?.systemId as SystemId];
          return (
            <div key={s?.id} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sys?.color }} />
                <span className="text-sm font-semibold">{locale === 'es' ? s?.nombre_es : s?.nombre_en}</span>
                <button onClick={() => removeCompare(s?.id)} className="ml-auto p-0.5 rounded hover:bg-destructive/10">
                  <X size={11} />
                </button>
              </div>
              {fields.map((f: any) => (
                <div key={f.key}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">{locale === 'es' ? f.label_es : f.label_en}</p>
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
