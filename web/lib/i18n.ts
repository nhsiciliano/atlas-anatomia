'use client';
import { useCallback, useEffect } from 'react';
import { useAtlasStore } from '@/lib/store';

export type Locale = 'es' | 'en';

const messages: Record<Locale, Record<string, string>> = {
  es: {
    'nav.atlas': 'Atlas',
    'nav.tours': 'Recorridos guiados',
    'nav.quiz': 'Cuestionarios',
    'nav.bookmarks': 'Marcadores',
    'nav.atribuciones': 'Atribuciones',
    'nav.arbol': 'Árbol de estructuras',
    'view.reset': 'Restablecer vista',
    'panel.fundamental': 'Fundamental',
    'panel.avanzado': 'Avanzado',
    'panel.ubicacion': 'Ubicación y vecinos',
    'panel.funciones': 'Funciones',
    'panel.partes': 'Partes / subdivisiones',
    'panel.conexiones': 'Conexiones con otros sistemas',
    'panel.dato': 'Dato para recordar',
    'panel.referencias': 'Referencias',
    'panel.clinica': 'En la clínica',
    'panel.clinica_aviso': 'Orientativo y educativo; no es diagnóstico.',
    'panel.inervacion': 'Inervación',
    'panel.irrigacion': 'Irrigación',
    'search.placeholder': 'Buscar estructura (español o inglés)…',
    'search.no_results': 'Sin resultados',
    'sidebar.title': 'Sistemas',
    'sidebar.opacity': 'Opacidad',
    'sidebar.toggle_all': 'Todos',
    'sidebar.isolate': 'Aislar',
    'legend.title': 'Leyenda de colores',
    'tour.start': 'Iniciar recorrido',
    'tour.next': 'Siguiente',
    'tour.prev': 'Anterior',
    'tour.finish': 'Finalizar',
    'tour.completed': '¡Recorrido completado!',
    'quiz.start': 'Iniciar cuestionario',
    'quiz.next': 'Siguiente pregunta',
    'quiz.finish': 'Ver resultados',
    'quiz.score': 'Puntuación',
    'quiz.correct': '¡Correcto!',
    'quiz.incorrect': 'Incorrecto',
    'quiz.difficulty': 'Dificultad',
    'quiz.system_filter': 'Filtrar por sistema',
    'quiz.all_systems': 'Todos los sistemas',
    'quiz.basico': 'Básico',
    'quiz.intermedio': 'Intermedio',
    'quiz.avanzado': 'Avanzado',
    'bookmark.remove': 'Quitar marcador',
    'bookmark.empty': 'No hay marcadores aún. Selecciona una estructura y márcala.',
    'recent.title': 'Vistos recientemente',
    'recent.empty': 'Aún no has explorado estructuras.',
    'compare.title': 'Comparar estructuras',
    'compare.select': 'Seleccionar para comparar',
    'compare.clear': 'Limpiar comparación',
    'coverage.title': 'Cobertura',
    'coverage.note': 'Esta aplicación contiene {count} estructuras simplificadas distribuidas en {systems} sistemas corporales. El modelo 3D es una representación educativa simplificada de un cuerpo masculino (BodyParts3D), no una imagen anatómica médicamente precisa; los órganos reproductores femeninos provienen del Human Reference Atlas (HuBMAP/NIH). Las estructuras sin malla 3D se describen en su ficha. Nada de esto sustituye el criterio profesional de salud.',
    'tree.title': 'Árbol de estructuras',
    'stage.micro': '{name}: estructura microscópica, se describe en la ficha',
    'stage.no_model': '{name}: sin modelo 3D disponible. Se muestra el sistema {system}',
  
    'app.loading': 'Cargando atlas…',
  
    'nav.explore': 'Explorar',
  
    'nav.tours_short': 'Recorridos',
  
    'nav.practice': 'Practicar',
  
    'nav.my_structures': 'Mis estructuras',
  
    'nav.saved': 'Guardadas',
  
    'nav.index': 'Índice',
  
    'nav.sections': 'Secciones',
  
    'header.systems_menu': 'Menú de sistemas',
  
    'header.home': 'Atlas del cuerpo — inicio',
  
    'app.brand': 'Atlas',
  
    'app.brand_em': 'del cuerpo',
  
    'theme.to_light': 'Cambiar a modo claro',
  
    'theme.to_dark': 'Cambiar a modo oscuro',
  
    'panel.empty_title': 'Toca una estructura',
  
    'panel.empty_title_em': 'para conocerla',
  
    'panel.empty_desktop': 'Gira el modelo arrastrando, acerca con la rueda o el pellizco y activa sistemas desde la columna izquierda.',
  
    'panel.empty_mobile': 'Arrastra para girar el modelo, pellizca para acercar y elige sistemas desde el menú.',
  
    'panel.search_hint': 'También puedes buscar con la barra superior.',
  
    'common.close': 'Cerrar',
  
    'settings.language': 'Idioma',
  
    'sheet.structure': 'Estructura',
  
    'sheet.structure_index': 'Índice de estructuras',
  
    'sheet.close': 'Cerrar panel',
  
    'panel.hierarchy': 'Ubicación jerárquica',
  
    'panel.detail_level': 'Nivel de detalle',
  
    'panel.save': 'Guardar',
  
    'panel.saved': 'Guardada',
  
    'panel.compare': 'Comparar',
  
    'search.clear': 'Limpiar búsqueda',
  
    'coverage.short': '{count} estructuras · modelo 3D basado en BodyParts3D (CC BY-SA).',
  
    'dock.front': 'Frente',
  
    'dock.back': 'Dorso',
  
    'dock.side': 'Lado',
  
    'dock.rotate': 'Girar 360°',
  
    'dock.layers': 'Capas',
  
    'dock.layers_title': 'Transparencia de las capas',
  
    'dock.labels': 'Etiquetas',
  
    'sidebar.heading': 'Sistemas · {count} visibles',
  
    'sidebar.hide_all': 'Ocultar todos',
  
    'sidebar.hide_system': 'Ocultar {name}',
  
    'sidebar.show_system': 'Mostrar {name}',
  
    'sidebar.isolate_system': 'Aislar {name}',
  
    'sidebar.opacity_system': 'Opacidad de {name}',
  
    'stage.loading': 'Preparando el modelo 3D…',
  
    'stage.disclaimer': 'Representación educativa simplificada. Modelo 3D: BodyParts3D (DBCLS), CC BY-SA 2.1 JP.',
  
    'stage.loading_progress': 'Preparando el modelo… {progress}%',
  
    'compare.description': 'Descripción',
  
    'compare.location': 'Ubicación',
  
    'compare.remove': 'Quitar {name} de la comparación',
  
    'quiz.all_difficulties': 'Todas',
    'quiz.count': 'Cantidad de preguntas',
    'quiz.count_all': 'Todas',
    'quiz.available': '{count} preguntas disponibles',
    'quiz.exit': 'Salir del cuestionario',
    'quiz.hidden_name': 'Estructura en evaluación',
    'quiz.hidden_hint': 'Responde la pregunta para ver su nombre y su ficha.',
  
    'tour.steps_count': '{count} pasos',
    'tour.meta': '{count} pasos · ~{min} min',
  
    'tour.close': 'Cerrar recorrido',
  
    'tour.step_of': 'Paso {step} de {total}',
  
    'attrib.back': 'Volver al atlas',
  
    'attrib.title': 'Atribuciones y fuentes',
  
    'attrib.intro': 'Esta aplicación es una representación educativa simplificada. El modelo 3D y las fichas son material educativo simplificado; no sustituyen a un atlas clínico. A continuación se listan el origen del modelo 3D y las fuentes de referencia utilizadas para elaborar el contenido textual.',
  
    'attrib.model_title': 'Modelo 3D',
  
    'attrib.license_lead': 'BodyParts3D, © The Database Center for Life Science (DBCLS), licenciado bajo',
  
    'attrib.license_name': 'Creative Commons Reconocimiento-CompartirIgual 2.1 Japón (CC BY-SA 2.1 JP)',
  
    'attrib.modifications': 'Modificaciones: las mallas originales se agruparon por estructura, se simplificaron (reducción de polígonos), se reorientaron y se convirtieron a formato glTF para su visualización en el navegador. Los modelos 3D derivados se distribuyen bajo CC BY-SA 4.0 (compatible con la CC BY-SA 2.1 JP de origen), manteniendo la atribución a DBCLS.',
  
    'attrib.male_model': 'BodyParts3D es un modelo de cuerpo masculino. El útero, los ovarios y las trompas uterinas provienen del Human Reference Atlas y se alinearon de forma aproximada dentro de esa pelvis; el resto de las estructuras femeninas se describen en sus fichas sin representación 3D.',
    'attrib.hra_title': 'Human Reference Atlas',
    'attrib.hra_text': 'Mallas del útero, los ovarios y las trompas uterinas: Human Reference Atlas, 3D Reference Object Library v1.2 © HuBMAP Consortium, licencia CC BY 4.0. Modificaciones: alineación y escalado dentro del cuerpo de BodyParts3D, unión izquierda-derecha, simplificación de mallas y conversión a GLB.',
    'attrib.hra_link': 'Ver el Human Reference Atlas',
    'attrib.licenses_label': 'Licencias del proyecto (MIT / CC BY-SA 4.0)',
  
    'attrib.sources_title': 'Fuentes del contenido',
  
    'attrib.note_label': 'Nota:',
  
    'attrib.note': 'Este atlas contiene {count} estructuras simplificadas distribuidas en {systems} sistemas corporales. No pretende reemplazar un atlas anatómico completo ni sustituir el criterio profesional de salud. El modelo 3D es una representación didáctica simplificada, no una imagen clínica.',
  
    'stage.canvas_label': 'Modelo 3D interactivo del cuerpo humano',
  
    'nav.cards': 'Repasar',
  
    'cards.systems': 'Sistemas',
  
    'cards.all_systems': 'Todos',
  
    'cards.stat_total': 'Total',
  
    'cards.stat_new': 'Nuevas',
  
    'cards.stat_due': 'Vencidas hoy',
  
    'cards.stat_learned': 'Aprendidas',
  
    'cards.new_per_session': 'Tarjetas nuevas por sesión',
  
    'cards.start': 'Repasar ({count})',
  
    'cards.nothing_due': 'Nada pendiente hoy',
  
    'cards.progress': '{done} / {total}',
  
    'cards.exit': 'Salir del repaso',
  
    'cards.show_answer': 'Mostrar respuesta',
  
    'cards.grade_label': '¿Qué tan bien la recordaste?',
  
    'cards.again': 'Otra vez',
  
    'cards.hard': 'Difícil',
  
    'cards.good': 'Bien',
  
    'cards.easy': 'Fácil',
  
    'cards.days': '{count} d',
  
    'cards.summary_title': 'Sesión terminada',
  
    'cards.summary_done': '{count} tarjetas repasadas',
  
    'cards.back': 'Volver',
  
    'cards.kind.nombre_funcion': 'Nombre → funciones',
  
    'cards.kind.funcion_nombre': 'Función → nombre',
  
    'cards.kind.ubicacion_nombre': 'Ubicación → nombre',
  
    'cards.kind.ta_nombre': 'Término latino → nombre',
  
    'cards.kind.clinica_nombre': 'Clínica → estructura',
  
    'cards.kind.identificar': 'Identifica en el modelo',
  
    'cards.kind.manual': 'Repaso',
  
    'progress.title': 'Tu progreso',
  
    'progress.due': 'Tarjetas vencidas hoy',
  
    'progress.learned': 'Tarjetas aprendidas',
  
    'progress.tours': 'Recorridos completados',
  
    'progress.tours_value': '{done}/{total}',
  
    'progress.best_scores': 'Mejor puntaje por sistema',
  
    'progress.no_scores': 'Aún no has completado ningún cuestionario.',
  
    'progress.export': 'Exportar',
  
    'progress.import': 'Importar',
  
    'progress.reset': 'Reiniciar',
  
    'progress.confirm_import': 'Reemplazar',
  
    'progress.confirm_import_hint': '¿Reemplazar todo tu progreso por el del archivo «{file}»?',
  
    'progress.confirm_reset': 'Sí, borrar todo',
  
    'progress.confirm_reset_hint': '¿Borrar marcadores, puntajes, recorridos y tarjetas? No se puede deshacer.',
  
    'progress.cancel': 'Cancelar',
  
    'progress.imported': 'Progreso importado.',
  
    'progress.reset_done': 'Progreso reiniciado.',
  
    'progress.import_error': 'No se pudo importar: {error}',
  
    'progress.err.invalid_json': 'el archivo no es JSON válido',
  
    'progress.err.no_version': 'falta el número de versión',
  
    'progress.err.future_version': 'el archivo es de una versión más nueva de la aplicación',
  
    'progress.err.no_data': 'faltan los datos de progreso',
  
    'progress.err.bad_list': 'una de las listas no tiene el formato esperado',
  
    'progress.err.bad_object': 'los puntajes o las tarjetas no tienen el formato esperado',
  
    'progress.err.bad_value': 'el idioma o el nivel de detalle no son válidos',
  
    'sidebar.sexo': 'Variante del sistema reproductor',
  
    'sidebar.femenino': 'Femenino',
  
    'sidebar.masculino': 'Masculino',
  
    'sidebar.femenino_short': 'Fem.',
  
    'sidebar.masculino_short': 'Masc.',
  },
  en: {
    'nav.atlas': 'Atlas',
    'nav.tours': 'Guided Tours',
    'nav.quiz': 'Quizzes',
    'nav.bookmarks': 'Bookmarks',
    'nav.atribuciones': 'Attributions',
    'nav.arbol': 'Structure Tree',
    'view.reset': 'Reset view',
    'panel.fundamental': 'Fundamental',
    'panel.avanzado': 'Advanced',
    'panel.ubicacion': 'Location and neighbors',
    'panel.funciones': 'Functions',
    'panel.partes': 'Parts / subdivisions',
    'panel.conexiones': 'Connections to other systems',
    'panel.dato': 'Fact to remember',
    'panel.referencias': 'References',
    'panel.clinica': 'Clinical notes',
    'panel.clinica_aviso': 'Educational guidance only; not a diagnosis.',
    'panel.inervacion': 'Innervation',
    'panel.irrigacion': 'Blood supply',
    'search.placeholder': 'Search structure (Spanish or English)…',
    'search.no_results': 'No results',
    'sidebar.title': 'Systems',
    'sidebar.opacity': 'Opacity',
    'sidebar.toggle_all': 'All',
    'sidebar.isolate': 'Isolate',
    'legend.title': 'Color legend',
    'tour.start': 'Start tour',
    'tour.next': 'Next',
    'tour.prev': 'Previous',
    'tour.finish': 'Finish',
    'tour.completed': 'Tour completed!',
    'quiz.start': 'Start quiz',
    'quiz.next': 'Next question',
    'quiz.finish': 'See results',
    'quiz.score': 'Score',
    'quiz.correct': 'Correct!',
    'quiz.incorrect': 'Incorrect',
    'quiz.difficulty': 'Difficulty',
    'quiz.system_filter': 'Filter by system',
    'quiz.all_systems': 'All systems',
    'quiz.basico': 'Basic',
    'quiz.intermedio': 'Intermediate',
    'quiz.avanzado': 'Advanced',
    'bookmark.remove': 'Remove bookmark',
    'bookmark.empty': 'No bookmarks yet. Select a structure and bookmark it.',
    'recent.title': 'Recently viewed',
    'recent.empty': 'You haven\'t explored any structures yet.',
    'compare.title': 'Compare structures',
    'compare.select': 'Select to compare',
    'compare.clear': 'Clear comparison',
    'coverage.title': 'Coverage',
    'coverage.note': 'This application contains {count} simplified structures across {systems} body systems. The 3D model is a simplified educational representation of a male body (BodyParts3D), not medically accurate anatomy; the female reproductive organs come from the Human Reference Atlas (HuBMAP/NIH). Structures without a 3D mesh are described in their detail card. None of this replaces professional health judgment.',
    'tree.title': 'Structure Tree',
    'stage.micro': '{name}: microscopic structure, described in the card',
    'stage.no_model': '{name}: no 3D model available. Showing the {system} system',
  
    'app.loading': 'Loading atlas…',
  
    'nav.explore': 'Explore',
  
    'nav.tours_short': 'Tours',
  
    'nav.practice': 'Practice',
  
    'nav.my_structures': 'My structures',
  
    'nav.saved': 'Saved',
  
    'nav.index': 'Index',
  
    'nav.sections': 'Sections',
  
    'header.systems_menu': 'Systems menu',
  
    'header.home': 'Body atlas — home',
  
    'app.brand': 'Body',
  
    'app.brand_em': 'atlas',
  
    'theme.to_light': 'Switch to light mode',
  
    'theme.to_dark': 'Switch to dark mode',
  
    'panel.empty_title': 'Tap a structure',
  
    'panel.empty_title_em': 'to learn about it',
  
    'panel.empty_desktop': 'Drag to rotate the model, zoom with the wheel or a pinch, and turn systems on from the left column.',
  
    'panel.empty_mobile': 'Drag to rotate the model, pinch to zoom and pick systems from the menu.',
  
    'panel.search_hint': 'You can also search with the top bar.',
  
    'common.close': 'Close',
  
    'settings.language': 'Language',
  
    'sheet.structure': 'Structure',
  
    'sheet.structure_index': 'Structure index',
  
    'sheet.close': 'Close panel',
  
    'panel.hierarchy': 'Hierarchy',
  
    'panel.detail_level': 'Detail level',
  
    'panel.save': 'Save',
  
    'panel.saved': 'Saved',
  
    'panel.compare': 'Compare',
  
    'search.clear': 'Clear search',
  
    'coverage.short': '{count} structures · 3D model based on BodyParts3D (CC BY-SA).',
  
    'dock.front': 'Front',
  
    'dock.back': 'Back',
  
    'dock.side': 'Side',
  
    'dock.rotate': 'Rotate 360°',
  
    'dock.layers': 'Layers',
  
    'dock.layers_title': 'Layer transparency',
  
    'dock.labels': 'Labels',
  
    'sidebar.heading': 'Systems · {count} visible',
  
    'sidebar.hide_all': 'Hide all',
  
    'sidebar.hide_system': 'Hide {name}',
  
    'sidebar.show_system': 'Show {name}',
  
    'sidebar.isolate_system': 'Isolate {name}',
  
    'sidebar.opacity_system': '{name} opacity',
  
    'stage.loading': 'Preparing the 3D model…',
  
    'stage.disclaimer': 'Simplified educational representation. 3D model: BodyParts3D (DBCLS), CC BY-SA 2.1 JP.',
  
    'stage.loading_progress': 'Preparing the model… {progress}%',
  
    'compare.description': 'Description',
  
    'compare.location': 'Location',
  
    'compare.remove': 'Remove {name} from comparison',
  
    'quiz.all_difficulties': 'All',
    'quiz.count': 'Number of questions',
    'quiz.count_all': 'All',
    'quiz.available': '{count} questions available',
    'quiz.exit': 'Exit quiz',
    'quiz.hidden_name': 'Structure under assessment',
    'quiz.hidden_hint': 'Answer the question to see its name and card.',
  
    'tour.steps_count': '{count} steps',
    'tour.meta': '{count} steps · ~{min} min',
  
    'tour.close': 'Close tour',
  
    'tour.step_of': 'Step {step} of {total}',
  
    'attrib.back': 'Back to the atlas',
  
    'attrib.title': 'Attributions and sources',
  
    'attrib.intro': 'This application is a simplified educational representation. The 3D model and the structure cards are simplified educational material; they do not replace a clinical atlas. Below are the origin of the 3D model and the reference sources used to write the text content.',
  
    'attrib.model_title': '3D model',
  
    'attrib.license_lead': 'BodyParts3D, © The Database Center for Life Science (DBCLS), licensed under',
  
    'attrib.license_name': 'Creative Commons Attribution-ShareAlike 2.1 Japan (CC BY-SA 2.1 JP)',
  
    'attrib.modifications': 'Modifications: the original meshes were grouped by structure, simplified (polygon reduction), reoriented and converted to glTF for display in the browser. The derived 3D models are distributed under CC BY-SA 4.0 (compatible with the original CC BY-SA 2.1 JP), keeping the attribution to DBCLS.',
  
    'attrib.male_model': 'BodyParts3D is a model of a male body. The uterus, ovaries and uterine tubes come from the Human Reference Atlas and were aligned approximately within that pelvis; the other female structures are described in their cards without a 3D representation.',
    'attrib.hra_title': 'Human Reference Atlas',
    'attrib.hra_text': 'Meshes of the uterus, ovaries and uterine tubes: Human Reference Atlas, 3D Reference Object Library v1.2 © HuBMAP Consortium, CC BY 4.0 license. Modifications: alignment and scaling within the BodyParts3D body, left-right merging, mesh simplification and conversion to GLB.',
    'attrib.hra_link': 'View the Human Reference Atlas',
    'attrib.licenses_label': 'Project licenses (MIT / CC BY-SA 4.0)',
  
    'attrib.sources_title': 'Content sources',
  
    'attrib.note_label': 'Note:',
  
    'attrib.note': 'This atlas contains {count} simplified structures across {systems} body systems. It is not intended to replace a complete anatomical atlas or professional healthcare judgment. The 3D model is a simplified teaching representation, not a clinical image.',
  
    'stage.canvas_label': 'Interactive 3D model of the human body',
  
    'nav.cards': 'Review',
  
    'cards.systems': 'Systems',
  
    'cards.all_systems': 'All',
  
    'cards.stat_total': 'Total',
  
    'cards.stat_new': 'New',
  
    'cards.stat_due': 'Due today',
  
    'cards.stat_learned': 'Learned',
  
    'cards.new_per_session': 'New cards per session',
  
    'cards.start': 'Review ({count})',
  
    'cards.nothing_due': 'Nothing due today',
  
    'cards.progress': '{done} / {total}',
  
    'cards.exit': 'Exit review',
  
    'cards.show_answer': 'Show answer',
  
    'cards.grade_label': 'How well did you remember it?',
  
    'cards.again': 'Again',
  
    'cards.hard': 'Hard',
  
    'cards.good': 'Good',
  
    'cards.easy': 'Easy',
  
    'cards.days': '{count} d',
  
    'cards.summary_title': 'Session complete',
  
    'cards.summary_done': '{count} cards reviewed',
  
    'cards.back': 'Back',
  
    'cards.kind.nombre_funcion': 'Name → functions',
  
    'cards.kind.funcion_nombre': 'Function → name',
  
    'cards.kind.ubicacion_nombre': 'Location → name',
  
    'cards.kind.ta_nombre': 'Latin term → name',
  
    'cards.kind.clinica_nombre': 'Clinical → structure',
  
    'cards.kind.identificar': 'Identify on the model',
  
    'cards.kind.manual': 'Review',
  
    'progress.title': 'Your progress',
  
    'progress.due': 'Cards due today',
  
    'progress.learned': 'Cards learned',
  
    'progress.tours': 'Tours completed',
  
    'progress.tours_value': '{done}/{total}',
  
    'progress.best_scores': 'Best score by system',
  
    'progress.no_scores': 'You have not completed any quiz yet.',
  
    'progress.export': 'Export',
  
    'progress.import': 'Import',
  
    'progress.reset': 'Reset',
  
    'progress.confirm_import': 'Replace',
  
    'progress.confirm_import_hint': 'Replace all your progress with the one in "{file}"?',
  
    'progress.confirm_reset': 'Yes, erase everything',
  
    'progress.confirm_reset_hint': 'Erase bookmarks, scores, tours and cards? This cannot be undone.',
  
    'progress.cancel': 'Cancel',
  
    'progress.imported': 'Progress imported.',
  
    'progress.reset_done': 'Progress reset.',
  
    'progress.import_error': 'Could not import: {error}',
  
    'progress.err.invalid_json': 'the file is not valid JSON',
  
    'progress.err.no_version': 'the version number is missing',
  
    'progress.err.future_version': 'the file comes from a newer version of the app',
  
    'progress.err.no_data': 'the progress data is missing',
  
    'progress.err.bad_list': 'one of the lists does not have the expected format',
  
    'progress.err.bad_object': 'the scores or cards do not have the expected format',
  
    'progress.err.bad_value': 'the language or detail level is not valid',
  
    'sidebar.sexo': 'Reproductive system variant',
  
    'sidebar.femenino': 'Female',
  
    'sidebar.masculino': 'Male',
  
    'sidebar.femenino_short': 'Female',
  
    'sidebar.masculino_short': 'Male',
  },
};

type Vars = Record<string, string | number>;

/** Current UI language, read from the (persisted) store so every component follows changes. */
export function useLocale(): Locale {
  return useAtlasStore((s) => s.locale);
}

/** Keeps `<html lang>` in sync with the chosen language (the server always renders "es"). */
export function useDocumentLang() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
}

/** `t` bound to the current language. */
export function useT(): (key: string, vars?: Vars) => string {
  const locale = useLocale();
  return useCallback((key: string, vars?: Vars) => t(key, locale, vars), [locale]);
}

export function t(key: string, locale: Locale = 'es', vars?: Vars): string {
  let text = messages[locale]?.[key] ?? messages['es']?.[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.split(`{${k}}`).join(String(v));
    }
  }
  return text;
}
