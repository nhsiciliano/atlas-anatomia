# Pipeline 3D (BodyParts3D → GLB)

Genera los modelos 3D que consume la app (`atlas_anatomia/nextjs_space`) a partir de las mallas OBJ de BodyParts3D.

## Qué hace

1. Lee el mapeo `id de estructura → nombres de concepto de BodyParts3D` de `mapping.py` (`MAP`, `CONTEXT` y `WRAP`; es la única tabla).
2. Resuelve cada nombre a archivos de malla (`FJxxxx.obj`) usando las tablas `*_element_parts.txt`.
3. Agrupa, simplifica (reducción de polígonos), reorienta (de mm Z-up a metros Y-up, centrado en la piel) y exporta **un GLB por sistema**.
4. Dentro de cada GLB hay **un nodo por id de estructura**. Los nodos `ctx__<sistema>` son mallas de contexto que se muestran pero no se pueden seleccionar.
5. Los **pulmones** no usan la malla original: se reconstruyen envolviéndola con vóxeles (cierre morfológico + marching cubes + suavizado) para obtener una superficie continua.

## Origen de los datos

[BodyParts3D](https://lifesciencedb.jp/bp3d/) 4.0, © The Database Center for Life Science (DBCLS), licencia **CC BY-SA 2.1 JP**. La atribución es obligatoria y los GLB derivados se distribuyen bajo la misma licencia.

Archivos a descargar de BodyParts3D (**no se versionan**: pesan ~870 MB; `bp3d/objs/` y `bp3d/*.zip` están en `.gitignore`):

- `partof_BP3D_4.0_obj_99.zip`
- `isa_BP3D_4.0_obj_99.zip`

Descomprimirlos dentro de `bp3d/objs/` para que existan `objs/partof_BP3D_4.0_obj_99/` (~1258 archivos) y `objs/isa_BP3D_4.0_obj_99/` (~2234 archivos).

Las listas de texto que ya están en esta carpeta (sí se versionan) vienen del mismo sitio:

| Archivo | Contenido |
|---|---|
| `partof_element_parts.txt`, `isa_element_parts.txt` | concepto → archivo de malla (`FJ…`) |
| `partof_parts_list_e.txt`, `isa_parts_list_e.txt` | concepto → id de representación y nombre en inglés |
| `partof_inclusion_relation_list.txt` | relación padre/hijo entre conceptos |
| `allnames.txt` | índice `FMA id` ↔ nombre, para buscar conceptos |

## Instalación

Requiere Python 3.9+ (probado con 3.9 en arm64, todo con ruedas precompiladas).

```bash
cd bp3d
python3 -m venv .venv
./.venv/bin/pip install --upgrade pip
./.venv/bin/pip install -r requirements.txt
./.venv/bin/python -c "import numpy, scipy, skimage, trimesh, fast_simplification; print('ok')"
```

`fast-simplification` está fijada en 0.1.12: las versiones posteriores usan anotaciones `float | None` que fallan al importar en Python 3.9.

## Uso

```bash
./.venv/bin/python build_glb.py                      # todos los sistemas
./.venv/bin/python build_glb.py --only endocrino     # solo un sistema (repetible: --only a --only b)
./.venv/bin/python build_glb.py --dry-run            # solo resolver nombres → FJ y listar MISSING
./.venv/bin/python build_glb.py --skip-wrap          # pulmones con la malla cruda (más rápido para iterar)
```

| Opción | Efecto |
|---|---|
| `--app-dir RUTA` | Carpeta de la app Next.js. Por defecto `../atlas_anatomia/nextjs_space`. |
| `--only SISTEMA` | Genera solo ese sistema (repetible). El manifest se actualiza solo para esos sistemas y conserva los demás. |
| `--skip-wrap` | No aplica el envoltorio por vóxeles (`WRAP` en `mapping.py`): usa la malla original. No usarlo para los GLB definitivos. |
| `--dry-run` | No exporta nada: lista cada estructura con su cantidad de archivos FJ y los nombres de concepto sin malla (`MISSING`). |

Las rutas se resuelven a partir de la ubicación del script, así que puede ejecutarse desde cualquier carpeta. El sistema de cada estructura se lee de `data/structures/*.ts` de la app. Una corrida completa tarda ~15 s.

Al terminar imprime una tabla por sistema (estructuras, caras, bytes), la lista de `MISSING` y el recordatorio de subir `MODEL_VERSION`.

## Salida

- `atlas_anatomia/nextjs_space/public/models3d/<sistema>.glb`
- `atlas_anatomia/nextjs_space/data/models3d-manifest.json` (qué estructuras tiene cada GLB y su tamaño; se escribe directamente ahí)

Después de regenerar, subir `MODEL_VERSION` en `atlas_anatomia/nextjs_space/lib/models3d.ts` para invalidar la caché del navegador.

## Agregar o corregir una estructura

`mapping.py` es la tabla `id de estructura → [nombres de concepto de BodyParts3D]`. Los nombres deben coincidir **exactamente** con los de BodyParts3D (en inglés, en minúsculas). Para encontrarlos:

```bash
grep -i "clavicle" allnames.txt
```

El script resuelve cada nombre contra `partof_element_parts.txt` e `isa_element_parts.txt`: un nombre que no aparezca ahí no genera geometría y la estructura se informa como `MISSING` al ejecutar.
