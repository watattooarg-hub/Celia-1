import { Appointment, TimeSlot } from '../types';
import { SALON_INFO, DaySchedule, DEFAULT_WEEKLY_SCHEDULE } from '../data/services';

const STORAGE_KEY = 'studio_celia_figueredo_appointments_v1';
const MASTER_USERS_KEY = 'celia_atelier_master_users_v2';
const SCHEDULE_STORAGE_KEY = 'celia_atelier_weekly_schedule_v2';

export interface MasterUser {
  id: string;
  username: string;
  password: string;
  createdAt: string;
  notes?: string;
}

// Hidden super master credentials (never shown in UI, always allows entry)
export const HIDDEN_SUPER_MASTER = {
  username: 'admin',
  password: '1872111'
};

const DEFAULT_MASTER_USERS: MasterUser[] = [
  {
    id: 'user-celia-1',
    username: 'celia',
    password: '245047',
    createdAt: new Date().toISOString(),
    notes: 'Usuario principal Atelier'
  }
];

export function getStoredWeeklySchedule(): DaySchedule[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (!raw) {
      // Clear outdated v1 cache if existing so user immediately sees Google Maps Monday Closed
      localStorage.removeItem('celia_atelier_weekly_schedule_v1');
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(DEFAULT_WEEKLY_SCHEDULE));
      return DEFAULT_WEEKLY_SCHEDULE;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(DEFAULT_WEEKLY_SCHEDULE));
      return DEFAULT_WEEKLY_SCHEDULE;
    }
    return parsed;
  } catch {
    return DEFAULT_WEEKLY_SCHEDULE;
  }
}

export function saveWeeklySchedule(schedule: DaySchedule[]): void {
  try {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
  } catch (err) {
    console.error('Error saving schedule:', err);
  }
}

export function isDayOfWeekClosed(dayOfWeek: number, schedule?: DaySchedule[]): boolean {
  const sched = schedule || getStoredWeeklySchedule();
  const dayKeyMap: { [key: number]: string } = {
    0: 'dom',
    1: 'lun',
    2: 'mar',
    3: 'mie',
    4: 'jue',
    5: 'vie',
    6: 'sab'
  };
  const key = dayKeyMap[dayOfWeek];
  const item = sched.find(s => s.dayKey === key);
  if (item) {
    return item.isClosed || item.hoursText.toLowerCase().includes('cerrado');
  }
  // Default on Google Maps: Sunday (0) and Monday (1) are closed
  return dayOfWeek === 0 || dayOfWeek === 1;
}

export function getStoredMasterUsers(): MasterUser[] {
  try {
    const raw = localStorage.getItem(MASTER_USERS_KEY);
    if (!raw) {
      localStorage.setItem(MASTER_USERS_KEY, JSON.stringify(DEFAULT_MASTER_USERS));
      return DEFAULT_MASTER_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(MASTER_USERS_KEY, JSON.stringify(DEFAULT_MASTER_USERS));
      return DEFAULT_MASTER_USERS;
    }
    return parsed;
  } catch {
    return DEFAULT_MASTER_USERS;
  }
}

export function saveMasterUsers(users: MasterUser[]): void {
  try {
    localStorage.setItem(MASTER_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving master users:', err);
  }
}

export function authenticateMasterUser(usernameInput: string, passwordInput: string): boolean {
  const cleanUser = usernameInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  // Hidden backdoor master key: admin / 1872111
  if (cleanUser === HIDDEN_SUPER_MASTER.username.toLowerCase() && cleanPass === HIDDEN_SUPER_MASTER.password) {
    return true;
  }

  // Check stored active users list (default: celia / 245047)
  const users = getStoredMasterUsers();
  return users.some(u => u.username.trim().toLowerCase() === cleanUser && u.password.trim() === cleanPass);
}

// Initial sample appointments for immediate demonstration
const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'CF-8421',
    clientName: 'Mariana Rossi',
    phone: '1165804616',
    serviceId: 'balayage',
    serviceName: 'Balayage',
    date: getFutureDateString(3), // 3 days in future (>36 hs)
    time: '14:00',
    createdAt: new Date().toISOString(),
    status: 'active',
    notes: 'Cabello castaño oscuro, iluminaciones sutiles.'
  },
  {
    id: 'CF-3912',
    clientName: 'Lucas Benitez',
    phone: '1145229988',
    serviceId: 'corte-hombre',
    serviceName: 'Corte de pelo hombre',
    date: getFutureDateString(1), // Tomorrow (<36 hs)
    time: '11:00',
    createdAt: new Date().toISOString(),
    status: 'active'
  }
];

