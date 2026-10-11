/**
 * Spaced-repetition engine test (`npm run test:srs`): scheduling, deck building, due selection,
 * interval previews and stats. Pure logic: no store, no DOM.
 */
import type { SrsCardState } from '../lib/store';
import {
  DEFAULT_EASE, MIN_EASE, buildDeck, dueCards, nextIntervals, schedule, srsStats,
  type Card, type CardKind, type Grade,
} from '../lib/srs';
import { STRUCTURES, type AnatomicalStructure } from '../data/anatomy-data';
import { MANUAL_CARDS } from '../data/flashcards';
import { SYSTEMS, type SystemId } from '../data/systems';
import { hasModel3D } from '../lib/models3d';

let failed = 0;
const ok = (name: string, cond: boolean, extra?: unknown) => {
  console.log((cond ? 'OK   ' : 'FAIL ') + name + (extra !== undefined && !cond ? '  ' + JSON.stringify(extra) : ''));
  if (!cond) failed++;
};
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-10-12T09:00:00.000Z');
const plusDays = (d: number, from = NOW) => new Date(from.getTime() + d * DAY).toISOString();
const state = (s: Partial<SrsCardState>): SrsCardState => ({ ease: 2.5, interval: 0, due: NOW.toISOString(), reps: 0, lapses: 0, ...s });

// ── schedule ────────────────────────────────────────────────────────────────
{
  const g0 = schedule(undefined, 0, NOW);
  ok('nuevo + 0: reps 0, lapse 1, intervalo 1, ease 2.3',
    g0.reps === 0 && g0.lapses === 1 && g0.interval === 1 && g0.ease === 2.3 && g0.due === plusDays(1), g0);
  const g1 = schedule(undefined, 1, NOW);
  ok('nuevo + 1: intervalo 1, ease 2.35, reps 1', g1.interval === 1 && g1.ease === 2.35 && g1.reps === 1 && g1.lapses === 0, g1);
  const g2 = schedule(undefined, 2, NOW);
  ok('nuevo + 2: intervalo 1, ease 2.5, reps 1', g2.interval === 1 && g2.ease === DEFAULT_EASE && g2.reps === 1, g2);
  const g3 = schedule(undefined, 3, NOW);
  ok('nuevo + 3: intervalo 4, ease 2.65, reps 1', g3.interval === 4 && g3.ease === 2.65 && g3.reps === 1 && g3.due === plusDays(4), g3);

  let st: SrsCardState | undefined;
  const seq: number[] = [];
  for (let i = 0; i < 3; i++) {
    st = schedule(st, 2, NOW);
    seq.push(st.interval);
  }
  ok('secuencia 2,2,2 => 1, 6, 15', eq(seq, [1, 6, 15]), seq);
  ok('tras 3 aciertos: reps 3, due = now + 15 d', st!.reps === 3 && st!.due === plusDays(15), st);

  const lapse = schedule(st, 0, NOW);
  ok('0 reinicia reps, suma lapse y baja ease', lapse.reps === 0 && lapse.lapses === 1 && lapse.interval === 1 && lapse.ease === 2.3, lapse);
  const after = schedule(lapse, 2, NOW);
  ok('tras un fallo, el siguiente 2 vuelve a intervalo 1', after.interval === 1 && after.reps === 1, after);

  let low: SrsCardState | undefined;
  for (let i = 0; i < 10; i++) low = schedule(low, 0, NOW);
  ok('ease nunca baja de MIN_EASE (1.3)', low!.ease === MIN_EASE && low!.lapses === 10, low);
  ok('1 también respeta MIN_EASE', schedule(state({ ease: 1.35, reps: 2, interval: 10 }), 1, NOW).ease === MIN_EASE);

  const h = schedule(state({ reps: 2, interval: 10 }), 1, NOW);
  ok('1 con reps>0: intervalo*1.2 redondeado, ease -0.15', h.interval === 12 && h.ease === 2.35 && h.reps === 3, h);
  ok('1 nunca da intervalo menor que 1', schedule(state({ reps: 1, interval: 1 }), 1, NOW).interval === 1);

  const easy = schedule(state({ reps: 3, interval: 15 }), 3, NOW);
  ok('3 con reps>=2: usa el ease anterior (15*2.5*1.3=49) y sube 0.15', easy.interval === 49 && easy.ease === 2.65, easy);
  ok('3 en segunda repetición: 10 días', schedule(state({ reps: 1, interval: 1 }), 3, NOW).interval === 10);
  ok('2 en segunda repetición: 6 días', schedule(state({ reps: 1, interval: 1 }), 2, NOW).interval === 6);
  let e = state({ reps: 5, interval: 20 });
  for (let i = 0; i < 2; i++) e = schedule(e, 3, NOW);
  ok('ease acumula sin errores de coma flotante (2.8)', schedule(state({ ease: 2.65, reps: 5, interval: 20 }), 3, NOW).ease === 2.8 && e.ease === 2.8, e);

  ok('tope de intervalo: 365 (grade 3)', schedule(state({ ease: 3, reps: 5, interval: 300 }), 3, NOW).interval === 365);
  ok('tope de intervalo: 365 (grade 2)', schedule(state({ ease: 2.5, reps: 5, interval: 300 }), 2, NOW).interval === 365);
  ok('estado corrupto (reps>=2, intervalo 0) => al menos 1 día', schedule(state({ reps: 3, interval: 0 }), 2, NOW).interval === 1);

  const prev = state({ reps: 2, interval: 6, due: '2030-01-01T00:00:00.000Z' });
  const snapshot = JSON.stringify(prev);
  const fromNow = schedule(prev, 2, NOW);
  ok('due se calcula desde now, no desde prev.due', fromNow.due === plusDays(fromNow.interval), fromNow);
  ok('schedule no muta el estado previo', JSON.stringify(prev) === snapshot);
  ok('due es ISO válido', !Number.isNaN(Date.parse(fromNow.due)) && new Date(fromNow.due).toISOString() === fromNow.due);
}

