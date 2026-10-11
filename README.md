# Atlas Interactivo de Anatomía

Atlas educativo 3D de anatomía humana, pensado para estudiantes de secundaria y de los primeros años de ciencias de la salud. Todo el contenido está en español e inglés, con modo fundamental/avanzado, recorridos guiados y un quiz de práctica. No requiere login ni base de datos.

## Qué incluye

Cifras tomadas de `npm run validate` al momento de escribir este documento (el script las recalcula):

- **162 estructuras** en **12 sistemas**, todas con ficha bilingüe (es/en) y **correlación clínica** introductoria.
- **110 con modelo 3D** y **18 microscópicas** (nefrona, alvéolos, queratinocito…), que se describen en su ficha y se indican como tales en el visor. Las 34 restantes son fichas sin modelo.
- **Fichas con información avanzada**: términos de la Terminologia Anatomica, inervación e irrigación (visibles en el modo avanzado), notas "En la clínica", referencias.
- **4 recorridos guiados**, **20 preguntas de quiz** y **60 tarjetas de repaso** escritas a mano (`data/flashcards.ts`, aún sin pantalla propia).
- **Interfaz bilingüe es/en** con selector de idioma, y modo oscuro/claro.
- **Sin login**: el progreso (favoritos, recientes, recorridos completados, puntajes del quiz y estado de repaso) se guarda en `localStorage`. El store permite exportar, importar y reiniciar ese progreso (`lib/store.ts`).
- **Solo 3D**, con el modelo BodyParts3D. Es un cuerpo **masculino**: las estructuras femeninas tienen ficha pero no malla 3D.

## Estructura del repositorio

```
.
├── atlas_anatomia/
│   └── nextjs_space/        # Aplicación web (Next.js + React + three.js)
├── bp3d/                    # Pipeline Python que genera los GLB desde BodyParts3D
├── docs/
│   ├── REVISION_PROFESIONAL.md  # Contenido pendiente de revisión por un profesional
│   └── design/                  # Mockups y capturas de diseño
└── anatomy_research.json    # Borrador inicial de contenido anatómico
```

- **`atlas_anatomia/nextjs_space/`**: la app. Datos estáticos en `data/` (estructuras por sistema en `data/structures/`), estado en `lib/store.ts` (Zustand), modelos 3D por sistema en `public/models3d/`. Convenciones y arquitectura en `CLAUDE.md`.
- **`bp3d/`**: scripts (`build_glb.py`, `mapping.py`) y listados de partes de BodyParts3D que generan los GLB por sistema que consume la app. Ver [`bp3d/README.md`](bp3d/README.md).
- **`docs/`**: revisión de contenido y mockups de diseño ("Museo nocturno").
- **`anatomy_research.json`**: borrador de contenido con el que se armó el catálogo inicial de estructuras.

## Cómo correr la app

Requiere Node 20 o superior (probado con Node 24) y npm.

```bash
cd atlas_anatomia/nextjs_space
npm install
npm run dev
```

La app queda disponible en http://localhost:3000.

Otros comandos, desde la misma carpeta:

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Compilación de producción (falla si hay errores de tipos). |
| `npm run lint` | ESLint. |
| `npm run typecheck` | Chequeo de tipos de TypeScript (`tsc --noEmit`). |
| `npm run validate` | Verifica la integridad de los datos (ids, sistemas, referencias, traducciones es/en, mallas, tours, quiz y tarjetas) e imprime un resumen con los conteos. Debe terminar con 0 errores antes de commitear cambios de datos. |
| `npm run test:store` | Prueba la persistencia y la migración del progreso en el store. |

## Modelos 3D

Los modelos de `public/models3d/` ya están generados; solo hace falta regenerarlos si cambia el mapeo de estructuras o se agregan mallas. Los archivos fuente de BodyParts3D (~870 MB de `.obj` y `.zip`) **no se versionan**: las instrucciones para descargarlos y para preparar el entorno Python están en [`bp3d/README.md`](bp3d/README.md).

Una vez preparado el entorno:

```bash
cd bp3d
./.venv/bin/python build_glb.py                    # todos los sistemas
./.venv/bin/python build_glb.py --only endocrino   # solo un sistema (repetible)
./.venv/bin/python build_glb.py --dry-run          # solo verificar nombres de concepto → mallas
```

El script escribe `public/models3d/<sistema>.glb` y `data/models3d-manifest.json`. Después de regenerar hay que **subir `MODEL_VERSION`** en `atlas_anatomia/nextjs_space/lib/models3d.ts` para invalidar la caché del navegador, y correr `npm run validate`.

## Revisión de contenido

El contenido anatómico y, sobre todo, el **clínico** (notas "En la clínica", cifras, inervación e irrigación, términos latinos) fue redactado durante el desarrollo y es **orientativo**. Está **pendiente de revisión por un docente de anatomía o un profesional de la salud** antes de una publicación abierta. La lista de lo que conviene confirmar, organizada por sistema, está en [`docs/REVISION_PROFESIONAL.md`](docs/REVISION_PROFESIONAL.md).

## Licencias y atribuciones

- **Modelos 3D**: [BodyParts3D](https://lifesciencedb.jp/bp3d/) © DBCLS (Database Center for Life Science), licencia **CC BY-SA 2.1 JP**. La atribución es obligatoria y se muestra en la página `/atribuciones` y en la nota de cobertura del visor. Los GLB derivados se distribuyen bajo la misma licencia.
- **Contenido**: elaborado a partir de fuentes como FIPAT (Terminologia Anatomica, TA2), *Gray's Anatomy*, OpenStax, MedlinePlus, StatPearls y NCBI. El detalle está en la página `/atribuciones` de la app.

## Aviso

Este proyecto es **material educativo**. No es una herramienta clínica ni sustituye el criterio de un profesional de la salud; no debe usarse para diagnóstico ni tratamiento.
