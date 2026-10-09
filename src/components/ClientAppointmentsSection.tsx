import React, { useState } from 'react';
import { Appointment, TimeSlot } from '../types';
import {
  searchClientAppointments,
  check36HourPolicy,
  updateAppointmentStatus,
  deleteAppointmentPermanently,
  formatFriendlyDate,
  generateAvailableSlots,
  buildWhatsAppRescheduleUrl,
  buildWhatsAppCancelUrl,
  buildWhatsAppDirectContactUrl
} from '../utils/appointmentStorage';
import { SALON_INFO } from '../data/services';
import { MiniCalendar } from './MiniCalendar';
import {
  Search,
  Calendar,
  Clock,
  Scissors,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageCircle,
  User,
  Phone,
  ArrowRight,
  ShieldAlert,
  Edit3,
  Trash2
} from 'lucide-react';

interface ClientAppointmentsSectionProps {
  lastUpdatedTrigger?: number;
}

export const ClientAppointmentsSection: React.FC<ClientAppointmentsSectionProps> = ({
  lastUpdatedTrigger
}) => {
  const [nameQuery, setNameQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [foundAppointments, setFoundAppointments] = useState<Appointment[]>([]);

  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('12:00');
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlot[]>([]);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Cancellation confirm modal
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActionSuccessMessage(null);
    setReschedulingId(null);
    setCancellingAppointment(null);

    const results = searchClientAppointments(nameQuery, phoneQuery);
    setFoundAppointments(results);
    setHasSearched(true);
  };

  const handleOpenReschedule = (appointment: Appointment) => {
    setReschedulingId(appointment.id);
    setNewDate(appointment.date);
    setNewTime(appointment.time);
    const slots = generateAvailableSlots(appointment.date);
    setRescheduleSlots(slots);
  };

  const handleDateChangeForReschedule = (date: string) => {
    setNewDate(date);
    const slots = generateAvailableSlots(date);
    setRescheduleSlots(slots);
    const curr = slots.find(s => s.time === newTime);
    if (!curr || !curr.available) {
      const firstAvail = slots.find(s => s.available);
      if (firstAvail) setNewTime(firstAvail.time);
    }
  };

  const handleConfirmReschedule = (appointment: Appointment) => {
    if (!newDate || !newTime) return;

    const oldDate = appointment.date;
    const oldTime = appointment.time;

    const updated = updateAppointmentStatus(appointment.id, 'rescheduled', newDate, newTime);
    if (updated) {
      // Refresh current search results
      setFoundAppointments(prev =>
        prev.map(a => (a.id === appointment.id ? { ...a, date: newDate, time: newTime, status: 'rescheduled' } : a))
      );
      setReschedulingId(null);
      setActionSuccessMessage(`¡Turno ${appointment.id} reprogramado con éxito para el ${formatFriendlyDate(newDate)} a las ${newTime} hs!`);

      // Open WhatsApp notification
      const waUrl = buildWhatsAppRescheduleUrl(updated, oldDate, oldTime);
      window.open(waUrl, '_blank');
    }
  };

  const handleConfirmCancel = (appointment: Appointment) => {
    const updated = updateAppointmentStatus(appointment.id, 'cancelled');
    if (updated) {
      setFoundAppointments(prev =>
        prev.map(a => (a.id === appointment.id ? { ...a, status: 'cancelled' } : a))
      );
      setCancellingAppointment(null);
      setActionSuccessMessage(`Turno ${appointment.id} cancelado correctamente.`);

      // Open WhatsApp cancellation notice
      const waUrl = buildWhatsAppCancelUrl(appointment);
      window.open(waUrl, '_blank');
    }
  };

  return (
    <section id="mis-turnos" className="py-24 px-4 md:px-8 max-w-5xl mx-auto scroll-mt-20">
      {/* Title */}
      <div className="text-center mb-14">
        <span className="text-[11px] tracking-[0.35em] uppercase text-[#D4AF37] font-medium block mb-2">
          Gestión de Clientes & Citas
        </span>
        <h2 className="text-3xl md:text-5xl text-stone-100 font-serif-luxury tracking-wider font-light">
          Consultar Mis Turnos
        </h2>
        <div className="w-16 h-px bg-[#D6001C] mx-auto mt-4 mb-4" />
        <p className="text-xs md:text-sm text-[#a0a0a0] max-w-xl mx-auto font-light leading-relaxed">
          Ingresá tu nombre y tu número de teléfono (o los últimos dígitos) para consultar tus reservas activas, cambiar el horario o cancelar con al menos 36 horas de anticipación.
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-[#0a0a0a] border border-[#222] hover:border-[#333] transition-colors rounded-sm p-6 md:p-8 mb-10 shadow-lg">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs uppercase tracking-wider text-[#D4AF37] font-medium mb-1.5">
              Nombre y Apellido
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Ej: Mariana o Lucas"
                className="w-full bg-[#111] border border-[#333] focus:border-[#D4AF37] pl-10 pr-3 py-2.5 text-xs text-stone-100 rounded focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs uppercase tracking-wider text-[#D4AF37] font-medium mb-1.5">
              Teléfono (o últimos dígitos)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777]">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                placeholder="Ej: 4616 o 1165804616"
                className="w-full bg-[#111] border border-[#333] focus:border-[#D4AF37] pl-10 pr-3 py-2.5 text-xs text-stone-100 rounded focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#141414] hover:bg-[#D6001C] text-stone-200 hover:text-white border border-[#333] hover:border-[#D6001C] text-xs uppercase tracking-widest font-medium transition-all duration-300 rounded flex items-center justify-center gap-2 cursor-pointer h-[42px]"
            >
              <Search className="w-4 h-4" />
              <span>Buscar Turno</span>
            </button>
          </div>
        </form>

        <p className="text-[11px] text-[#777] mt-3">
          * Para verificar tu identidad, el sistema busca coincidencias entre tu nombre y la terminación de tu número de teléfono registrado.
        </p>
      </div>

      {/* Success alert message if rescheduled / cancelled */}
      {actionSuccessMessage && (
        <div className="mb-6 p-4 bg-[#101b13] border border-emerald-500/40 text-emerald-300 text-xs rounded flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Search Results Display */}
      {hasSearched && (
        <div className="space-y-6">
          {foundAppointments.length === 0 ? (
            <div className="text-center py-12 px-6 bg-[#0a0a0a] border border-[#222] rounded-sm">
              <AlertTriangle className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
              <h3 className="text-lg font-serif-luxury text-stone-200 mb-1">
                No se encontraron turnos registrados
              </h3>
              <p className="text-xs text-[#888] max-w-md mx-auto mb-5">
                No encontramos reservas coincidentes para <span className="text-stone-300 font-medium">"{nameQuery}"</span> con teléfono terminado en <span className="text-stone-300 font-medium">"{phoneQuery}"</span>.
              </p>
              <a
                href="#reservar"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#D4AF37] hover:text-[#f1d592] border border-[#D4AF37]/50 py-2 px-4 rounded hover:bg-[#1a1608] transition-colors"
              >
                <span>Agendar un nuevo turno</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-[#888] px-1">
                <span>Turnos encontrados: <strong className="text-stone-200">{foundAppointments.length}</strong></span>
                <span className="text-[11px] text-[#D4AF37]">Política: Modificaciones con 36 hs de antelación</span>
              </div>

              {foundAppointments.map((appointment) => {
                const policy = check36HourPolicy(appointment.date, appointment.time);
                const isCancelled = appointment.status === 'cancelled';
                const isEditingThis = reschedulingId === appointment.id;

                return (
                  <div
                    key={appointment.id}
                    className={`bg-[#0a0a0a] border rounded-sm p-6 transition-all duration-300 ${
                      isCancelled
                        ? 'border-[#222] opacity-60'
                        : policy.canModify
                        ? 'border-[#2d2514] hover:border-[#D4AF37]'
                        : 'border-[#332020]'
                    }`}
                  >
                    {/* Top Bar of Card */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1f1f1f]">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold text-[#f1d592] tracking-wider">
                          {appointment.id}
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium ${
                            isCancelled
                              ? 'bg-stone-800 text-stone-400'
                              : appointment.status === 'rescheduled'
                              ? 'bg-blue-900/30 text-blue-300 border border-blue-700/40'
                              : 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/40'
                          }`}
                        >
                          {isCancelled ? 'Cancelado' : appointment.status === 'rescheduled' ? 'Reprogramado' : 'Confirmado'}
                        </span>
                      </div>

                      {/* 36 Hours Status Badge */}
                      {!isCancelled && (
                        <div
                          className={`text-[11px] px-2.5 py-1 rounded flex items-center gap-1.5 ${
                            policy.canModify
                              ? 'bg-[#18150c] text-[#f1d592] border border-[#D4AF37]/30'
                              : 'bg-[#221010] text-[#ff8080] border border-[#e53935]/40'
                          }`}
                        >
                          {policy.canModify ? (
                            <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5 text-[#ff8080]" />
                          )}
                          <span>
                            {policy.hoursRemaining < 0
                              ? 'Turno finalizado'
                              : policy.canModify
                              ? `Faltan ${Math.floor(policy.hoursRemaining)} hs (Modificación habilitada)`
                              : `Faltan ${Math.floor(policy.hoursRemaining)} hs (Menos de 36 hs)`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-[#777] block mb-1">Cliente</span>
                        <p className="font-medium text-stone-100">{appointment.clientName}</p>
                        <p className="text-[11px] text-[#888]">{appointment.phone}</p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-[#777] block mb-1">Servicio</span>
                        <p className="font-medium text-stone-100">{appointment.serviceName}</p>
                        {appointment.otherDetails && (
                          <p className="text-[11px] text-stone-400 italic">"{appointment.otherDetails}"</p>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-[#777] block mb-1">Cita Agendada</span>
                        <p className="font-medium text-[#f1d592]">{formatFriendlyDate(appointment.date)}</p>
                        <p className="text-stone-300 font-mono font-medium">{appointment.time} hs</p>
                      </div>
                    </div>

                    {/* Policy warning if < 36 hs */}
                    {!isCancelled && !policy.canModify && policy.hoursRemaining >= 0 && (
                      <div className="bg-[#180e0e] border border-[#D6001C]/40 p-3.5 rounded text-xs text-[#ffb0b0] mb-4 flex items-start gap-2.5">
                        <ShieldAlert className="w-4 h-4 text-[#ff5555] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">
                            Modificación restringida por política de 36 horas de antelación
                          </p>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            Debido a la exclusividad de cada bloque de atención, los cambios automáticos requieren al menos 36 horas de aviso. Si se presentó un imprevisto de fuerza mayor, por favor ponete en contacto directo con Celia Figueredo.
                          </p>
                          <a
                            href={buildWhatsAppDirectContactUrl(
                              `¡Hola Celia! Te escribo con respecto a mi turno ${appointment.id} (${appointment.serviceName}) agendado para el ${appointment.date} a las ${appointment.time} hs. Tuve un imprevisto y quería consultarte directamente. Muchas gracias.`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] text-[#D4AF37] hover:underline mt-2 font-medium"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Escribirle a Celia por WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Reschedule inline drawer if opened */}
                    {isEditingThis && (
                      <div className="mt-4 p-5 bg-[#111] border border-[#D4AF37] rounded-sm space-y-5 animate-fade-in">
                        <div className="flex items-center justify-between border-b border-[#222] pb-3">
                          <h4 className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-2">
                            <Edit3 className="w-4 h-4" />
                            <span>Reprogramar Turno (Celdas en Cascada de 9 a 18 hs)</span>
                          </h4>
                          <button
                            onClick={() => setReschedulingId(null)}
                            className="text-xs text-stone-500 hover:text-stone-300 cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>

                        {/* Cascade Cells for Rescheduling */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                          {/* Dia */}
                          <div className="bg-[#161616] border border-[#333] rounded p-2.5">
                            <label className="block text-[10px] uppercase text-[#D4AF37] font-semibold mb-1">
                              Día
                            </label>
                            <select
                              value={Number(newDate.split('-')[2] || 1)}
                              onChange={(e) => {
                                const parts = newDate.split('-');
                                const y = parts[0] || '2026';
                                const m = parts[1] || '10';
                                const d = String(e.target.value).padStart(2, '0');
                                handleDateChangeForReschedule(`${y}-${m}-${d}`);
                              }}
                              className="w-full bg-[#0d0d0d] border border-[#444] text-xs text-stone-100 py-1.5 px-2 rounded cursor-pointer"
                            >
                              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                                const parts = newDate.split('-');
                                const y = Number(parts[0] || 2026);
                                const m = Number(parts[1] || 10);
                                const dateObj = new Date(y, m - 1, d);
                                const dayOfWeekIndex = dateObj.getDay();
                                const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                                const dayName = dayNames[dayOfWeekIndex];
                                const isClosedDay = dayOfWeekIndex === 0 || dayOfWeekIndex === 1;

                                return (
                                  <option key={d} value={d}>
                                    {dayName} {d} {isClosedDay ? '(Cerrado)' : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {/* Mes */}
                          <div className="bg-[#161616] border border-[#333] rounded p-2.5">
                            <label className="block text-[10px] uppercase text-[#D4AF37] font-semibold mb-1">
                              Mes
                            </label>
                            <select
                              value={Number(newDate.split('-')[1] || 10)}
                              onChange={(e) => {
                                const parts = newDate.split('-');
                                const y = parts[0] || '2026';
                                const m = String(e.target.value).padStart(2, '0');
                                const d = parts[2] || '01';
                                handleDateChangeForReschedule(`${y}-${m}-${d}`);
                              }}
                              className="w-full bg-[#0d0d0d] border border-[#444] text-xs text-stone-100 py-1.5 px-2 rounded cursor-pointer"
                            >
                              <option value="1">Enero</option>
                              <option value="2">Febrero</option>
                              <option value="3">Marzo</option>
                              <option value="4">Abril</option>
                              <option value="5">Mayo</option>
                              <option value="6">Junio</option>
                              <option value="7">Julio</option>
                              <option value="8">Agosto</option>
                              <option value="9">Septiembre</option>
                              <option value="10">Octubre</option>
                              <option value="11">Noviembre</option>
                              <option value="12">Diciembre</option>
                            </select>
                          </div>

                          {/* Año */}
                          <div className="bg-[#161616] border border-[#333] rounded p-2.5">
                            <label className="block text-[10px] uppercase text-[#D4AF37] font-semibold mb-1">
                              Año
                            </label>
                            <select
                              value={Number(newDate.split('-')[0] || 2026)}
                              onChange={(e) => {
                                const parts = newDate.split('-');
                                const y = e.target.value;
                                const m = parts[1] || '10';
                                const d = parts[2] || '01';
                                handleDateChangeForReschedule(`${y}-${m}-${d}`);
                              }}
                              className="w-full bg-[#0d0d0d] border border-[#444] text-xs text-stone-100 py-1.5 px-2 rounded cursor-pointer"
                            >
                              <option value="2026">2026</option>
                              <option value="2027">2027</option>
                            </select>
                          </div>

                          {/* Hora (9 a 18) */}
                          <div className="bg-[#161616] border border-[#333] rounded p-2.5">
                            <label className="block text-[10px] uppercase text-[#D4AF37] font-semibold mb-1">
                              Hora (9 a 18)
                            </label>
                            <select
                              value={newTime.split(':')[0] || '11'}
                              onChange={(e) => {
                                const mins = newTime.split(':')[1] || '00';
                                setNewTime(`${e.target.value}:${mins}`);
                              }}
                              className="w-full bg-[#0d0d0d] border border-[#444] text-xs text-stone-100 py-1.5 px-2 rounded cursor-pointer"
                            >
                              {['09', '10', '11', '12', '13', '14', '15', '16', '17', '18'].map(h => (
                                <option key={h} value={h}>{h} hs</option>
                              ))}
                            </select>
                          </div>

                          {/* Minutos */}
                          <div className="bg-[#161616] border border-[#333] rounded p-2.5 col-span-2 sm:col-span-1">
                            <label className="block text-[10px] uppercase text-[#D4AF37] font-semibold mb-1">
                              Minutos
                            </label>
                            <select
                              value={newTime.split(':')[1] || '00'}
                              onChange={(e) => {
                                const hrs = newTime.split(':')[0] || '11';
                                setNewTime(`${hrs}:${e.target.value}`);
                              }}
                              className="w-full bg-[#0d0d0d] border border-[#444] text-xs text-stone-100 py-1.5 px-2 rounded cursor-pointer"
                            >
                              {['00', '15', '30', '45'].map(m => (
                                <option key={m} value={m}>:{m} min</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Preview and Validation for Reschedule */}
                        {(() => {
                          const [y, m, d] = newDate.split('-').map(Number);
                          const testDate = new Date(y, (m || 1) - 1, d || 1);
                          const isSun = testDate.getDay() === 0;

                          return (
                            <div className="space-y-3">
                              <div className={`p-3 rounded border text-xs flex flex-wrap items-center justify-between gap-2 ${
                                isSun ? 'bg-red-950/40 border-red-600 text-red-200' : 'bg-[#18150a] border-[#D4AF37]/50 text-stone-200'
                              }`}>
                                <div>
                                  <span className="text-[#888] block text-[10px] uppercase">Nueva Selección:</span>
                                  <strong>{formatFriendlyDate(newDate)} a las {newTime} hs</strong>
                                </div>
                                {isSun ? (
                                  <span className="px-2 py-1 bg-red-800 text-white text-[10px] uppercase font-bold rounded">
                                    Domingo Cerrado
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-bold rounded">
                                    Día Habilitado
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-3 justify-end pt-2">
                                <button
                                  type="button"
                                  onClick={() => setReschedulingId(null)}
                                  className="py-2 px-4 bg-transparent hover:bg-[#222] text-[#888] border border-[#333] text-xs uppercase rounded cursor-pointer"
                                >
                                  Cancelar
                                </button>
                                <button
                                  disabled={isSun}
                                  onClick={() => handleConfirmReschedule(appointment)}
                                  className={`py-2 px-5 text-white text-xs uppercase tracking-wider font-medium rounded transition-colors flex items-center gap-2 ${
                                    isSun ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : 'bg-[#D6001C] hover:bg-[#b00017] cursor-pointer'
                                  }`}
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Confirmar y Notificar a WhatsApp</span>
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Action buttons (only if not cancelled and > 36hs) */}
                    {!isCancelled && policy.canModify && !isEditingThis && (
                      <div className="pt-4 border-t border-[#1c1c1c] flex flex-wrap gap-3 justify-end">
                        <button
                          onClick={() => handleOpenReschedule(appointment)}
                          className="py-2 px-4 bg-transparent hover:bg-[#1f1a0e] text-[#D4AF37] border border-[#D4AF37]/50 text-xs tracking-wider uppercase font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Cambiar Fecha / Horario</span>
                        </button>

                        <button
                          onClick={() => setCancellingAppointment(appointment)}
                          className="py-2 px-4 bg-transparent hover:bg-[#201010] text-[#ff6666] border border-[#e53935]/40 text-xs tracking-wider uppercase font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Cancelar Turno</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirmation modal for cancellation */}
      {cancellingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f0f0f] border border-[#D6001C] rounded-sm p-6 md:p-8 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#2a1010] text-[#ff4444] flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-serif-luxury text-stone-100 text-center mb-2">
              ¿Confirmás la cancelación del turno {cancellingAppointment.id}?
            </h3>

            <p className="text-xs text-[#888] text-center mb-5 leading-relaxed">
              Estás a tiempo (más de 36 horas de anticipación). Al cancelar, liberaremos el espacio y se abrirá WhatsApp para notificar a Celia Figueredo.
            </p>

            <div className="bg-[#141414] p-3 rounded text-xs text-stone-300 mb-6 space-y-1">
              <p><strong>Servicio:</strong> {cancellingAppointment.serviceName}</p>
              <p><strong>Fecha:</strong> {formatFriendlyDate(cancellingAppointment.date)} a las {cancellingAppointment.time} hs</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setCancellingAppointment(null)}
                className="py-2.5 px-4 bg-transparent hover:bg-[#222] text-[#888] hover:text-white border border-[#333] text-xs uppercase tracking-wider rounded cursor-pointer"
              >
                No, mantener turno
              </button>
              <button
                onClick={() => handleConfirmCancel(cancellingAppointment)}
                className="py-2.5 px-5 bg-[#D6001C] hover:bg-[#b00017] text-white text-xs uppercase tracking-wider font-semibold rounded cursor-pointer"
              >
                Sí, cancelar turno
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