// ── nextIntervals ───────────────────────────────────────────────────────────
{
  ok('nextIntervals(undefined) => 1,1,1,4', eq(nextIntervals(undefined), { 0: 1, 1: 1, 2: 1, 3: 4 }), nextIntervals(undefined));
  const n = nextIntervals(state({ reps: 2, interval: 6, ease: 2.5 }));
  ok('nextIntervals con historial => 1, 7, 15, 20', eq(n, { 0: 1, 1: 7, 2: 15, 3: 20 }), n);
  ok('nextIntervals coincide con schedule', ([0, 1, 2, 3] as Grade[]).every((g) => n[g] === schedule(state({ reps: 2, interval: 6 }), g, NOW).interval));
}

// ── buildDeck ───────────────────────────────────────────────────────────────
const base = (over: Partial<AnatomicalStructure>): AnatomicalStructure => ({
  id: 'zz-prueba', systemId: 'esqueletico', nombre_es: 'Prueba', nombre_en: 'Test', termino_ta: 'Probatio', regiones: [],
  explicacion_es: '', explicacion_en: '', explicacion_avanzada_es: '', explicacion_avanzada_en: '',
  ubicacion_es: 'Aquí', ubicacion_en: 'Here', funciones_es: ['Sostener', 'Proteger'], funciones_en: ['Support', 'Protect'],
  partes_es: [], partes_en: [], conexiones: [], dato_es: '', dato_en: '', referencias: [],
  clinica_es: [{ titulo: 'Dolor', texto: 'x' }], clinica_en: [{ titulo: 'Pain', texto: 'x' }],
  ...over,
} as AnatomicalStructure);
const kindsOf = (deck: Card[]) => deck.map((c) => c.kind);

