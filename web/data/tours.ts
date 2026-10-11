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
  /** Duración aproximada en minutos. */
  duracion_min?: number;
  steps: TourStep[];
}

export const GUIDED_TOURS: GuidedTour[] = [
  {
    id: 'camino-oxigeno',
    titulo_es: 'Sigue el camino del oxígeno',
    titulo_en: 'Follow the path of oxygen',
    descripcion_es: 'Desde la primera inhalación hasta cada célula del cuerpo.',
    descripcion_en: 'From the first breath to every cell in the body.',
    duracion_min: 7,
    steps: [
      {
        structureId: 'cavidad-nasal', systemId: 'respiratorio',
        titulo_es: 'Entrada del aire', titulo_en: 'Air entry',
        explicacion_es: 'El aire entra por la nariz, donde los cornetes y la mucosa lo calientan, lo humedecen y atrapan el polvo. Así llega a los pulmones en mejores condiciones que si se respirara por la boca.',
        explicacion_en: 'Air enters through the nose, where the turbinates and lining warm it, moisten it and trap dust. This way it reaches the lungs in better condition than if we breathed through the mouth.',
      },
      {
        structureId: 'faringe', systemId: 'respiratorio',
        titulo_es: 'Cruce de caminos', titulo_en: 'Crossroads',
        explicacion_es: 'La faringe es un conducto compartido: por ella pasan el aire y los alimentos. El aire sigue hacia adelante, hacia la laringe, mientras que la comida va hacia atrás, al esófago.',
        explicacion_en: 'The pharynx is a shared passage: both air and food travel through it. Air continues forward into the larynx, while food goes back into the esophagus.',
      },
      {
        structureId: 'laringe', systemId: 'respiratorio',
        titulo_es: 'Guardiana de la vía aérea', titulo_en: 'Airway guardian',
        explicacion_es: 'Al tragar, la epiglotis se pliega y cierra la entrada de la laringe para que el alimento no pase a los pulmones. Mientras respiramos queda abierta, y el aire atraviesa las cuerdas vocales, que también producen la voz.',
        explicacion_en: 'When we swallow, the epiglottis folds down and closes the entrance to the larynx so food does not go into the lungs. While we breathe it stays open, and air passes the vocal cords, which also produce the voice.',
      },
      {
        structureId: 'traquea', systemId: 'respiratorio',
        titulo_es: 'Conducto principal', titulo_en: 'Main airway',
        explicacion_es: 'La tráquea es un tubo reforzado por anillos de cartílago en forma de C que impiden que se cierre. Su mucosa tiene cilios que barren el moco y las partículas atrapadas hacia la garganta.',
        explicacion_en: 'The trachea is a tube reinforced by C-shaped rings of cartilage that keep it from collapsing. Its lining has cilia that sweep mucus and trapped particles up toward the throat.',
      },
      {
        structureId: 'bronquios-principales', systemId: 'respiratorio',
        titulo_es: 'La primera división', titulo_en: 'The first division',
        explicacion_es: 'A la altura del esternón, la tráquea se divide en dos bronquios principales, uno para cada pulmón. El derecho es más ancho, corto y vertical; por eso lo que se aspira por error suele ir a ese lado.',
        explicacion_en: 'At the level of the sternum, the trachea divides into two main bronchi, one for each lung. The right one is wider, shorter and more vertical, which is why anything inhaled by mistake usually goes to that side.',
      },
      {
        structureId: 'bronquios-lobares', systemId: 'respiratorio',
        titulo_es: 'Un camino para cada lóbulo', titulo_en: 'A path for each lobe',
        explicacion_es: 'Cada bronquio principal se ramifica en bronquios lobares: tres a la derecha y dos a la izquierda. A partir de ahí se dividirán más de veinte veces hasta terminar en los alvéolos.',
        explicacion_en: 'Each main bronchus branches into lobar bronchi: three on the right and two on the left. From there they will divide more than twenty times before ending in the alveoli.',
      },
      {
        structureId: 'pulmones', systemId: 'respiratorio',
        titulo_es: 'Intercambio gaseoso', titulo_en: 'Gas exchange',
        explicacion_es: 'En los alvéolos, sacos diminutos rodeados de capilares, el oxígeno atraviesa una pared finísima y pasa a la sangre, mientras el dióxido de carbono hace el camino inverso. Entre todos suman una superficie de unos 70 m².',
        explicacion_en: 'In the alveoli, tiny sacs surrounded by capillaries, oxygen crosses a very thin wall into the blood while carbon dioxide travels the other way. Together they add up to a surface of about 70 m².',
      },
      {
        structureId: 'corazon', systemId: 'cardiovascular',
        titulo_es: 'Bomba vital', titulo_en: 'Vital pump',
        explicacion_es: 'La sangre recién oxigenada vuelve al corazón por las venas pulmonares y llega al lado izquierdo. El ventrículo izquierdo, la cavidad más musculosa, la impulsa con fuerza hacia la aorta.',
        explicacion_en: 'The freshly oxygenated blood returns to the heart through the pulmonary veins and reaches the left side. The left ventricle, the most muscular chamber, pumps it forcefully into the aorta.',
      },
      {
        structureId: 'aorta', systemId: 'cardiovascular',
        titulo_es: 'Autopista de la sangre', titulo_en: 'Blood highway',
        explicacion_es: 'La aorta, la arteria más grande del cuerpo, reparte la sangre oxigenada por sus ramas hacia todos los órganos. En los capilares, el oxígeno pasa finalmente a cada célula, que lo usa para obtener energía.',
        explicacion_en: 'The aorta, the largest artery in the body, distributes oxygenated blood through its branches to every organ. In the capillaries, oxygen finally reaches each cell, which uses it to obtain energy.',
      },
    ],
  },
  {
    id: 'alimentos-nutrientes',
    titulo_es: 'De los alimentos a los nutrientes',
    titulo_en: 'From food to nutrients',
    descripcion_es: 'El recorrido de los alimentos desde la boca hasta su absorción.',
    descripcion_en: 'The journey of food from the mouth to absorption.',
    duracion_min: 8,
    steps: [
      {
        structureId: 'dientes', systemId: 'digestivo',
        titulo_es: 'Cortar y triturar', titulo_en: 'Cut and grind',
        explicacion_es: 'Los incisivos cortan, los caninos desgarran y los molares trituran el alimento en trozos pequeños. Cuanto más pequeños son, más superficie ofrecen a las enzimas digestivas.',
        explicacion_en: 'The incisors cut, the canines tear and the molars grind food into small pieces. The smaller they are, the more surface they offer to digestive enzymes.',
      },
      {
        structureId: 'lengua', systemId: 'digestivo',
        titulo_es: 'Formar el bolo', titulo_en: 'Shaping the bolus',
        explicacion_es: 'La lengua mezcla el alimento con la saliva, cuya amilasa empieza a digerir el almidón, y lo moldea en una bola blanda: el bolo. Luego lo empuja hacia atrás para iniciar la deglución.',
        explicacion_en: 'The tongue mixes food with saliva, whose amylase starts to digest starch, and shapes it into a soft ball: the bolus. It then pushes it backward to start swallowing.',
      },
      {
        structureId: 'esofago', systemId: 'digestivo',
        titulo_es: 'Tubo de transporte', titulo_en: 'Transport tube',
        explicacion_es: 'Ondas de contracción, llamadas peristaltismo, empujan el bolo hacia el estómago en pocos segundos. Funcionan incluso cabeza abajo, porque no dependen de la gravedad.',
        explicacion_en: 'Waves of contraction, called peristalsis, push the bolus to the stomach in a few seconds. They work even upside down, because they do not depend on gravity.',
      },
      {
        structureId: 'estomago', systemId: 'digestivo',
        titulo_es: 'Cámara ácida', titulo_en: 'Acid chamber',
        explicacion_es: 'El estómago mezcla el alimento con ácido clorhídrico y pepsina, que empiezan a descomponer las proteínas. Lo retiene unas horas y lo libera de a poco, convertido en una papilla llamada quimo.',
        explicacion_en: 'The stomach mixes food with hydrochloric acid and pepsin, which begin to break down proteins. It holds it for a few hours and releases it little by little as a paste called chyme.',
      },
      {
        structureId: 'duodeno', systemId: 'digestivo',
        titulo_es: 'Llegan los refuerzos', titulo_en: 'Reinforcements arrive',
        explicacion_es: 'En el duodeno el quimo ácido se neutraliza y se mezcla con la bilis y el jugo pancreático, que llegan por un orificio común. Aquí empieza la parte más intensa de la digestión química.',
        explicacion_en: 'In the duodenum the acidic chyme is neutralized and mixed with bile and pancreatic juice, which arrive through a shared opening. This is where the most intense part of chemical digestion begins.',
      },
      {
        structureId: 'higado', systemId: 'digestivo',
        titulo_es: 'La bilis', titulo_en: 'Bile',
        explicacion_es: 'El hígado produce bilis, que se guarda en la vesícula y se vierte al duodeno después de comer. Funciona como un detergente: divide las grasas en gotitas para que las enzimas puedan actuar.',
        explicacion_en: 'The liver makes bile, which is stored in the gallbladder and released into the duodenum after eating. It works like a detergent: it breaks fats into droplets so enzymes can act on them.',
      },
      {
        structureId: 'pancreas', systemId: 'digestivo',
        titulo_es: 'Enzimas digestivas', titulo_en: 'Digestive enzymes',
        explicacion_es: 'El páncreas libera un jugo con bicarbonato y enzimas que digieren las grasas (lipasa), los almidones (amilasa) y las proteínas (tripsina). Sin él, gran parte de los alimentos pasaría sin digerirse.',
        explicacion_en: 'The pancreas releases a juice with bicarbonate and enzymes that digest fats (lipase), starches (amylase) and proteins (trypsin). Without it, much of our food would pass through undigested.',
      },
      {
        structureId: 'intestino-delgado', systemId: 'digestivo',
        titulo_es: 'Absorción de nutrientes', titulo_en: 'Nutrient absorption',
        explicacion_es: 'Sus pliegues y millones de vellosidades multiplican la superficie de absorción. Los nutrientes pasan a la sangre, que los lleva por la vena porta al hígado, y las grasas pasan a la linfa.',
        explicacion_en: 'Its folds and millions of villi multiply the absorbing surface. Nutrients pass into the blood, which carries them through the portal vein to the liver, and fats pass into the lymph.',
      },
      {
        structureId: 'intestino-grueso', systemId: 'digestivo',
        titulo_es: 'Agua y desechos', titulo_en: 'Water and waste',
        explicacion_es: 'El colon absorbe la mayor parte del agua y las sales que quedan y forma las heces. Sus bacterias fermentan restos de fibra y producen algunas vitaminas, como la K.',
        explicacion_en: 'The colon absorbs most of the remaining water and salts and forms the feces. Its bacteria ferment leftover fiber and produce some vitamins, such as vitamin K.',
      },
    ],
  },
  {
    id: 'oido-cerebro',
    titulo_es: 'Del sonido a la corteza',
    titulo_en: 'From sound to cortex',
    descripcion_es: 'Sigue una onda de sonido desde la oreja hasta las áreas auditivas del cerebro.',
    descripcion_en: 'Follow a sound wave from the ear to the auditory areas of the brain.',
    duracion_min: 5,
    steps: [
      {
        structureId: 'oido-externo', systemId: 'organos_sensoriales',
        titulo_es: 'Captar el sonido', titulo_en: 'Catching sound',
        explicacion_es: 'El pabellón de la oreja recoge las ondas sonoras y las dirige por el conducto auditivo externo. Su forma ayuda a saber si un sonido viene de adelante o de atrás.',
        explicacion_en: 'The outer ear collects sound waves and funnels them down the external auditory canal. Its shape helps us tell whether a sound comes from in front or behind.',
      },
      {
        structureId: 'timpano', systemId: 'organos_sensoriales',
        titulo_es: 'Una membrana que vibra', titulo_en: 'A vibrating membrane',
        explicacion_es: 'Al final del conducto, el tímpano vibra al ritmo de las ondas de sonido. Es una membrana muy fina que separa el oído externo del oído medio.',
        explicacion_en: 'At the end of the canal, the eardrum vibrates in time with the sound waves. It is a very thin membrane that separates the outer ear from the middle ear.',
      },
      {
        structureId: 'huesecillos-del-oido', systemId: 'organos_sensoriales',
        titulo_es: 'Amplificador mecánico', titulo_en: 'Mechanical amplifier',
        explicacion_es: 'El martillo, el yunque y el estribo, los huesos más pequeños del cuerpo, transmiten la vibración del tímpano a la ventana oval. Como el tímpano es mucho más grande que esa ventana, la presión se multiplica.',
        explicacion_en: 'The malleus, incus and stapes, the smallest bones in the body, pass the eardrum\'s vibration to the oval window. Because the eardrum is much larger than that window, the pressure is multiplied.',
      },
      {
        structureId: 'coclea', systemId: 'organos_sensoriales',
        titulo_es: 'De vibración a señal', titulo_en: 'From vibration to signal',
        explicacion_es: 'En la cóclea, un tubo en espiral lleno de líquido, la vibración mueve las células ciliadas, que la convierten en impulsos nerviosos. Cada zona responde a una frecuencia: los agudos cerca de la base y los graves cerca del vértice.',
        explicacion_en: 'In the cochlea, a fluid-filled spiral tube, the vibration moves the hair cells, which turn it into nerve impulses. Each region responds to one frequency: high pitches near the base and low pitches near the apex.',
      },
      {
        structureId: 'tronco-encefalico', systemId: 'nervioso',
        titulo_es: 'Primeras estaciones', titulo_en: 'First stations',
        explicacion_es: 'El nervio coclear lleva la señal a los núcleos del tronco encefálico, donde se compara lo que llega de cada oído. Las pequeñas diferencias de tiempo e intensidad entre ambos permiten localizar de dónde viene un sonido.',
        explicacion_en: 'The cochlear nerve carries the signal to the brainstem nuclei, where input from each ear is compared. Small differences in timing and loudness between the two ears let us locate where a sound is coming from.',
      },
      {
        structureId: 'talamo', systemId: 'nervioso',
        titulo_es: 'Relevo auditivo', titulo_en: 'Auditory relay',
        explicacion_es: 'La señal hace escala en el cuerpo geniculado medial del tálamo. Desde allí sube hacia la corteza del lóbulo temporal.',
        explicacion_en: 'The signal stops over in the medial geniculate body of the thalamus. From there it rises to the cortex of the temporal lobe.',
      },
      {
        structureId: 'cerebro', systemId: 'nervioso',
        titulo_es: 'Escuchar es entender', titulo_en: 'Listening is understanding',
        explicacion_es: 'La corteza auditiva primaria, en el lóbulo temporal, recibe los sonidos ordenados por frecuencia. Áreas vecinas, como la de Wernicke en el hemisferio izquierdo, permiten reconocer palabras y comprender el lenguaje.',
        explicacion_en: 'The primary auditory cortex, in the temporal lobe, receives sounds arranged by frequency. Neighboring areas, such as Wernicke\'s area in the left hemisphere, let us recognize words and understand language.',
      },
    ],
  },
  {
    id: 'filtracion-renal',
    titulo_es: 'Cómo filtran los riñones la sangre',
    titulo_en: 'How the kidneys filter blood',
    descripcion_es: 'El viaje de la sangre a través de la nefrona hasta la orina.',
    descripcion_en: 'The journey of blood through the nephron to urine.',
    duracion_min: 6,
    steps: [
      {
        structureId: 'aorta', systemId: 'cardiovascular',
        titulo_es: 'Salida de la sangre', titulo_en: 'Blood sets out',
        explicacion_es: 'Con cada latido, la aorta abdominal lleva sangre cargada de desechos del metabolismo, como la urea. Cerca de una quinta parte de esa sangre se desvía hacia los riñones.',
        explicacion_en: 'With every heartbeat, the abdominal aorta carries blood loaded with metabolic waste, such as urea. About a fifth of that blood is diverted to the kidneys.',
      },
      {
        structureId: 'arteria-renal', systemId: 'cardiovascular',
        titulo_es: 'Entrada al riñón', titulo_en: 'Into the kidney',
        explicacion_es: 'Las arterias renales salen a los lados de la aorta y entran en cada riñón por el hilio. Allí se ramifican hasta formar los pequeños ovillos de capilares de las nefronas.',
        explicacion_en: 'The renal arteries leave the sides of the aorta and enter each kidney at the hilum. There they branch until they form the tiny capillary tufts of the nephrons.',
      },
      {
        structureId: 'rinon', systemId: 'urinario',
        titulo_es: 'Centro de filtración', titulo_en: 'Filtration center',
        explicacion_es: 'Cada riñón contiene alrededor de un millón de nefronas, sus unidades de filtración. Entre los dos filtran unos 180 litros de plasma por día, aunque solo producen entre 1 y 2 litros de orina.',
        explicacion_en: 'Each kidney contains about a million nephrons, its filtering units. Together they filter about 180 liters of plasma a day, yet they produce only 1 to 2 liters of urine.',
      },
      {
        structureId: 'nefrona', systemId: 'urinario',
        titulo_es: 'Filtrar y recuperar', titulo_en: 'Filter and recover',
        explicacion_es: 'En el glomérulo, la presión de la sangre empuja agua y sustancias pequeñas hacia el túbulo. A lo largo del túbulo se recupera casi todo lo útil, como agua, glucosa y sales, y se agregan desechos: lo que queda es la orina.',
        explicacion_en: 'In the glomerulus, blood pressure pushes water and small substances into the tubule. Along the tubule almost everything useful, such as water, glucose and salts, is recovered and waste is added: what remains is urine.',
      },
      {
        structureId: 'ureter', systemId: 'urinario',
        titulo_es: 'Conducción urinaria', titulo_en: 'Urine transport',
        explicacion_es: 'La orina se reúne en la pelvis renal y baja por el uréter, un tubo muscular que la empuja con ondas de contracción. Por eso puede llegar a la vejiga aunque estemos acostados.',
        explicacion_en: 'Urine collects in the renal pelvis and travels down the ureter, a muscular tube that pushes it with waves of contraction. That is why it can reach the bladder even when we are lying down.',
      },
      {
        structureId: 'vejiga-urinaria', systemId: 'urinario',
        titulo_es: 'Almacenamiento', titulo_en: 'Storage',
        explicacion_es: 'La vejiga se distiende a medida que se llena y puede guardar unos 400–500 ml. Sus receptores de estiramiento avisan al cerebro, y así aparece el deseo de orinar.',
        explicacion_en: 'The bladder stretches as it fills and can hold about 400–500 ml. Its stretch receptors alert the brain, and that is how the urge to urinate appears.',
      },
      {
        structureId: 'esfinter-uretral-externo', systemId: 'urinario',
        titulo_es: 'Control voluntario', titulo_en: 'Voluntary control',
        explicacion_es: 'Este anillo de músculo esquelético rodea la uretra y se mantiene cerrado hasta que decidimos orinar. Es el que aprende a controlar un niño al dejar los pañales.',
        explicacion_en: 'This ring of skeletal muscle surrounds the urethra and stays closed until we decide to urinate. It is the one a child learns to control when leaving diapers behind.',
      },
      {
        structureId: 'uretra', systemId: 'urinario',
        titulo_es: 'Eliminación', titulo_en: 'Elimination',
        explicacion_es: 'Al relajarse el esfínter y contraerse la vejiga, la orina sale por la uretra. En el hombre mide unos 20 cm y comparte camino con el semen; en la mujer mide unos 4 cm.',
        explicacion_en: 'When the sphincter relaxes and the bladder contracts, urine leaves through the urethra. In men it is about 20 cm long and shares its path with semen; in women it is about 4 cm long.',
      },
    ],
  },
  {
    id: 'latido-circulacion',
    titulo_es: 'Un latido, dos circulaciones',
    titulo_en: 'One heartbeat, two circuits',
    descripcion_es: 'Sigue a la sangre por el corazón derecho, los pulmones y el corazón izquierdo.',
    descripcion_en: 'Follow the blood through the right heart, the lungs and the left heart.',
    duracion_min: 7,
    steps: [
      {
        structureId: 'auricula-derecha', systemId: 'cardiovascular',
        titulo_es: 'Vuelve la sangre usada', titulo_en: 'Used blood returns',
        explicacion_es: 'La sangre que ya entregó su oxígeno a los tejidos regresa por las venas cavas y llena la aurícula derecha. En su pared está el nódulo sinusal, el marcapasos natural que inicia cada latido.',
        explicacion_en: 'Blood that has already delivered its oxygen to the tissues returns through the venae cavae and fills the right atrium. Its wall holds the sinoatrial node, the natural pacemaker that starts every heartbeat.',
      },
      {
        structureId: 'ventriculo-derecho', systemId: 'cardiovascular',
        titulo_es: 'Impulso hacia los pulmones', titulo_en: 'Pumping to the lungs',
        explicacion_es: 'La sangre cruza la válvula tricúspide y llena el ventrículo derecho. Al contraerse, este la empuja a baja presión hacia los pulmones, y la válvula se cierra detrás para que no retroceda.',
        explicacion_en: 'Blood crosses the tricuspid valve and fills the right ventricle. When it contracts, it pushes the blood at low pressure toward the lungs, and the valve closes behind it so it does not flow back.',
      },
      {
        structureId: 'tronco-pulmonar', systemId: 'cardiovascular',
        titulo_es: 'Salida del corazón derecho', titulo_en: 'Leaving the right heart',
        explicacion_es: 'La sangre atraviesa la válvula pulmonar y sube por el tronco pulmonar. Aunque es una arteria, lleva sangre pobre en oxígeno.',
        explicacion_en: 'Blood passes through the pulmonary valve and rises up the pulmonary trunk. Although it is an artery, it carries oxygen-poor blood.',
      },
      {
        structureId: 'arterias-pulmonares', systemId: 'cardiovascular',
        titulo_es: 'Rumbo a cada pulmón', titulo_en: 'Heading to each lung',
        explicacion_es: 'El tronco se divide en las arterias pulmonares derecha e izquierda, que se ramifican junto a los bronquios. Sus ramas terminan en capilares que rodean los alvéolos.',
        explicacion_en: 'The trunk divides into the right and left pulmonary arteries, which branch alongside the bronchi. Their branches end in capillaries that surround the alveoli.',
      },
      {
        structureId: 'pulmones', systemId: 'respiratorio',
        titulo_es: 'Cambio de carga', titulo_en: 'Swapping cargo',
        explicacion_es: 'En los capilares alveolares la sangre suelta el dióxido de carbono, que exhalamos, y toma oxígeno del aire. Su color pasa de rojo oscuro a rojo brillante.',
        explicacion_en: 'In the alveolar capillaries the blood releases carbon dioxide, which we breathe out, and picks up oxygen from the air. Its color changes from dark red to bright red.',
      },
      {
        structureId: 'venas-pulmonares', systemId: 'cardiovascular',
        titulo_es: 'Regreso al corazón', titulo_en: 'Back to the heart',
        explicacion_es: 'La sangre ya oxigenada sale de cada pulmón por las venas pulmonares. Son las únicas venas del adulto que llevan sangre rica en oxígeno.',
        explicacion_en: 'The now oxygenated blood leaves each lung through the pulmonary veins. They are the only veins in the adult that carry oxygen-rich blood.',
      },
      {
        structureId: 'auricula-izquierda', systemId: 'cardiovascular',
        titulo_es: 'Sala de espera', titulo_en: 'Waiting room',
        explicacion_es: 'Las cuatro venas pulmonares desembocan en la aurícula izquierda. Desde allí la sangre pasa por la válvula mitral al ventrículo izquierdo.',
        explicacion_en: 'The four pulmonary veins open into the left atrium. From there the blood passes through the mitral valve into the left ventricle.',
      },
      {
        structureId: 'ventriculo-izquierdo', systemId: 'cardiovascular',
        titulo_es: 'La bomba más potente', titulo_en: 'The strongest pump',
        explicacion_es: 'El ventrículo izquierdo tiene la pared más gruesa del corazón, porque debe impulsar la sangre a todo el cuerpo. Al contraerse se cierra la válvula mitral y se abre la aórtica.',
        explicacion_en: 'The left ventricle has the thickest wall in the heart, because it must pump blood to the whole body. As it contracts, the mitral valve closes and the aortic valve opens.',
      },
      {
        structureId: 'aorta', systemId: 'cardiovascular',
        titulo_es: 'Hacia todo el cuerpo', titulo_en: 'Out to the whole body',
        explicacion_es: 'La sangre sale a presión por la aorta y se reparte por sus ramas a cada órgano. Después de recorrer el cuerpo volverá a la aurícula derecha, y el ciclo empezará otra vez.',
        explicacion_en: 'Blood leaves under pressure through the aorta and spreads through its branches to every organ. After traveling around the body it will return to the right atrium, and the cycle will start again.',
      },
    ],
  },
  {
    id: 'ojo-corteza',
    titulo_es: 'Del ojo a la corteza: cómo vemos',
    titulo_en: 'From eye to cortex: how we see',
    descripcion_es: 'Acompaña a la luz desde la córnea hasta las áreas visuales del cerebro.',
    descripcion_en: 'Follow light from the cornea to the visual areas of the brain.',
    duracion_min: 6,
    steps: [
      {
        structureId: 'cornea', systemId: 'organos_sensoriales',
        titulo_es: 'Primera lente', titulo_en: 'The first lens',
        explicacion_es: 'La luz entra por la córnea, una ventana transparente y curva que hace la mayor parte del enfoque. No tiene vasos sanguíneos, lo que ayuda a que sea transparente.',
        explicacion_en: 'Light enters through the cornea, a clear, curved window that does most of the focusing. It has no blood vessels, which helps keep it transparent.',
      },
      {
        structureId: 'iris', systemId: 'organos_sensoriales',
        titulo_es: 'Diafragma automático', titulo_en: 'Automatic diaphragm',
        explicacion_es: 'El iris regula el tamaño de la pupila: la achica con mucha luz y la agranda en la oscuridad. Así controla cuánta luz llega al interior del ojo.',
        explicacion_en: 'The iris adjusts the size of the pupil: it narrows it in bright light and widens it in the dark. This way it controls how much light reaches the inside of the eye.',
      },
      {
        structureId: 'cristalino', systemId: 'organos_sensoriales',
        titulo_es: 'Enfoque fino', titulo_en: 'Fine focus',
        explicacion_es: 'El cristalino es una lente flexible que cambia de forma para enfocar objetos cercanos o lejanos. Con la edad se endurece, y por eso cuesta leer de cerca después de los 40 años.',
        explicacion_en: 'The lens is flexible and changes shape to focus on near or distant objects. With age it stiffens, which is why reading up close gets harder after age 40.',
      },
      {
        structureId: 'cuerpo-vitreo', systemId: 'organos_sensoriales',
        titulo_es: 'Un gel transparente', titulo_en: 'A clear gel',
        explicacion_es: 'La luz atraviesa el cuerpo vítreo, el gel que llena la mayor parte del ojo y mantiene su forma. Sus pequeñas condensaciones se ven como «moscas volantes».',
        explicacion_en: 'Light passes through the vitreous body, the gel that fills most of the eye and keeps its shape. Its small clumps are seen as "floaters".',
      },
      {
        structureId: 'retina', systemId: 'organos_sensoriales',
        titulo_es: 'Luz convertida en señal', titulo_en: 'Light becomes a signal',
        explicacion_es: 'En la retina, los conos y los bastones transforman la luz en señales eléctricas. Los conos captan los colores y el detalle; los bastones permiten ver con poca luz. La imagen llega invertida y el cerebro la endereza.',
        explicacion_en: 'In the retina, cones and rods turn light into electrical signals. Cones capture color and detail; rods let us see in dim light. The image arrives upside down and the brain turns it the right way up.',
      },
      {
        structureId: 'nervio-optico', systemId: 'nervioso',
        titulo_es: 'El cable del ojo', titulo_en: 'The eye\'s cable',
        explicacion_es: 'Las fibras de la retina se reúnen y salen del ojo formando el nervio óptico. En el quiasma óptico, las fibras de la mitad nasal de cada retina cruzan al otro lado.',
        explicacion_en: 'The fibers of the retina gather and leave the eye as the optic nerve. At the optic chiasm, the fibers from the nasal half of each retina cross to the other side.',
      },
      {
        structureId: 'talamo', systemId: 'nervioso',
        titulo_es: 'Estación de relevo', titulo_en: 'Relay station',
        explicacion_es: 'Las señales visuales hacen escala en el cuerpo geniculado lateral del tálamo. Desde allí, las radiaciones ópticas las llevan hacia la parte posterior del cerebro.',
        explicacion_en: 'Visual signals stop over in the lateral geniculate body of the thalamus. From there, the optic radiations carry them to the back of the brain.',
      },
      {
        structureId: 'cerebro', systemId: 'nervioso',
        titulo_es: 'Ver es interpretar', titulo_en: 'Seeing is interpreting',
        explicacion_es: 'La corteza visual primaria, en el lóbulo occipital, recibe la información, y otras áreas reconocen formas, colores, movimiento y rostros. Ver no es solo captar luz: es el cerebro interpretándola.',
        explicacion_en: 'The primary visual cortex, in the occipital lobe, receives the information, and other areas recognize shapes, colors, motion and faces. Seeing is not just capturing light: it is the brain interpreting it.',
      },
    ],
  },
  {
    id: 'reflejo-movimiento',
    titulo_es: 'Del pensamiento al gesto: doblar el codo',
    titulo_en: 'From thought to gesture: bending the elbow',
    descripcion_es: 'Sigue una orden motora desde la corteza hasta el bíceps, y cómo el cerebelo la corrige.',
    descripcion_en: 'Follow a motor command from the cortex to the biceps, and see how the cerebellum corrects it.',
    duracion_min: 5,
    steps: [
      {
        structureId: 'cerebro', systemId: 'nervioso',
        titulo_es: 'La orden', titulo_en: 'The command',
        explicacion_es: 'Para doblar el codo, la corteza motora primaria envía la orden. Sus neuronas, llamadas motoneuronas superiores, forman la vía piramidal o corticoespinal.',
        explicacion_en: 'To bend the elbow, the primary motor cortex sends the command. Its neurons, called upper motor neurons, form the pyramidal or corticospinal tract.',
      },
      {
        structureId: 'medula-espinal', systemId: 'nervioso',
        titulo_es: 'Cruce y relevo', titulo_en: 'Crossing and relay',
        explicacion_es: 'La vía piramidal cruza al lado opuesto en el bulbo raquídeo y baja por la médula hasta los segmentos C5–C6. Allí hace sinapsis con las motoneuronas inferiores, que envían sus axones fuera de la médula.',
        explicacion_en: 'The pyramidal tract crosses to the opposite side in the medulla oblongata and runs down the cord to segments C5–C6. There it synapses with the lower motor neurons, which send their axons out of the cord.',
      },
      {
        structureId: 'plexo-braquial', systemId: 'nervioso',
        titulo_es: 'Reparto de la señal', titulo_en: 'Routing the signal',
        explicacion_es: 'Los axones salen por las raíces cervicales y se reorganizan en el plexo braquial, una red de nervios en el cuello y la axila. De él nace el nervio musculocutáneo, que lleva la señal al bíceps.',
        explicacion_en: 'The axons leave through the cervical roots and are regrouped in the brachial plexus, a network of nerves in the neck and armpit. From it arises the musculocutaneous nerve, which carries the signal to the biceps.',
      },
      {
        structureId: 'biceps-braquial', systemId: 'muscular',
        titulo_es: 'La placa motora', titulo_en: 'The motor end plate',
        explicacion_es: 'En la placa motora, el nervio libera acetilcolina, que excita la membrana de la fibra muscular. Los filamentos de actina y miosina se deslizan entre sí y el músculo se acorta.',
        explicacion_en: 'At the motor end plate, the nerve releases acetylcholine, which excites the membrane of the muscle fiber. The actin and myosin filaments slide past each other and the muscle shortens.',
      },
      {
        structureId: 'radio', systemId: 'esqueletico',
        titulo_es: 'La palanca', titulo_en: 'The lever',
        explicacion_es: 'El tendón del bíceps tira del radio, cerca del codo, y el antebrazo se flexiona. Como el radio también puede girar, el bíceps además pone la palma hacia arriba.',
        explicacion_en: 'The biceps tendon pulls on the radius, near the elbow, and the forearm bends. Because the radius can also rotate, the biceps also turns the palm upward.',
      },
      {
        structureId: 'cerebelo', systemId: 'nervioso',
        titulo_es: 'Corrección en tiempo real', titulo_en: 'Real-time correction',
        explicacion_es: 'Los receptores de los músculos y las articulaciones informan al cerebelo de cómo va el movimiento. El cerebelo compara esa información con la orden original y ajusta la fuerza y el momento de cada músculo.',
        explicacion_en: 'Receptors in the muscles and joints tell the cerebellum how the movement is going. The cerebellum compares that information with the original command and adjusts the force and timing of each muscle.',
      },
    ],
  },
  {
    id: 'defensa-inmunitaria',
    titulo_es: 'La defensa del cuerpo',
    titulo_en: 'The body\'s defenses',
    descripcion_es: 'De la primera barrera a los órganos donde nacen y se entrenan los glóbulos blancos.',
    descripcion_en: 'From the first barrier to the organs where white blood cells are born and trained.',
    duracion_min: 6,
    steps: [
      {
        structureId: 'piel', systemId: 'tegumentario',
        titulo_es: 'La primera barrera', titulo_en: 'The first barrier',
        explicacion_es: 'La piel intacta impide la entrada de la mayoría de los microbios: su capa córnea es resistente y su superficie, ligeramente ácida. Cuando una herida la rompe, comienza la respuesta inmunitaria.',
        explicacion_en: 'Intact skin keeps out most microbes: its horny layer is tough and its surface slightly acidic. When a wound breaks it, the immune response begins.',
      },
      {
        structureId: 'ganglios-regionales', systemId: 'linfatico_inmunitario',
        titulo_es: 'Los puestos de control', titulo_en: 'The checkpoints',
        explicacion_es: 'La linfa de la zona herida drena hacia los ganglios más cercanos, por ejemplo los de la axila o la ingle. Por eso, ante una infección en la mano, pueden inflamarse los ganglios de la axila.',
        explicacion_en: 'Lymph from the wounded area drains to the nearest lymph nodes, for example those in the armpit or groin. That is why an infection in the hand can make the armpit nodes swell.',
      },
      {
        structureId: 'ganglio-linfatico', systemId: 'linfatico_inmunitario',
        titulo_es: 'Donde se organiza la respuesta', titulo_en: 'Where the response is organized',
        explicacion_es: 'Dentro del ganglio, los linfocitos revisan la linfa en busca de microbios. Si reconocen uno, se multiplican, y el ganglio se agranda y duele.',
        explicacion_en: 'Inside the node, lymphocytes inspect the lymph for microbes. If they recognize one, they multiply, and the node enlarges and becomes tender.',
      },
      {
        structureId: 'conducto-toracico', systemId: 'linfatico_inmunitario',
        titulo_es: 'Regreso a la sangre', titulo_en: 'Back to the blood',
        explicacion_es: 'La linfa filtrada sigue por vasos cada vez mayores hasta el conducto torácico, el principal del cuerpo. Este la vierte en las venas de la base del cuello, en la unión de la yugular interna y la subclavia izquierdas.',
        explicacion_en: 'The filtered lymph flows through ever larger vessels to the thoracic duct, the body\'s main lymphatic vessel. It empties into the veins at the base of the neck, where the left internal jugular and subclavian veins meet.',
      },
      {
        structureId: 'bazo', systemId: 'linfatico_inmunitario',
        titulo_es: 'Filtro de la sangre', titulo_en: 'Blood filter',
        explicacion_es: 'El bazo hace con la sangre lo que los ganglios hacen con la linfa: detecta microbios y produce anticuerpos. Además elimina los glóbulos rojos viejos.',
        explicacion_en: 'The spleen does for the blood what the lymph nodes do for the lymph: it detects microbes and makes antibodies. It also removes old red blood cells.',
      },
      {
        structureId: 'timo', systemId: 'linfatico_inmunitario',
        titulo_es: 'La escuela de los linfocitos T', titulo_en: 'School for T cells',
        explicacion_es: 'En el timo, los linfocitos T aprenden a reconocer lo extraño y a tolerar lo propio; los que atacarían al propio cuerpo se eliminan. Es grande en la infancia y en la adultez se va reemplazando por grasa.',
        explicacion_en: 'In the thymus, T cells learn to recognize what is foreign and to tolerate what is self; those that would attack the body are eliminated. It is large in childhood and is gradually replaced by fat in adulthood.',
      },
      {
        structureId: 'medula-osea-roja', systemId: 'linfatico_inmunitario',
        titulo_es: 'Donde todo empieza', titulo_en: 'Where it all begins',
        explicacion_es: 'En la médula ósea roja nacen todas las células de la sangre, incluidos los glóbulos blancos que defienden al cuerpo. Allí también maduran los linfocitos B.',
        explicacion_en: 'All blood cells are born in the red bone marrow, including the white blood cells that defend the body. B cells also mature there.',
      },
    ],
  },
  {
    id: 'hormonas-cadena',
    titulo_es: 'Mensajeros químicos: las hormonas',
    titulo_en: 'Chemical messengers: hormones',
    descripcion_es: 'Cómo el hipotálamo y la hipófisis dirigen al resto de las glándulas.',
    descripcion_en: 'How the hypothalamus and pituitary direct the other glands.',
    duracion_min: 5,
    steps: [
      {
        structureId: 'hipotalamo', systemId: 'endocrino',
        titulo_es: 'El director', titulo_en: 'The director',
        explicacion_es: 'El hipotálamo vigila la temperatura, el hambre, la sed y el nivel de muchas hormonas. Cuando hace falta, libera hormonas liberadoras que viajan por una pequeña red de vasos hasta la hipófisis.',
        explicacion_en: 'The hypothalamus monitors temperature, hunger, thirst and the levels of many hormones. When needed, it releases releasing hormones that travel through a small network of vessels to the pituitary.',
      },
      {
        structureId: 'hipofisis', systemId: 'endocrino',
        titulo_es: 'La glándula maestra', titulo_en: 'The master gland',
        explicacion_es: 'Siguiendo esas órdenes, la hipófisis anterior secreta hormonas que estimulan a otras glándulas: la tiroides, las suprarrenales y las gónadas. Su lóbulo posterior libera hormonas fabricadas en el hipotálamo, como la antidiurética.',
        explicacion_en: 'Following those orders, the anterior pituitary secretes hormones that stimulate other glands: the thyroid, the adrenals and the gonads. Its posterior lobe releases hormones made in the hypothalamus, such as antidiuretic hormone.',
      },
      {
        structureId: 'tiroides', systemId: 'endocrino',
        titulo_es: 'El ritmo del metabolismo', titulo_en: 'The pace of metabolism',
        explicacion_es: 'La hormona estimulante de la tiroides (TSH) hace que la tiroides produzca T3 y T4, que regulan la velocidad del metabolismo. Cuando hay suficiente, frenan al hipotálamo y a la hipófisis: es la retroalimentación negativa.',
        explicacion_en: 'Thyroid-stimulating hormone (TSH) makes the thyroid produce T3 and T4, which set the pace of metabolism. When there is enough, they hold back the hypothalamus and pituitary: this is negative feedback.',
      },
      {
        structureId: 'glandula-suprarrenal', systemId: 'endocrino',
        titulo_es: 'Respuesta al estrés', titulo_en: 'Stress response',
        explicacion_es: 'La ACTH de la hipófisis estimula la corteza suprarrenal, que libera cortisol para movilizar energía ante el estrés. La médula suprarrenal, en cambio, responde al sistema nervioso y libera adrenalina en segundos.',
        explicacion_en: 'ACTH from the pituitary stimulates the adrenal cortex, which releases cortisol to mobilize energy under stress. The adrenal medulla, by contrast, responds to the nervous system and releases adrenaline within seconds.',
      },
      {
        structureId: 'islotes-pancreaticos', systemId: 'endocrino',
        titulo_es: 'Una glándula independiente', titulo_en: 'An independent gland',
        explicacion_es: 'No todas las glándulas dependen de la hipófisis. Los islotes del páncreas miden la glucosa de la sangre y liberan insulina para bajarla o glucagón para subirla.',
        explicacion_en: 'Not every gland depends on the pituitary. The pancreatic islets measure blood glucose and release insulin to lower it or glucagon to raise it.',
      },
      {
        structureId: 'testiculo', systemId: 'reproductor',
        titulo_es: 'Las gónadas', titulo_en: 'The gonads',
        explicacion_es: 'La hipófisis libera LH y FSH, que estimulan las gónadas: en el hombre, los testículos producen testosterona y espermatozoides; en la mujer, los ovarios producen estrógenos, progesterona y óvulos. El modelo 3D es masculino, por eso el recorrido termina en el testículo.',
        explicacion_en: 'The pituitary releases LH and FSH, which stimulate the gonads: in men, the testes produce testosterone and sperm; in women, the ovaries produce estrogens, progesterone and eggs. The 3D model is male, which is why the tour ends at the testis.',
      },
    ],
  },
  {
    id: 'esqueleto-marcha',
    titulo_es: 'Huesos que caminan',
    titulo_en: 'Bones that walk',
    descripcion_es: 'La cadena de huesos de la pelvis al pie y el músculo que mantiene la pelvis nivelada.',
    descripcion_en: 'The chain of bones from pelvis to foot, and the muscle that keeps the pelvis level.',
    duracion_min: 6,
    steps: [
      {
        structureId: 'hueso-coxal', systemId: 'esqueletico',
        titulo_es: 'La base', titulo_en: 'The base',
        explicacion_es: 'Los dos huesos coxales y el sacro forman el anillo de la pelvis, que recibe el peso del tronco. En el acetábulo encaja la cabeza del fémur y se forma la cadera.',
        explicacion_en: 'The two hip bones and the sacrum form the pelvic ring, which receives the weight of the trunk. The head of the femur fits into the acetabulum, forming the hip joint.',
      },
      {
        structureId: 'sacro', systemId: 'esqueletico',
        titulo_es: 'Transmisión del peso', titulo_en: 'Passing on the load',
        explicacion_es: 'El peso de la columna llega al sacro y pasa a los coxales por las articulaciones sacroilíacas. Son articulaciones muy firmes, casi inmóviles, ideales para transmitir carga.',
        explicacion_en: 'The weight of the spine reaches the sacrum and passes to the hip bones through the sacroiliac joints. These are very firm, almost immobile joints, ideal for transmitting load.',
      },
      {
        structureId: 'femur', systemId: 'esqueletico',
        titulo_es: 'El hueso más largo', titulo_en: 'The longest bone',
        explicacion_es: 'Desde la cadera, el peso baja por el fémur, cuyo cuello angulado aleja la diáfisis de la pelvis. Es el hueso más largo y resistente del cuerpo.',
        explicacion_en: 'From the hip, the weight travels down the femur, whose angled neck holds the shaft away from the pelvis. It is the longest and strongest bone in the body.',
      },
      {
        structureId: 'rotula', systemId: 'esqueletico',
        titulo_es: 'La polea de la rodilla', titulo_en: 'The knee\'s pulley',
        explicacion_es: 'Delante de la rodilla, la rótula aumenta la palanca del cuádriceps para extenderla. Sin ella, subir escaleras o levantarse de una silla costaría mucho más.',
        explicacion_en: 'At the front of the knee, the patella increases the leverage of the quadriceps to straighten it. Without it, climbing stairs or getting up from a chair would be much harder.',
      },
      {
        structureId: 'tibia', systemId: 'esqueletico',
        titulo_es: 'El pilar de la pierna', titulo_en: 'The pillar of the leg',
        explicacion_es: 'La tibia recibe casi todo el peso del fémur en la rodilla y lo lleva hasta el tobillo. Su borde anterior se palpa bajo la piel: es la espinilla.',
        explicacion_en: 'The tibia takes almost all of the weight from the femur at the knee and carries it to the ankle. Its front edge can be felt under the skin: it is the shin.',
      },
      {
        structureId: 'perone', systemId: 'esqueletico',
        titulo_es: 'El estabilizador', titulo_en: 'The stabilizer',
        explicacion_es: 'El peroné apenas soporta peso, pero su extremo inferior, el maléolo lateral, sujeta el tobillo por fuera. Además, muchos músculos de la pierna se insertan en él.',
        explicacion_en: 'The fibula bears little weight, but its lower end, the lateral malleolus, braces the ankle on the outside. Many leg muscles also attach to it.',
      },
      {
        structureId: 'huesos-pie', systemId: 'esqueletico',
        titulo_es: 'Amortiguador y trampolín', titulo_en: 'Shock absorber and springboard',
        explicacion_es: 'Los 26 huesos del pie forman arcos que amortiguan el choque del talón y luego sirven de palanca para impulsar el paso. En cada zancada, el peso pasa del talón al dedo gordo.',
        explicacion_en: 'The 26 bones of the foot form arches that absorb the heel strike and then act as a lever to push off. With every stride, the weight rolls from the heel to the big toe.',
      },
      {
        structureId: 'gluteo-medio', systemId: 'muscular',
        titulo_es: 'Mantener el equilibrio', titulo_en: 'Keeping balance',
        explicacion_es: 'Al levantar un pie para dar el paso, el glúteo medio del lado de apoyo impide que la pelvis caiga hacia el otro lado. Si está débil, la pelvis cae y aparece el signo de Trendelenburg.',
        explicacion_en: 'When one foot lifts to take a step, the gluteus medius on the standing side keeps the pelvis from dropping to the other side. If it is weak, the pelvis drops and the Trendelenburg sign appears.',
      },
    ],
  },
];
