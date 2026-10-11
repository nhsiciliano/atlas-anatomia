export interface ReferenceSource {
  id: string;
  nombre: string;
  shortName: string;
  autor: string;
  tipo: string;
  url: string;
  url_en?: string;
  isbn?: string;
  descripcion_es: string;
  descripcion_en: string;
}

export const REFERENCES: ReferenceSource[] = [
  {
    id: 'fipat-ta2',
    nombre: 'Terminologia Anatomica, 2nd edition (TA2)',
    shortName: 'FIPAT TA2',
    autor: 'Federative International Programme for Anatomical Terminology (FIPAT)',
    tipo: 'Nomenclatura oficial',
    url: 'https://fipat.library.dal.ca/terminologia-anatomica/',
    descripcion_es: 'Fuente de los términos latinos normalizados utilizados en esta aplicación.',
    descripcion_en: 'Source of the standardized Latin terms used in this application.',
  },
  {
    id: 'grays-42',
    nombre: "Gray's Anatomy: The Anatomical Basis of Clinical Practice, 42nd ed.",
    shortName: "Gray's 42e",
    autor: 'Standring S. (ed.), Elsevier',
    tipo: 'Tratado de referencia',
    isbn: '978-0-7020-7705-0',
    url: 'https://shop.elsevier.com/books/grays-anatomy/standring/978-0-7020-7705-0',
    descripcion_es: 'Referencia anatómica macroscópica, relaciones topográficas y variaciones.',
    descripcion_en: 'Reference for gross anatomy, topographic relationships and variations.',
  },
  {
    id: 'openstax-ap2',
    nombre: 'Anatomy and Physiology 2e',
    shortName: 'OpenStax AP2e',
    autor: 'OpenStax, Rice University',
    tipo: 'Libro abierto (CC BY 4.0)',
    url: 'https://openstax.org/details/books/anatomy-and-physiology-2e',
    descripcion_es: 'Explicaciones didácticas de funciones y mecanismos fisiológicos.',
    descripcion_en: 'Didactic explanations of physiological functions and mechanisms.',
  },
  {
    id: 'medlineplus',
    nombre: 'MedlinePlus: Health Topics',
    shortName: 'MedlinePlus',
    autor: 'U.S. National Library of Medicine',
    tipo: 'Portal sanitario público',
    url: 'https://medlineplus.gov/',
    descripcion_es: 'Contexto funcional y divulgación sanitaria accesible.',
    descripcion_en: 'Functional context and accessible health information.',
  },
  {
    id: 'ncbi-bookshelf',
    nombre: 'NCBI Bookshelf — StatPearls & otros textos',
    shortName: 'NCBI Books',
    autor: 'National Center for Biotechnology Information, NIH',
    tipo: 'Biblioteca biomédica abierta',
    url: 'https://www.ncbi.nlm.nih.gov/books/',
    descripcion_es: 'Revisiones biomédicas y anatomía funcional de apoyo.',
    descripcion_en: 'Supporting biomedical reviews and functional anatomy.',
  },
  {
    id: 'statpearls',
    nombre: 'StatPearls',
    shortName: 'StatPearls',
    autor: 'StatPearls Publishing, NCBI Bookshelf (NIH)',
    tipo: 'Manual clínico en línea',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK430685/',
    descripcion_es: 'Revisiones clínicas breves, usadas como apoyo para la correlación clínica introductoria.',
    descripcion_en: 'Brief clinical reviews, used as support for the introductory clinical correlation.',
  },
];

export const REFERENCE_MAP = Object.fromEntries(REFERENCES.map(r => [r.id, r])) as Record<string, ReferenceSource>;
