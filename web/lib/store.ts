'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SystemId, ViewId } from '@/data/systems';
import type { Locale } from '@/lib/i18n';
import { schedule, type Grade } from '@/lib/srs';
import type { ReproSex } from '@/lib/models3d';

export interface QuizScore {
  best: number;
  last: number;
  total: number;
  /** ISO date of the last attempt ('' for scores migrated from the legacy format). */
  fecha: string;
}

/** Spaced-repetition state of one review card, as computed by schedule() in lib/srs.ts. */
export interface SrsCardState {
  ease: number;
  interval: number;
  due: string;
  reps: number;
  lapses: number;
}

export type DetailLevel = 'fundamental' | 'avanzado';

/** Review-session settings (persisted). */
export interface SrsPrefs {
  systems: SystemId[] | 'all';
  maxNew: number;
  maxDue: number;
}

/** Learning progress: the only part of the store that is persisted. */
export interface Progress {
  bookmarks: string[];
  recentlyViewed: string[];
  completedTours: string[];
  quizScores: Record<string, QuizScore>;
  srs: Record<string, SrsCardState>;
  srsPrefs: SrsPrefs;
  /** Which reproductive-system model (and GLB) the viewer shows. */
  reproSex: ReproSex;
  locale: Locale;
  detailLevel: DetailLevel;
}

/** Machine-readable reason for a failed import (`error` keeps a Spanish description). */
export type ImportErrorCode =
  | 'invalid_json' | 'no_version' | 'future_version' | 'no_data' | 'bad_list' | 'bad_object' | 'bad_value';

export type ImportResult = { ok: true } | { ok: false; error: string; code: ImportErrorCode };

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
  /** `recordRecent: false` keeps the structure out of "recently viewed" (quiz identification). */
  setSelectedStructure: (id: string | null, opts?: { recordRecent?: boolean }) => void;
  hoveredStructureId: string | null;
  setHoveredStructure: (id: string | null) => void;

  // Detail level (persisted)
  detailLevel: DetailLevel;
  setDetailLevel: (l: DetailLevel) => void;

  // Locale (persisted)
  locale: Locale;
  setLocale: (l: Locale) => void;

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
  quizScores: Record<string, QuizScore>;
  saveQuizScore: (quizKey: string, correct: number, total: number) => void;

  // Spaced repetition (persisted)
  srs: Record<string, SrsCardState>;
  gradeCard: (cardId: string, grade: Grade, now?: Date) => void;
  srsPrefs: SrsPrefs;
  setSrsPrefs: (prefs: Partial<SrsPrefs>) => void;

  // Reproductive-system variant shown in the 3D viewer (persisted)
  reproSex: ReproSex;
  setReproSex: (sex: ReproSex) => void;

  // Progress backup
  exportProgress: () => string;
  importProgress: (json: string) => ImportResult;
  resetProgress: () => void;

  // 3D viewer
  autoRotate: boolean;
  toggleAutoRotate: () => void;
  /** Incremented to ask the 3D camera to re-frame (home / view change). */
  cameraNonce: number;
  setAllOpacity: (val: number) => void;

  // Panel tab (shared by header nav, right panel and mobile sheet)
  panelTab: PanelTab;
  setPanelTab: (t: PanelTab) => void;

  /** Structure being asked about in an identification question: its name stays hidden until answered. */
  quizHighlightId: string | null;
  setQuizHighlight: (id: string | null) => void;
}

export type PanelTab = 'detail' | 'tours' | 'quiz' | 'cards' | 'bookmarks' | 'tree';

const ALL_SYSTEMS: SystemId[] = [
  'esqueletico', 'muscular', 'nervioso', 'cardiovascular',
  'respiratorio', 'digestivo', 'urinario', 'endocrino',
  'linfatico_inmunitario', 'tegumentario', 'reproductor',
  'organos_sensoriales',
];

const DEFAULT_ON: SystemId[] = ['esqueletico', 'cardiovascular', 'respiratorio', 'digestivo', 'tegumentario'];
const defaultVisible = Object.fromEntries(ALL_SYSTEMS.map(s => [s, DEFAULT_ON.includes(s)])) as Record<SystemId, boolean>;
const defaultOpacity = Object.fromEntries(ALL_SYSTEMS.map(s => [s, 1])) as Record<SystemId, number>;

const RECENT_MAX = 20;
const PROGRESS_VERSION = 1;
const LEGACY_KEYS = ['atlas_bookmarks', 'atlas_recent', 'atlas_tours', 'atlas_quiz'] as const;

const EMPTY_PROGRESS: Progress = {
  bookmarks: [],
  recentlyViewed: [],
  completedTours: [],
  quizScores: {},
  srs: {},
  srsPrefs: { systems: 'all', maxNew: 10, maxDue: 20 },
  reproSex: 'masculino',
  locale: 'es',
  detailLevel: 'fundamental',
};

function pickProgress(s: Progress): Progress {
  const { bookmarks, recentlyViewed, completedTours, quizScores, srs, srsPrefs, reproSex, locale, detailLevel } = s;
  return { bookmarks, recentlyViewed, completedTours, quizScores, srs, srsPrefs, reproSex, locale, detailLevel };
}

