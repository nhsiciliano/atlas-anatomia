# Atlas Interactivo de Anatomía

Atlas educativo 3D de anatomía humana. Reúne ~96 estructuras anatómicas organizadas en 12 sistemas, con fichas en español e inglés, modo fundamental/avanzado, recorridos guiados y un quiz de práctica. No requiere login ni base de datos: el progreso (favoritos, recorridos completados, puntajes) se guarda en `localStorage` del navegador.

## Estructura del repositorio

```
.
├── atlas_anatomia/
│   └── nextjs_space/        # Aplicación web (Next.js + React + three.js)
├── bp3d/                    # Pipeline Python que genera los GLB desde BodyParts3D
├── anatomy_research.json    # Borrador inicial de contenido anatómico
└── docs/design/             # Mockups y capturas de diseño
```

- **`atlas_anatomia/nextjs_space/`**: la app. Datos estáticos en `data/`, estado en `lib/store.ts` (Zustand), modelos 3D por sistema en `public/models3d/`.
- **`bp3d/`**: scripts (`build_glb.py`, `mapping.py`) y listados de partes de BodyParts3D que generan los GLB por sistema que consume la app.
- **`anatomy_research.json`**: borrador de contenido con el que se armó el catálogo inicial de estructuras.
- **`docs/design/`**: mockups de diseño (referencia visual, "Museo nocturno").

## Cómo correr la app

Requiere Node 20+ y npm.

```bash
cd atlas_anatomia/nextjs_space
npm install
npm run dev
```

La app queda disponible en http://localhost:3000.

## Cómo regenerar los modelos 3D

Los modelos de `public/models3d/` ya están generados; solo hace falta regenerarlos si cambia el mapeo de estructuras. Los archivos fuente de BodyParts3D (~870 MB de `.obj` y `.zip`) **no se versionan**.

1. Descargar BodyParts3D 4.0 (`partof_BP3D_4.0_obj_99.zip` e `isa_BP3D_4.0_obj_99.zip`) desde el sitio de DBCLS y descomprimirlos en `bp3d/objs/`, de modo que existan `bp3d/objs/partof_BP3D_4.0_obj_99/` y `bp3d/objs/isa_BP3D_4.0_obj_99/`.
2. Instalar las dependencias Python del pipeline (`numpy`, `trimesh`, `fast_simplification`, entre otras; se recomienda un entorno virtual en `bp3d/.venv/`).
3. Ejecutar `build_glb.py` desde `bp3d/` (usa rutas relativas como `objs/...` y `mapping.py`).

> **Nota:** hoy `build_glb.py` tiene rutas absolutas de `/home/ubuntu/...` para la salida y para leer `anatomy-data.ts`. Esto se corregirá en una fase posterior; hasta entonces hay que editar esas rutas a mano antes de ejecutarlo.

Tras regenerar, subir `MODEL_VERSION` en `lib/models3d.ts` para invalidar la caché.

## Licencias y atribuciones

- **Modelos 3D**: [BodyParts3D](https://lifesciencedb.jp/bp3d/) © DBCLS (Database Center for Life Science), licencia **CC BY-SA 2.1 JP**. La atribución es obligatoria y se muestra en la página `/atribuciones` y en la nota de cobertura del visor. Los GLB derivados se distribuyen bajo la misma licencia.
- **Contenido**: elaborado a partir de fuentes como FIPAT (Terminologia Anatomica, TA2), *Gray's Anatomy*, OpenStax, MedlinePlus y NCBI.

## Aviso

Este proyecto es **material educativo**. No es una herramienta clínica ni sustituye el criterio de un profesional de la salud; no debe usarse para diagnóstico ni tratamiento.
