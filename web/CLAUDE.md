# Atlas de Anatomía Humana

## Project Overview
Interactive anatomy atlas and learning platform. UI fully bilingual es/en (LanguageToggle, persisted). No database — localStorage only. No accounts.

## Architecture
- **Data layer**: Static TypeScript modules in `data/`. Structures live in `data/structures/<systemId>.ts` (one array per system, 12 systems; 162 structures, 110 with a mesh, 18 `micro`) and are concatenated by `data/anatomy-data.ts` (`STRUCTURES`, `STRUCTURE_MAP`, …). Every text field is paired `_es`/`_en`; read it with `pick()`/`pickList()` from `lib/l10n.ts`, never with locale ternaries. Optional fields: `escala: 'micro'` (microscopic, no 3D possible), `clinica_es/en: ClinicalNote[]`, `inervacion_es/en`, `irrigacion_es/en`, `sexo`.
- **Learning content**: `data/tours.ts` (10 guided tours, `duracion_min`), `data/quizzes.ts` (108 questions, 9 per system; `tipo: 'identificacion'` needs a `structureId` with a mesh), `data/flashcards.ts` (60 manual cards). `lib/srs.ts` is the pure spaced-repetition engine (SM-2 lite: `schedule`, `buildDeck`, `dueCards`, `nextIntervals`, `srsStats`); do not change its algorithm without updating `scripts/test-srs.ts`.
- **Validation**: `npm run validate` (`scripts/validate-data.ts`) must pass with 0 errors before committing data changes; `npm run test:store` covers persistence/migration; `npm run test:srs` covers the SRS engine.
- **State**: Zustand store (`lib/store.ts`) with `persist` on a single key `atlas-progress` (v1): bookmarks, recentlyViewed, completedTours, quizScores `{best,last,total,fecha}`, srs (per-card SM-2 state), srsPrefs, locale, detailLevel. UI state is not persisted. Legacy keys (`atlas_bookmarks`, …) are migrated once. `skipHydration` + `useProgressHydrated()` gate: components that write to the store must not mount before hydration. `exportProgress`/`importProgress`/`resetProgress` are exposed in the progress panel (Mis estructuras). `quizHighlightId` (not persisted) hides a structure's name in the 3D label and detail panel during identification questions/cards; `setSelectedStructure(id, { recordRecent: false })` avoids leaking it into recents.
- **i18n**: `useLocale()` reads `locale` from the store; `useT()` / `t(key, locale, vars)` with catalog in `lib/i18n.ts` (es/en keys must stay in parity). No hard-coded UI strings in components.
- **Search**: Client-side accent-insensitive search (`lib/search.ts`)

## Visual Style (Design A "Museo nocturno", chosen by user)
- Dark default + light mode ("Museo de día") via ThemeToggle in header (next-themes class); use `foreground/` alpha classes, never `white/`
- Mobile: search on its own row under header, bottom nav (Explorar/Recorridos/Practicar/Repasar/Guardadas/Índice) + draggable glass sheet, short dock labels (Frente/Dorso/Lado)
- Warm radial stage glow (`.museum-stage`), bone-white text #E9E4DA, amber primary #E8B66B
- Fonts: Fraunces light (display, italic amber accents), Instrument Sans (body)
- Floating `.glass-panel` cards, pill controls, `.eyebrow` uppercase letter-spaced labels
- Reference mockups live outside the repo (~/Desktop/atlas-design-mockups); the "Museo nocturno" look is defined by `app/globals.css` and `tailwind.config.ts`

