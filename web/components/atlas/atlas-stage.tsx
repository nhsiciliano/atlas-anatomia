'use client';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useAtlasStore } from '@/lib/store';
import { STRUCTURE_MAP } from '@/data/anatomy-data';
import { SYSTEM_MAP } from '@/data/systems';
import { hasModel3D } from '@/lib/models3d';
import { preferredSex } from '@/lib/focus';
import { useLocale, useT } from '@/lib/i18n';
import { pick } from '@/lib/l10n';
import ViewerDock from '@/components/atlas/viewer-dock';
import { Info } from 'lucide-react';

function Loading3D() {
  const tr = useT();
  return <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{tr('stage.loading')}</div>;
}

const Atlas3D = dynamic(() => import('@/components/atlas/atlas-3d'), {
  ssr: false,
  loading: () => <Loading3D />,
});

export default function AtlasStage() {
  const locale = useLocale();
  const tr = useT();
  const selectedId = useAtlasStore(s => s.selectedStructureId);

  // Make sure the system of a structure picked from search, tree or tours is visible.
  // Structures without a mesh isolate their system so the model still gives context.
  useEffect(() => {
    if (!selectedId) return;
    // Read the store directly: re-running when visibility changes would undo a manual hide.
    const { visibleSystems, toggleSystem, isolateSystem, reproSex, setReproSex } = useAtlasStore.getState();
    const st = STRUCTURE_MAP[selectedId];
    if (!st) return;
    // Show the reproductive model that contains it (searching "útero" switches to the female one).
    const sex = preferredSex(st.id);
    if (sex && sex !== reproSex) setReproSex(sex);
    if (!hasModel3D(st.id) && st.escala !== 'micro') isolateSystem(st.systemId);
    else if (!visibleSystems[st.systemId]) toggleSystem(st.systemId);
  }, [selectedId]);

  const st = selectedId ? STRUCTURE_MAP[selectedId] : null;
  const notice = st && !hasModel3D(st.id)
    ? st.escala === 'micro'
      ? tr('stage.micro', { name: pick(st, 'nombre', locale) })
      : tr('stage.no_model', {
          name: pick(st, 'nombre', locale),
          system: SYSTEM_MAP[st.systemId] ? pick(SYSTEM_MAP[st.systemId], 'nombre', locale).toLowerCase() : st.systemId,
        })
    : null;

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0">
        <Atlas3D />
      </div>

      {notice && (
        <div
          role="status"
          className="glass-panel absolute left-1/2 top-2 z-20 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground md:top-3"
        >
          <Info size={12} className="flex-shrink-0 text-primary" />
          <span>{notice}</span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-2 md:bottom-6 md:px-3">
        <ViewerDock />
      </div>

      <p className="pointer-events-none absolute left-6 top-4 z-10 hidden max-w-[240px] text-[11px] leading-snug text-muted-foreground/70 xl:block">
        {tr('stage.disclaimer')}
      </p>
    </div>
  );
}
