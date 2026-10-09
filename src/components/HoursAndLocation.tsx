import React from 'react';
import { MapPin, ExternalLink, Navigation, Compass } from 'lucide-react';
import { SALON_INFO } from '../data/services';

export const HoursAndLocation: React.FC = () => {
  return (
    <section id="horarios-ubicacion" className="py-16 md:py-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto scroll-mt-20">
      {/* Title */}
      <div className="text-center mb-10 md:mb-14">
        <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#D4AF37] font-medium block mb-2">
          Ubicación & Accesos
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-stone-100 font-serif-luxury tracking-wider font-light">
          Cómo Llegar al Atelier
        </h2>
        <div className="w-16 h-px bg-[#D6001C] mx-auto mt-4" />
      </div>

      <div className="bg-[#0a0a0a] border border-[#222] hover:border-[#D4AF37]/40 transition-all duration-300 rounded-sm p-5 sm:p-7 md:p-10 shadow-2xl">
        {/* Main Address Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c1c1c]">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 bg-[#161208] border border-[#D4AF37]/40 rounded-full flex-shrink-0">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[#D6001C]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] block font-light">
                Galería Americana • Recoleta, CABA
              </span>
              <h3 className="text-lg sm:text-xl md:text-2xl text-stone-100 font-serif-luxury tracking-wide mt-0.5">
                {SALON_INFO.address.street}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                {SALON_INFO.address.reference}
              </p>
            </div>
          </div>

          <a
            href={SALON_INFO.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start sm:self-auto inline-flex items-center gap-2 py-2.5 px-4 bg-[#141414] hover:bg-[#D6001C] text-stone-200 hover:text-white border border-[#333] hover:border-[#D6001C] text-xs uppercase tracking-wider rounded transition-all duration-300"
          >
            <span>Ver en Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Detailed Entrances (Entradas a la Galería Americana) */}
        <div className="my-8">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              Accesos a la Galería (Atención: la galería no tiene ascensor)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entrada 1: Av. Pueyrredón 1357 */}
            <div className="bg-[#111] border border-[#222] hover:border-[#333] rounded p-4 sm:p-5 transition-colors">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-100 mb-2">
                <Navigation className="w-4 h-4 text-[#D6001C]" />
                <span>Entrada 1: Av. Pueyrredón 1357</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Ingresás por Av. Pueyrredón 1357, caminás derecho y subís <strong>1 piso por la escalera</strong> (la galería no cuenta con ascensor). Al subir, continuás derecho por el pasillo: el <strong>segundo local a la derecha es el Local 47</strong> (Studio Celia Figueredo).
              </p>
            </div>

            {/* Entrada 2: Av. Santa Fe 2450 */}
            <div className="bg-[#111] border border-[#222] hover:border-[#333] rounded p-4 sm:p-5 transition-colors">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-100 mb-2">
                <Navigation className="w-4 h-4 text-[#D4AF37]" />
                <span>Entrada 2: Av. Santa Fe 2450</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Ingresás por Av. Santa Fe 2450, subís la escalera al primer piso y caminás hasta el final del pasillo <strong>donde está la ventana</strong>, y doblás a la derecha para llegar al <strong>Local 47</strong>.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[#888] mt-4 italic bg-[#0e0e0e] p-3 rounded border border-[#1a1a1a]">
            * Recordatorio: La Galería Americana no dispone de ascensor. Ambos accesos se realizan subiendo un piso por escalera.
          </p>
        </div>

        {/* Embedded Interactive Map - Original colors without grey filter */}
        <div className="rounded overflow-hidden border border-[#333] shadow-lg aspect-[16/7] w-full bg-[#1a1a1a]">
          <iframe
            title="Ubicación Studio Celia Figueredo"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.4447387799277!2d-58.40443882343905!3d-34.59471177295834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca9a88df4d1d%3A0x7abd9aea078000e1!2sPeluqueria%20Celia%20Figueredo!5e0!3m2!1ses!2sar!4v1710000000000!5m2!1ses!2sar"
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
};
