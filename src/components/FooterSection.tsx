import React from 'react';
import { SALON_INFO } from '../data/services';
import { MapPin, Instagram, ExternalLink, Sparkles } from 'lucide-react';
import { StudioLogo } from './StudioLogo';
import { WhatsAppIcon } from './WhatsAppIcon';

export const FooterSection: React.FC = () => {
  return (
    <>
      {/* Philosophy Section from original HTML */}
      <section className="py-24 px-6 bg-black text-center border-t border-b border-[#141414]">
        <div className="max-w-3xl mx-auto">
          <Sparkles className="w-5 h-5 text-[#D4AF37] mx-auto mb-4" />
          <p className="font-serif-luxury italic text-xl md:text-2xl text-stone-200 leading-relaxed font-light">
            "El lujo no es una apariencia, es la armonía perfecta entre la precisión técnica y el flujo de tu propia energía."
          </p>
          <span className="block text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] mt-5">
            — Filosofía Celia Figueredo Atelier
          </span>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="py-16 px-4 md:px-8 bg-[#050505] border-t border-[#1a1a1a] text-center text-xs">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Miniature Logo */}
          <div className="mb-6 opacity-85 hover:opacity-100 transition-opacity">
            <StudioLogo size={110} showText={false} />
          </div>

          <div className="text-[#D4AF37] tracking-[0.2em] font-light text-xs uppercase mb-2">
            {SALON_INFO.address.street.toUpperCase()} • LOCAL 47 • RECOLETA, CABA
          </div>

          <p className="text-[10px] text-stone-400 tracking-[0.25em] uppercase mb-8">
            ATENCIÓN EXCLUSIVA BAJO CITA PREVIA
          </p>

          {/* Social and Contact Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8 mb-10 text-[11px] tracking-widest uppercase">
            <a
              href={SALON_INFO.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a0a0a0] hover:text-[#D4AF37] transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>EL ESTUDIO</span>
            </a>

            <a
              href={SALON_INFO.websiteServicesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a0a0a0] hover:text-[#D4AF37] transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>SERVICIOS</span>
            </a>

            <a
              href={SALON_INFO.websiteFaqUrl}
              className="text-[#a0a0a0] hover:text-[#D4AF37] transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>PREGUNTAS</span>
            </a>

            <a
              href={SALON_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4AF37] hover:text-[#f1d592] transition-colors flex items-center gap-1.5"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>INSTAGRAM</span>
            </a>

            <a
              href="https://wa.me/5491165804616?text=Hola%20me%20gustaria%20pedir%20un%20Turno%20para%20..."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:text-[#20ba59] font-bold transition-colors flex items-center gap-1.5"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>WHATSAPP ELITE</span>
            </a>

            <a
              href={SALON_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>GOOGLE MAPS</span>
            </a>
          </div>

          <div className="w-12 h-px bg-[#262626] mb-8" />

          {/* Credits & Copyright */}
          <div className="space-y-3 text-[10px] text-stone-500">
            <p>
              © {new Date().getFullYear()} CELIA FIGUEREDO ATELIER. TODOS LOS DERECHOS RESERVADOS.
            </p>
            <p className="text-xs" style={{ color: '#facc15' }}>
              creada por <strong className="font-bold" style={{ color: '#facc15' }}>Soul Grafic Desing</strong>{' '}
              <a
                href="https://wa.me/5491176423742?text=hola%20megustaria%20tener%20mi%20propio%20proyecto%20de.."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity ml-1 cursor-pointer font-medium"
                style={{ color: '#facc15', textDecoration: 'none' }}
                title="Hablar de tu proyecto con Soul Grafic Desing"
              >
                click para hablar de tu proyecto.
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
