/**
 * Data integrity check for the atlas (`npm run validate`).
 * Exits with code 1 when any ERROR is found; WARN lines are informational.
 */
import { STRUCTURES, type AnatomicalStructure } from '../data/anatomy-data';
import { SYSTEMS, REGIONS, type SystemId } from '../data/systems';
import { REFERENCES, REFERENCE_MAP } from '../data/references';
import { GUIDED_TOURS } from '../data/tours';
import { QUIZ_QUESTIONS } from '../data/quizzes';
import { MANUAL_CARDS } from '../data/flashcards';
import manifest from '../data/models3d-manifest.json';

const errors: string[] = [];
const warnings: string[] = [];
const error = (msg: string) => errors.push(msg);
const warn = (msg: string) => warnings.push(msg);

const systemIds = new Set<string>(SYSTEMS.map((s) => s.id));
const regionIds = new Set<string>(REGIONS.map((r) => r.id));
const structureIds = new Set<string>();
const meshIds = new Set(
  Object.values(manifest as Record<string, { structures: string[] }>).flatMap((m) => m.structures),
);
const usedRefs = new Set<string>();

const filled = (v: unknown) => (typeof v === 'string' ? v.trim() !== '' : Array.isArray(v) && v.length > 0);

/** `_en` must be filled wherever `_es` is (strings, string lists, clinical notes). */
function checkTranslation(s: AnatomicalStructure, field: string) {
  const es = (s as unknown as Record<string, unknown>)[`${field}_es`];
  const en = (s as unknown as Record<string, unknown>)[`${field}_en`];
  if (!filled(es)) return;
  if (!filled(en)) return error(`${s.id}: ${field}_en vacío (${field}_es tiene contenido)`);
  if (Array.isArray(es) && Array.isArray(en)) {
    if (es.length !== en.length) error(`${s.id}: ${field}_es tiene ${es.length} elementos y ${field}_en ${en.length}`);
    en.forEach((item, i) => {
      const empty = typeof item === 'string' ? !item.trim() : !filled(item?.titulo) || !filled(item?.texto);
      if (empty && es[i] !== undefined) error(`${s.id}: ${field}_en[${i}] vacío`);
    });
  }
}

// ── Sources and systems ─────────────────────────────────────────────────────
for (const r of REFERENCES) if (!filled(r.descripcion_en)) error(`referencia ${r.id}: descripcion_en vacía`);
for (const sys of SYSTEMS) if (!filled(sys.descripcion_en)) error(`sistema ${sys.id}: descripcion_en vacía`);

const noMesh: string[] = [];

// ── Structures ──────────────────────────────────────────────────────────────
for (const s of STRUCTURES) {
  if (structureIds.has(s.id)) error(`id duplicado: ${s.id}`);
  structureIds.add(s.id);

  if (!systemIds.has(s.systemId)) error(`${s.id}: systemId inválido "${s.systemId}"`);
  for (const r of s.regiones) if (!regionIds.has(r)) error(`${s.id}: región inválida "${r}"`);
  for (const c of s.conexiones) {
    if (!systemIds.has(c)) error(`${s.id}: conexión inválida "${c}"`);
    if (c === s.systemId) error(`${s.id}: conexiones incluye su propio sistema "${c}"`);
  }
  for (const ref of s.referencias) {
    usedRefs.add(ref);
    if (!REFERENCE_MAP[ref]) error(`${s.id}: referencia inexistente "${ref}"`);
  }

  if (s.escala === 'micro' && meshIds.has(s.id)) error(`${s.id}: marcada escala 'micro' pero tiene malla en el manifest`);
  if (!meshIds.has(s.id) && !s.escala) noMesh.push(s.id);

  for (const f of ['nombre', 'explicacion', 'explicacion_avanzada', 'ubicacion', 'dato', 'funciones', 'partes',
    'clinica', 'inervacion', 'irrigacion']) {
    checkTranslation(s, f);
  }
}

if (noMesh.length) warn(`${noMesh.length} estructuras sin malla 3D y sin escala (fichas sin modelo): ${noMesh.join(', ')}`);

const noClinic = STRUCTURES.filter((s) => !filled(s.clinica_es)).map((s) => s.id);
if (noClinic.length === STRUCTURES.length) warn(`ninguna estructura tiene clínica todavía (${noClinic.length})`);
else if (noClinic.length) warn(`${noClinic.length} estructuras sin clínica: ${noClinic.join(', ')}`);

const bySystem = new Map<SystemId, AnatomicalStructure[]>(SYSTEMS.map((s) => [s.id, []]));
for (const s of STRUCTURES) bySystem.get(s.systemId)?.push(s);
for (const [sys, list] of bySystem) if (list.length < 8) warn(`sistema ${sys}: solo ${list.length} estructuras (< 8)`);

// ── 3D manifest ─────────────────────────────────────────────────────────────
for (const [sys, m] of Object.entries(manifest as Record<string, { structures: string[] }>)) {
  if (!systemIds.has(sys)) error(`manifest: sistema inexistente "${sys}"`);
  for (const id of m.structures) if (!structureIds.has(id)) error(`manifest ${sys}: id inexistente "${id}"`);
}