{
  const full = base({ id: 'femur' }); // 'femur' has a 3D mesh in the manifest
  ok('precondición: femur tiene malla', hasModel3D('femur'));
  const d = buildDeck([full], []);
  ok('estructura completa con malla: 6 tarjetas', d.length === 6, kindsOf(d));
  ok('orden de kinds determinista', eq(kindsOf(d), ['nombre_funcion', 'funcion_nombre', 'ubicacion_nombre', 'ta_nombre', 'clinica_nombre', 'identificar']), kindsOf(d));
  ok('ids = estructura:kind', d.every((c) => c.id === `femur:${c.kind}`));
  ok('todas llevan structureId y systemId', d.every((c) => c.structureId === 'femur' && c.systemId === 'esqueletico'));
  const byKind = (k: CardKind) => d.find((c) => c.kind === k)!;
  ok('dificultad: nombre_funcion/ubicacion = basico', byKind('nombre_funcion').dificultad === 'basico' && byKind('ubicacion_nombre').dificultad === 'basico');
  ok('dificultad: funcion_nombre/ta = intermedio', byKind('funcion_nombre').dificultad === 'intermedio' && byKind('ta_nombre').dificultad === 'intermedio');
  ok('dificultad: clinica/identificar = avanzado', byKind('clinica_nombre').dificultad === 'avanzado' && byKind('identificar').dificultad === 'avanzado');
  ok('nombre_funcion: frente nombre, dorso funciones unidas con "; "',
    byKind('nombre_funcion').frente_es === 'Prueba' && byKind('nombre_funcion').dorso_es === 'Sostener; Proteger' && byKind('nombre_funcion').dorso_en === 'Support; Protect');
  ok('funcion_nombre usa la primera función', byKind('funcion_nombre').frente_es === 'Sostener' && byKind('funcion_nombre').frente_en === 'Support' && byKind('funcion_nombre').dorso_es === 'Prueba');
  ok('ubicacion_nombre: frente ubicación, dorso nombre', byKind('ubicacion_nombre').frente_es === 'Aquí' && byKind('ubicacion_nombre').dorso_en === 'Test');
  ok('ta_nombre: frente = término TA, dorso nombre', byKind('ta_nombre').frente_es === 'Probatio' && byKind('ta_nombre').dorso_es === 'Prueba');
  ok('clinica_nombre: título de la primera nota + pregunta', byKind('clinica_nombre').frente_es.startsWith('Dolor') && byKind('clinica_nombre').frente_es.includes('¿A qué estructura corresponde?')
    && byKind('clinica_nombre').frente_en.startsWith('Pain'));
  ok('identificar: texto fijo y dorso nombre', byKind('identificar').frente_es.includes('modelo') && byKind('identificar').frente_en.includes('model') && byKind('identificar').dorso_es === 'Prueba');

  const noMesh = buildDeck([base({ id: 'zz-sin-malla' })], []);
  ok('sin malla: no hay "identificar" (5 tarjetas)', noMesh.length === 5 && !kindsOf(noMesh).includes('identificar'), kindsOf(noMesh));
  ok('sin clínica: no hay "clinica_nombre"', !kindsOf(buildDeck([base({ id: 'zz-a', clinica_es: undefined, clinica_en: undefined })], [])).includes('clinica_nombre'));
  ok('sin funciones: no hay nombre_funcion ni funcion_nombre',
    !kindsOf(buildDeck([base({ id: 'zz-b', funciones_es: [], funciones_en: [] })], [])).some((k) => k === 'nombre_funcion' || k === 'funcion_nombre'));
  ok('sin ubicación: no hay ubicacion_nombre', !kindsOf(buildDeck([base({ id: 'zz-c', ubicacion_es: '', ubicacion_en: '' })], [])).includes('ubicacion_nombre'));
  ok('ta vacío: no hay ta_nombre', !kindsOf(buildDeck([base({ id: 'zz-d', termino_ta: '' })], [])).includes('ta_nombre'));
  ok('ta igual al nombre en inglés: no hay ta_nombre', !kindsOf(buildDeck([base({ id: 'zz-e', termino_ta: 'test' })], [])).includes('ta_nombre'));
  ok('ta igual al nombre en español: no hay ta_nombre', !kindsOf(buildDeck([base({ id: 'zz-f', termino_ta: 'Prueba' })], [])).includes('ta_nombre'));
  ok('sin traducción en: el en cae al español', buildDeck([base({ id: 'zz-g', funciones_en: [], ubicacion_en: '' })], []).find((c) => c.kind === 'ubicacion_nombre')!.frente_en === 'Aquí');

  // manual cards + ordering across systems
  const man = MANUAL_CARDS.filter((m) => m.systemId === 'muscular').slice(0, 2);
  const mixed = buildDeck([base({ id: 'zz-m', systemId: 'muscular' }), base({ id: 'zz-e1', systemId: 'esqueletico' })], man);
  ok('orden: sistemas según SYSTEMS (esquelético antes que muscular)', mixed[0].systemId === 'esqueletico' && mixed[mixed.length - 1].systemId === 'muscular');
  ok('manuales van al final de su sistema y mapean a kind "manual"', eq(kindsOf(mixed).slice(-2), ['manual', 'manual']) && mixed.slice(-2).every((c) => c.id.startsWith('manual:muscular:')));
  ok('manual conserva id, dificultad y textos', mixed[mixed.length - 2].id === man[0].id && mixed[mixed.length - 2].dificultad === man[0].dificultad && mixed[mixed.length - 2].dorso_en === man[0].dorso_en);
  ok('buildDeck es determinista', eq(buildDeck(STRUCTURES, MANUAL_CARDS), buildDeck(STRUCTURES, MANUAL_CARDS)));

  // filters
  ok('filtro systems', buildDeck(STRUCTURES, MANUAL_CARDS, { systems: ['endocrino'] }).every((c) => c.systemId === 'endocrino'));
  ok('filtro systems: no mezcla otros', buildDeck(STRUCTURES, MANUAL_CARDS, { systems: ['endocrino', 'urinario'] }).every((c) => c.systemId === 'endocrino' || c.systemId === 'urinario'));
  ok('filtro kinds', buildDeck(STRUCTURES, MANUAL_CARDS, { kinds: ['ta_nombre', 'manual'] }).every((c) => c.kind === 'ta_nombre' || c.kind === 'manual'));
  ok('filtro kinds sin "manual" excluye manuales', buildDeck(STRUCTURES, MANUAL_CARDS, { kinds: ['nombre_funcion'] }).every((c) => c.kind === 'nombre_funcion'));
  ok('filtros combinados', buildDeck(STRUCTURES, MANUAL_CARDS, { systems: ['endocrino'], kinds: ['identificar'] }).every((c) => c.systemId === 'endocrino' && c.kind === 'identificar'));
  ok('filtro vacío = sin filtro', buildDeck(STRUCTURES, MANUAL_CARDS, { systems: [], kinds: [] }).length === buildDeck(STRUCTURES, MANUAL_CARDS).length);
}

