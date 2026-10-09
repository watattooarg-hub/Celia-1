import { ServiceItem } from '../types';

export const SALON_SERVICES: ServiceItem[] = [
  {
    id: 'corte-mujer',
    name: 'Corte de pelo mujer',
    category: 'Corte & Estilo',
    description: 'Corte de precisión personalizado según visagismo facial y textura del cabello.',
    durationApprox: '50 min',
    badge: 'Popular'
  },
  {
    id: 'corte-hombre',
    name: 'Corte de pelo hombre',
    category: 'Corte & Estilo',
    description: 'Tijera y máquina de alta definición, perfilado y acabado sofisticado.',
    durationApprox: '40 min'
  },
  {
    id: 'brushing',
    name: 'Brushing',
    category: 'Corte & Estilo',
    description: 'Modelado térmico y pulido profesional para un movimiento y brillo extraordinario.',
    durationApprox: '45 min'
  },
  {
    id: 'peinados-fiesta',
    name: 'Peinados de fiesta',
    category: 'Corte & Estilo',
    description: 'Recogidos de alta costura, ondas al agua o estilos de gala para ocasiones especiales.',
    durationApprox: '75 min',
    badge: 'Exclusivo'
  },
  {
    id: 'coloracion-global',
    name: 'Coloración global',
    category: 'Color & Luz',
    description: 'Pigmentos puros de vanguardia para cobertura perfecta y máxima luminosidad.',
    durationApprox: '90 min'
  },
  {
    id: 'balayage',
    name: 'Balayage',
    category: 'Color & Luz',
    description: 'Degradé artesanal a mano alzada para un efecto iluminado multidimensional.',
    durationApprox: '150 min',
    badge: 'Destacado'
  },
  {
    id: 'reflejos',
    name: 'Reflejos',
    category: 'Color & Luz',
    description: 'Mechas delicadas y precisas con matización personalizada.',
    durationApprox: '120 min'
  },
  {
    id: 'alisado-laser',
    name: 'Alisado láser',
    category: 'Tratamientos & Alisados',
    description: 'Tecnología láser fotónica para sellado de cutícula, lacio perfecto y cero frizz.',
    durationApprox: '150 min',
    badge: 'Premium'
  },
  {
    id: 'celulas-madre',
    name: 'Células madre',
    category: 'Tratamientos & Alisados',
    description: 'Regeneración celular capilar intensiva para cabellos dañados o afinados.',
    durationApprox: '75 min'
  },
  {
    id: 'botox-capilar',
    name: 'Botox capilar',
    category: 'Tratamientos & Alisados',
    description: 'Relleno de fibra capilar con ácido hialurónico y colágeno para máxima sedosidad.',
    durationApprox: '60 min'
  },
  {
    id: 'otros',
    name: 'Otros',
    category: 'Otros',
    description: 'Consulta o servicio personalizado a coordinar directamente con Celia Figueredo.',
    durationApprox: 'A convenir'
  }
];

export interface DaySchedule {
  dayKey: string;
  dayShort: string;
  dayFull: string;
  hoursText: string;
  isClosed: boolean;
  openHour?: number;
  closeHour?: number;
}

export const DEFAULT_WEEKLY_SCHEDULE: DaySchedule[] = [
  { dayKey: 'lun', dayShort: 'Lun', dayFull: 'Lunes', hoursText: 'Cerrado', isClosed: true },
  { dayKey: 'mar', dayShort: 'Mar', dayFull: 'Martes', hoursText: 'de 11 a 18 hs', isClosed: false, openHour: 11, closeHour: 18 },
  { dayKey: 'mie', dayShort: 'Mie', dayFull: 'Miércoles', hoursText: 'de 11 a 18 hs', isClosed: false, openHour: 11, closeHour: 18 },
  { dayKey: 'jue', dayShort: 'Jue', dayFull: 'Jueves', hoursText: 'de 11 a 18 hs', isClosed: false, openHour: 11, closeHour: 18 },
  { dayKey: 'vie', dayShort: 'Vie', dayFull: 'Viernes', hoursText: 'de 11 a 18 hs', isClosed: false, openHour: 11, closeHour: 18 },
  { dayKey: 'sab', dayShort: 'Sab', dayFull: 'Sábado', hoursText: 'de 11 a 18 hs', isClosed: false, openHour: 11, closeHour: 18 },
  { dayKey: 'dom', dayShort: 'Dom', dayFull: 'Domingo', hoursText: 'Cerrado', isClosed: true }
];

export const SALON_INFO = {
  name: 'Studio Celia Figueredo',
  tagline: 'ESTUDIO EXCLUSIVO • DESDE 2016',
  slogan: 'Un espacio donde la precisión, la experiencia y el cuidado se encuentran para crear una versión de vos que te represente.',
  address: {
    street: 'Av. Santa Fe 2450, Local 47, 1.er piso',
    reference: 'Galería Americana • Esquina Av. Pueyrredón',
    neighborhood: 'Recoleta, Ciudad Autónoma de Buenos Aires'
  },
  whatsapp: '+5491165804616',
  whatsappRaw: '5491165804616',
  logoUrl: 'https://iili.io/nGb1aHv.png',
  websiteUrl: 'https://celiafigueredo.com.ar/',
  websiteEstilosUrl: 'https://celiafigueredo.com.ar/#estilos',
  websiteServicesUrl: 'https://celiafigueredo.com.ar/#servicios',
  websiteOpinionesUrl: 'https://celiafigueredo.com.ar/#opiniones',
  websiteFaqUrl: '/preguntas.html',
  mapsUrl: 'https://maps.app.goo.gl/3xnF5ZwrPzLt5A8Q6',
  instagramUrl: 'https://www.instagram.com/studioceliabelleza/',
  openingHour: 11, // 11 AM
  closingHour: 18, // 18 PM (6 PM)
  closedDays: [0, 1], // 0 is Sunday, 1 is Monday (both closed on Google Maps)
  cancellationHoursLimit: 36 // 36 hours required notice
};
