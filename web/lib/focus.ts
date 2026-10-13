import { STRUCTURE_MAP } from '@/data/anatomy-data';
import { MODELS_3D, sexOfMesh, type ReproSex } from '@/lib/models3d';
import { useAtlasStore } from '@/lib/store';

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

/**
 * Shows a structure for an identification exercise (quiz question or review card): its sex
 * variant, its system isolated, selected without entering "recently viewed", and its name hidden
 * (quizHighlightId) until the caller clears it with setQuizHighlight(null).
 */
export function focusStructureForIdentification(id: string): void {
  const s = useAtlasStore.getState();
  const sex = preferredSex(id);
  if (sex && sex !== s.reproSex) s.setReproSex(sex);
  const sys = STRUCTURE_MAP[id]?.systemId;
  if (sys) s.isolateSystem(sys);
  s.setSelectedStructure(id, { recordRecent: false });
  s.setQuizHighlight(id);
}
