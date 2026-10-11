import type { SystemId } from './systems';

export interface TourStep {
  structureId: string;
  systemId: SystemId;
  titulo_es: string;
  explicacion_es: string;
  titulo_en: string;
  explicacion_en: string;
}

export interface GuidedTour {
  id: string;
  titulo_es: string;
  titulo_en: string;
  descripcion_es: string;
  descripcion_en: string;
  steps: TourStep[];
}

export const GUIDED_TOURS: GuidedTour[] = [
  {
    id: 'camino-oxigeno',
    titulo_es: 'Sigue el camino del oxígeno',
    titulo_en: 'Follow the path of oxygen',
    descripcion_es: 'Desde la primera inhalación hasta cada célula del cuerpo.',
    descripcion_en: 'From the first breath to every cell in the body.',
    steps: [
      {
        structureId: 'cavidad-nasal', systemId: 'respiratorio',
        titulo_es: 'Entrada del aire', titulo_en: 'Air entry',
        explicacion_es: 'El aire entra por la nariz, donde se calienta, humedece y filtra gracias a los cornetes y la mucosa nasal.',
        explicacion_en: 'Air enters through the nose, where turbinates and mucosa warm, moisten and filter it.',
      },
      {
        structureId: 'faringe', systemId: 'respiratorio',
        titulo_es: 'Cruce de caminos', titulo_en: 'Crossroads',
        explicacion_es: 'La faringe conecta la cavidad nasal con la laringe. Aquí convergen las vías aérea y digestiva.',
        explicacion_en: 'The pharynx connects the nasal cavity to the larynx, where airway and digestive tract meet.',
      },
      {
        structureId: 'laringe', systemId: 'respiratorio',
        titulo_es: 'Guardiana de la vía aérea', titulo_en: 'Airway guardian',
        explicacion_es: 'La epiglotis se cierra al tragar para proteger la laringe. Las cuerdas vocales generan la voz.',
        explicacion_en: 'The epiglottis closes during swallowing to protect the larynx. The vocal cords produce voice.',
      },
      {
        structureId: 'traquea', systemId: 'respiratorio',
        titulo_es: 'Conducto principal', titulo_en: 'Main airway',
        explicacion_es: 'La tráquea, con sus anillos de cartílago en forma de C, mantiene abierta la vía aérea hacia los pulmones.',
        explicacion_en: 'The trachea, with C-shaped cartilage rings, keeps the airway open toward the lungs.',
      },
      {
        structureId: 'bronquios-principales', systemId: 'respiratorio',
        titulo_es: 'División bronquial', titulo_en: 'Bronchial division',
        explicacion_es: 'La tráquea se bifurca en dos bronquios principales, uno para cada pulmón. El derecho es más ancho y corto.',
        explicacion_en: 'The trachea splits into two main bronchi, one per lung. The right one is wider and shorter.',
      },
      {
        structureId: 'pulmones', systemId: 'respiratorio',
        titulo_es: 'Intercambio gaseoso', titulo_en: 'Gas exchange',
        explicacion_es: 'En los alvéolos pulmonares, el oxígeno pasa a la sangre y el dióxido de carbono sale. Hay unos 480 millones de alvéolos.',
        explicacion_en: 'In pulmonary alveoli, oxygen enters the blood and CO₂ exits. There are about 480 million alveoli.',
      },
      {
        structureId: 'corazon', systemId: 'cardiovascular',
        titulo_es: 'Bomba vital', titulo_en: 'Vital pump',
        explicacion_es: 'La sangre oxigenada llega al ventrículo izquierdo del corazón, que la impulsa a todo el cuerpo a través de la aorta.',
        explicacion_en: 'Oxygenated blood reaches the left ventricle, which pumps it to the whole body via the aorta.',
      },
      {
        structureId: 'aorta', systemId: 'cardiovascular',
        titulo_es: 'Autopista de la sangre', titulo_en: 'Blood highway',
        explicacion_es: 'La aorta distribuye sangre oxigenada a todas las arterias del cuerpo, completando el viaje del oxígeno.',
        explicacion_en: 'The aorta distributes oxygenated blood to all body arteries, completing oxygen\'s journey.',
      },
    ],
  },
  {
    id: 'alimentos-nutrientes',
    titulo_es: 'De los alimentos a los nutrientes',
    titulo_en: 'From food to nutrients',
    descripcion_es: 'El recorrido de los alimentos desde la boca hasta su absorción.',
    descripcion_en: 'The journey of food from the mouth to nutrient absorption.',
    steps: [
      {
        structureId: 'cavidad-oral', systemId: 'digestivo',
        titulo_es: 'Inicio de la digestión', titulo_en: 'Digestion begins',
        explicacion_es: 'Los dientes trituran el alimento y la saliva (con amilasa) comienza la digestión química del almidón.',
        explicacion_en: 'Teeth crush food and saliva (with amylase) begins chemical starch digestion.',
      },
      {
        structureId: 'esofago', systemId: 'digestivo',
        titulo_es: 'Tubo de transporte', titulo_en: 'Transport tube',
        explicacion_es: 'Ondas peristálticas empujan el bolo alimenticio hacia el estómago en unos 8 segundos.',
        explicacion_en: 'Peristaltic waves push the bolus toward the stomach in about 8 seconds.',
      },
      {
        structureId: 'estomago', systemId: 'digestivo',
        titulo_es: 'Cámara ácida', titulo_en: 'Acid chamber',
        explicacion_es: 'El ácido clorhídrico y la pepsina descomponen las proteínas. El estómago mezcla todo durante 2-4 horas.',
        explicacion_en: 'Hydrochloric acid and pepsin break down proteins. The stomach churns contents for 2-4 hours.',
      },
      {
        structureId: 'higado', systemId: 'digestivo',
        titulo_es: 'Fábrica metabólica', titulo_en: 'Metabolic factory',
        explicacion_es: 'El hígado produce bilis, que emulsiona las grasas en el duodeno para facilitar su digestión.',
        explicacion_en: 'The liver produces bile, which emulsifies fats in the duodenum to aid digestion.',
      },
      {
        structureId: 'pancreas', systemId: 'digestivo',
        titulo_es: 'Enzimas digestivas', titulo_en: 'Digestive enzymes',
        explicacion_es: 'El páncreas exocrino libera lipasa, amilasa y tripsina al duodeno, completando la digestión química.',
        explicacion_en: 'The exocrine pancreas releases lipase, amylase and trypsin into the duodenum.',
      },
      {
        structureId: 'intestino-delgado', systemId: 'digestivo',
        titulo_es: 'Absorción de nutrientes', titulo_en: 'Nutrient absorption',
        explicacion_es: 'Las vellosidades intestinales (unos 5 millones) absorben los nutrientes digeridos hacia la sangre y la linfa.',
        explicacion_en: 'Intestinal villi (about 5 million) absorb digested nutrients into blood and lymph.',
      },
      {
        structureId: 'intestino-grueso', systemId: 'digestivo',
        titulo_es: 'Agua y desechos', titulo_en: 'Water and waste',
        explicacion_es: 'El colon absorbe agua y electrolitos de los residuos, formando las heces. La flora bacteriana sintetiza vitaminas.',
        explicacion_en: 'The colon absorbs water and electrolytes from waste, forming feces. Gut flora synthesizes vitamins.',
      },
    ],
  },
  {
    id: 'movimiento',
    titulo_es: 'Cómo ocurre un movimiento',
    titulo_en: 'How a movement happens',
    descripcion_es: 'Desde la decisión cerebral hasta la contracción muscular.',
    descripcion_en: 'From the brain\'s decision to muscle contraction.',
    steps: [
      {
        structureId: 'cerebro', systemId: 'nervioso',
        titulo_es: 'Decisión motora', titulo_en: 'Motor decision',
        explicacion_es: 'La corteza motora primaria del lóbulo frontal planifica y ordena el movimiento voluntario.',
        explicacion_en: 'The primary motor cortex of the frontal lobe plans and commands voluntary movement.',
      },
      {
        structureId: 'medula-espinal', systemId: 'nervioso',
        titulo_es: 'Autopista nerviosa', titulo_en: 'Neural highway',
        explicacion_es: 'Los impulsos viajan por las vías corticoespinales, cruzando al lado opuesto en el tronco encefálico.',
        explicacion_en: 'Impulses travel via corticospinal tracts, crossing to the opposite side in the brainstem.',
      },
      {
        structureId: 'deltoides', systemId: 'muscular',
        titulo_es: 'Contracción muscular', titulo_en: 'Muscle contraction',
        explicacion_es: 'La motoneurona libera acetilcolina en la placa motora, provocando la contracción de las fibras musculares.',
        explicacion_en: 'The motor neuron releases acetylcholine at the motor end plate, triggering muscle fiber contraction.',
      },
      {
        structureId: 'humero', systemId: 'esqueletico',
        titulo_es: 'Palanca ósea', titulo_en: 'Bone lever',
        explicacion_es: 'El hueso actúa como palanca. La inserción del deltoides en el húmero levanta el brazo al contraerse.',
        explicacion_en: 'The bone acts as a lever. The deltoid insertion on the humerus lifts the arm upon contraction.',
      },
      {
        structureId: 'cerebelo', systemId: 'nervioso',
        titulo_es: 'Coordinación fina', titulo_en: 'Fine coordination',
        explicacion_es: 'El cerebelo ajusta la precisión, velocidad y suavidad del movimiento comparando la intención con la ejecución.',
        explicacion_en: 'The cerebellum refines precision, speed and smoothness by comparing intention with execution.',
      },
    ],
  },
  {
    id: 'filtracion-renal',
    titulo_es: 'Cómo filtran los riñones la sangre',
    titulo_en: 'How the kidneys filter blood',
    descripcion_es: 'El viaje de la sangre a través de la nefrona hasta la orina.',
    descripcion_en: 'Blood\'s journey through the nephron to urine.',
    steps: [
      {
        structureId: 'aorta', systemId: 'cardiovascular',
        titulo_es: 'Sangre al riñón', titulo_en: 'Blood to kidney',
        explicacion_es: 'La arteria renal (rama de la aorta) lleva sangre cargada de desechos metabólicos a cada riñón.',
        explicacion_en: 'The renal artery (branch of the aorta) carries waste-laden blood to each kidney.',
      },
      {
        structureId: 'rinon', systemId: 'urinario',
        titulo_es: 'Centro de filtración', titulo_en: 'Filtration center',
        explicacion_es: 'Cada riñón contiene más de un millón de nefronas, las unidades funcionales de filtración.',
        explicacion_en: 'Each kidney contains over a million nephrons, the functional filtration units.',
      },
      {
        structureId: 'nefrona', systemId: 'urinario',
        titulo_es: 'Filtración glomerular', titulo_en: 'Glomerular filtration',
        explicacion_es: 'El glomérulo filtra plasma. Los túbulos reabsorben agua, glucosa y electrolitos útiles, y secretan toxinas.',
        explicacion_en: 'The glomerulus filters plasma. Tubules reabsorb water, glucose and useful electrolytes, and secrete toxins.',
      },
      {
        structureId: 'ureter', systemId: 'urinario',
        titulo_es: 'Conducción urinaria', titulo_en: 'Urine transport',
        explicacion_es: 'Los uréteres transportan la orina desde la pelvis renal hasta la vejiga mediante peristaltismo.',
        explicacion_en: 'Ureters transport urine from the renal pelvis to the bladder via peristalsis.',
      },
      {
        structureId: 'vejiga-urinaria', systemId: 'urinario',
        titulo_es: 'Almacenamiento', titulo_en: 'Storage',
        explicacion_es: 'La vejiga almacena hasta 500 ml de orina. Receptores de estiramiento avisan al sistema nervioso cuando se llena.',
        explicacion_en: 'The bladder stores up to 500 ml of urine. Stretch receptors alert the nervous system when it fills.',
      },
      {
        structureId: 'uretra', systemId: 'urinario',
        titulo_es: 'Eliminación', titulo_en: 'Elimination',
        explicacion_es: 'La uretra permite la micción voluntaria cuando se relaja el esfínter uretral externo.',
        explicacion_en: 'The urethra allows voluntary urination when the external urethral sphincter relaxes.',
      },
    ],
  },
];