const positiveInt = (v: unknown, fallback: number) =>
  typeof v === 'number' && Number.isInteger(v) && v > 0 ? v : fallback;

/** Lenient: older exports have no srsPrefs, and bad values fall back to the defaults. */
function toSrsPrefs(v: unknown): SrsPrefs {
  const d = EMPTY_PROGRESS.srsPrefs;
  if (!isObject(v)) return { ...d };
  return {
    systems: isStringList(v.systems) && v.systems.length ? (v.systems as SystemId[]) : 'all',
    maxNew: positiveInt(v.maxNew, d.maxNew),
    maxDue: positiveInt(v.maxDue, d.maxDue),
  };
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStringList = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];

/** Accepts the current score shape and the legacy `{ correct, total }` one. */
function toQuizScore(v: unknown): QuizScore | null {
  if (!isObject(v) || typeof v.total !== 'number') return null;
  if (typeof v.best === 'number' && typeof v.last === 'number') {
    return { best: v.best, last: v.last, total: v.total, fecha: typeof v.fecha === 'string' ? v.fecha : '' };
  }
  if (typeof v.correct === 'number') return { best: v.correct, last: v.correct, total: v.total, fecha: '' };
  return null;
}

function toQuizScores(v: unknown): Record<string, QuizScore> {
  if (!isObject(v)) return {};
  const out: Record<string, QuizScore> = {};
  for (const [k, val] of Object.entries(v)) {
    const score = toQuizScore(val);
    if (score) out[k] = score;
  }
  return out;
}

function readLegacy(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined; // corrupt legacy JSON is ignored
  }
}

/**
 * One-time import of the pre-persist keys (atlas_bookmarks, atlas_recent, atlas_tours, atlas_quiz).
 * Merges them into the hydrated progress, saves it, and only then deletes the legacy keys.
 */
function migrateLegacyKeys() {
  if (typeof localStorage === 'undefined') return;
  if (!LEGACY_KEYS.some((k) => localStorage.getItem(k) !== null)) return;

  const s = useAtlasStore.getState();
  const bookmarks = readLegacy('atlas_bookmarks');
  const recent = readLegacy('atlas_recent');
  const tours = readLegacy('atlas_tours');
  const legacyScores = toQuizScores(readLegacy('atlas_quiz'));

  try {
    useAtlasStore.setState({
      bookmarks: isStringList(bookmarks) ? union(s.bookmarks, bookmarks) : s.bookmarks,
      recentlyViewed: isStringList(recent) ? union(s.recentlyViewed, recent).slice(0, RECENT_MAX) : s.recentlyViewed,
      completedTours: isStringList(tours) ? union(s.completedTours, tours) : s.completedTours,
      quizScores: { ...legacyScores, ...s.quizScores },
    });
    if (localStorage.getItem('atlas-progress') === null) return; // not saved: keep legacy keys for next time
    for (const k of LEGACY_KEYS) localStorage.removeItem(k);
  } catch {
    // storage full or unavailable: keep the legacy keys and retry on next load
  }
}

/** Validates an exported progress file and normalizes it into a full Progress object. */
function parseProgress(json: string): { ok: true; progress: Progress } | { ok: false; error: string; code: ImportErrorCode } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'El archivo no es JSON válido.', code: 'invalid_json' };
  }
  if (!isObject(parsed) || typeof parsed.version !== 'number') return { ok: false, error: 'Falta el número de versión.', code: 'no_version' };
  if (parsed.version > PROGRESS_VERSION) return { ok: false, error: `Versión ${parsed.version} no soportada.`, code: 'future_version' };
  const d = parsed.data;
  if (!isObject(d)) return { ok: false, error: 'Falta el objeto "data".', code: 'no_data' };
  for (const key of ['bookmarks', 'recentlyViewed', 'completedTours'] as const) {
    if (d[key] !== undefined && !isStringList(d[key])) return { ok: false, error: `"${key}" debe ser una lista de textos.`, code: 'bad_list' };
  }
  if (d.quizScores !== undefined && !isObject(d.quizScores)) return { ok: false, error: '"quizScores" debe ser un objeto.', code: 'bad_object' };
  if (d.srs !== undefined && !isObject(d.srs)) return { ok: false, error: '"srs" debe ser un objeto.', code: 'bad_object' };
  if (d.locale !== undefined && d.locale !== 'es' && d.locale !== 'en') return { ok: false, error: '"locale" debe ser "es" o "en".', code: 'bad_value' };
  if (d.detailLevel !== undefined && d.detailLevel !== 'fundamental' && d.detailLevel !== 'avanzado') {
    return { ok: false, error: '"detailLevel" no es válido.', code: 'bad_value' };
  }
  return {
    ok: true,
    progress: {
      bookmarks: (d.bookmarks as string[] | undefined) ?? [],
      recentlyViewed: ((d.recentlyViewed as string[] | undefined) ?? []).slice(0, RECENT_MAX),
      completedTours: (d.completedTours as string[] | undefined) ?? [],
      quizScores: toQuizScores(d.quizScores),
      srs: (d.srs as Record<string, SrsCardState> | undefined) ?? {},
      srsPrefs: toSrsPrefs(d.srsPrefs),
      // Lenient like srsPrefs: older exports have no reproSex and bad values fall back to the default.
      reproSex: d.reproSex === 'femenino' || d.reproSex === 'masculino' ? d.reproSex : EMPTY_PROGRESS.reproSex,
      locale: (d.locale as Locale | undefined) ?? 'es',
      detailLevel: (d.detailLevel as DetailLevel | undefined) ?? 'fundamental',
    },
  };
}

