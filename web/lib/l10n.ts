import type { Locale } from '@/lib/i18n';

/** Campos de texto de las estructuras que existen como `<campo>_es` / `<campo>_en`. */
export type LocalizedField =
  | 'nombre' | 'explicacion' | 'explicacion_avanzada'
  | 'ubicacion' | 'dato' | 'inervacion' | 'irrigacion';

/** Campos de lista que existen como `<campo>_es` / `<campo>_en`. */
export type LocalizedListField = 'funciones' | 'partes';

// Las claves se arman en tiempo de ejecución (`${field}_${locale}`), así que el
// acceso va por `any`: no se restringe `field` para poder usar el helper también
// con objetos que no son estructuras (recorridos, preguntas, etc.).
function read(obj: object, field: string, locale: Locale): unknown {
  const value = (obj as any)?.[`${field}_${locale}`];
  if (value === undefined || value === null || value === '') {
    return (obj as any)?.[`${field}_es`];
  }
  return value;
}

/** Devuelve obj[`${field}_${locale}`], con fallback a español y luego a cadena vacía. */
export function pick<T extends object>(obj: T, field: string, locale: Locale): string {
  const value = read(obj, field, locale);
  return typeof value === 'string' ? value : '';
}

/** Igual que `pick` para listas: fallback a español y luego a lista vacía. */
export function pickList<T extends object>(obj: T, field: string, locale: Locale): string[] {
  const value = (obj as any)?.[`${field}_${locale}`];
  if (Array.isArray(value) && value.length > 0) return value;
  const fallback = (obj as any)?.[`${field}_es`];
  return Array.isArray(fallback) ? fallback : [];
}
