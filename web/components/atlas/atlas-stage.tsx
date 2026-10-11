'use client';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useAtlasStore } from '@/lib/store';
import { STRUCTURE_MAP } from '@/data/anatomy-data';
import { hasModel3D } from '@/lib/models3d';
import AtlasViewer from '@/components/atlas/atlas-viewer';
import ViewerDock from '@/components/atlas/viewer-dock';
import { FileImage } from 'lucide-react';

const Atlas3D = dynamic(() => import('@/components/atlas/atlas-3d'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Preparando el modelo 3D…</div>
  ),
});

export default function AtlasStage() {
  const viewerMode = useAtlasStore(s => s.viewerMode);
  const setViewerMode = useAtlasStore(s => s.setViewerMode);
  const selectedId = useAtlasStore(s => s.selectedStructureId);
  const visibleSystems = useAtlasStore(s => s.visibleSystems);
  const toggleSystem = useAtlasStore(s => s.toggleSystem);
  const reproSex = useAtlasStore(s => s.reproSex);

  // Make sure the system of a structure picked from search, tree or tours is visible.
  useEffect(() => {
    if (!selectedId) return;
    const sys = STRUCTURE_MAP[selectedId]?.systemId;
    if (sys && !visibleSystems[sys]) toggleSystem(sys);
  }, [selectedId]);

  const st = selectedId ? STRUCTURE_MAP[selectedId] : null;
  const missing3D =
    viewerMode === '3d' && st && (!hasModel3D(st.id) || (st.systemId === 'reproductor' && reproSex === 'femenino'));

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0">
        {viewerMode === '3d' ? <Atlas3D /> : <AtlasViewer />}
      </div>

      {missing3D && (
        <div className="glass-panel absolute left-1/2 top-2 z-20 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-3 rounded-full py-1.5 pl-4 pr-1.5 text-xs md:top-3 text-muted-foreground">
          <span>
            <span className="text-foreground">{st.nombre_es}</span> se muestra en la lámina 2D
          </span>
          <button
            onClick={() => setViewerMode('2d')}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <FileImage size={12} /> Ver en 2D
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-2 md:bottom-6 md:px-3">
        <ViewerDock />
      </div>

      <p className="pointer-events-none absolute left-6 top-4 z-10 hidden max-w-[240px] text-[11px] leading-snug text-muted-foreground/70 xl:block">
        Representación educativa simplificada.{viewerMode === '3d' && ' Modelo 3D: BodyParts3D (DBCLS), CC BY-SA 2.1 JP.'}
      </p>
    </div>
  );
}
