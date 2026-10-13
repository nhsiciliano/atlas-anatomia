# Pipeline 3D (BodyParts3D → GLB)

Genera los modelos 3D que consume la app (`web/`) a partir de las mallas OBJ de BodyParts3D.

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

## Mallas externas (HRA)

BodyParts3D describe un cuerpo masculino y **no tiene conceptos femeninos** (útero, ovarios, trompas). Para el reproductor femenino se usan mallas del **Human Reference Atlas (HRA)** de HuBMAP/NIH, *3D Reference Object Library* v1.2 (junio 2022), derivadas del Visible Human Female:

| Archivo | Para qué |
|---|---|
| `VH_F_Uterus.glb` | útero |
| `VH_F_Ovary_L.glb`, `VH_F_Ovary_R.glb` | ovarios (izquierdo y derecho) |
| `VH_F_Fallopian_Tube_L.glb`, `VH_F_Fallopian_Tube_R.glb` | trompas uterinas |
| `VH_F_Pelvis.glb` | pelvis de referencia, **solo para alinear** (no se exporta) |

- **Licencia**: Creative Commons Atribución 4.0 (CC BY 4.0), según <https://hubmapconsortium.github.io/ccf/pages/ccf-3d-reference-library.html>. Los GLB derivados deben mantener la atribución al HRA.
- **Fuente**: <https://github.com/hubmapconsortium/ccf-releases/tree/main/v1.2/models>.
- **Descarga**: los archivos **no se versionan** (`bp3d/extra/` está en `.gitignore`). Se bajan con un script que solo usa la biblioteca estándar de Python:

  ```bash
  python3 bp3d/fetch_hra.py            # a bp3d/extra/hra/
  python3 bp3d/fetch_hra.py --out RUTA # a otra carpeta
  ```

  El script verifica el tamaño de cada archivo (±1 %) y que empiece con los bytes `glTF`, no vuelve a descargar lo que ya está bien, imprime una tabla y escribe `bp3d/extra/hra/SOURCE.md` con la fuente, la licencia, el tamaño y el sha256 de cada archivo.
- **Alineación**: las mallas del HRA están en otro sistema de coordenadas y escala que BodyParts3D; la alineación la hace `build_glb.py` (clase `ExternalAligner`) a partir de la pelvis, con la configuración de `EXTRA_ALIGN` en `mapping.py`:
  1. **Unidades**: si la malla de referencia (`VH_F_Pelvis.glb`) mide menos de 5 en su lado mayor, se asume metros y se multiplica por 1000 (una pelvis adulta mide ~250–300 mm).
  2. **Orientación**: se prueban dos rotaciones propias del glTF (Y arriba) al espacio BodyParts3D (Z arriba, frente = −Y), `frente +Z` y `frente -Z`, y se elige la que deja la pelvis HRA más cerca (distancia media de 4000 puntos de superficie) de la pelvis de BodyParts3D (`hip bone` + `sacrum`).
  3. **Escala**: uniforme, igual al ancho en X de la pelvis de BodyParts3D dividido por el de la pelvis HRA (o la fija `scale`, si se define).
  4. **Traslación**: lleva el centro de la caja de la pelvis HRA al de la pelvis de BodyParts3D, más `offset_mm` (hoy +20 mm en Z, para que el útero apoye sobre la cúpula de la vejiga en lugar de meterse en ella).

  Como son cuerpos distintos, el resultado es proporcionalmente aproximado, no exacto.

## Variantes por sexo: `EXTRA`, `EXTRA_ALIGN` y `BASE_VARIANT`

Se configuran en `mapping.py`:

- **`BASE_VARIANT`** (`'masculino'`): nombre de la variante que corresponde al GLB normal de un sistema (el construido con `MAP`).
- **`EXTRA`**: mallas externas por sistema y variante, con rutas relativas a `--extra-dir`. Cada id puede tener varias piezas, que se **unen en un solo nodo** (los nodos del GLB se llaman como el id). Hoy:

  ```python
  EXTRA = {'reproductor': {'femenino': {
      'utero': ['hra/VH_F_Uterus.glb'],
      'ovario': ['hra/VH_F_Ovary_L.glb', 'hra/VH_F_Ovary_R.glb'],
      'trompa-uterina': ['hra/VH_F_Fallopian_Tube_L.glb', 'hra/VH_F_Fallopian_Tube_R.glb'],
  }}}
  ```

  Cada id de `EXTRA` debe ser una estructura del mismo sistema en `data/structures/`; si no, el script se detiene con un error. Cada malla se simplifica al presupuesto de caras de su id (`BUDGET`, por defecto `DEFAULT_BUDGET` = 6000).
- **`EXTRA_ALIGN`**: una entrada por fuente (la primera carpeta de la ruta, aquí `hra`) con `ref` (la malla de referencia, `hra/VH_F_Pelvis.glb`, que **no se exporta**), `target` (los conceptos de BodyParts3D con los que se alinea), `offset_mm` (ajuste fino manual en mm de BodyParts3D) y `scale` (`None` = automática).

