import type { SystemId, RegionId } from './systems';
import { ESQUELETICO } from './structures/esqueletico';
import { MUSCULAR } from './structures/muscular';
import { NERVIOSO } from './structures/nervioso';
import { CARDIOVASCULAR } from './structures/cardiovascular';
import { RESPIRATORIO } from './structures/respiratorio';
import { DIGESTIVO } from './structures/digestivo';
import { URINARIO } from './structures/urinario';
import { ENDOCRINO } from './structures/endocrino';
import { LINFATICO_INMUNITARIO } from './structures/linfatico_inmunitario';
import { TEGUMENTARIO } from './structures/tegumentario';
import { REPRODUCTOR } from './structures/reproductor';
import { ORGANOS_SENSORIALES } from './structures/organos_sensoriales';

export interface ClinicalNote {
  titulo: string;
  texto: string;
}

export interface AnatomicalStructure {
  id: string;
  systemId: SystemId;
  nombre_es: string;
  nombre_en: string;
  termino_ta: string;
  regiones: RegionId[];
  explicacion_es: string;
  explicacion_en: string;
  explicacion_avanzada_es: string;
  explicacion_avanzada_en: string;
  ubicacion_es: string;
  ubicacion_en: string;
  funciones_es: string[];
  funciones_en: string[];
  partes_es: string[];
  partes_en: string[];
  conexiones: SystemId[];
  dato_es: string;
  dato_en: string;
  referencias: string[];
  sexo?: 'masculino' | 'femenino'; // only for sex-specific structures
  escala?: 'micro'; // estructura microscópica: sin representación 3D posible
  clinica_es?: ClinicalNote[];
  clinica_en?: ClinicalNote[];
  inervacion_es?: string;
  inervacion_en?: string;
  irrigacion_es?: string;
  irrigacion_en?: string;
}

// Order follows SYSTEMS in data/systems.ts.
export const STRUCTURES: AnatomicalStructure[] = [
  ...ESQUELETICO,
  ...MUSCULAR,
  ...NERVIOSO,
  ...CARDIOVASCULAR,
  ...RESPIRATORIO,
  ...DIGESTIVO,
  ...URINARIO,
  ...ENDOCRINO,
  ...LINFATICO_INMUNITARIO,
  ...TEGUMENTARIO,
  ...REPRODUCTOR,
  ...ORGANOS_SENSORIALES,
];

// Index helpers
export const STRUCTURE_MAP = Object.fromEntries(
  STRUCTURES.map(s => [s.id, s])
) as Record<string, AnatomicalStructure>;

export const STRUCTURES_BY_SYSTEM = STRUCTURES.reduce((acc, s) => {
  if (!acc[s.systemId]) acc[s.systemId] = [];
  acc[s.systemId]!.push(s);
  return acc;
}, {} as Record<SystemId, AnatomicalStructure[]>);

export const STRUCTURES_BY_REGION = STRUCTURES.reduce((acc, s) => {
  for (const r of s.regiones) {
    if (!acc[r]) acc[r] = [];
    acc[r]!.push(s);
  }
  return acc;
}, {} as Record<RegionId, AnatomicalStructure[]>);
