'use client';
import { STRUCTURE_MAP } from '@/data/anatomy-data';
import { SYSTEM_MAP, type SystemId } from '@/data/systems';
import { REFERENCE_MAP } from '@/data/references';
import { useAtlasStore } from '@/lib/store';
import { useLocale, useT } from '@/lib/i18n';
import { pick, pickList } from '@/lib/l10n';
import { buildBreadcrumbs } from '@/lib/breadcrumbs';
import { X, Bookmark, BookmarkCheck, GitCompare, ChevronRight, MapPin, Cog, Link2, BookOpen, Focus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DetailPanel() {
  const locale = useLocale();
  const tr = useT();
  const selectedId = useAtlasStore(s => s.selectedStructureId);
  const setSelected = useAtlasStore(s => s.setSelectedStructure);
  const detailLevel = useAtlasStore(s => s.detailLevel);
  const setDetailLevel = useAtlasStore(s => s.setDetailLevel);
  const bookmarks = useAtlasStore(s => s.bookmarks);
  const toggleBookmark = useAtlasStore(s => s.toggleBookmark);
  const addCompare = useAtlasStore(s => s.addCompare);
  const compareIds = useAtlasStore(s => s.compareIds);
  const isolateSystem = useAtlasStore(s => s.isolateSystem);

  const structure = selectedId ? STRUCTURE_MAP?.[selectedId] : null;

  if (!structure) return null;

  const sys = SYSTEM_MAP?.[structure?.systemId as SystemId];
  const crumbs = buildBreadcrumbs(selectedId);
  const isBookmarked = (bookmarks ?? []).includes(structure?.id ?? '');
  const canCompare = (compareIds ?? []).length < 2 && !(compareIds ?? []).includes(structure?.id ?? '');

  const explicacion = pick(structure, detailLevel === 'avanzado' ? 'explicacion_avanzada' : 'explicacion', locale);
  const funciones = pickList(structure, 'funciones', locale);
  const partes = pickList(structure, 'partes', locale);
  const ubicacion = pick(structure, 'ubicacion', locale);
  const dato = pick(structure, 'dato', locale);

  const isolate = () => {
    isolateSystem(structure.systemId as SystemId);
    setSelected(structure.id);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={structure?.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex flex-col"
      >
        {/* Header */}
        <div className="px-5 pb-5 pt-2 md:px-6 md:pt-5">
          <div className="flex items-start justify-between gap-3">
            <nav aria-label={tr('panel.hierarchy')} className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
              {(crumbs ?? []).map((c: any, i: number) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={9} className="opacity-50" />}
                  <span className={i === crumbs.length - 1 ? 'text-primary' : ''}>{pick(c, 'label', locale)}</span>
                </span>
              ))}
            </nav>
            <button
              onClick={() => setSelected(null)}
              className="-mr-2 -mt-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              aria-label={tr('common.close')}
            >
              <X size={15} />
            </button>
          </div>

          <h2 className="mt-3 font-display text-[28px] font-light leading-[1.05] tracking-tight md:text-[34px]">
            {pick(structure, 'nombre', locale)}
          </h2>
          <p className="mt-1.5 font-display text-[15px] italic text-muted-foreground">
            {structure?.termino_ta || structure?.nombre_en}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <div className="inline-flex rounded-full bg-foreground/[0.05] p-0.5" role="group" aria-label={tr('panel.detail_level')}>
              {(['fundamental', 'avanzado'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDetailLevel(lvl)}
                  aria-pressed={detailLevel === lvl}
                  className={`rounded-full px-3.5 py-1 text-[12px] transition-colors ${
                    detailLevel === lvl ? 'bg-foreground/90 text-background' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tr(`panel.${lvl}`)}
                </button>
              ))}
            </div>
            <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sys?.color }} />
              {sys && pick(sys, 'nombre', locale)}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={isolate}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Focus size={13} /> {tr('sidebar.isolate')}
            </button>
            <button
              onClick={() => toggleBookmark(structure?.id ?? '')}
              aria-pressed={isBookmarked}
              className="flex items-center gap-1.5 rounded-full border border-foreground/10 px-4 py-2 text-[12px] text-foreground transition-colors hover:bg-foreground/5"
            >
              {isBookmarked ? <BookmarkCheck size={13} className="text-primary" /> : <Bookmark size={13} />}
              {tr(isBookmarked ? 'panel.saved' : 'panel.save')}
            </button>
            <button
              onClick={() => addCompare(structure?.id ?? '')}
              disabled={!canCompare}
              title={tr('compare.select')}
              className="flex items-center gap-1.5 rounded-full border border-foreground/10 px-4 py-2 text-[12px] text-foreground transition-colors hover:bg-foreground/5 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <GitCompare size={13} /> {tr('panel.compare')}
            </button>
          </div>
        </div>

        {/* Memorable fact */}
        {dato && (
          <div className="mx-5 mb-5 border-l-2 border-primary/70 pl-4 md:mx-6">
            <p className="eyebrow !text-primary">{tr('panel.dato')}</p>
            <p className="mt-1.5 font-display text-[16px] font-light leading-snug text-foreground/90">{dato}</p>
          </div>
        )}

        {/* Content */}
        <div className="space-y-5 border-t border-foreground/[0.06] px-5 py-5 md:px-6">
          {/* Description */}
          <p className="text-[14px] leading-relaxed text-foreground/85">{explicacion}</p>

          {/* Location */}
          {ubicacion && (
            <Section icon={MapPin} title={tr('panel.ubicacion')}>
              <p className="text-sm text-muted-foreground">{ubicacion}</p>
            </Section>
          )}

          {/* Functions */}
          {(funciones ?? []).length > 0 && (
            <Section icon={Cog} title={tr('panel.funciones')}>
              <ul className="space-y-1">
                {(funciones ?? []).map((f: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span> {f}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Parts */}
          {(partes ?? []).length > 0 && (
            <Section icon={Link2} title={tr('panel.partes')}>
              <div className="flex flex-wrap gap-1">
                {(partes ?? []).map((p: string, i: number) => (
                  <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full bg-foreground/[0.06] text-foreground/80">
                    {p}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Connections */}
          {(structure?.conexiones ?? []).length > 0 && (
            <Section icon={Link2} title={tr('panel.conexiones')}>
              <div className="flex flex-wrap gap-1">
                {(structure?.conexiones ?? []).map((cId: string) => {
                  const connSys = SYSTEM_MAP?.[cId as SystemId];
                  return connSys ? (
                    <span
                      key={cId}
                      className="text-[11px] px-2 py-0.5 rounded-full border"
                      style={{ borderColor: `${connSys?.color}66`, color: connSys?.color }}
                    >
                      {pick(connSys, 'nombre', locale)}
                    </span>
                  ) : null;
                })}
              </div>
            </Section>
          )}

          {/* References */}
          {(structure?.referencias ?? []).length > 0 && (
            <Section icon={BookOpen} title={tr('panel.referencias')}>
              <ul className="space-y-0.5">
                {(structure?.referencias ?? []).map((refId: string) => {
                  const ref = REFERENCE_MAP?.[refId];
                  return ref ? (
                    <li key={refId} className="text-[10px] text-muted-foreground">
                      {ref?.shortName} — <span className="italic">{ref?.nombre}</span>
                    </li>
                  ) : null;
                })}
              </ul>
            </Section>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon size={12} className="text-primary/80" />
        <h3 className="eyebrow">{title}</h3>
      </div>
      {children}
    </div>
  );
}
