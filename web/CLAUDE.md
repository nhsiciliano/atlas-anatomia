# Atlas de Anatomía Humana

## Project Overview
Interactive anatomy atlas and learning platform. UI fully bilingual es/en (LanguageToggle, persisted). No database — localStorage only. No accounts.

## Architecture
- **Data layer**: Static TypeScript modules in `data/`. Structures live in `data/structures/<systemId>.ts` (one array per system, 12 systems) and are concatenated by `data/anatomy-data.ts` (`STRUCTURES`, `STRUCTURE_MAP`, …). Every text field is paired `_es`/`_en`; read it with `pick()`/`pickList()` from `lib/l10n.ts`, never with locale ternaries. Optional fields: `escala: 'micro'` (microscopic, no 3D possible), `clinica_es/en: ClinicalNote[]`, `inervacion_es/en`, `irrigacion_es/en`, `sexo`.
- **Validation**: `npm run validate` (`scripts/validate-data.ts`) must pass with 0 errors before committing data changes; `npm run test:store` covers persistence/migration.
- **State**: Zustand store (`lib/store.ts`) with `persist` on a single key `atlas-progress` (v1): bookmarks, recentlyViewed, completedTours, quizScores `{best,last,total,fecha}`, srs, locale, detailLevel. UI state is not persisted. Legacy keys (`atlas_bookmarks`, …) are migrated once. `skipHydration` + `useProgressHydrated()` gate: components that write to the store must not mount before hydration. `exportProgress`/`importProgress`/`resetProgress` available.
- **i18n**: `useLocale()` reads `locale` from the store; `useT()` / `t(key, locale, vars)` with catalog in `lib/i18n.ts` (es/en keys must stay in parity). No hard-coded UI strings in components.
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
- `DetailPanel`: Structure info with fundamental/advanced toggle, breadcrumbs, bookmarks, compare, "En la clínica" section, innervation/blood supply (advanced only)
- `LanguageToggle` (header desktop, drawer mobile) and `ThemeToggle`
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
- Spanish is the default language; every new text must ship with its `_en` pair
- Adding a structure: entry in `data/structures/<system>.ts` (bilingual, TA term, refs, clinica when relevant) → `escala: 'micro'` if microscopic → optional 3D: add to `bp3d/mapping.py` and rebuild (`bp3d/README.md`), bump `MODEL_VERSION` → `npm run validate`