### Ejecutar desde el checkout principal apuntando al worktree

El venv y los OBJ (`bp3d/.venv`, `bp3d/objs/`, `bp3d/extra/`) existen solo en el checkout principal; el worktree tiene el código. Se ejecuta el script del worktree con el Python del checkout principal y se le indican los datos:

```bash
MAIN=/Users/nhsiciliano/Desktop/Interactive_Anatomy_Atlas
DEV=/Users/nhsiciliano/Desktop/atlas-anatomia-dev
cd $DEV/bp3d
$MAIN/bp3d/.venv/bin/python build_glb.py --only reproductor \
    --objs-dir $MAIN/bp3d/objs --extra-dir $MAIN/bp3d/extra \
    --app-dir $DEV/web --dry-run          # quitar --dry-run para exportar
```

(`--app-dir` ya apunta a `../web` del propio script; se muestra para ser explícito.)

### Qué imprime `--dry-run` sobre las mallas externas

Una sección "Mallas externas" con, por fuente: las **unidades** detectadas, la **orientación elegida** (con la distancia media de cada candidata a la pelvis de BodyParts3D), la **escala** y la **traslación** en mm; y, por cada malla, su número de **caras** y su **caja** alineada (mínimo y máximo en mm). Luego ejecuta **7 chequeos de plausibilidad** de la pelvis femenina (`OK` / `FALLA`):

1. el útero cae dentro de la caja de la pelvis;
2. el centro del útero queda por encima del centro de la vejiga;
3. el útero queda por debajo del borde superior del sacro;
4. y 5. cada ovario (izquierdo y derecho) queda a un lado del útero;
6. y 7. cada trompa (izquierda y derecha) queda entre el útero y su ovario.

Un `FALLA` indica que hay que revisar la orientación, la escala o `offset_mm` antes de exportar.

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
./.venv/bin/python build_glb.py --dry-run            # resolver nombres → FJ, alinear las mallas externas y reportar
./.venv/bin/python build_glb.py --skip-wrap          # pulmones con la malla cruda (más rápido para iterar)
```

| Opción | Efecto |
|---|---|
| `--app-dir RUTA` | Carpeta de la app Next.js. Por defecto `../web`. |
| `--only SISTEMA` | Genera solo ese sistema (repetible). El manifest se actualiza solo para esos sistemas y conserva los demás. |
| `--skip-wrap` | No aplica el envoltorio por vóxeles (`WRAP` en `mapping.py`): usa la malla original. No usarlo para los GLB definitivos. |
| `--objs-dir RUTA` | Carpeta con los OBJ de BodyParts3D (la que contiene `partof_BP3D_4.0_obj_99/` e `isa_BP3D_4.0_obj_99/`). Por defecto `objs/` junto al script. |
| `--extra-dir RUTA` | Carpeta con las mallas externas de `EXTRA` (la que contiene `hra/`). Por defecto `extra/` junto al script. |
| `--dry-run` | No exporta nada: lista cada estructura con su cantidad de archivos FJ, imprime la alineación de las mallas externas (ver más abajo) y los nombres de concepto sin malla (`MISSING`). |

Las rutas por defecto se resuelven a partir de la ubicación del script, así que puede ejecutarse desde cualquier carpeta. El sistema de cada estructura se lee de `data/structures/*.ts` de la app. Una corrida completa tarda ~15 s.

Al terminar imprime una tabla por sistema (estructuras, caras, bytes), la lista de `MISSING` y el recordatorio de subir `MODEL_VERSION`.

## Salida

- `web/public/models3d/<sistema>.glb`
- `web/public/models3d/<sistema>_<variante>.glb` para cada variante de `EXTRA` (hoy `reproductor_femenino.glb`). El GLB "base" del sistema (el de `MAP`) es la variante `BASE_VARIANT` (`masculino`) y conserva su nombre `reproductor.glb`. Las variantes de `EXTRA` no llevan malla de contexto (`ctx__…`).
- `web/data/models3d-manifest.json` (qué estructuras tiene cada GLB y su tamaño; se escribe directamente ahí). Un sistema con variantes se ve así: en el nivel superior, `file` y `bytes` son los de la variante base y `structures` es la **unión** de todas las variantes (así `hasModel3D`, `validate` y el repaso ven todas las mallas); además trae `variantes: { masculino: {file, structures, bytes}, femenino: {…} }`. Con `--only` solo se actualizan los sistemas indicados.

Después de regenerar, subir `MODEL_VERSION` en `web/lib/models3d.ts` para invalidar la caché del navegador.

## Agregar o corregir una estructura

`mapping.py` es la tabla `id de estructura → [nombres de concepto de BodyParts3D]`. Los nombres deben coincidir **exactamente** con los de BodyParts3D (en inglés, en minúsculas). Para encontrarlos:

```bash
grep -i "clavicle" allnames.txt
```

El script resuelve cada nombre contra `partof_element_parts.txt` e `isa_element_parts.txt`: un nombre que no aparezca ahí no genera geometría y la estructura se informa como `MISSING` al ejecutar.
