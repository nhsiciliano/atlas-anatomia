import { STRUCTURE_MAP } from '@/data/anatomy-data';
import { SYSTEM_MAP, REGIONS, type RegionId, type SystemId } from '@/data/systems';

export interface Breadcrumb {
  label_es: string;
  label_en: string;
  type: 'body' | 'region' | 'system' | 'structure';
  id?: string;
}

export function buildBreadcrumbs(structureId: string | null): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [{ label_es: 'Cuerpo', label_en: 'Body', type: 'body' }];
  if (!structureId) return crumbs;

  const s = STRUCTURE_MAP[structureId];
  if (!s) return crumbs;

  // Region
  const regionId = s.regiones?.[0] as RegionId | undefined;
  if (regionId) {
    const reg = REGIONS.find(r => r.id === regionId);
    if (reg) {
      crumbs.push({ label_es: reg.nombre_es, label_en: reg.nombre_en, type: 'region', id: regionId });
    }
  }

  // System
  const sys = SYSTEM_MAP[s.systemId as SystemId];
  if (sys) {
    crumbs.push({ label_es: `Sistema ${sys.nombre_es.toLowerCase()}`, label_en: `${sys.nombre_en} System`, type: 'system', id: s.systemId });
  }

  // Structure
  crumbs.push({ label_es: s.nombre_es, label_en: s.nombre_en, type: 'structure', id: s.id });

  return crumbs;
}