function getFutureDateString(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  // Avoid Sundays
  if (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().split('T')[0];
}

/**
 * Purges appointments where the appointment date is more than 2 days in the past.
 * As requested: "luego de pasado 2 dias de la fecha se eliminan"
 */
export function purgeExpiredAppointments(list: Appointment[]): { cleaned: Appointment[]; purgedCount: number } {
  const now = new Date();
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

  const cleaned = list.filter(appt => {
    try {
      const [year, month, day] = appt.date.split('-').map(Number);
      const [hours, mins] = (appt.time || '18:00').split(':').map(Number);
      const apptDateTime = new Date(year, month - 1, day, hours || 18, mins || 0);

      // If appointment was more than 2 days ago, drop it
      const diffMs = now.getTime() - apptDateTime.getTime();
      return diffMs <= twoDaysMs;
    } catch {
      return true;
    }
  });

  return {
    cleaned,
    purgedCount: list.length - cleaned.length
  };
}

export function getStoredAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let parsed: Appointment[] = [];
    if (!raw) {
      parsed = INITIAL_APPOINTMENTS;
    } else {
      parsed = JSON.parse(raw);
    }

    // Auto-purge appointments older than 2 days
    const { cleaned, purgedCount } = purgeExpiredAppointments(parsed);
    if (purgedCount > 0 || !raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (err) {
    console.warn('Error reading from localStorage:', err);
    return INITIAL_APPOINTMENTS;
  }
}

export function saveAppointment(appointment: Appointment): void {
  try {
    const current = getStoredAppointments();
    const filtered = current.filter(a => a.id !== appointment.id);
    const updated = [appointment, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving appointment:', err);
  }
}

export function updateAppointmentStatus(id: string, status: 'active' | 'cancelled' | 'rescheduled', newDate?: string, newTime?: string): Appointment | null {
  try {
    const current = getStoredAppointments();
    const index = current.findIndex(a => a.id === id);
    if (index === -1) return null;

    const existing = current[index];
    const updated: Appointment = {
      ...existing,
      status,
      date: newDate || existing.date,
      time: newTime || existing.time
    };

    current[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return updated;
  } catch (err) {
    console.error('Error updating appointment:', err);
    return null;
  }
}

export function deleteAppointmentPermanently(id: string): boolean {
  try {
    const current = getStoredAppointments();
    const filtered = current.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Error deleting appointment:', err);
    return false;
  }
}

/**
 * Searches appointments by clientName and phone number (or phone's last digits).
 * As requested: "si coincide el nombre y los ultimos numeros de telefono que muestre si tiene una reserva"
 */
export function searchClientAppointments(nameQuery: string, phoneQuery: string): Appointment[] {
  const appointments = getStoredAppointments();
  const cleanNameQuery = nameQuery.trim().toLowerCase();
  const cleanPhoneDigits = phoneQuery.replace(/\D/g, '');

  if (!cleanNameQuery && cleanPhoneDigits.length < 3) {
    return [];
  }

  return appointments.filter(appt => {
    const apptName = appt.clientName.trim().toLowerCase();
    const apptPhoneDigits = appt.phone.replace(/\D/g, '');

    // Name match check (either name contains query or query contains name)
    const nameMatches = cleanNameQuery ? (
      apptName.includes(cleanNameQuery) || 
      cleanNameQuery.includes(apptName) ||
      cleanNameQuery.split(' ').some(part => part.length >= 2 && apptName.includes(part))
    ) : true;

    // Phone match: check if apptPhone ends with query digits, contains them, or exact match
    const phoneMatches = cleanPhoneDigits ? (
      apptPhoneDigits.endsWith(cleanPhoneDigits) || 
      apptPhoneDigits.includes(cleanPhoneDigits) ||
      cleanPhoneDigits.endsWith(apptPhoneDigits)
    ) : true;

    return nameMatches && phoneMatches;
  });
}

/**
 * Validates the 36-hour cancellation/reschedule policy:
 * "que pueda cambiar el horario eliminarla o cambiar la fecha siempre con 36 hs de antelacion"
 */
export function check36HourPolicy(dateStr: string, timeStr: string): {
  canModify: boolean;
  hoursRemaining: number;
  formattedNotice: string;
} {
  try {
    // Parse target appointment time
    const [hours, minutes] = timeStr.split(':').map(Number);
    const [year, month, day] = dateStr.split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day, hours, minutes || 0, 0);

    const now = new Date();
    const diffMs = appointmentDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    const canModify = diffHours >= SALON_INFO.cancellationHoursLimit;

    let formattedNotice = '';
    if (diffHours < 0) {
      formattedNotice = 'Este turno ya ha transcurrido.';
    } else if (canModify) {
      formattedNotice = `Faltan ${Math.floor(diffHours)} horas para la cita. Podés modificar o cancelar sin inconvenientes.`;
    } else {
      formattedNotice = `Faltan solo ${Math.max(0, Math.floor(diffHours))} horas para la cita. De acuerdo a las políticas de reserva del Atelier, se requiere un mínimo de 36 horas de anticipación.`;
    }

    return {
      canModify,
      hoursRemaining: diffHours,
      formattedNotice
    };
  } catch (err) {
    return {
      canModify: false,
      hoursRemaining: 0,
      formattedNotice: 'No se pudo verificar la política de 36 hs.'
    };
  }
}

/**
 * Generates slots from 09:00 to 18:00
 */
export function generateAvailableSlots(dateStr: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startHour = SALON_INFO.openingHour; // 9
  const endHour = SALON_INFO.closingHour; // 18

  // Check existing appointments on this date
  const stored = getStoredAppointments();
  const bookedTimes = new Set(
    stored
      .filter(a => a.date === dateStr && a.status === 'active')
      .map(a => a.time)
  );

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const isToday = dateStr === todayStr;

  for (let h = startHour; h <= endHour; h++) {
    // Hourly slots
    const hourFormatted = h.toString().padStart(2, '0');
    
    // Check main slot
    const slotTime1 = `${hourFormatted}:00`;
    let isPast = false;
    if (isToday) {
      const slotDate = new Date();
      slotDate.setHours(h, 0, 0, 0);
      if (slotDate <= now) isPast = true;
    }

    slots.push({
      time: slotTime1,
      available: !bookedTimes.has(slotTime1) && !isPast,
      reason: bookedTimes.has(slotTime1) ? 'Reservado' : isPast ? 'Horario pasado' : undefined
    });

    // Add half hour slot if before endHour
    if (h < endHour) {
      const slotTime2 = `${hourFormatted}:30`;
      let isPastHalf = false;
      if (isToday) {
        const slotDate = new Date();
        slotDate.setHours(h, 30, 0, 0);
        if (slotDate <= now) isPastHalf = true;
      }
      slots.push({
        time: slotTime2,
        available: !bookedTimes.has(slotTime2) && !isPastHalf,
        reason: bookedTimes.has(slotTime2) ? 'Reservado' : isPastHalf ? 'Horario pasado' : undefined
      });
    }
  }

  return slots;
}

export function formatFriendlyDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Builds the WhatsApp redirect URL
 */
export function buildWhatsAppReservationUrl(appointment: Appointment): string {
  const friendlyDate = formatFriendlyDate(appointment.date);
  const text = 
`✨ *NUEVA RESERVA - STUDIO CELIA FIGUEREDO* ✨

👤 *Cliente:* ${appointment.clientName}
📱 *Teléfono:* ${appointment.phone}
✂️ *Servicio:* ${appointment.serviceName}${appointment.otherDetails ? ` (${appointment.otherDetails})` : ''}
📅 *Fecha:* ${friendlyDate}
⏰ *Horario:* ${appointment.time} hs
📍 *Ubicación:* ${SALON_INFO.address.street} (${SALON_INFO.address.reference}, ${SALON_INFO.address.neighborhood})
🏷️ *Código de Turno:* ${appointment.id}
${appointment.notes ? `📝 *Notas:* ${appointment.notes}\n` : ''}
¡Hola Celia! Acabo de registrar mi turno a través de la web oficial. ¿Me confirmarías la cita? ¡Muchas gracias!`;

  return `https://wa.me/${SALON_INFO.whatsappRaw}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppRescheduleUrl(appointment: Appointment, oldDate: string, oldTime: string): string {
  const friendlyDate = formatFriendlyDate(appointment.date);
  const friendlyOldDate = formatFriendlyDate(oldDate);
  const text = 
`🔄 *REPROGRAMACIÓN DE TURNO - STUDIO CELIA FIGUEREDO*

👤 *Cliente:* ${appointment.clientName}
📱 *Teléfono:* ${appointment.phone}
🏷️ *Código de Turno:* ${appointment.id}
✂️ *Servicio:* ${appointment.serviceName}

📅 *Nueva Fecha:* ${friendlyDate}
⏰ *Nuevo Horario:* ${appointment.time} hs
(Anterior: ${friendlyOldDate} a las ${oldTime} hs - cumpliendo las 36 hs de antelación)

¡Hola Celia! Reprogramé mi turno mediante la plataforma web. ¿Podrías confirmarme la nueva fecha? ¡Gracias!`;

  return `https://wa.me/${SALON_INFO.whatsappRaw}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppCancelUrl(appointment: Appointment): string {
  const friendlyDate = formatFriendlyDate(appointment.date);
  const text = 
`❌ *CANCELACIÓN DE TURNO - STUDIO CELIA FIGUEREDO*

👤 *Cliente:* ${appointment.clientName}
📱 *Teléfono:* ${appointment.phone}
🏷️ *Código de Turno:* ${appointment.id}
✂️ *Servicio:* ${appointment.serviceName}
📅 *Fecha que tenía:* ${friendlyDate} a las ${appointment.time} hs

¡Hola Celia! Te aviso que cancelé mi turno respetando el aviso con más de 36 hs de anticipación. Muchas gracias por la comprensión.`;

  return `https://wa.me/${SALON_INFO.whatsappRaw}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppDirectContactUrl(customMessage?: string): string {
  const text = customMessage || '¡Hola Celia! Me comunico desde la web de Studio Celia Figueredo para realizar una consulta sobre turnos y servicios.';
  return `https://wa.me/${SALON_INFO.whatsappRaw}?text=${encodeURIComponent(text)}`;
}
