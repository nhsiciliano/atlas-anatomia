'use client';
import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { BODY_OUTLINES, STRUCTURE_PATHS } from '@/data/svg-paths';
import { STRUCTURES, STRUCTURE_MAP } from '@/data/anatomy-data';
import { SYSTEM_MAP, type SystemId } from '@/data/systems';
import { useAtlasStore } from '@/lib/store';
import { useLocale, t } from '@/lib/i18n';

export default function AtlasViewer() {
  const locale = useLocale();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentView = useAtlasStore(s => s.currentView);
  const visibleSystems = useAtlasStore(s => s.visibleSystems);
  const systemOpacity = useAtlasStore(s => s.systemOpacity);
  const selectedId = useAtlasStore(s => s.selectedStructureId);
  const hoveredId = useAtlasStore(s => s.hoveredStructureId);
  const setSelected = useAtlasStore(s => s.setSelectedStructure);
  const setHovered = useAtlasStore(s => s.setHoveredStructure);
  const showLabels = useAtlasStore(s => s.showLabels);
  const showDirections = useAtlasStore(s => s.showDirections);
  const reproSex = useAtlasStore(s => s.reproSex);
  const zoom = useAtlasStore(s => s.zoom);
  const panX = useAtlasStore(s => s.panX);
  const panY = useAtlasStore(s => s.panY);
  const setZoom = useAtlasStore(s => s.setZoom);
  const setPan = useAtlasStore(s => s.setPan);

  const [isPanning, setIsPanning] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Filter structures visible in current view
  const visibleStructures = useMemo(() => {
    return (STRUCTURES ?? []).filter((s: any) => {
      const paths = STRUCTURE_PATHS?.[s?.id];
      if (!paths) return false;
      if (!(paths.views ?? []).includes(currentView)) return false;
      if (!visibleSystems?.[s?.systemId as SystemId]) return false;
      // Filter sex-specific
      if (s?.sexo && s.sexo !== reproSex) return false;
      return true;
    });
  }, [currentView, visibleSystems, reproSex]);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(zoom + delta);
  }, [zoom, setZoom]);

  // Pan handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    // Don't start pan if clicking a structure
    const target = e.target as SVGElement;
    if (target?.classList?.contains?.('anatomy-path')) return;
    setIsPanning(true);
    setLastPos({ x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setPan(panX + dx, panY + dy);
    setLastPos({ x: e.clientX, y: e.clientY });
  }, [isPanning, lastPos, panX, panY, setPan]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Keyboard zoom/pan
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') setZoom(zoom + 0.2);
      if (e.key === '-') setZoom(zoom - 0.2);
      if (e.key === '0') { setZoom(1); setPan(0, 0); }
      if (e.key === 'Escape') setSelected(null);
    };
    window?.addEventListener?.('keydown', handler);
    return () => window?.removeEventListener?.('keydown', handler);
  }, [zoom, setZoom, setPan, setSelected]);

  const bodyOutline = BODY_OUTLINES?.[currentView] ?? '';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none bg-muted/30"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ cursor: isPanning ? 'grabbing' : 'grab', touchAction: 'none' }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 400 800"
        className="w-full h-full max-h-[80vh] md:max-h-full"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.15s ease-out',
        }}
        onWheel={handleWheel}
        role="img"
        aria-label={t('app.title', locale)}
      >
        {/* Body outline */}
        <path
          d={bodyOutline}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          opacity={0.3}
        />

        {/* Direction labels */}
        {showDirections && (
          <g className="anatomy-label" style={{ fontSize: '9px', fill: 'hsl(var(--muted-foreground))' }}>
            {currentView === 'anterior' && (
              <>
                <text x="200" y="16" textAnchor="middle">Superior (craneal)</text>
                <text x="200" y="796" textAnchor="middle">Inferior (caudal)</text>
                <text x="25" y="400" textAnchor="start" transform="rotate(-90,25,400)">Derecho</text>
                <text x="375" y="400" textAnchor="start" transform="rotate(90,375,400)">Izquierdo</text>
              </>
            )}
            {currentView === 'posterior' && (
              <>
                <text x="200" y="16" textAnchor="middle">Superior (craneal)</text>
                <text x="200" y="796" textAnchor="middle">Inferior (caudal)</text>
                <text x="25" y="400" textAnchor="start" transform="rotate(-90,25,400)">Izquierdo</text>
                <text x="375" y="400" textAnchor="start" transform="rotate(90,375,400)">Derecho</text>
              </>
            )}
            {currentView === 'lateral' && (
              <>
                <text x="200" y="16" textAnchor="middle">Superior</text>
                <text x="200" y="796" textAnchor="middle">Inferior</text>
                <text x="25" y="400" textAnchor="start" transform="rotate(-90,25,400)">Anterior</text>
                <text x="375" y="400" textAnchor="start" transform="rotate(90,375,400)">Posterior</text>
              </>
            )}
          </g>
        )}

        {/* Structure paths by system (layered by order) */}
        {(visibleStructures ?? []).map((structure: any) => {
          const paths = STRUCTURE_PATHS?.[structure?.id];
          if (!paths) return null;
          const sys = SYSTEM_MAP?.[structure?.systemId as SystemId];
          if (!sys) return null;
          const isSelected = selectedId === structure?.id;
          const isHovered = hoveredId === structure?.id;
          const opacity = systemOpacity?.[structure?.systemId as SystemId] ?? 1;

          return (
            <g key={structure?.id}>
              <path
                className={`anatomy-path ${isSelected ? 'selected' : ''}`}
                d={paths?.d ?? ''}
                fill={sys?.color ?? '#888'}
                fillOpacity={opacity * (isHovered ? 0.9 : 0.7)}
                stroke={isSelected ? '#fff' : (sys?.colorDark ?? '#666')}
                strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.5}
                tabIndex={0}
                role="button"
                aria-label={locale === 'es' ? structure?.nombre_es : structure?.nombre_en}
                onClick={(e) => { e.stopPropagation(); setSelected(structure?.id ?? null); }}
                onMouseEnter={() => setHovered(structure?.id ?? null)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(structure?.id ?? null)}
                onBlur={() => setHovered(null)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(structure?.id ?? null); } }}
              />
              {/* Label */}
              {showLabels && (
                <text
                  className="anatomy-label"
                  x={paths?.labelX ?? 0}
                  y={(paths?.labelY ?? 0) - 8}
                  style={{ pointerEvents: 'none' }}
                >
                  {locale === 'es' ? structure?.nombre_es : structure?.nombre_en}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1">
        <button
          className="glass-panel rounded-md w-8 h-8 flex items-center justify-center text-sm font-bold hover:bg-accent transition-colors"
          onClick={() => setZoom(zoom + 0.2)}
          aria-label="Acercar"
        >+</button>
        <button
          className="glass-panel rounded-md w-8 h-8 flex items-center justify-center text-sm font-bold hover:bg-accent transition-colors"
          onClick={() => setZoom(zoom - 0.2)}
          aria-label="Alejar"
        >−</button>
        <button
          className="glass-panel rounded-md w-8 h-8 flex items-center justify-center text-xs hover:bg-accent transition-colors"
          onClick={() => { setZoom(1); setPan(0, 0); }}
          aria-label={t('view.reset', locale)}
        >⟳</button>
      </div>

      {/* Hovered tooltip */}
      {hoveredId && !selectedId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel rounded-lg px-3 py-1.5 text-sm font-medium pointer-events-none z-10">
          {locale === 'es' ? STRUCTURE_MAP?.[hoveredId]?.nombre_es : STRUCTURE_MAP?.[hoveredId]?.nombre_en}
        </div>
      )}
    </div>
  );
}