## 3D Viewer
- Real 3D body from BodyParts3D (DBCLS, CC BY-SA 2.1 JP) — attribution required on /atribuciones and in coverage note
- GLBs per system in `public/models3d/` (one node per structure id, ctx__<sys> = non-selectable context), manifest `data/models3d-manifest.json`, helpers `lib/models3d.ts` (bump MODEL_VERSION after regenerating)
- Build script: bp3d/build_glb.py (+ mapping.py); lungs are voxel-wrapped surfaces. External meshes (HRA) live in `bp3d/extra/hra/` (git-ignored; `bp3d/fetch_hra.py` downloads them, CC BY 4.0) and are aligned into the BodyParts3D pelvis by `build_glb.py`
- Components: `AtlasStage` (3D only + floating notice), `Atlas3D` (r3f), `ViewerDock` (Frente/Dorso/Lado camera presets, 360°, layers, labels, home); store has `autoRotate`, `cameraNonce`, `panelTab`
- The atlas is 3D-only (the 2D SVG plate was removed in Fase 2). A structure without a mesh (`!hasModel3D(id)`) shows a notice: `stage.micro` if `escala === 'micro'`, otherwise `stage.no_model` and its system is isolated for context
- BodyParts3D is a male body. The reproductive system has two GLB variants (`reproductor.glb` male from BodyParts3D, `reproductor_femenino.glb` uterus/ovaries/uterine tubes from the Human Reference Atlas); `reproSex` in the store (persisted) selects the variant via `modelUrl(sys, sex)`, the ♀/♂ control lives in the reproductor row of `SystemSidebar`, and selecting a structure of the other sex switches automatically. Vagina, cervix, mammary gland and ductus deferens have no mesh in any variant
- Skin (tegumentario) is a translucent glass shell, on by default
- GLBs are served with `Cache-Control: public, max-age=31536000, immutable` (`next.config.js` headers); bump `MODEL_VERSION` in `lib/models3d.ts` whenever a GLB changes, otherwise browsers keep the old mesh

## Key Components
- `SystemSidebar`: Toggle visibility, opacity slider, isolate per system
- `DetailPanel`: Structure info with fundamental/advanced toggle, breadcrumbs, bookmarks, compare, "En la clínica" section, innervation/blood supply (advanced only)
- `LanguageToggle` (header desktop, drawer mobile) and `ThemeToggle`
- `TourEngine`: 10 guided tours with step-by-step navigation
- `QuizEngine`: shuffled quizzes (10/20/all), score tracking, 3D identification mode
- `FlashcardsEngine` (tab `cards`, "Repasar"): spaced-repetition sessions over `buildDeck(STRUCTURES, MANUAL_CARDS)`; `ProgressPanel`: stats + export/import/reset
- `StructureTree`: Accessible tree navigation of all structures
- `MobileDetailSheet`: Bottom sheet with tab bar for mobile; it must not switch tab on selection while `panelTab` is tours/quiz/cards (would unmount the engine and lose progress)

## Layout
- Desktop: 3-column (sidebar 220px | atlas viewer | right panel 320–360px)
- Mobile: Full-width atlas + bottom tab bar with expandable sheet + drawer sidebar

## Deploy
- GitHub: `nhsiciliano/atlas-anatomia` (public). CI (`.github/workflows/ci.yml`, actions v7, Node from `web/.nvmrc` = 24) runs typecheck, lint, validate, test:store, test:srs and build on every push to `main`/`development` and on PRs; `main` requires the `check` job to pass on PRs.
- Workflow: feature work happens in the `development` branch, checked out as a git worktree at `../atlas-anatomia-dev`; `main` only receives it through a PR `development → main`. The 3D pipeline runs from the main checkout (it holds `bp3d/.venv`, `bp3d/objs/`, `bp3d/extra/`) with `--app-dir ../atlas-anatomia-dev/web --objs-dir … --extra-dir …`.
- Vercel project `atlas-anatomia` (Root Directory = `web`, Node 24) is connected to the repo: every push to `main` deploys to production (https://atlas-anatomia-three.vercel.app); every push to `development` creates a Preview deployment (protected: requires a Vercel login to view). Do not deploy with `vercel --prod` from `web/` (the CLI would look for `web/web`); push to `main` instead.
- `metadataBase`, robots and sitemap derive from `lib/site-url.ts` (`NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → localhost). Set `NEXT_PUBLIC_SITE_URL` in Vercel only when a custom domain is added.
- Licenses: code MIT (`LICENSE`), content and GLBs CC BY-SA 4.0 (`LICENSE-CONTENT.md`, BodyParts3D attribution required).

## Important Rules
- Coverage disclaimer visible: "Representación educativa simplificada"
- No database — persistence via localStorage
- 3D model labeled as a simplified educational representation (BodyParts3D, CC BY-SA 2.1 JP)
- Spanish is the default language; every new text must ship with its `_en` pair
- Adding a structure: entry in `data/structures/<system>.ts` (bilingual, TA term, refs, clinica when relevant) → `escala: 'micro'` if microscopic → optional 3D: add to `bp3d/mapping.py` and rebuild (`bp3d/README.md`), bump `MODEL_VERSION` → `npm run validate`