// ── mazo real ───────────────────────────────────────────────────────────────
const deck = buildDeck(STRUCTURES, MANUAL_CARDS);
const perKind: Record<string, number> = {};
for (const c of deck) perKind[c.kind] = (perKind[c.kind] ?? 0) + 1;
{
  ok('mazo real: ids únicos', new Set(deck.map((c) => c.id)).size === deck.length);
  ok('mazo real: 60 manuales', perKind.manual === MANUAL_CARDS.length && MANUAL_CARDS.length === 60, perKind);
  ok('mazo real: identificar = estructuras con malla', perKind.identificar === STRUCTURES.filter((s) => hasModel3D(s.id)).length, perKind);
  ok('mazo real: clinica_nombre = estructuras con clínica', perKind.clinica_nombre === STRUCTURES.filter((s) => s.clinica_es?.length).length, perKind);
  ok('mazo real: derivadas con structureId existente', deck.filter((c) => c.kind !== 'manual').every((c) => c.structureId && STRUCTURES.some((s) => s.id === c.structureId)));
  ok('mazo real: sin textos vacíos', deck.every((c) => c.frente_es && c.frente_en && c.dorso_es && c.dorso_en));
  const order = deck.map((c) => SYSTEMS.findIndex((s) => s.id === c.systemId));
  ok('mazo real: sistemas en orden no decreciente', order.every((v, i) => i === 0 || v >= order[i - 1]));
  console.log(`INFO mazo real: ${deck.length} tarjetas · ${Object.entries(perKind).map(([k, v]) => `${k}=${v}`).join(' ')}`);
}

