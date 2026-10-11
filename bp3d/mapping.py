# Única tabla de mapeo del pipeline 3D (la lee build_glb.py).
#
# MAP: id de estructura -> nombres de concepto de BodyParts3D (en inglés, exactos).
#      Cada id es un nodo seleccionable dentro del GLB de su sistema.
MAP = {
  'craneo': ['neurocranium', 'viscerocranium'],
  'mandibula': ['mandible'],
  'columna-vertebral': ['vertebral column'],
  'costillas': ['rib'],
  'esternon': ['sternum'],
  'escapula': ['right scapula', 'left scapula'],
  'humero': ['right humerus', 'left humerus'],
  'femur': ['right femur', 'left femur'],
  'clavicula': ['clavicle'],
  'radio': ['radius'],
  'cubito': ['ulna'],
  'huesos-mano': ['carpal bone', 'metacarpal bone', 'phalanx of finger'],
  'hueso-coxal': ['hip bone'],
  'sacro': ['sacrum'],
  'rotula': ['patella'],
  'tibia': ['tibia'],
  'perone': ['fibula'],
  'huesos-pie': ['tarsal bone', 'metatarsal bone', 'phalanx of toe'],
  'hioides': ['hyoid bone'],
  'esternocleidomastoideo': ['sternocleidomastoid'],
  'trapecio': ['ascending part of trapezius', 'transverse part of trapezius', 'descending part of trapezius'],
  'deltoides': ['clavicular part of deltoid', 'acromial part of deltoid', 'spinal part of deltoid'],
  'pectoral-mayor': ['right pectoralis major', 'left pectoralis major'],
  'diafragma': ['diaphragm'],
  'gluteo-mayor': ['gluteus maximus'],
  'cerebro': ['right cerebral hemisphere', 'left cerebral hemisphere'],
  'cerebelo': ['cerebellum'],
  'tronco-encefalico': ['brainstem'],
  'medula-espinal': ['spinal cord'],
  'nervio-optico': ['optic nerve'],
  # Antes que corazon: con la regla primero-gana, la estructura específica conserva las mallas compartidas.
  'arterias-coronarias': ['coronary artery'],
  'corazon': ['heart'],
  'auricula-derecha': ['right atrium'],
  'ventriculo-izquierdo': ['left ventricle'],
  'aorta': ['aorta'],
  'arteria-carotida-comun': ['right common carotid artery', 'left common carotid artery'],
  'vena-cava-superior': ['superior vena cava'],
  'vena-cava-inferior': ['inferior vena cava'],
  'cavidad-nasal': ['nasal septum', 'inferior nasal concha', 'nasal cartilage'],
  'faringe': ['muscle of pharynx'],
  'laringe': ['thyroid cartilage', 'cricoid cartilage'],
  'traquea': ['trachea'],
  'bronquios-principales': ['right main bronchus', 'left main bronchus'],
  'pulmones': ['right lung', 'left lung'],
  'cavidad-oral': ['tongue', 'soft palate'],
  'esofago': ['esophagus'],
  'estomago': ['stomach'],
  'higado': ['hepatovenous segment ii', 'hepatovenous segment iii', 'hepatovenous segment iv', 'hepatovenous segment v',
             'hepatovenous segment vi', 'hepatovenous segment vii', 'hepatovenous segment viii', 'caudate lobe of liver'],
  'vesicula-biliar': ['gallbladder'],
  'pancreas': ['pancreas'],
  'intestino-delgado': ['small intestine'],
  'intestino-grueso': ['large intestine'],
  'rinon': ['right kidney', 'left kidney'],
  'ureter': ['right ureter', 'left ureter'],
  'vejiga-urinaria': ['urinary bladder'],
  'uretra': ['urethra'],
  'hipotalamo': ['hypothalamus'],
  'hipofisis': ['pituitary gland'],
  'pineal': ['pineal body'],
  'glandula-suprarrenal': ['right adrenal gland', 'left adrenal gland'],
  'bazo': ['spleen'],
  'timo': ['thymus'],
  'piel': ['skin'],
  'testiculo': ['testis'],
  'epididimo': ['epididymis'],
  'prostata': ['prostate'],
  'globo-ocular': ['right eyeball', 'left eyeball'],
  'cornea': ['right cornea', 'left cornea'],
  'cristalino': ['right lens', 'left lens'],
  'nervio-trigemino': ['branch of trigeminal nerve'],
  'retina': ['optic part of right retina', 'optic part of left retina'],
}

# Caras máximas tras la simplificación, por estructura (DEFAULT_BUDGET si no figura) y por malla de contexto.
DEFAULT_BUDGET = 6000
BUDGET = {
  'piel': 60000, 'pulmones': 14000, 'higado': 9000, 'corazon': 12000, 'intestino-delgado': 14000, 'intestino-grueso': 9000,
  'cerebro': 16000, 'columna-vertebral': 16000, 'craneo': 16000, 'costillas': 10000,
  'huesos-mano': 12000, 'huesos-pie': 12000, 'dientes': 8000, 'arterias-pulmonares': 8000, 'venas-pulmonares': 8000,
}
CONTEXT_BUDGET = {'esqueletico': 30000, 'muscular': 70000, 'cardiovascular': 14000}

# Estructuras que no usan la malla original sino un envoltorio por vóxeles: una lista de nombres
# por pieza (cada pieza se envuelve por separado). Ver wrap() en build_glb.py.
WRAP = {'pulmones': [['right lung'], ['left lung']]}

# CONTEXT: mallas de contexto por sistema (nodo ctx__<sistema>): se ven pero no se pueden seleccionar.
CONTEXT = {
  'muscular': ['short head of biceps brachii', 'long head of biceps brachii', 'long head of triceps brachii', 'lateral head of triceps brachii', 'rectus femoris', 'vastus lateralis', 'vastus medialis', 'sartorius', 'head of gastrocnemius', 'serratus anterior', 'external oblique', 'tibialis anterior', 'brachioradialis', 'gluteus medius', 'semitendinosus', 'adductor longus', 'soleus',
    'vastus intermedius', 'long head of biceps femoris', 'gracilis', 'semimembranosus', 'rhomboid major',
    'infraspinatus', 'teres major', 'psoas major', 'pectoralis minor', 'medial head of triceps brachii', 'brachialis',
    'flexor carpi radialis', 'extensor digitorum', 'extensor carpi radialis longus', 'flexor digitorum superficialis',
    'tibialis posterior', 'extensor digitorum longus', 'iliacus', 'supraspinatus'],
  'cardiovascular': ['subclavian artery', 'brachiocephalic artery', 'common iliac artery', 'external iliac artery', 'femoral artery', 'brachial artery', 'pulmonary trunk', 'internal jugular vein', 'femoral vein', 'brachiocephalic vein',
    'pulmonary artery', 'popliteal artery', 'anterior tibial artery', 'posterior tibial artery',
    'radial artery', 'ulnar artery', 'axillary artery', 'subclavian vein', 'axillary vein', 'great saphenous vein',
    'popliteal vein', 'hepatic portal vein', 'pulmonary vein', 'renal artery', 'internal carotid artery',
    'common iliac vein', 'external iliac vein'],
}
