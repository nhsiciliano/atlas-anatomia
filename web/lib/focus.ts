import { STRUCTURE_MAP } from '@/data/anatomy-data';
import { MODELS_3D, sexOfMesh, type ReproSex } from '@/lib/models3d';

/**
 * Reproductive variant to show for a structure: the variant whose GLB holds its mesh, or, for a
 * structure with `sexo` but no mesh (vagina, cuello uterino…), its own sex when its system has
 * that variant, so the context model matches. Null when the structure does not depend on sex.
 */
export function preferredSex(id: string | null | undefined): ReproSex | null {
  if (!id) return null;
  const meshSex = sexOfMesh(id);
  if (meshSex) return meshSex;
  const st = STRUCTURE_MAP[id];
  return st?.sexo && MODELS_3D[st.systemId]?.variantes?.[st.sexo] ? st.sexo : null;
}
