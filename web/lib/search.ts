import { STRUCTURES, type AnatomicalStructure } from '@/data/anatomy-data';

export interface SearchResult {
  structure: AnatomicalStructure;
  matchField: string;
  score: number;
}

function normalize(s: string): string {
  return (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function searchStructures(query: string): SearchResult[] {
  if (!query || query.trim().length < 2) return [];
  const q = normalize(query.trim());

  const results: SearchResult[] = [];

  for (const s of STRUCTURES) {
    const fields: [string, string][] = [
      [normalize(s.nombre_es), 'nombre_es'],
      [normalize(s.nombre_en), 'nombre_en'],
      [normalize(s.termino_ta), 'termino_ta'],
    ];

    for (const [val, field] of fields) {
      if (val.includes(q)) {
        const score = val.startsWith(q) ? 100 : val === q ? 200 : 50;
        results.push({ structure: s, matchField: field, score });
        break; // one match per structure
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 20);
}
