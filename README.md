# Atlas Interactivo de Anatomía

[![CI](https://github.com/nhsiciliano/atlas-anatomia/actions/workflows/ci.yml/badge.svg)](https://github.com/nhsiciliano/atlas-anatomia/actions/workflows/ci.yml) · Código: [MIT](LICENSE) · Contenido y modelos 3D: [CC BY-SA 4.0](LICENSE-CONTENT.md)

Atlas educativo 3D de anatomía humana, pensado para estudiantes de secundaria y de los primeros años de ciencias de la salud. Todo el contenido está en español e inglés, con modo fundamental/avanzado, recorridos guiados, un quiz de práctica y repaso con repetición espaciada. No requiere login ni base de datos.

## Qué incluye

Cifras tomadas de `npm run validate` al momento de escribir este documento (el script las recalcula):

- **162 estructuras** en **12 sistemas**, todas con ficha bilingüe (es/en) y **correlación clínica** introductoria.
- **110 con modelo 3D** y **18 microscópicas** (nefrona, alvéolos, queratinocito…), que se describen en su ficha y se indican como tales en el visor. Las 34 restantes son fichas sin modelo.
- **Fichas con información avanzada**: términos de la Terminologia Anatomica, inervación e irrigación (visibles en el modo avanzado), notas "En la clínica", referencias.
- **10 recorridos guiados** (77 pasos), **108 preguntas de quiz** (9 por sistema; 75 de opción múltiple y 33 de identificación de la estructura resaltada en el modelo 3D) y **60 tarjetas de repaso** escritas a mano.
- **Repasar**: pantalla de repaso con repetición espaciada (SM-2 simplificado, con cuatro notas: Otra vez, Difícil, Bien, Fácil). El mazo se genera a partir de las fichas (nombre↔función, ubicación, término anatómico, clínica, identificación en el 3D) más las tarjetas manuales: unas 935 en total según `npm run test:srs`.
- **Interfaz bilingüe es/en** con selector de idioma, y modo oscuro/claro.
- **Sin login**: el progreso (favoritos, recientes, recorridos completados, puntajes del quiz y estado de repaso) se guarda en `localStorage`. El panel **Mis estructuras** muestra el progreso y permite **exportarlo, importarlo y reiniciarlo**.
- **Solo 3D**, con el modelo BodyParts3D. Es un cuerpo **masculino**: las estructuras femeninas tienen ficha pero no malla 3D.

## Estructura del repositorio

```
.
├── web/                     # Aplicación web (Next.js + React + three.js)
├── bp3d/                    # Pipeline Python que genera los GLB desde BodyParts3D
├── docs/
│   └── REVISION_PROFESIONAL.md  # Contenido pendiente de revisión por un profesional
├── LICENSE                  # MIT (código)
└── LICENSE-CONTENT.md       # CC BY-SA 4.0 (contenido y modelos 3D)
```

- **`web/`**: la app. Datos estáticos en `data/` (estructuras por sistema en `data/structures/`), estado en `lib/store.ts` (Zustand), modelos 3D por sistema en `public/models3d/`. Convenciones y arquitectura en `CLAUDE.md`.
- **`bp3d/`**: scripts (`build_glb.py`, `mapping.py`) y listados de partes de BodyParts3D que generan los GLB por sistema que consume la app. Ver [`bp3d/README.md`](bp3d/README.md).
- **`docs/`**: contenido pendiente de revisión profesional.

## Cómo correr la app

Requiere Node 20.9 o superior (así lo declara `engines` en `web/package.json`; probado con Node 24) y npm.

```bash
cd web
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
| `npm run test:srs` | Prueba el motor de repetición espaciada (`lib/srs.ts`): cálculo de intervalos, armado del mazo, tarjetas pendientes y estadísticas. |

## Modelos 3D

Los modelos de `public/models3d/` ya están generados; solo hace falta regenerarlos si cambia el mapeo de estructuras o se agregan mallas. Los archivos fuente de BodyParts3D (~870 MB de `.obj` y `.zip`) **no se versionan**: las instrucciones para descargarlos y para preparar el entorno Python están en [`bp3d/README.md`](bp3d/README.md).

Una vez preparado el entorno:

```bash
cd bp3d
./.venv/bin/python build_glb.py                    # todos los sistemas
./.venv/bin/python build_glb.py --only endocrino   # solo un sistema (repetible)
./.venv/bin/python build_glb.py --dry-run          # solo verificar nombres de concepto → mallas
```

El script escribe `public/models3d/<sistema>.glb` y `data/models3d-manifest.json`. Después de regenerar hay que **subir `MODEL_VERSION`** en `web/lib/models3d.ts` para invalidar la caché del navegador, y correr `npm run validate`.

## Despliegue en Vercel

La app es un proyecto Next.js que vive en la carpeta `web/`:

1. Importar el repositorio en Vercel (o, desde `web/`, ejecutar `npx vercel link`).
2. En la configuración del proyecto, poner **Root Directory = `web`**. Vercel detecta el framework Next.js.
3. Usar **Node 22** en los ajustes del proyecto. No hay variables de entorno obligatorias.
4. Opcional: definir `NEXT_PUBLIC_SITE_URL` con el dominio final, **sin barra al final** (por ejemplo `https://mi-dominio.com`), para las URL absolutas de las vistas previas (Open Graph) y el sitemap.

Los modelos 3D se piden como `/models3d/<sistema>.glb?v=<MODEL_VERSION>` y pueden quedar en caché durante mucho tiempo en el navegador y en el CDN. Por eso, **cada vez que se regeneran los GLB hay que subir `MODEL_VERSION`** en `web/lib/models3d.ts`.

## Cómo agregar una estructura

1. Agregar la ficha al final de `web/data/structures/<sistema>.ts`, con todos los textos en español e inglés (`_es` / `_en`), el término de la Terminologia Anatomica, regiones, conexiones, referencias y, cuando corresponda, nota clínica, inervación e irrigación. Las convenciones están en `web/CLAUDE.md`.
2. Si es microscópica (sin representación 3D posible), agregar `escala: 'micro'`.
3. Opcional, para que tenga modelo 3D: agregar el id y los nombres de concepto de BodyParts3D a `bp3d/mapping.py` (se buscan en `bp3d/allnames.txt`), regenerar con `./.venv/bin/python build_glb.py --only <sistema>` desde `bp3d/` y subir `MODEL_VERSION` en `lib/models3d.ts`.
4. Correr `npm run validate` desde la carpeta de la app: debe terminar con 0 errores.

## Contenido en revisión

El contenido anatómico y, sobre todo, el **clínico** (notas "En la clínica", cifras, inervación e irrigación, términos latinos) es **educativo y orientativo**, y **está en proceso de revisión por docentes de anatomía y profesionales de la salud**. Hasta que esa revisión termine, conviene contrastarlo con las fuentes de referencia antes de usarlo para estudiar un examen o enseñar. La lista de lo que se está confirmando, organizada por sistema, es pública: [`docs/REVISION_PROFESIONAL.md`](docs/REVISION_PROFESIONAL.md). Si encuentras un error, abre un *issue* en el repositorio.

## Licencias

- **Código** (la aplicación en `web/` y los scripts de `bp3d/`): licencia **MIT**, ver [`LICENSE`](LICENSE).
- **Contenido educativo** (`web/data/**`) y **modelos 3D derivados** (`web/public/models3d/*.glb`): **Creative Commons Atribución-CompartirIgual 4.0 (CC BY-SA 4.0)**, ver [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md).
- **Atribución a BodyParts3D**: los modelos 3D son derivados de [BodyParts3D](https://lifesciencedb.jp/bp3d/), © The Database Center for Life Science (DBCLS), licenciado bajo CC BY-SA 2.1 Japón. Quien reutilice los GLB debe mantener esa atribución. También se muestra en la página `/atribuciones` de la app y en la nota de cobertura del visor.
- **Fuentes**: el texto es redacción propia, apoyada en FIPAT (Terminologia Anatomica, TA2), *Gray's Anatomy*, OpenStax, MedlinePlus, StatPearls y NCBI Bookshelf, que se citan como referencias. El detalle está en `/atribuciones`.

## Aviso

Este proyecto es **material educativo**. No es una herramienta clínica ni sustituye el criterio de un profesional de la salud; no debe usarse para diagnóstico ni tratamiento.