const addRecent = (list: string[], id: string) => [id, ...list.filter((r) => r !== id)].slice(0, RECENT_MAX);

export const useAtlasStore = create<AtlasState>()(persist<AtlasState, [], [], Progress>((set, get) => ({
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
  setSelectedStructure: (id, opts) => set((s) => (
    id && opts?.recordRecent !== false
      ? { selectedStructureId: id, recentlyViewed: addRecent(s.recentlyViewed, id) }
      : { selectedStructureId: id }
  )),
  hoveredStructureId: null,
  setHoveredStructure: (id) => set({ hoveredStructureId: id }),

  detailLevel: EMPTY_PROGRESS.detailLevel,
  setDetailLevel: (l) => set({ detailLevel: l }),

  locale: EMPTY_PROGRESS.locale,
  setLocale: (l) => set({ locale: l }),

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

  bookmarks: EMPTY_PROGRESS.bookmarks,
  toggleBookmark: (id) => set((s) => ({
    bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter(b => b !== id) : [...s.bookmarks, id],
  })),

  recentlyViewed: EMPTY_PROGRESS.recentlyViewed,
  addRecentlyViewed: (id) => set((s) => ({ recentlyViewed: addRecent(s.recentlyViewed, id) })),

  completedTours: EMPTY_PROGRESS.completedTours,
  completeTour: (id) => set((s) => (
    s.completedTours.includes(id) ? s : { completedTours: [...s.completedTours, id] }
  )),

  quizScores: EMPTY_PROGRESS.quizScores,
  saveQuizScore: (key, correct, total) => set((s) => {
    const prev = s.quizScores[key];
    const best = prev && prev.total === total ? Math.max(prev.best, correct) : correct;
    return {
      quizScores: { ...s.quizScores, [key]: { best, last: correct, total, fecha: new Date().toISOString() } },
    };
  }),

  srs: EMPTY_PROGRESS.srs,
  gradeCard: (cardId, grade, now) => set((s) => ({
    srs: { ...s.srs, [cardId]: schedule(s.srs[cardId], grade, now ?? new Date()) },
  })),
  srsPrefs: EMPTY_PROGRESS.srsPrefs,
  setSrsPrefs: (prefs) => set((s) => ({ srsPrefs: { ...s.srsPrefs, ...prefs } })),
  reproSex: EMPTY_PROGRESS.reproSex,
  setReproSex: (sex) => set({ reproSex: sex }),

  exportProgress: () => JSON.stringify(
    { version: PROGRESS_VERSION, exportedAt: new Date().toISOString(), data: pickProgress(get()) },
    null,
    2,
  ),
  importProgress: (json) => {
    const result = parseProgress(json);
    if (!result.ok) return result;
    set(result.progress);
    return { ok: true };
  },
  resetProgress: () => set({ ...EMPTY_PROGRESS }),

  autoRotate: false,
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  cameraNonce: 0,
  setAllOpacity: (val) => set({
    systemOpacity: Object.fromEntries(ALL_SYSTEMS.map(s => [s, val])) as Record<SystemId, number>,
  }),

  panelTab: 'detail',
  setPanelTab: (t) => set({ panelTab: t }),

  quizHighlightId: null,
  setQuizHighlight: (id) => set({ quizHighlightId: id }),
}), {
  name: 'atlas-progress',
  version: PROGRESS_VERSION,
  storage: createJSONStorage(() => localStorage),
  partialize: pickProgress,
  // Hydrated from components/atlas-app.tsx after mount, so SSR and first client render match.
  skipHydration: true,
  onRehydrateStorage: () => (_state, error) => {
    if (!error) migrateLegacyKeys();
  },
}));

// Missing when localStorage is unavailable: zustand then skips persistence entirely.
const progressStore = useAtlasStore.persist as typeof useAtlasStore.persist | undefined;

/**
 * Loads the saved progress after mount (the store uses skipHydration, so the server render and the
 * first client render match) and reports when it is ready. Components that update the store must
 * wait for `true`: an update before hydration would overwrite the saved progress with the defaults.
 */
export function useProgressHydrated(): boolean {
  const hydrated = useSyncExternalStore(
    (onChange) => progressStore?.onFinishHydration(onChange) ?? (() => {}),
    () => progressStore?.hasHydrated() ?? true,
    () => false,
  );

  useEffect(() => {
    if (progressStore && !progressStore.hasHydrated()) progressStore.rehydrate();
  }, []);

  return hydrated;
}
