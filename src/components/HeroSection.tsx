import React, { useState, useEffect } from 'react';
import { StudioLogo } from './StudioLogo';
import { SALON_INFO, DaySchedule, DEFAULT_WEEKLY_SCHEDULE } from '../data/services';
import { getStoredWeeklySchedule } from '../utils/appointmentStorage';
import { MapPin, Calendar, Search, Sparkles, Clock, ExternalLink } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

export const HeroSection: React.FC = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    return getStoredWeeklySchedule();
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setSchedule(getStoredWeeklySchedule());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  return (
    <section id="estudio" className="relative min-h-screen pt-28 pb-20 flex flex-col items-center justify-center text-center px-4 md:px-8 overflow-hidden bg-radial from-[#181818] via-[#080808] to-[#030303]">
      {/* Decorative subtle ambient lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-[#D6001C]/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* The Studio Logo */}
        <div className="mb-6 animate-fade-in">
          <StudioLogo size={220} showText={false} />
        </div>

        {/* Tagline specified by user: ESTUDIO EXCLUSIVO • DESDE 2016 */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#D4AF37]/30 bg-[#120f06]/70 mb-5">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          <span className="text-[10px] md:text-xs tracking-[0.35em] text-[#D4AF37] uppercase font-medium">
            {SALON_INFO.tagline}
          </span>
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
        </div>

        {/* Main Title: CELIA FIGUEREDO */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif-luxury font-light tracking-[0.15em] uppercase text-stone-100 mb-6 drop-shadow-[0_2px_15px_rgba(212,175,55,0.25)]">
          <span className="gold-gradient-text block">CELIA FIGUEREDO</span>
        </h1>

        {/* Studio Manifest specified by user:
            "Un espacio donde la precisión, la experiencia y el cuidado se encuentran para crear una versión de vos que te represente." */}
        <p className="text-base sm:text-lg md:text-xl font-serif-luxury text-[#e0e0e0] italic max-w-2xl mx-auto leading-relaxed mb-6 font-light">
          "{SALON_INFO.slogan}"
        </p>

        {/* Address specified by user:
            "Av. Santa Fe 2450, Local 47, 1.er piso.
             Galería Americana • Esquina Av. Pueyrredón. Recoleta" */}
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-[#D4AF37] tracking-wider mb-10 max-w-xl mx-auto bg-[#0d0d0d]/80 border border-[#222] py-2.5 px-5 rounded-full">
          <MapPin className="w-4 h-4 text-[#D6001C] flex-shrink-0" />
          <span className="text-stone-300">
            {SALON_INFO.address.street} • {SALON_INFO.address.reference} • Recoleta
          </span>
        </div>

        {/* Primary Dual CTA Buttons: Siempre uno al lado del otro, mismo tamaño */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md sm:max-w-lg mx-auto">
          {/* Botón 1: Turnos online (Rojo) */}
          <a
            href="#reservar"
            className="w-full py-3.5 sm:py-4 px-3 sm:px-6 bg-[#D6001C] hover:bg-[#b00017] text-white text-center text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest font-semibold transition-all duration-300 rounded-sm shadow-[0_0_20px_rgba(214,0,28,0.45)] hover:shadow-[0_0_30px_rgba(214,0,28,0.65)] hover:-translate-y-0.5 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Turnos online</span>
          </a>

          {/* Botón 2: Watsapp directo (Verde) */}
          <a
            href="https://wa.me/5491165804616?text=Hola%20me%20gustaria%20pedir%20un%20Turno%20para%20..."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 sm:py-4 px-3 sm:px-6 bg-[#25D366] hover:bg-[#20ba59] text-white text-center text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest font-semibold transition-all duration-300 rounded-sm shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] hover:-translate-y-0.5 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 flex-shrink-0 text-white" />
            <span className="truncate">Watsapp directo</span>
          </a>
        </div>

        {/* Link to consult existing appointments */}
        <div className="mt-5">
          <a
            href="#mis-turnos"
            className="inline-flex items-center gap-1.5 text-xs text-[#a0a0a0] hover:text-[#D4AF37] transition-colors tracking-wider"
          >
            <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>¿Ya tenés turno? Consultar o reprogramar mi reserva</span>
          </a>
        </div>

        {/* Recuadro / Cartel Comercial de Horarios de Atención (Estilo Placa Vidriera con Ventosas / Suction Cups como en la imagen) */}
        <div className="mt-8 w-full max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto relative group">
          {/* Main Acrylic Sign Plaque */}
          <div className="relative bg-[#070707] border-2 border-stone-700/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-left overflow-hidden">
            {/* 4 Corner Suction Cups / Standoffs (Ventosas de fijación a vidrio idénticas a la foto) */}
            <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-stone-200 via-stone-400 to-stone-600 border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center justify-center pointer-events-none">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-stone-900 border border-stone-600/70" />
            </div>
            <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-stone-200 via-stone-400 to-stone-600 border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center justify-center pointer-events-none">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-stone-900 border border-stone-600/70" />
            </div>
            <div className="absolute bottom-3.5 left-3.5 sm:bottom-4 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-stone-200 via-stone-400 to-stone-600 border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center justify-center pointer-events-none">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-stone-900 border border-stone-600/70" />
            </div>
            <div className="absolute bottom-3.5 right-3.5 sm:bottom-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-stone-200 via-stone-400 to-stone-600 border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center justify-center pointer-events-none">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-stone-900 border border-stone-600/70" />
            </div>

            {/* Subtle glass reflection sheen */}
            <div className="absolute -top-12 -left-12 w-96 h-32 bg-white/[0.03] rotate-12 blur-xl pointer-events-none" />

            {/* Plaque Header: Large, bold, centered uppercase as shown in reference sign */}
            <div className="text-center pb-4 sm:pb-5 mb-3 sm:mb-4 border-b-2 border-stone-700/80 relative z-10 px-4">
              <div className="inline-flex items-center justify-center gap-2 mb-1.5">
                <Clock className="w-5 h-5 text-white/90" />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-[0.16em] sm:tracking-[0.2em] text-white font-sans">
                  HORARIO DE ATENCIÓN
                </h3>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-stone-300 font-sans tracking-wide">
                <span className="font-semibold text-white/90">Galería Americana • Local 47</span>
                <span className="text-stone-600 hidden sm:inline">•</span>
                <a
                  href={SALON_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#D4AF37] hover:text-[#f1d592] hover:underline font-bold text-xs uppercase tracking-wider"
                  title="Abrir y verificar ficha oficial en Google Maps"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Days and Hours List: Wide layout, ultra-legible bold white typography as requested */}
            <div className="divide-y divide-stone-800/90 relative z-10 font-sans">
              {schedule.map((item) => {
                const isClosed = item.isClosed || item.hoursText.toLowerCase().includes('cerrado');
                return (
                  <div
                    key={item.dayKey}
                    className="flex items-center justify-between py-2.5 sm:py-3.5 px-2 sm:px-4 transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Day Column (Full name, Bold Sans-Serif White) */}
                    <span className="font-black text-white text-base sm:text-lg md:text-xl uppercase tracking-wider">
                      {item.dayFull}
                    </span>

                    {/* Hours Column (Bold Sans-Serif White or Red Cerrado) */}
                    {isClosed ? (
                      <span className="inline-flex items-center gap-1.5 font-black uppercase tracking-wider text-[#ff3344] text-base sm:text-lg md:text-xl">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff3344] inline-block animate-pulse" />
                        CERRADO
                      </span>
                    ) : (
                      <span className="font-black text-white text-base sm:text-lg md:text-xl uppercase tracking-wider">
                        {item.hoursText.toUpperCase()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Plaque Footer: Official Google Maps Live Sync status */}
            <div className="mt-5 pt-3.5 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] sm:text-xs text-stone-400 font-sans relative z-10 px-2">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                <span className="text-stone-300">Horarios sincronizados con Google Maps oficial</span>
              </span>
              <span className="text-stone-500 italic">
                Lunes y Domingos Cerrado
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
