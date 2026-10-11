import manifest from '@/data/models3d-manifest.json';
import type { SystemId } from '@/data/systems';

export interface SystemModelInfo {
  file: string;
  structures: string[];
  bytes: number;
}

export const MODELS_3D = manifest as Partial<Record<SystemId, SystemModelInfo>>;

export const MODEL_VERSION = 3;

export function modelUrl(sys: SystemId): string | null {
  const m = MODELS_3D[sys];
  return m ? `/models3d/${m.file}?v=${MODEL_VERSION}` : null;
}

const STRUCTURES_IN_3D = new Set(
  Object.values(MODELS_3D).flatMap((m) => m?.structures ?? []),
);

/** True when the structure has a real 3D mesh in the BodyParts3D-derived models. */
export function hasModel3D(structureId: string | null | undefined): boolean {
  return !!structureId && STRUCTURES_IN_3D.has(structureId);
}

export const MODELS_3D_COUNT = STRUCTURES_IN_3D.size;
