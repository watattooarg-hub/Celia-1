export interface ServiceItem {
  id: string;
  name: string;
  category: 'Corte & Estilo' | 'Color & Luz' | 'Tratamientos & Alisados' | 'Otros';
  description: string;
  durationApprox: string;
  badge?: string;
}

export interface Appointment {
  id: string; // e.g. "CF-9482"
  clientName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  otherDetails?: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM", e.g. "14:00"
  createdAt: string; // ISO string
  status: 'active' | 'cancelled' | 'rescheduled';
  notes?: string;
}

export interface TimeSlot {
  time: string; // "09:00", "10:00", etc.
  available: boolean;
  reason?: string;
}
