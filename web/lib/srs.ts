/**
 * Spaced-repetition core: pure functions, no UI and no store access.
 * Simplified SM-2, deterministic and in whole days; every date is computed from the
 * `now` argument so the functions are easy to test.
 */
import { SYSTEMS, type SystemId } from '@/data/systems';
import type { AnatomicalStructure } from '@/data/anatomy-data';
import type { ManualCard } from '@/data/flashcards';
import type { SrsCardState } from '@/lib/store';
import { hasModel3D } from '@/lib/models3d';
import { pick, pickList } from '@/lib/l10n';

/** 0 Otra vez · 1 Difícil · 2 Bien · 3 Fácil */
export type Grade = 0 | 1 | 2 | 3;

export type CardKind =
  | 'nombre_funcion' | 'funcion_nombre' | 'ubicacion_nombre'
  | 'ta_nombre' | 'clinica_nombre' | 'identificar' | 'manual';

export interface Card {
  id: string; // `${structureId}:${kind}` or the id of the ManualCard
  kind: CardKind;
  systemId: SystemId;
  structureId?: string; // always set on derived cards; optional on manual ones
  dificultad: 'basico' | 'intermedio' | 'avanzado';
  frente_es: string;
  frente_en: string;
  dorso_es: string;
  dorso_en: string;
}

export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_INTERVAL = 365;
/** Interval (days) from which a card counts as "learned". */
export const LEARNED_INTERVAL = 21;

const DAY_MS = 24 * 60 * 60 * 1000;
const GRADES: Grade[] = [0, 1, 2, 3];

const round2 = (n: number) => Math.round(n * 100) / 100;
const clampInterval = (days: number) => Math.min(MAX_INTERVAL, Math.max(1, Math.round(days)));

/** Applies one review to a card state and returns the new state (the input is not mutated). */
export function schedule(prev: SrsCardState | undefined, grade: Grade, now: Date): SrsCardState {
  const ease = prev?.ease ?? DEFAULT_EASE;
  const interval = prev?.interval ?? 0;
  const reps = prev?.reps ?? 0;
  const lapses = prev?.lapses ?? 0;

  let nextEase = ease;
  let nextInterval: number;
  let nextReps = reps + 1;
  let nextLapses = lapses;

  switch (grade) {
    case 0:
      nextReps = 0;
      nextLapses = lapses + 1;
      nextInterval = 1;
      nextEase = Math.max(MIN_EASE, ease - 0.2);
      break;
    case 1:
      nextInterval = reps === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
      nextEase = Math.max(MIN_EASE, ease - 0.15);
      break;
    case 2:
      nextInterval = reps === 0 ? 1 : reps === 1 ? 6 : Math.round(interval * ease);
      break;
    case 3:
      nextInterval = reps === 0 ? 4 : reps === 1 ? 10 : Math.round(interval * ease * 1.3);
      nextEase = ease + 0.15;
      break;
  }

  nextInterval = clampInterval(nextInterval);
  return {
    ease: round2(nextEase),
    interval: nextInterval,
    due: new Date(now.getTime() + nextInterval * DAY_MS).toISOString(),
    reps: nextReps,
    lapses: nextLapses,
  };
}

/** Days that would result from each grade (for the answer buttons). */
export function nextIntervals(prev: SrsCardState | undefined): Record<Grade, number> {
  const epoch = new Date(0);
  const out = {} as Record<Grade, number>;
  for (const g of GRADES) out[g] = schedule(prev, g, epoch).interval;
  return out;
}

type DerivedKind = Exclude<CardKind, 'manual'>;

const DERIVED_KINDS: DerivedKind[] = [
  'nombre_funcion', 'funcion_nombre', 'ubicacion_nombre', 'ta_nombre', 'clinica_nombre', 'identificar',
];

