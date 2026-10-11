/**
 * Store persistence test (`npm run test:store`): hydration, migration of the legacy
 * localStorage keys, and the progress actions, against an in-memory localStorage.
 */
export {}; // module scope: keep these helpers out of the global namespace

const mem = new Map<string, string>();
const fake = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => void mem.set(k, String(v)),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: (i: number) => [...mem.keys()][i] ?? null,
  get length() { return mem.size; },
};
Object.defineProperty(globalThis, 'localStorage', { value: fake, configurable: true });

let failed = 0;
const ok = (name: string, cond: boolean, extra?: unknown) => {
  console.log((cond ? 'OK   ' : 'FAIL ') + name + (extra !== undefined ? '  ' + JSON.stringify(extra) : ''));
  if (!cond) failed++;
};
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

async function main() {
  // 1) New key already has some progress + the 4 legacy keys (overlapping).
  mem.set('atlas-progress', JSON.stringify({ version: 1, state: {
    bookmarks: ['corazon'], recentlyViewed: ['rinon'], completedTours: [], srs: {}, locale: 'en', detailLevel: 'avanzado',
    quizScores: { 'all-all': { best: 9, last: 7, total: 10, fecha: '2026-10-01T00:00:00.000Z' } },
  } }));
  mem.set('atlas_bookmarks', JSON.stringify(['corazon', 'femur']));
  mem.set('atlas_recent', JSON.stringify(['craneo', 'rinon']));
  mem.set('atlas_tours', JSON.stringify(['tour-circulacion']));
  mem.set('atlas_quiz', JSON.stringify({ 'all-all': { correct: 3, total: 10 }, 'muscular-all': { correct: 2, total: 4 } }));

  // Loaded after the fake storage exists: zustand grabs localStorage when the store is created.
  const { useAtlasStore } = await import('../lib/store');
  const st = () => useAtlasStore.getState();

  ok('antes de rehydrate: estado vacío (skipHydration)', st().bookmarks.length === 0 && !useAtlasStore.persist.hasHydrated());
  await useAtlasStore.persist.rehydrate();
  ok('hasHydrated() === true', useAtlasStore.persist.hasHydrated());
  ok('bookmarks = unión sin duplicados', eq(st().bookmarks, ['corazon', 'femur']), st().bookmarks);
  ok('recentlyViewed = unión (nuevo primero)', eq(st().recentlyViewed, ['rinon', 'craneo']), st().recentlyViewed);
  ok('completedTours absorbe legado', eq(st().completedTours, ['tour-circulacion']), st().completedTours);
  ok('quizScores: gana la entrada nueva si existe', eq(st().quizScores['all-all'], { best: 9, last: 7, total: 10, fecha: '2026-10-01T00:00:00.000Z' }));
  ok('quizScores: legado {correct,total} convertido', eq(st().quizScores['muscular-all'], { best: 2, last: 2, total: 4, fecha: '' }), st().quizScores['muscular-all']);
  ok('locale/detailLevel del estado nuevo conservados', st().locale === 'en' && st().detailLevel === 'avanzado');
  ok('claves legadas borradas', ['atlas_bookmarks', 'atlas_recent', 'atlas_tours', 'atlas_quiz'].every(k => mem.get(k) === undefined));
  const saved = JSON.parse(mem.get('atlas-progress') ?? 'null');
  ok('atlas-progress escrito con version 1 y solo el progreso', saved?.version === 1 && eq(Object.keys(saved.state).sort(),
    ['bookmarks', 'completedTours', 'detailLevel', 'locale', 'quizScores', 'recentlyViewed', 'srs', 'srsPrefs']), Object.keys(saved?.state ?? {}));
  ok('atlas-progress contiene la fusión', eq(saved.state.bookmarks, ['corazon', 'femur']) && !!saved.state.quizScores['muscular-all']);

  // 2) Sin claves legadas: segunda rehidratación no cambia nada.
  const before = mem.get('atlas-progress');
  await useAtlasStore.persist.rehydrate();
  ok('segunda rehidratación idempotente', mem.get('atlas-progress') === before && eq(st().bookmarks, ['corazon', 'femur']));

  // 3) Legado corrupto: se ignora sin romper; lo válido se migra; todo se borra.
  mem.set('atlas_bookmarks', '{no es json');
  mem.set('atlas_tours', JSON.stringify(['tour-digestion']));
  mem.set('atlas_quiz', JSON.stringify({ x: 'basura' }));
  await useAtlasStore.persist.rehydrate();
  ok('legado corrupto ignorado, el válido migrado', eq(st().bookmarks, ['corazon', 'femur']) && eq(st().completedTours, ['tour-circulacion', 'tour-digestion']), st().completedTours);
  ok('claves legadas (incluso corruptas) borradas', !mem.has('atlas_bookmarks') && !mem.has('atlas_tours') && !mem.has('atlas_quiz'));

  // 4) Acciones: recientes vía set(), saveQuizScore, export/import/reset.
  for (let i = 0; i < 25; i++) st().setSelectedStructure('s' + i);
  st().setSelectedStructure('s3');
  ok('recentlyViewed tope 20, sin duplicados, más reciente primero', st().recentlyViewed.length === 20 && st().recentlyViewed[0] === 's3' && new Set(st().recentlyViewed).size === 20);
  ok('recentlyViewed persistido sin escritura manual', JSON.parse(mem.get('atlas-progress')!).state.recentlyViewed[0] === 's3');
  st().saveQuizScore('all-all', 5, 10);
  const q = st().quizScores['all-all'];
  ok('saveQuizScore: best = max, last = actual, fecha ISO', q.best === 9 && q.last === 5 && /^\d{4}-\d\d-\d\dT/.test(q.fecha), q);

  const exported = st().exportProgress();
  const ex = JSON.parse(exported);
  ok('exportProgress: { version: 1, exportedAt, data }', ex.version === 1 && typeof ex.exportedAt === 'string' && eq(ex.data.bookmarks, ['corazon', 'femur']));
  st().resetProgress();
  ok('resetProgress: progreso vacío y locale es', st().bookmarks.length === 0 && eq(st().quizScores, {}) && st().locale === 'es' && st().detailLevel === 'fundamental');
  ok('reset persistido', eq(JSON.parse(mem.get('atlas-progress')!).state.bookmarks, []));
  ok('importProgress(export) => ok', eq(st().importProgress(exported), { ok: true }));
  ok('import restaura el progreso', eq(st().bookmarks, ['corazon', 'femur']) && st().quizScores['all-all'].best === 9 && st().locale === 'en');
  for (const [bad, label] of [['nope', 'JSON inválido'], ['{"data":{}}', 'sin version'], ['{"version":1}', 'sin data'],
    ['{"version":1,"data":{"bookmarks":[1]}}', 'lista no-string'], ['{"version":1,"data":{"quizScores":[]}}', 'quizScores no objeto'],
    ['{"version":2,"data":{}}', 'versión futura']] as const) {
    const r = st().importProgress(bad);
    ok('import rechaza ' + label, !r.ok, r);
  }
  ok('import fallido no toca el estado', eq(st().bookmarks, ['corazon', 'femur']));

  // 4b) Repetición espaciada: gradeCard usa schedule() y persiste; srsPrefs se persiste.
  const { schedule } = await import('../lib/srs');
  const t0 = new Date('2026-10-01T12:00:00.000Z');
  st().gradeCard('craneo:nombre_funcion', 2, t0);
  ok('gradeCard aplica schedule()', eq(st().srs['craneo:nombre_funcion'], schedule(undefined, 2, t0)), st().srs['craneo:nombre_funcion']);
  const t1 = new Date('2026-10-02T12:00:00.000Z');
  st().gradeCard('craneo:nombre_funcion', 2, t1);
  ok('gradeCard encadena sobre el estado anterior', eq(st().srs['craneo:nombre_funcion'], schedule(schedule(undefined, 2, t0), 2, t1)), st().srs['craneo:nombre_funcion'].interval);
  ok('gradeCard persiste en atlas-progress', !!JSON.parse(mem.get('atlas-progress')!).state.srs['craneo:nombre_funcion']);
  ok('srsPrefs por defecto', eq(st().srsPrefs, { systems: 'all', maxNew: 10, maxDue: 20 }));
  st().setSrsPrefs({ maxNew: 5, systems: ['esqueletico'] });
  ok('setSrsPrefs mezcla y persiste', eq(JSON.parse(mem.get('atlas-progress')!).state.srsPrefs, { systems: ['esqueletico'], maxNew: 5, maxDue: 20 }));
  ok('import sin srsPrefs usa los valores por defecto', st().importProgress(JSON.stringify({ version: 1, data: {} })).ok && eq(st().srsPrefs, { systems: 'all', maxNew: 10, maxDue: 20 }));
  ok('import recupera el progreso exportado', st().importProgress(exported).ok);

  // 5) Modo identificación del cuestionario: estado efímero, nunca persistido.
  ok('quizHighlightId empieza en null', st().quizHighlightId === null);
  st().setQuizHighlight('craneo');
  const recentBefore = st().recentlyViewed.join();
  st().setSelectedStructure('craneo', { recordRecent: false });
  ok('selección con recordRecent:false no toca recientes', st().recentlyViewed.join() === recentBefore && st().selectedStructureId === 'craneo');
  ok('setQuizHighlight marca la estructura en evaluación', st().quizHighlightId === 'craneo' && st().selectedStructureId === 'craneo');
  ok('quizHighlightId no se persiste', !('quizHighlightId' in JSON.parse(mem.get('atlas-progress')!).state));
  st().setQuizHighlight(null); // lo que hace el cuestionario al responder, cambiar de pregunta o salir
  ok('al responder se limpia y la selección se mantiene', st().quizHighlightId === null && st().selectedStructureId === 'craneo');
  st().setQuizHighlight('femur');
  st().resetProgress();
  ok('resetProgress no toca el estado de UI', st().quizHighlightId === 'femur');
  st().setQuizHighlight(null);

  console.log(failed ? '\n' + failed + ' FALLOS' : '\nTODO OK');
  process.exit(failed ? 1 : 0);
}

void main();
