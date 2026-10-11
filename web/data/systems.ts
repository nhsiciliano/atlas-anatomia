import {
  Bone, Activity, Brain, Heart, Wind, UtensilsCrossed,
  Droplets, Gauge, Shield, Layers, Baby, Eye,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SystemId =
  | 'esqueletico' | 'muscular' | 'nervioso' | 'cardiovascular'
  | 'respiratorio' | 'digestivo' | 'urinario' | 'endocrino'
  | 'linfatico_inmunitario' | 'tegumentario' | 'reproductor'
  | 'organos_sensoriales';

export type ViewId = 'anterior' | 'posterior' | 'lateral';

export type RegionId =
  | 'cabeza' | 'cuello' | 'torax' | 'abdomen' | 'pelvis'
  | 'espalda' | 'extremidades_superiores' | 'extremidades_inferiores';

export interface SystemDef {
  id: SystemId;
  nombre_es: string;
  nombre_en: string;
  descripcion_es: string;
  color: string;
  colorDark: string;
  icon: LucideIcon;
  order: number;
}

export const SYSTEMS: SystemDef[] = [
  {
    id: 'esqueletico', nombre_es: 'Esquelético', nombre_en: 'Skeletal',
    descripcion_es: 'Huesos, articulaciones y cartílagos que sostienen el cuerpo.',
    color: '#E9DFC9', colorDark: '#B9A783',
    icon: Bone, order: 0,
  },
  {
    id: 'muscular', nombre_es: 'Muscular', nombre_en: 'Muscular',
    descripcion_es: 'Músculos esqueléticos que producen movimiento y estabilidad.',
    color: '#B8574A', colorDark: '#8E3D33',
    icon: Activity, order: 1,
  },
  {
    id: 'nervioso', nombre_es: 'Nervioso', nombre_en: 'Nervous',
    descripcion_es: 'Encéfalo, médula espinal y nervios periféricos.',
    color: '#E5C94A', colorDark: '#B59A22',
    icon: Brain, order: 2,
  },
  {
    id: 'cardiovascular', nombre_es: 'Cardiovascular', nombre_en: 'Cardiovascular',
    descripcion_es: 'Corazón y vasos sanguíneos que transportan sangre.',
    color: '#D8423A', colorDark: '#A82D26',
    icon: Heart, order: 3,
  },
  {
    id: 'respiratorio', nombre_es: 'Respiratorio', nombre_en: 'Respiratory',
    descripcion_es: 'Vías aéreas y pulmones para el intercambio gaseoso.',
    color: '#E6A6A0', colorDark: '#C27B74',
    icon: Wind, order: 4,
  },
  {
    id: 'digestivo', nombre_es: 'Digestivo', nombre_en: 'Digestive',
    descripcion_es: 'Órganos del tubo digestivo y glándulas anexas.',
    color: '#C98A5E', colorDark: '#9C653E',
    icon: UtensilsCrossed, order: 5,
  },
  {
    id: 'urinario', nombre_es: 'Urinario', nombre_en: 'Urinary',
    descripcion_es: 'Riñones, uréteres, vejiga y uretra.',
    color: '#D9B44A', colorDark: '#A9862A',
    icon: Droplets, order: 6,
  },
  {
    id: 'endocrino', nombre_es: 'Endocrino', nombre_en: 'Endocrine',
    descripcion_es: 'Glándulas que secretan hormonas al torrente sanguíneo.',
    color: '#9C7BD0', colorDark: '#7556AC',
    icon: Gauge, order: 7,
  },
  {
    id: 'linfatico_inmunitario', nombre_es: 'Linfático / Inmunitario', nombre_en: 'Lymphatic / Immune',
    descripcion_es: 'Ganglios, vasos linfáticos y órganos de defensa.',
    color: '#7DBF8E', colorDark: '#55966A',
    icon: Shield, order: 8,
  },
  {
    id: 'tegumentario', nombre_es: 'Tegumentario', nombre_en: 'Integumentary',
    descripcion_es: 'Piel, pelo, uñas y glándulas cutáneas.',
    color: '#D9B39A', colorDark: '#AE8770',
    icon: Layers, order: 9,
  },
  {
    id: 'reproductor', nombre_es: 'Reproductor', nombre_en: 'Reproductive',
    descripcion_es: 'Órganos reproductores masculinos y femeninos.',
    color: '#D78FB0', colorDark: '#B06689',
    icon: Baby, order: 10,
  },
  {
    id: 'organos_sensoriales', nombre_es: 'Órganos sensoriales', nombre_en: 'Sensory Organs',
    descripcion_es: 'Ojo, oído, olfato y gusto.',
    color: '#6FB6D6', colorDark: '#4790B0',
    icon: Eye, order: 11,
  },
];

export const SYSTEM_MAP = Object.fromEntries(SYSTEMS.map(s => [s.id, s])) as Record<SystemId, SystemDef>;

export const REGIONS: { id: RegionId; nombre_es: string; nombre_en: string }[] = [
  { id: 'cabeza', nombre_es: 'Cabeza', nombre_en: 'Head' },
  { id: 'cuello', nombre_es: 'Cuello', nombre_en: 'Neck' },
  { id: 'torax', nombre_es: 'Tórax', nombre_en: 'Thorax' },
  { id: 'abdomen', nombre_es: 'Abdomen', nombre_en: 'Abdomen' },
  { id: 'pelvis', nombre_es: 'Pelvis', nombre_en: 'Pelvis' },
  { id: 'espalda', nombre_es: 'Espalda', nombre_en: 'Back' },
  { id: 'extremidades_superiores', nombre_es: 'Extremidades superiores', nombre_en: 'Upper limbs' },
  { id: 'extremidades_inferiores', nombre_es: 'Extremidades inferiores', nombre_en: 'Lower limbs' },
];

export const VIEWS: { id: ViewId; nombre_es: string; nombre_en: string }[] = [
  { id: 'anterior', nombre_es: 'Anterior (frontal)', nombre_en: 'Anterior (front)' },
  { id: 'posterior', nombre_es: 'Posterior (dorsal)', nombre_en: 'Posterior (back)' },
  { id: 'lateral', nombre_es: 'Lateral (derecho)', nombre_en: 'Lateral (right)' },
];
