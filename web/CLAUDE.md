# Atlas de Anatomía Humana

## Project Overview
Interactive anatomy atlas and learning platform. All UI in Spanish (i18n-ready for English). No database — localStorage only. No accounts.

## Architecture
- **Data layer**: Static TypeScript modules in `data/` — 96 structures × 12 systems, guided tours (4), quiz questions (~20), references (5). `escala?: 'micro'` marks structures with no possible 3D representation.
- **State**: Zustand store (`lib/store.ts`) with localStorage persistence for bookmarks, recently viewed, tour completions, quiz scores
- **i18n**: React context + `t()` function (`lib/i18n.ts`), full message catalog es/en
- **Search**: Client-side accent-insensitive search (`lib/search.ts`)

## Visual Style (Design A "Museo nocturno", chosen by user)
- Dark default + light mode ("Museo de día") via ThemeToggle in header (next-themes class); use `foreground/` alpha classes, never `white/`
- Mobile: search on its own row under header, bottom nav (Explorar/Recorridos/Practicar/Guardadas/Índice) + draggable glass sheet, short dock labels (Frente/Dorso/Lado)
- Warm radial stage glow (`.museum-stage`), bone-white text #E9E4DA, amber primary #E8B66B
- Fonts: Fraunces light (display, italic amber accents), Instrument Sans (body)
- Floating `.glass-panel` cards, pill controls, `.eyebrow` uppercase letter-spaced labels
- Reference mockup: docs/design/design_concepts/a_museo.png (repo root)

## 3D Viewer
- Real 3D body from BodyParts3D (DBCLS, CC BY-SA 2.1 JP) — attribution required on /atribuciones and in coverage note
- GLBs per system in `public/models3d/` (one node per structure id, ctx__<sys> = non-selectable context), manifest `data/models3d-manifest.json`, helpers `lib/models3d.ts` (bump MODEL_VERSION after regenerating)
- Build script: bp3d/build_glb.py (+ mapping.py); lungs are voxel-wrapped surfaces
- Components: `AtlasStage` (3D only + floating notice), `Atlas3D` (r3f), `ViewerDock` (Frente/Dorso/Lado camera presets, 360°, layers, labels, home); store has `autoRotate`, `cameraNonce`, `panelTab`
- The atlas is 3D-only (the 2D SVG plate and the sex toggle were removed in Fase 2). A structure without a mesh (`!hasModel3D(id)`) shows a notice: `stage.micro` if `escala === 'micro'`, otherwise `stage.no_model` and its system is isolated for context
- BodyParts3D is a male body: female reproductive structures have a card but never a mesh
- Skin (tegumentario) is a translucent glass shell, on by default

## Key Components
- `SystemSidebar`: Toggle visibility, opacity slider, isolate per system
- `DetailPanel`: Structure info with fundamental/advanced toggle, breadcrumbs, bookmarks, compare
- `TourEngine`: 4 guided tours with step-by-step navigation
- `QuizEngine`: Filtered quizzes with score tracking
- `StructureTree`: Accessible tree navigation of all structures
- `MobileDetailSheet`: Bottom sheet with tab bar for mobile

## Layout
- Desktop: 3-column (sidebar 220px | atlas viewer | right panel 320–360px)
- Mobile: Full-width atlas + bottom tab bar with expandable sheet + drawer sidebar

## Important Rules
- Coverage disclaimer visible: "Representación educativa simplificada"
- No database — persistence via localStorage
- 3D model labeled as a simplified educational representation (BodyParts3D, CC BY-SA 2.1 JP)
- Spanish is the default and primary language