// ── Tours ───────────────────────────────────────────────────────────────────
const tourIds = new Set<string>();
for (const t of GUIDED_TOURS) {
  if (tourIds.has(t.id)) error(`tour duplicado: ${t.id}`);
  tourIds.add(t.id);
  t.steps.forEach((step, i) => {
    const where = `tour ${t.id} paso ${i + 1}`;
    if (!structureIds.has(step.structureId)) error(`${where}: structureId inexistente "${step.structureId}"`);
    if (!systemIds.has(step.systemId)) error(`${where}: systemId inexistente "${step.systemId}"`);
    const st = STRUCTURES.find((s) => s.id === step.structureId);
    if (st && systemIds.has(step.systemId) && st.systemId !== step.systemId) {
      warn(`${where}: systemId "${step.systemId}" distinto del de la estructura (${st.systemId})`);
    }
  });
}

// ── Quizzes ─────────────────────────────────────────────────────────────────
const quizIds = new Set<string>();
for (const q of QUIZ_QUESTIONS) {
  if (quizIds.has(q.id)) error(`pregunta duplicada: ${q.id}`);
  quizIds.add(q.id);
  if (!systemIds.has(q.sistemaId)) error(`quiz ${q.id}: sistemaId inexistente "${q.sistemaId}"`);
  if (q.structureId && !structureIds.has(q.structureId)) error(`quiz ${q.id}: structureId inexistente "${q.structureId}"`);
  // El modo identificación resalta la estructura en el visor 3D: sin malla no hay nada que mostrar.
  if (q.tipo === 'identificacion') {
    if (!q.structureId) error(`quiz ${q.id}: pregunta de identificación sin structureId`);
    else if (structureIds.has(q.structureId) && !meshIds.has(q.structureId)) {
      error(`quiz ${q.id}: pregunta de identificación sobre "${q.structureId}", que no tiene malla 3D`);
    }
  }
  for (const lang of ['es', 'en'] as const) {
    const opts = q[`opciones_${lang}`];
    if (opts.length !== 4) error(`quiz ${q.id}: opciones_${lang} tiene ${opts.length} opciones (se esperan 4)`);
  }
  if (!Number.isInteger(q.respuestaCorrecta) || q.respuestaCorrecta < 0 || q.respuestaCorrecta >= q.opciones_es.length) {
    error(`quiz ${q.id}: respuestaCorrecta ${q.respuestaCorrecta} fuera de rango`);
  }
}

// ── Manual flashcards ───────────────────────────────────────────────────────
const cardIds = new Set<string>();
for (const c of MANUAL_CARDS) {
  if (cardIds.has(c.id)) error(`tarjeta duplicada: ${c.id}`);
  cardIds.add(c.id);
  if (!systemIds.has(c.systemId)) error(`tarjeta ${c.id}: systemId inexistente "${c.systemId}"`);
  if (!c.id.startsWith(`manual:${c.systemId}:`)) error(`tarjeta ${c.id}: el id debería empezar por "manual:${c.systemId}:"`);
  if (c.structureId && !structureIds.has(c.structureId)) error(`tarjeta ${c.id}: structureId inexistente "${c.structureId}"`);
  for (const f of ['frente_es', 'frente_en', 'dorso_es', 'dorso_en'] as const) {
    if (!filled(c[f])) error(`tarjeta ${c.id}: ${f} vacío`);
  }
}

// ── Output ──────────────────────────────────────────────────────────────────
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);

const count = (pred: (s: AnatomicalStructure) => boolean) => STRUCTURES.filter(pred).length;
const tally = <T extends string>(items: T[]) =>
  items.reduce((acc, k) => acc.set(k, (acc.get(k) ?? 0) + 1), new Map<T, number>());
const fmt = (m: Map<string, number>) => [...m].map(([k, v]) => `${k}=${v}`).join(' ');

console.log('\nResumen');
console.log(`  estructuras por sistema: ${fmt(new Map([...bySystem].map(([k, v]) => [k, v.length])))}`);
console.log(`  total ${STRUCTURES.length} · con malla ${count((s) => meshIds.has(s.id))} · micro ${count((s) => s.escala === 'micro')}` +
  ` · con clínica ${count((s) => filled(s.clinica_es))}`);
console.log(`  tours ${GUIDED_TOURS.length} · pasos ${GUIDED_TOURS.reduce((n, t) => n + t.steps.length, 0)}`);
console.log(`  preguntas ${QUIZ_QUESTIONS.length} · por sistema: ${fmt(tally(QUIZ_QUESTIONS.map((q) => q.sistemaId)))}`);
console.log(`  preguntas por dificultad: ${fmt(tally(QUIZ_QUESTIONS.map((q) => q.dificultad)))}`);
console.log(`  preguntas por tipo: ${fmt(tally(QUIZ_QUESTIONS.map((q) => q.tipo)))}`);
console.log(`  tarjetas manuales ${MANUAL_CARDS.length} · por sistema: ${fmt(tally(MANUAL_CARDS.map((c) => c.systemId)))}`);
console.log(`  tarjetas manuales por dificultad: ${fmt(tally(MANUAL_CARDS.map((c) => c.dificultad)))}`);
const unusedRefs = Object.keys(REFERENCE_MAP).filter((r) => !usedRefs.has(r));
console.log(`  referencias usadas ${[...usedRefs].filter((r) => REFERENCE_MAP[r]).length}/${Object.keys(REFERENCE_MAP).length}` +
  (unusedRefs.length ? ` · sin usar: ${unusedRefs.join(', ')}` : ''));

console.log(`\n${errors.length ? 'ERROR' : 'OK   '} ${errors.length} errores, ${warnings.length} avisos`);
process.exit(errors.length ? 1 : 0);
