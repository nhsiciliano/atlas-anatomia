import manifest from '@/data/models3d-manifest.json';
import type { SystemId } from '@/data/systems';

/** Sex variants of a system with more than one GLB (today only the reproductive system). */
export type ReproSex = 'masculino' | 'femenino';

export interface SystemModelInfo {
  file: string;
  structures: string[];
  bytes: number;
}

/**
 * Manifest entry of a system. With `variantes`, the top level describes the base (male) GLB and
 * `structures` is the union of every variant, so union-based checks keep working unchanged.
 */
export interface SystemModelEntry extends SystemModelInfo {
  variantes?: Partial<Record<ReproSex, SystemModelInfo>>;
}

// Plain assignment (not a cast) so TypeScript checks the JSON against the expected shape.
export const MODELS_3D: Partial<Record<SystemId, SystemModelEntry>> = manifest;

export const MODEL_VERSION = 12;

/** URL of a system's GLB; with `sex`, the GLB of that variant when the system has variants. */
export function modelUrl(sys: SystemId, sex?: ReproSex): string | null {
  const m = MODELS_3D[sys];
  if (!m) return null;
  const file = (sex && m.variantes?.[sex]?.file) || m.file;
  return `/models3d/${file}?v=${MODEL_VERSION}`;
}

const STRUCTURES_IN_3D = new Set(
  Object.values(MODELS_3D).flatMap((m) => m?.structures ?? []),
);

/** Variant that holds each structure, for structures of systems with variants. */
const SEX_OF_MESH = new Map<string, ReproSex>(
  Object.values(MODELS_3D).flatMap((m) =>
    Object.entries(m?.variantes ?? {}).flatMap(([sex, v]) =>
      (v?.structures ?? []).map((id) => [id, sex as ReproSex] as const),
    ),
  ),
);

/** True when the structure has a real 3D mesh in any variant (BodyParts3D or HRA). */
export function hasModel3D(structureId: string | null | undefined): boolean {
  return !!structureId && STRUCTURES_IN_3D.has(structureId);
}

/** True when the structure is visible with the given sex variant (or its system has no variants). */
export function hasModel3DFor(structureId: string | null | undefined, sex: ReproSex): boolean {
  if (!hasModel3D(structureId)) return false;
  const meshSex = SEX_OF_MESH.get(structureId!);
  return !meshSex || meshSex === sex;
}

/** Variant whose GLB contains the structure, or null when it is not in a system with variants. */
export function sexOfMesh(structureId: string | null | undefined): ReproSex | null {
  return (structureId && SEX_OF_MESH.get(structureId)) || null;
}

export const MODELS_3D_COUNT = STRUCTURES_IN_3D.size;
