import React, { useState, useEffect, useMemo } from 'react';
import { SALON_SERVICES, SALON_INFO } from '../data/services';
import {
  saveAppointment,
  buildWhatsAppReservationUrl,
  formatFriendlyDate,
  isDayOfWeekClosed
} from '../utils/appointmentStorage';
import { Appointment, ServiceItem } from '../types';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Phone,
  Sparkles,
  MessageCircle,
  AlertCircle,
  Copy,
  Check,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

interface BookingSectionProps {
  preselectedService?: ServiceItem | null;
  onAppointmentCreated?: (appointment: Appointment) => void;
}

const MONTH_NAMES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
];

const AVAILABLE_HOURS = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18'];
const AVAILABLE_MINUTES = ['00', '15', '30', '45'];

export const BookingSection: React.FC<BookingSectionProps> = ({
  preselectedService,
  onAppointmentCreated
}) => {
  // Current time reference
  const now = new Date();
  const currentYear = now.getFullYear();

  // Initial next open day (skipping Sunday if today/tomorrow is Sunday)
  const initialDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) {
      d.setDate(d.getDate() + 1);
    }
    return d;
  }, []);

  // Cascade states for Date
  const [selectedDay, setSelectedDay] = useState<number>(initialDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(initialDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(initialDate.getFullYear());

  // Cascade states for Time (09 to 18)
  const [selectedHour, setSelectedHour] = useState<string>('11');
  const [selectedMinute, setSelectedMinute] = useState<string>('00');

  // Client info
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedService ? preselectedService.id : 'corte-mujer'
  );
  const [otherServiceDetails, setOtherServiceDetails] = useState('');
  const [notes, setNotes] = useState('');

  // Feedback states
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync if preselectedService changes
  useEffect(() => {
    if (preselectedService) {
      setSelectedServiceId(preselectedService.id);
    }
  }, [preselectedService]);

  // Calculate days in selected month/year
  const daysInSelectedMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Adjust day if month has fewer days
  useEffect(() => {
    if (selectedDay > daysInSelectedMonth) {
      setSelectedDay(daysInSelectedMonth);
    }
  }, [daysInSelectedMonth, selectedDay]);

  // Build full Date object and check conditions
  const evaluatedDateInfo = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth - 1, selectedDay);
    const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday
    const isClosed = isDayOfWeekClosed(dayOfWeek);

    // Check past date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkD = new Date(selectedYear, selectedMonth - 1, selectedDay);
    checkD.setHours(0, 0, 0, 0);
    const isPast = checkD < today;

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = dayNames[dayOfWeek];

    const isoDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const timeStr = `${selectedHour}:${selectedMinute}`;

    let statusType: 'valid' | 'closed' | 'past' = 'valid';
    if (isClosed) statusType = 'closed';
    else if (isPast) statusType = 'past';

    const closedMessage = dayOfWeek === 1
      ? 'Los lunes el estudio permanece cerrado (según horario oficial de Google Maps). Por favor elegí de martes a sábado.'
      : 'Los domingos el estudio permanece cerrado. Por favor elegí de martes a sábado.';

    return {
      dateObj: d,
      dayOfWeek,
      dayName,
      isClosed,
      isSunday: dayOfWeek === 0,
      isMonday: dayOfWeek === 1,
      isPast,
      statusType,
      closedMessage,
      isoDateStr,
      timeStr,
      formattedText: `${dayName} ${selectedDay} de ${MONTH_NAMES[selectedMonth - 1]?.label} de ${selectedYear}`
    };
  }, [selectedDay, selectedMonth, selectedYear, selectedHour, selectedMinute]);

  const selectedService = SALON_SERVICES.find(s => s.id === selectedServiceId);

  // Validate form
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!clientName.trim()) {
      errors.clientName = 'Por favor ingresá tu nombre y apellido completo.';
    } else if (clientName.trim().length < 3) {
      errors.clientName = 'El nombre debe tener al menos 3 caracteres.';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'Por favor ingresá tu número de teléfono / WhatsApp.';
    } else if (cleanPhone.length < 8) {
      errors.phone = 'Ingresá un número de teléfono válido (mínimo 8 dígitos).';
    }

    if (evaluatedDateInfo.isClosed) {
      errors.date = evaluatedDateInfo.closedMessage;
    } else if (evaluatedDateInfo.isPast) {
      errors.date = 'La fecha seleccionada ya ha pasado. Por favor elegí una fecha a partir de hoy.';
    }

    if (selectedServiceId === 'otros' && !otherServiceDetails.trim()) {
      errors.otherDetails = 'Por favor especificá qué servicio o consulta deseás realizar.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Generate unique Appointment ID (e.g. CF-7492)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const appointmentId = `CF-${randomCode}`;

    const newAppointment: Appointment = {
      id: appointmentId,
      clientName: clientName.trim(),
      phone: phone.trim(),
      serviceId: selectedServiceId,
      serviceName: selectedService ? selectedService.name : 'Servicio personalizado',
      otherDetails: selectedServiceId === 'otros' ? otherServiceDetails.trim() : undefined,
      date: evaluatedDateInfo.isoDateStr,
      time: evaluatedDateInfo.timeStr,
      createdAt: new Date().toISOString(),
      status: 'active',
      notes: notes.trim() || undefined
    };

    // Save to localStorage for Netlify persistence
    saveAppointment(newAppointment);

    if (onAppointmentCreated) {
      onAppointmentCreated(newAppointment);
    }

    setConfirmedAppointment(newAppointment);
    setIsSubmitting(false);

    // Open WhatsApp with pre-composed message
    const waUrl = buildWhatsAppReservationUrl(newAppointment);
    window.open(waUrl, '_blank');
  };

  const handleCopyCode = () => {
    if (confirmedAppointment) {
      navigator.clipboard.writeText(confirmedAppointment.id);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleResetForm = () => {
    setConfirmedAppointment(null);
    setClientName('');
    setPhone('');
    setNotes('');
    setOtherServiceDetails('');
  };

  return (
    <section id="reservar" className="py-20 px-4 md:px-8 max-w-5xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="text-center mb-12">
        <span className="text-[11px] tracking-[0.35em] uppercase text-[#D4AF37] font-medium block mb-2">
          Sistema de Citas del Atelier
        </span>
        <h2 className="text-3xl md:text-5xl text-stone-100 font-serif-luxury tracking-wider font-light">
          Reservar un Turno
        </h2>
        <div className="w-16 h-px bg-[#D6001C] mx-auto mt-4 mb-4" />
        <p className="text-xs md:text-sm text-[#a0a0a0] max-w-xl mx-auto font-light leading-relaxed">
          Completá tus datos, seleccioná el servicio, elegí día, mes, año y horario en las celdas y confirmá tu turno directamente por WhatsApp al <strong className="text-stone-200">{SALON_INFO.whatsapp}</strong>.
        </p>
      </div>

      {/* Confirmation View if already created */}
      {confirmedAppointment ? (
        <div className="bg-[#0a0a0a] border border-[#D4AF37] rounded-sm p-6 md:p-10 shadow-[0_0_35px_rgba(212,175,55,0.15)] animate-fade-in text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#161208] border border-[#D4AF37] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#D4AF37]" />
          </div>

          <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] block font-light mb-1">
            Reserva Registrada Exitosamente
          </span>
          <h3 className="text-2xl md:text-3xl font-serif-luxury text-stone-100 tracking-wide mb-3">
            ¡Te esperamos en el Atelier, {confirmedAppointment.clientName}!
          </h3>

          {/* Booking Code */}
          <div className="inline-flex items-center gap-3 bg-[#141414] border border-[#333] px-5 py-2.5 rounded-sm my-4">
            <span className="text-xs text-[#888] uppercase tracking-wider">Código de Reserva:</span>
            <span className="text-lg font-mono font-bold text-[#f1d592] tracking-widest">
              {confirmedAppointment.id}
            </span>
            <button
              onClick={handleCopyCode}
              title="Copiar código"
              className="text-[#a0a0a0] hover:text-white transition-colors cursor-pointer ml-1"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Summary Details */}
          <div className="bg-[#111] border border-[#222] p-5 rounded-sm text-left my-6 space-y-2.5 text-xs text-stone-300">
            <div className="flex justify-between border-b border-[#222] pb-2">
              <span className="text-[#888]">Servicio:</span>
              <span className="font-medium text-stone-100 text-right">
                {confirmedAppointment.serviceName}
                {confirmedAppointment.otherDetails && ` (${confirmedAppointment.otherDetails})`}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#222] pb-2">
              <span className="text-[#888]">Fecha:</span>
              <span className="font-medium text-[#f1d592]">
                {formatFriendlyDate(confirmedAppointment.date)}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#222] pb-2">
              <span className="text-[#888]">Horario:</span>
              <span className="font-medium text-stone-100">
                {confirmedAppointment.time} hs
              </span>
            </div>
            <div className="flex justify-between border-b border-[#222] pb-2">
              <span className="text-[#888]">Teléfono de contacto:</span>
              <span className="font-medium text-stone-100">
                {confirmedAppointment.phone}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#888]">Dirección:</span>
              <span className="text-right text-stone-300">
                {SALON_INFO.address.street}, Recoleta
              </span>
            </div>
          </div>

          {/* Notice about 36hs policy */}
          <div className="bg-[#140e08] border border-[#D4AF37]/30 p-4 rounded-sm mb-8 text-left flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#d6c498] leading-relaxed">
              <strong>Política de 36 horas:</strong> Si necesitás reprogramar o cancelar tu turno, recordá que podés hacerlo desde la sección <em>"Consultar Mis Turnos"</em> hasta con <strong>36 horas de antelación</strong> a la fecha y horario fijado.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={buildWhatsAppReservationUrl(confirmedAppointment)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 bg-[#D6001C] hover:bg-[#b00017] text-white text-xs tracking-widest uppercase transition-all duration-300 rounded font-medium flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(214,0,28,0.4)]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Abrir WhatsApp con Celia (+54 9 11 6580-4616)</span>
            </a>

            <button
              onClick={handleResetForm}
              className="py-3 px-6 bg-transparent hover:bg-[#222] text-[#a0a0a0] hover:text-white border border-[#333] text-xs tracking-widest uppercase transition-colors rounded cursor-pointer"
            >
              Realizar otra reserva
            </button>
          </div>
        </div>
      ) : (
        /* The Booking Form */
        <form
          onSubmit={handleConfirmReservation}
          className="bg-[#0a0a0a] border border-[#222] rounded-sm p-6 md:p-10 shadow-2xl relative"
        >
          {/* STEP 1: Datos Personales (Obligatorio) */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#1c1c1c]">
              <span className="w-6 h-6 rounded-full bg-[#181408] border border-[#D4AF37] text-[#D4AF37] text-xs flex items-center justify-center font-bold">
                1
              </span>
              <h3 className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Datos del Cliente (Obligatorio) *
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nombre y Apellido */}
              <div>
                <label className="block text-xs text-stone-300 font-medium mb-1.5">
                  Nombre y Apellido *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => {
                      setClientName(e.target.value);
                      if (formErrors.clientName) {
                        setFormErrors(prev => ({ ...prev, clientName: '' }));
                      }
                    }}
                    placeholder="Ej: Mariana Rossi"
                    className={`w-full bg-[#111] border ${
                      formErrors.clientName ? 'border-[#ff4444]' : 'border-[#333]'
                    } focus:border-[#D4AF37] pl-10 pr-4 py-3 text-xs text-stone-100 rounded focus:outline-none transition-colors`}
                  />
                </div>
                {formErrors.clientName && (
                  <p className="text-[11px] text-[#ff6666] mt-1.5">{formErrors.clientName}</p>
                )}
              </div>

              {/* Teléfono / WhatsApp */}
              <div>
                <label className="block text-xs text-stone-300 font-medium mb-1.5">
                  Número de Teléfono / WhatsApp *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (formErrors.phone) {
                        setFormErrors(prev => ({ ...prev, phone: '' }));
                      }
                    }}
                    placeholder="Ej: 11 6580 4616"
                    className={`w-full bg-[#111] border ${
                      formErrors.phone ? 'border-[#ff4444]' : 'border-[#333]'
                    } focus:border-[#D4AF37] pl-10 pr-4 py-3 text-xs text-stone-100 rounded focus:outline-none transition-colors`}
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-[11px] text-[#ff6666] mt-1.5">{formErrors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: Servicio a Reservar */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#1c1c1c]">
              <span className="w-6 h-6 rounded-full bg-[#181408] border border-[#D4AF37] text-[#D4AF37] text-xs flex items-center justify-center font-bold">
                2
              </span>
              <h3 className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Seleccioná la Clase de Servicio *
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {SALON_SERVICES.map((srv) => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-3 text-left rounded-sm border transition-all duration-200 relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#18140c] border-[#D4AF37] text-white shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                        : 'bg-[#111] border-[#222] text-[#999] hover:border-[#444] hover:text-stone-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] uppercase tracking-wider text-[#777]">
                          {srv.category}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-stone-100 line-clamp-2">
                        {srv.name}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#777] mt-2 block">
                      {srv.durationApprox}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom input if "Otros" is selected */}
            {selectedServiceId === 'otros' && (
              <div className="mt-4 p-4 bg-[#141414] border border-[#333] rounded-sm">
                <label className="block text-xs text-stone-200 mb-1 font-medium">
                  Detalle del servicio u otra consulta: *
                </label>
                <input
                  type="text"
                  value={otherServiceDetails}
                  onChange={(e) => setOtherServiceDetails(e.target.value)}
                  placeholder="Ej: Prueba de peinado para novia, diagnóstico capilar, etc."
                  className="w-full bg-[#0a0a0a] border border-[#444] focus:border-[#D4AF37] px-3.5 py-2.5 text-xs text-stone-100 rounded focus:outline-none"
                />
                {formErrors.otherDetails && (
                  <p className="text-[11px] text-[#ff6666] mt-1.5">{formErrors.otherDetails}</p>
                )}
              </div>
            )}
          </div>

          {/* STEP 3: Selección en cascada en celdas (Día, Mes, Año, Hora, Minutos) */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#1c1c1c]">
              <span className="w-6 h-6 rounded-full bg-[#181408] border border-[#D4AF37] text-[#D4AF37] text-xs flex items-center justify-center font-bold">
                3
              </span>
              <h3 className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Fecha & Horario (En celdas de cascada) *
              </h3>
            </div>
            <p className="text-[11px] text-[#888] mb-5">
              Elegí cada opción en su celda correspondiente. El horario se limita estrictamente de <strong>09 a 18 hs</strong>. Domingos cerrado.
            </p>

            {/* Celdas en Cascada según diseño solicitado */}
            <div className="space-y-3 mb-6">
              {/* Renglón 1: Día, Mes (más corto), Año (más corto) en un mismo renglón */}
              <div className="flex flex-row items-center gap-2 sm:gap-3 w-full">
                {/* Celda Día */}
                <div className="flex-1 min-w-0 bg-[#111] border border-[#2a2a2a] hover:border-[#D4AF37]/50 rounded-sm p-2 sm:p-3 transition-colors relative">
                  <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                    Día
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(Number(e.target.value))}
                      className="w-full appearance-none bg-[#0a0a0a] border border-[#333] hover:border-[#555] focus:border-[#D4AF37] text-stone-100 text-xs sm:text-sm font-medium py-2 sm:py-2.5 px-2.5 pr-7 rounded focus:outline-none cursor-pointer truncate"
                    >
                      {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((d) => {
                        const dateObj = new Date(selectedYear, selectedMonth - 1, d);
                        const dayOfWeekIndex = dateObj.getDay();
                        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                        const dayName = dayNames[dayOfWeekIndex];
                        const isClosedDay = isDayOfWeekClosed(dayOfWeekIndex);

                        return (
                          <option key={d} value={d} className="bg-[#111] text-white">
                            {dayName} {d} {isClosedDay ? '(Cerrado)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#888] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Celda Mes: simplemente el nombre del mes sin número y más corto */}
                <div className="w-[110px] sm:w-[135px] flex-shrink-0 bg-[#111] border border-[#2a2a2a] hover:border-[#D4AF37]/50 rounded-sm p-2 sm:p-3 transition-colors relative">
                  <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                    Mes
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full appearance-none bg-[#0a0a0a] border border-[#333] hover:border-[#555] focus:border-[#D4AF37] text-stone-100 text-xs sm:text-sm font-medium py-2 sm:py-2.5 px-2.5 pr-7 rounded focus:outline-none cursor-pointer truncate"
                    >
                      {MONTH_NAMES.map((m) => (
                        <option key={m.value} value={m.value} className="bg-[#111] text-white">
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#888] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Celda Año: más corto */}
                <div className="w-[80px] sm:w-[100px] flex-shrink-0 bg-[#111] border border-[#2a2a2a] hover:border-[#D4AF37]/50 rounded-sm p-2 sm:p-3 transition-colors relative">
                  <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                    Año
                  </label>
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full appearance-none bg-[#0a0a0a] border border-[#333] hover:border-[#555] focus:border-[#D4AF37] text-stone-100 text-xs sm:text-sm font-medium py-2 sm:py-2.5 px-2.5 pr-7 rounded focus:outline-none cursor-pointer"
                    >
                      <option value={currentYear} className="bg-[#111] text-white">
                        {currentYear}
                      </option>
                      <option value={currentYear + 1} className="bg-[#111] text-white">
                        {currentYear + 1}
                      </option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#888] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Renglón 2: Hora (más corto), Minutos (más corto) y al costado el botón de confirmar la hora */}
              <div className="flex flex-row items-end gap-2 sm:gap-3 w-full">
                {/* Celda Hora: más corto */}
                <div className="w-[85px] sm:w-[110px] flex-shrink-0 bg-[#111] border border-[#2a2a2a] hover:border-[#D4AF37]/50 rounded-sm p-2 sm:p-3 transition-colors relative">
                  <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                    Hora
                  </label>
                  <div className="relative">
                    <select
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(e.target.value)}
                      className="w-full appearance-none bg-[#0a0a0a] border border-[#333] hover:border-[#555] focus:border-[#D4AF37] text-stone-100 text-xs sm:text-sm font-medium py-2 sm:py-2.5 px-2.5 pr-7 rounded focus:outline-none cursor-pointer"
                    >
                      {AVAILABLE_HOURS.map((h) => (
                        <option key={h} value={h} className="bg-[#111] text-white">
                          {h} hs
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#888] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Celda Minutos: más corto */}
                <div className="w-[85px] sm:w-[110px] flex-shrink-0 bg-[#111] border border-[#2a2a2a] hover:border-[#D4AF37]/50 rounded-sm p-2 sm:p-3 transition-colors relative">
                  <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                    Minutos
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(e.target.value)}
                      className="w-full appearance-none bg-[#0a0a0a] border border-[#333] hover:border-[#555] focus:border-[#D4AF37] text-stone-100 text-xs sm:text-sm font-medium py-2 sm:py-2.5 px-2.5 pr-7 rounded focus:outline-none cursor-pointer"
                    >
                      {AVAILABLE_MINUTES.map((m) => (
                        <option key={m} value={m} className="bg-[#111] text-white">
                          :{m} min
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#888] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Botón Confirmar la hora al costado en el espacio que sobra */}
                <div className="flex-1 min-w-0">
                  <button
                    type="submit"
                    disabled={isSubmitting || evaluatedDateInfo.isClosed || evaluatedDateInfo.isPast}
                    className={`w-full h-[58px] sm:h-[65px] px-2 sm:px-4 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-sm transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg ${
                      evaluatedDateInfo.isClosed || evaluatedDateInfo.isPast
                        ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                        : 'bg-[#D6001C] hover:bg-[#b00017] shadow-[0_0_20px_rgba(214,0,28,0.4)] hover:shadow-[0_0_25px_rgba(214,0,28,0.6)] cursor-pointer'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#f1d592] flex-shrink-0" />
                    <span className="truncate">Confirmar la hora</span>
                  </button>
                </div>
              </div>
            </div>

            {/* VISTA PREVIA: "y luego muestre lo seleccionado" */}
            <div className={`p-4 rounded-sm border transition-all ${
              evaluatedDateInfo.isClosed
                ? 'bg-[#180a0a] border-[#D6001C]'
                : evaluatedDateInfo.isPast
                ? 'bg-[#18110a] border-[#ff9900]/60'
                : 'bg-[#131008] border-[#D4AF37]/60 shadow-[0_0_20px_rgba(212,175,55,0.1)]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-medium block">
                    Resumen de Selección en Vivo:
                  </span>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-stone-100 font-medium">
                    <span className="flex items-center gap-1.5 text-[#f1d592]">
                      <Calendar className="w-4 h-4 text-[#D4AF37]" />
                      <strong>{evaluatedDateInfo.formattedText}</strong>
                    </span>
                    <span className="text-[#666]">•</span>
                    <span className="flex items-center gap-1.5 text-stone-200 font-mono">
                      <Clock className="w-4 h-4 text-[#D4AF37]" />
                      <strong>{evaluatedDateInfo.timeStr} hs</strong>
                    </span>
                    <span className="text-[#666]">•</span>
                    <span className="text-stone-300">
                      Servicio: <strong className="text-white">{selectedService?.name}</strong>
                    </span>
                  </div>
                </div>

                {/* State Badge */}
                <div>
                  {evaluatedDateInfo.isClosed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#D6001C]/20 border border-[#D6001C] text-[#ff7070] text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{evaluatedDateInfo.isMonday ? 'LUNES CERRADO' : 'DOMINGOS CERRADO'}</span>
                    </span>
                  ) : evaluatedDateInfo.isPast ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-900/30 border border-amber-600 text-amber-300 text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>FECHA PASADA</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>DÍA HÁBIL DISPONIBLE</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Warning message if Closed or Past */}
              {evaluatedDateInfo.isClosed && (
                <p className="text-xs text-[#ff9999] mt-3 pt-2.5 border-t border-[#D6001C]/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{evaluatedDateInfo.closedMessage}</span>
                </p>
              )}
              {evaluatedDateInfo.isPast && !evaluatedDateInfo.isClosed && (
                <p className="text-xs text-amber-300 mt-3 pt-2.5 border-t border-amber-500/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>La fecha seleccionada ya pasó. Por favor seleccioná un día a partir de hoy.</span>
                </p>
              )}
            </div>

            {formErrors.date && (
              <p className="text-[11px] text-[#ff6666] mt-2 font-medium">{formErrors.date}</p>
            )}
          </div>

          {/* Optional Notes */}
          <div className="mb-8">
            <label className="block text-xs text-[#888] font-normal mb-1.5">
              Observaciones o preferencias especiales (opcional):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Cabello con tintura previa, deseo consultar sobre balayage o alisado, etc."
              className="w-full bg-[#111] border border-[#333] focus:border-[#D4AF37] px-3.5 py-2.5 text-xs text-stone-200 rounded focus:outline-none resize-none"
            />
          </div>

          {/* Submission to WhatsApp */}
          <div className="pt-6 border-t border-[#1c1c1c] flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="text-left max-w-md">
              <span className="text-xs text-stone-300 block font-medium">
                Envío de Reserva a WhatsApp (+54 9 11 6580-4616)
              </span>
              <p className="text-[11px] text-[#777] mt-0.5">
                Al confirmar, se guardará tu turno en el sistema y se abrirá WhatsApp con el mensaje formateado para Celia Figueredo.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || evaluatedDateInfo.isClosed || evaluatedDateInfo.isPast}
              className={`w-full md:w-auto py-4 px-10 text-white font-medium text-xs tracking-[0.25em] uppercase transition-all duration-300 rounded-sm cursor-pointer flex items-center justify-center gap-3 ${
                evaluatedDateInfo.isClosed || evaluatedDateInfo.isPast
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                  : 'bg-[#D6001C] hover:bg-[#b50017] shadow-[0_0_25px_rgba(214,0,28,0.4)] hover:shadow-[0_0_35px_rgba(214,0,28,0.6)] hover:-translate-y-0.5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#f1d592]" />
              <span>{isSubmitting ? 'Procesando...' : 'Dar el Okey & Enviar por WhatsApp'}</span>
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
