import React, { useState, useEffect } from 'react';
import { SALON_INFO } from '../data/services';
import { WhatsAppIcon } from './WhatsAppIcon';
import {
  Menu,
  X,
  Calendar,
  Instagram,
  ExternalLink,
  MapPin,
  HelpCircle,
  Home,
  Scissors,
  Sparkles,
  Star,
  Search
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // The 6 exact navigation items requested for "el sandwich":
  // Inicio, Estilos, Servicios, Opiniones, Ubicación, Preguntas
  const NAV_ITEMS = [
    {
      label: 'Inicio',
      href: SALON_INFO.websiteUrl,
      icon: Home,
      internalAnchor: '#estudio'
    },
    {
      label: 'Estilos',
      href: SALON_INFO.websiteEstilosUrl,
      icon: Scissors
    },
    {
      label: 'Servicios',
      href: SALON_INFO.websiteServicesUrl,
      icon: Sparkles
    },
    {
      label: 'Opiniones',
      href: SALON_INFO.websiteOpinionesUrl,
      icon: Star
    },
    {
      label: 'Ubicación',
      href: SALON_INFO.mapsUrl,
      icon: MapPin,
      isExternal: true
    },
    {
      label: 'Preguntas',
      href: SALON_INFO.websiteFaqUrl,
      icon: HelpCircle
    }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-40 bg-[#050505]/95 backdrop-blur-md border-b border-[#1c1c1c]/90 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <a href={SALON_INFO.websiteUrl} className="flex items-center gap-3 group">
            <img
              src={SALON_INFO.logoUrl}
              alt="Studio Celia Figueredo"
              className="w-10 h-10 object-contain drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-serif-luxury text-lg md:text-xl tracking-[0.25em] text-[#D4AF37] uppercase group-hover:text-[#f1d592] transition-colors block leading-tight">
                CELIA FIGUEREDO
              </span>
              <span className="text-[8px] uppercase tracking-[0.3em] text-[#777] font-light block">
                Atelier Recoleta
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links: Inicio, Estilos, Servicios, Opiniones, Ubicación, Preguntas */}
          <div className="hidden xl:flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] font-light">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                className="text-[#a0a0a0] hover:text-[#D4AF37] transition-colors flex items-center gap-1 group"
              >
                <span>{item.label}</span>
                {item.isExternal && (
                  <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                )}
              </a>
            ))}

            {/* Mis Turnos link */}
            <a
              href="#mis-turnos"
              className="text-[#a0a0a0] hover:text-[#D4AF37] transition-colors flex items-center gap-1"
            >
              <span>Mis Turnos</span>
            </a>
          </div>

          {/* Desktop CTA & Sandwich trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* CTA 1: Turnos online (Rojo) */}
            <a
              href="#reservar"
              className="hidden sm:flex py-2.5 px-3.5 bg-[#D6001C] hover:bg-[#b00017] text-white text-[11px] uppercase tracking-wider font-semibold transition-all duration-300 rounded-sm items-center gap-1.5 shadow-[0_0_12px_rgba(214,0,28,0.4)]"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Turnos online</span>
            </a>

            {/* CTA 2: Watsapp directo (Verde) */}
            <a
              href="https://wa.me/5491165804616?text=Hola%20me%20gustaria%20pedir%20un%20Turno%20para%20..."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex py-2.5 px-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] uppercase tracking-wider font-semibold transition-all duration-300 rounded-sm items-center gap-1.5 shadow-[0_0_12px_rgba(37,211,102,0.4)]"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Watsapp directo</span>
            </a>

            {/* Instagram icon */}
            <a
              href={SALON_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram Oficial @studioceliabelleza"
              className="hidden md:flex p-2 text-[#a0a0a0] hover:text-[#D4AF37] hover:bg-[#141414] border border-transparent hover:border-[#333] rounded transition-all"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* EL SANDWICH BUTTON (Hamburger Menu) - Visible and accessible */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 text-[#D4AF37] hover:text-white bg-[#121212] hover:bg-[#1a1a1a] border border-[#2a2415] hover:border-[#D4AF37]/60 py-2 px-3 rounded cursor-pointer transition-all shadow-[0_0_15px_rgba(212,175,55,0.1)]"
              aria-label="Abrir menú sándwich"
              title="Menú Sándwich"
            >
              {menuOpen ? (
                <X className="w-5 h-5 text-[#D4AF37]" />
              ) : (
                <Menu className="w-5 h-5 text-[#D4AF37]" />
              )}
              <span className="text-[10px] uppercase tracking-widest font-semibold hidden xs:inline text-stone-300">
                Menú
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* EL SANDWICH: Slide-out Navigation Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-sm sm:max-w-md bg-[#080808] border-l border-[#222] h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-fade-in">
            {/* Drawer Top Header */}
            <div className="p-6 border-b border-[#1c1c1c] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={SALON_INFO.logoUrl}
                  alt="Logo"
                  className="w-9 h-9 object-contain"
                />
                <div>
                  <span className="font-serif-luxury text-base tracking-[0.2em] text-[#D4AF37] uppercase block">
                    CELIA FIGUEREDO
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.3em] text-[#888]">
                    Menú Principal
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 text-stone-400 hover:text-white bg-[#141414] hover:bg-[#222] border border-[#333] rounded-full transition-colors cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Nav Links: Inicio, Estilos, Servicios, Opiniones, Ubicación, Preguntas */}
            <div className="p-6 flex-1 space-y-1">
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold block mb-3 px-3">
                Secciones
              </span>

              {NAV_ITEMS.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded text-stone-300 hover:text-white hover:bg-[#14120a] border border-transparent hover:border-[#D4AF37]/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-[#111] group-hover:bg-[#1a1608] text-[#D4AF37] border border-[#222] group-hover:border-[#D4AF37]/50 transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-xs uppercase tracking-[0.2em] font-medium group-hover:text-[#f1d592] transition-colors">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-stone-600 group-hover:text-[#D4AF37] transition-colors">
                      <span className="text-[10px] font-mono">0{index + 1}</span>
                      <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    </div>
                  </a>
                );
              })}

              {/* Extra direct link: Mis Turnos */}
              <div className="pt-3 mt-3 border-t border-[#1a1a1a]">
                <a
                  href="#mis-turnos"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded text-stone-400 hover:text-white hover:bg-[#141414] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs uppercase tracking-wider font-medium">
                      Consultar Mis Turnos
                    </span>
                  </div>
                  <span className="text-[10px] text-[#777] font-mono">Ver</span>
                </a>
              </div>
            </div>

            {/* Drawer Bottom CTA Buttons: Turnos online & Watsapp directo */}
            <div className="p-6 border-t border-[#1c1c1c] bg-[#050505] space-y-3">
              <span className="text-[9px] uppercase tracking-[0.25em] text-stone-400 font-semibold block text-center">
                Atención Inmediata
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Botón 1: Turnos online (Rojo) */}
                <a
                  href="#reservar"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 px-2 bg-[#D6001C] hover:bg-[#b00017] text-white text-center rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(214,0,28,0.4)] transition-all"
                >
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Turnos online</span>
                </a>

                {/* Botón 2: Watsapp directo (Verde) */}
                <a
                  href="https://wa.me/5491165804616?text=Hola%20me%20gustaria%20pedir%20un%20Turno%20para%20..."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 px-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-center rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,211,102,0.4)] transition-all"
                >
                  <WhatsAppIcon className="w-4 h-4 flex-shrink-0 text-white" />
                  <span className="truncate">Watsapp directo</span>
                </a>
              </div>

              {/* Instagram footer link */}
              <a
                href={SALON_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pt-2 text-[10px] text-stone-500 hover:text-[#D4AF37] flex items-center justify-center gap-1.5 transition-colors uppercase tracking-widest"
              >
                <Instagram className="w-3 h-3 text-[#D4AF37]" />
                <span>Instagram @studioceliabelleza</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
