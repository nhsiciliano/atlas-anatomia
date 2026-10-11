'use client';
import { VIEWS, type ViewId } from '@/data/systems';
import { useAtlasStore } from '@/lib/store';
import { Home, Layers, RotateCw, Tag, Box, FileImage } from 'lucide-react';

const LAYER_STEPS = [1, 0.6, 0.3];
const SHORT_VIEW: Record<ViewId, string> = { anterior: 'Frente', posterior: 'Dorso', lateral: 'Lado' };

export default function ViewerDock() {
  const currentView = useAtlasStore(s => s.currentView);
  const setView = useAtlasStore(s => s.setView);
  const resetView = useAtlasStore(s => s.resetView);
  const autoRotate = useAtlasStore(s => s.autoRotate);
  const toggleAutoRotate = useAtlasStore(s => s.toggleAutoRotate);
  const showLabels = useAtlasStore(s => s.showLabels);
  const toggleLabels = useAtlasStore(s => s.toggleLabels);
  const viewerMode = useAtlasStore(s => s.viewerMode);
  const setViewerMode = useAtlasStore(s => s.setViewerMode);
  const systemOpacity = useAtlasStore(s => s.systemOpacity);
  const setAllOpacity = useAtlasStore(s => s.setAllOpacity);

  const vals = Object.values(systemOpacity);
  const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1;
  const layerIdx = LAYER_STEPS.reduce((best, v, i) => (Math.abs(v - avg) < Math.abs(LAYER_STEPS[best] - avg) ? i : best), 0);
  const nextLayer = () => setAllOpacity(LAYER_STEPS[(layerIdx + 1) % LAYER_STEPS.length]);

  const btn = (active: boolean) =>
    `flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[12px] transition-colors md:px-3 md:py-1.5 ${
      active ? 'bg-foreground/[0.09] text-foreground' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
    }`;

  return (
    <div className="glass-panel pointer-events-auto flex max-w-[calc(100vw-1.5rem)] items-center gap-0.5 overflow-x-auto rounded-full p-1 scrollbar-none md:p-1.5">
      {VIEWS.map(v => (
        <button key={v.id} onClick={() => setView(v.id as ViewId)} className={btn(currentView === v.id && !autoRotate)} aria-pressed={currentView === v.id}>
          <span className="md:hidden">{SHORT_VIEW[v.id as ViewId]}</span>
          <span className="hidden md:inline">{v.nombre_es}</span>
        </button>
      ))}
      <span className="mx-0.5 h-5 w-px flex-shrink-0 bg-foreground/10 md:mx-1" aria-hidden />
      {viewerMode === '3d' && (
        <button onClick={toggleAutoRotate} className={btn(autoRotate)} aria-pressed={autoRotate} title="Girar 360°">
          <RotateCw size={13} /> <span className="hidden 2xl:inline">Girar 360°</span>
        </button>
      )}
      <button onClick={nextLayer} className={btn(layerIdx > 0)} title="Transparencia de las capas">
        <Layers size={13} /> <span className="hidden 2xl:inline">Capas</span> <span className="hidden md:inline">{Math.round(LAYER_STEPS[layerIdx] * 100)}%</span>
      </button>
      <button onClick={toggleLabels} className={btn(showLabels)} aria-pressed={showLabels} title="Etiquetas">
        <Tag size={13} /> <span className="hidden 2xl:inline">Etiquetas</span>
      </button>
      <button onClick={resetView} className={btn(false)} aria-label="Restablecer vista" title="Restablecer vista">
        <Home size={13} />
      </button>
      <span className="mx-0.5 h-5 w-px flex-shrink-0 bg-foreground/10 md:mx-1" aria-hidden />
      <button
        onClick={() => setViewerMode(viewerMode === '3d' ? '2d' : '3d')}
        className={btn(false)}
        title={viewerMode === '3d' ? 'Cambiar a la lámina 2D' : 'Cambiar al modelo 3D'}
      >
        {viewerMode === '3d' ? <FileImage size={13} /> : <Box size={13} />}
        <span>{viewerMode === '3d' ? '2D' : '3D'}</span>
      </button>
    </div>
  );
}