const DERIVED_DIFFICULTY: Record<DerivedKind, Card['dificultad']> = {
  nombre_funcion: 'basico',
  ubicacion_nombre: 'basico',
  funcion_nombre: 'intermedio',
  ta_nombre: 'intermedio',
  clinica_nombre: 'avanzado',
  identificar: 'avanzado',
};

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function derivedCard(s: AnatomicalStructure, kind: DerivedKind): Card | null {
  const nombre = { es: pick(s, 'nombre', 'es'), en: pick(s, 'nombre', 'en') };
  const funciones = { es: pickList(s, 'funciones', 'es'), en: pickList(s, 'funciones', 'en') };
  const ubicacion = { es: pick(s, 'ubicacion', 'es'), en: pick(s, 'ubicacion', 'en') };
  const base = { id: `${s.id}:${kind}`, kind, systemId: s.systemId, structureId: s.id, dificultad: DERIVED_DIFFICULTY[kind] };

  switch (kind) {
    case 'nombre_funcion':
      if (!funciones.es.length) return null;
      return { ...base, frente_es: nombre.es, frente_en: nombre.en,
        dorso_es: funciones.es.join('; '), dorso_en: funciones.en.join('; ') };
    case 'funcion_nombre':
      if (!funciones.es.length) return null;
      return { ...base, frente_es: funciones.es[0], frente_en: funciones.en[0] ?? funciones.es[0],
        dorso_es: nombre.es, dorso_en: nombre.en };
    case 'ubicacion_nombre':
      if (!ubicacion.es) return null;
      return { ...base, frente_es: ubicacion.es, frente_en: ubicacion.en, dorso_es: nombre.es, dorso_en: nombre.en };
    case 'ta_nombre': {
      const ta = (s.termino_ta ?? '').trim();
      if (!ta || same(ta, s.nombre_en) || same(ta, s.nombre_es)) return null;
      return { ...base, frente_es: ta, frente_en: ta, dorso_es: nombre.es, dorso_en: nombre.en };
    }
    case 'clinica_nombre': {
      const es = s.clinica_es?.[0]?.titulo;
      if (!es) return null;
      const en = s.clinica_en?.[0]?.titulo || es;
      return { ...base, frente_es: `${es}. ¿A qué estructura corresponde?`, frente_en: `${en}. Which structure does it relate to?`,
        dorso_es: nombre.es, dorso_en: nombre.en };
    }
    case 'identificar':
      if (!hasModel3D(s.id)) return null;
      return { ...base, frente_es: 'Identifica la estructura resaltada en el modelo',
        frente_en: 'Identify the highlighted structure in the model', dorso_es: nombre.es, dorso_en: nombre.en };
  }
}

/**
 * Builds the full deck. Order is deterministic: systems in SYSTEMS order, then structures in
 * array order, then kinds in the order of DERIVED_KINDS; the manual cards of a system come
 * after its derived cards.
 */
export function buildDeck(
  structures: AnatomicalStructure[],
  manual: ManualCard[],
  opts?: { systems?: SystemId[]; kinds?: CardKind[] },
): Card[] {
  const systems = opts?.systems?.length ? new Set(opts.systems) : null;
  const kinds = opts?.kinds?.length ? new Set(opts.kinds) : null;
  const deck: Card[] = [];

  for (const sys of SYSTEMS) {
    if (systems && !systems.has(sys.id)) continue;

    for (const s of structures) {
      if (s.systemId !== sys.id) continue;
      for (const kind of DERIVED_KINDS) {
        if (kinds && !kinds.has(kind)) continue;
        const card = derivedCard(s, kind);
        if (card) deck.push(card);
      }
    }

    if (kinds && !kinds.has('manual')) continue;
    for (const m of manual) {
      if (m.systemId !== sys.id) continue;
      deck.push({
        id: m.id, kind: 'manual', systemId: m.systemId, structureId: m.structureId, dificultad: m.dificultad,
        frente_es: m.frente_es, frente_en: m.frente_en, dorso_es: m.dorso_es, dorso_en: m.dorso_en,
      });
    }
  }
  return deck;
}

/** `due` as epoch ms; an unparseable date counts as already due. */
const dueMs = (st: SrsCardState) => {
  const t = Date.parse(st.due);
  return Number.isNaN(t) ? 0 : t;
};

/**
 * Cards to study now: the overdue ones (oldest due first, up to `maxDue`) followed by new
 * cards (up to `maxNew`), picked round-robin across systems so a session does not start with
 * ten bones in a row.
 */
export function dueCards(
  deck: Card[],
  state: Record<string, SrsCardState>,
  now: Date,
  opts?: { maxDue?: number; maxNew?: number },
): Card[] {
  const maxDue = opts?.maxDue ?? 20;
  const maxNew = opts?.maxNew ?? 10;
  const nowMs = now.getTime();

  const overdue = deck
    .map((card, index) => ({ card, index, st: state[card.id] }))
    .filter((x) => x.st && dueMs(x.st) <= nowMs)
    .sort((a, b) => dueMs(a.st) - dueMs(b.st) || a.index - b.index)
    .slice(0, Math.max(0, maxDue))
    .map((x) => x.card);

  const bySystem = new Map<SystemId, Card[]>();
  for (const card of deck) {
    if (state[card.id]) continue;
    const list = bySystem.get(card.systemId);
    if (list) list.push(card);
    else bySystem.set(card.systemId, [card]);
  }
  const queues = [...bySystem.values()];
  const fresh: Card[] = [];
  for (let round = 0; fresh.length < maxNew; round++) {
    let took = false;
    for (const q of queues) {
      if (round < q.length && fresh.length < maxNew) {
        fresh.push(q[round]);
        took = true;
      }
    }
    if (!took) break;
  }

  return [...overdue, ...fresh];
}

export function srsStats(
  deck: Card[],
  state: Record<string, SrsCardState>,
  now: Date,
): { total: number; nuevas: number; vencidas: number; aprendidas: number } {
  const nowMs = now.getTime();
  let nuevas = 0;
  let vencidas = 0;
  let aprendidas = 0;
  for (const card of deck) {
    const st = state[card.id];
    if (!st) {
      nuevas++;
      continue;
    }
    if (dueMs(st) <= nowMs) vencidas++;
    if (st.interval >= LEARNED_INTERVAL) aprendidas++;
  }
  return { total: deck.length, nuevas, vencidas, aprendidas };
}
