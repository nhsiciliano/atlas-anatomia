'use client';
import { create } from 'zustand';
import type { SystemId, ViewId } from '@/data/systems';

export interface AtlasState {
  // View
  currentView: ViewId;
  setView: (v: ViewId) => void;

  // System visibility & opacity
  visibleSystems: Record<SystemId, boolean>;
  systemOpacity: Record<SystemId, number>;
  toggleSystem: (id: SystemId) => void;
  setAllSystems: (on: boolean) => void;
  setSystemOpacity: (id: SystemId, val: number) => void;
  isolateSystem: (id: SystemId) => void;

  // Selected structure
  selectedStructureId: string | null;
  setSelectedStructure: (id: string | null) => void;
  hoveredStructureId: string | null;
  setHoveredStructure: (id: string | null) => void;

  // Detail level
  detailLevel: 'fundamental' | 'avanzado';
  setDetailLevel: (l: 'fundamental' | 'avanzado') => void;

  // Labels
  showLabels: boolean;
  toggleLabels: () => void;

  /** Re-frames the 3D camera. */
  resetView: () => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;

  // Compare
  compareIds: string[];
  addCompare: (id: string) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;

  // Bookmarks (persisted)
  bookmarks: string[];
  toggleBookmark: (id: string) => void;

  // Recently viewed (persisted)
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;

  // Tour completion (persisted)
  completedTours: string[];
  completeTour: (id: string) => void;

  // Quiz scores (persisted)
  quizScores: Record<string, { correct: number; total: number }>;
  saveQuizScore: (quizKey: string, correct: number, total: number) => void;

  // 3D viewer
  autoRotate: boolean;
  toggleAutoRotate: () => void;
  /** Incremented to ask the 3D camera to re-frame (home / view change). */
  cameraNonce: number;
  setAllOpacity: (val: number) => void;

  // Panel tab (shared by header nav, right panel and mobile sheet)
  panelTab: PanelTab;
  setPanelTab: (t: PanelTab) => void;
}

export type PanelTab = 'detail' | 'tours' | 'quiz' | 'bookmarks' | 'tree';

const ALL_SYSTEMS: SystemId[] = [
  'esqueletico', 'muscular', 'nervioso', 'cardiovascular',
  'respiratorio', 'digestivo', 'urinario', 'endocrino',
  'linfatico_inmunitario', 'tegumentario', 'reproductor',
  'organos_sensoriales',
];

const DEFAULT_ON: SystemId[] = ['esqueletico', 'cardiovascular', 'respiratorio', 'digestivo', 'tegumentario'];
const defaultVisible = Object.fromEntries(ALL_SYSTEMS.map(s => [s, DEFAULT_ON.includes(s)])) as Record<SystemId, boolean>;
const defaultOpacity = Object.fromEntries(ALL_SYSTEMS.map(s => [s, 1])) as Record<SystemId, number>;

function loadFromLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveToLS(key: string, val: any): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota */ }
}

export const useAtlasStore = create<AtlasState>((set, get) => ({
  currentView: 'anterior',
  setView: (v) => set((s) => ({ currentView: v, cameraNonce: s.cameraNonce + 1, autoRotate: false })),

  visibleSystems: { ...defaultVisible },
  systemOpacity: { ...defaultOpacity },
  toggleSystem: (id) => set((s) => ({
    visibleSystems: { ...s.visibleSystems, [id]: !s.visibleSystems[id] },
  })),
  setAllSystems: (on) => set({
    visibleSystems: Object.fromEntries(ALL_SYSTEMS.map(s => [s, on])) as Record<SystemId, boolean>,
  }),
  setSystemOpacity: (id, val) => set((s) => ({
    systemOpacity: { ...s.systemOpacity, [id]: val },
  })),
  isolateSystem: (id) => set({
    visibleSystems: Object.fromEntries(ALL_SYSTEMS.map(s => [s, s === id])) as Record<SystemId, boolean>,
  }),

  selectedStructureId: null,
  setSelectedStructure: (id) => {
    set({ selectedStructureId: id });
    if (id) {
      const recent = get().recentlyViewed.filter(r => r !== id);
      recent.unshift(id);
      const trimmed = recent.slice(0, 20);
      set({ recentlyViewed: trimmed });
      saveToLS('atlas_recent', trimmed);
    }
  },
  hoveredStructureId: null,
  setHoveredStructure: (id) => set({ hoveredStructureId: id }),

  detailLevel: 'fundamental',
  setDetailLevel: (l) => set({ detailLevel: l }),

  showLabels: true,
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),

  resetView: () => set((s) => ({ cameraNonce: s.cameraNonce + 1 })),

  sidebarOpen: false,
  setSidebarOpen: (o) => set({ sidebarOpen: o }),

  compareIds: [],
  addCompare: (id) => set((s) => {
    if (s.compareIds.includes(id) || s.compareIds.length >= 2) return s;
    return { compareIds: [...s.compareIds, id] };
  }),
  removeCompare: (id) => set((s) => ({ compareIds: s.compareIds.filter(c => c !== id) })),
  clearCompare: () => set({ compareIds: [] }),

  bookmarks: loadFromLS<string[]>('atlas_bookmarks', []),
  toggleBookmark: (id) => set((s) => {
    const next = s.bookmarks.includes(id)
      ? s.bookmarks.filter(b => b !== id)
      : [...s.bookmarks, id];
    saveToLS('atlas_bookmarks', next);
    return { bookmarks: next };
  }),

  recentlyViewed: loadFromLS<string[]>('atlas_recent', []),
  addRecentlyViewed: (id) => set((s) => {
    const recent = s.recentlyViewed.filter(r => r !== id);
    recent.unshift(id);
    const trimmed = recent.slice(0, 20);
    saveToLS('atlas_recent', trimmed);
    return { recentlyViewed: trimmed };
  }),

  completedTours: loadFromLS<string[]>('atlas_tours', []),
  completeTour: (id) => set((s) => {
    if (s.completedTours.includes(id)) return s;
    const next = [...s.completedTours, id];
    saveToLS('atlas_tours', next);
    return { completedTours: next };
  }),

  quizScores: loadFromLS<Record<string, { correct: number; total: number }>>('atlas_quiz', {}),
  saveQuizScore: (key, correct, total) => set((s) => {
    const next = { ...(s.quizScores ?? {}), [key]: { correct, total } };
    saveToLS('atlas_quiz', next);
    return { quizScores: next };
  }),

  autoRotate: false,
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  cameraNonce: 0,
  setAllOpacity: (val) => set({
    systemOpacity: Object.fromEntries(ALL_SYSTEMS.map(s => [s, val])) as Record<SystemId, number>,
  }),

  panelTab: 'detail',
  setPanelTab: (t) => set({ panelTab: t }),
}));