// ── dueCards ────────────────────────────────────────────────────────────────
const mk = (id: string, systemId: SystemId): Card => ({ id, kind: 'manual', systemId, dificultad: 'basico', frente_es: 'f', frente_en: 'f', dorso_es: 'd', dorso_en: 'd' });
{
  const small = [mk('a1', 'esqueletico'), mk('a2', 'esqueletico'), mk('a3', 'esqueletico'), mk('b1', 'muscular'), mk('b2', 'muscular'), mk('c1', 'nervioso')];
  const ids = (cs: Card[]) => cs.map((c) => c.id);

  ok('sin estado: todo es nuevo, intercalado por sistema', eq(ids(dueCards(small, {}, NOW, { maxNew: 6 })), ['a1', 'b1', 'c1', 'a2', 'b2', 'a3']), ids(dueCards(small, {}, NOW, { maxNew: 6 })));
  ok('maxNew limita las nuevas', dueCards(small, {}, NOW, { maxNew: 2 }).length === 2);
  ok('maxNew 0 => ninguna nueva', dueCards(small, {}, NOW, { maxNew: 0 }).length === 0);
  ok('round-robin con maxNew 4: a1,b1,c1,a2', eq(ids(dueCards(small, {}, NOW, { maxNew: 4 })), ['a1', 'b1', 'c1', 'a2']));

  const st: Record<string, SrsCardState> = {
    a1: state({ due: plusDays(-1) }), // overdue 1 day
    b1: state({ due: plusDays(-5) }), // overdue 5 days
    a2: state({ due: plusDays(2) }), // not due
    c1: state({ due: NOW.toISOString() }), // due exactly now
  };
  const r = dueCards(small, st, NOW, { maxNew: 10 });
  ok('vencidas primero, ordenadas por due ascendente', eq(ids(r).slice(0, 3), ['b1', 'a1', 'c1']), ids(r));
  ok('due == now cuenta como vencida', ids(r).includes('c1'));
  ok('no vencidas no aparecen', !ids(r).includes('a2'));
  ok('después de las vencidas, las nuevas', eq(ids(r).slice(3), ['b2', 'a3']) || eq(ids(r).slice(3), ['a3', 'b2']), ids(r));
  ok('una tarjeta con estado nunca cuenta como nueva', !ids(dueCards(small, st, NOW, { maxNew: 10 })).includes('a2'));
  ok('maxDue limita las vencidas (las más antiguas primero)', eq(ids(dueCards(small, st, NOW, { maxDue: 2, maxNew: 0 })), ['b1', 'a1']));
  ok('desempate estable por orden del mazo', eq(ids(dueCards(small, { a1: state({ due: plusDays(-1) }), b1: state({ due: plusDays(-1) }) }, NOW, { maxNew: 0 })), ['a1', 'b1']));
  ok('due inválido cuenta como vencida', ids(dueCards(small, { a1: state({ due: 'no-es-fecha' }) }, NOW, { maxNew: 0 })).includes('a1'));
  ok('estado de tarjetas fuera del mazo se ignora', dueCards(small, { zzz: state({ due: plusDays(-3) }) }, NOW, { maxNew: 0 }).length === 0);

  const big = Array.from({ length: 30 }, (_, i) => mk(`x${i}`, 'esqueletico'));
  const bigState = Object.fromEntries(big.slice(0, 25).map((c, i) => [c.id, state({ due: plusDays(-1 - i) })]));
  const dflt = dueCards(big, bigState, NOW);
  ok('por defecto: máximo 20 vencidas + 10 nuevas (solo quedan 5 nuevas => 25)', dflt.length === 25, dflt.length);
  const dflt2 = dueCards(big, {}, NOW);
  ok('por defecto: 10 nuevas', dflt2.length === 10);
  const dflt3 = dueCards(big.concat(Array.from({ length: 5 }, (_, i) => mk(`y${i}`, 'muscular'))), { ...bigState }, NOW);
  ok('por defecto: 20 vencidas máximo', dflt3.filter((c) => bigState[c.id]).length === 20, dflt3.length);
}

// ── srsStats ────────────────────────────────────────────────────────────────
{
  const d = [mk('a', 'esqueletico'), mk('b', 'esqueletico'), mk('c', 'muscular'), mk('d', 'muscular'), mk('e', 'nervioso')];
  const s0 = srsStats(d, {}, NOW);
  ok('stats sin estado: todo nuevo', eq(s0, { total: 5, nuevas: 5, vencidas: 0, aprendidas: 0 }), s0);
  const s = srsStats(d, {
    a: state({ due: plusDays(-1), interval: 3 }), // overdue
    b: state({ due: plusDays(10), interval: 21 }), // learned (>= 21), not due
    c: state({ due: plusDays(-2), interval: 40 }), // learned and overdue
    zzz: state({ due: plusDays(-9), interval: 100 }), // not in the deck: ignored
  }, NOW);
  ok('stats: total 5, nuevas 2 (d, e), vencidas 2 (a, c), aprendidas 2 (b, c)', eq(s, { total: 5, nuevas: 2, vencidas: 2, aprendidas: 2 }), s);
  ok('stats: intervalo 20 todavía no es aprendida', srsStats([mk('a', 'esqueletico')], { a: state({ interval: 20, due: plusDays(5) }) }, NOW).aprendidas === 0);
  ok('stats sobre mazo real', srsStats(deck, {}, NOW).total === deck.length && srsStats(deck, {}, NOW).nuevas === deck.length);
}

console.log(failed ? '\n' + failed + ' FALLOS' : '\nTODO OK');
process.exit(failed ? 1 : 0);
