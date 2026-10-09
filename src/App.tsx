/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HoursAndLocation } from './components/HoursAndLocation';
import { BookingSection } from './components/BookingSection';
import { ClientAppointmentsSection } from './components/ClientAppointmentsSection';
import { FooterSection } from './components/FooterSection';
import { MasterPanel } from './components/MasterPanel';
import { Appointment } from './types';
import { SALON_INFO } from './data/services';
import { ArrowUp } from 'lucide-react';
import { WhatsAppIcon } from './components/WhatsAppIcon';

function getInitialRoute(): 'turnos' | 'master' {
  if (typeof window === 'undefined') return 'turnos';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path.includes('/master') || hash === '#master' || hash === '#/master') {
    return 'master';
  }
  return 'turnos';
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<'turnos' | 'master'>(getInitialRoute);
  const [appointmentSyncTrigger, setAppointmentSyncTrigger] = useState<number>(Date.now());
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle URL change detection (supports /master, /turnos, and hash fallbacks)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(getInitialRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (route: 'turnos' | 'master') => {
    setCurrentRoute(route);
    const targetUrl = route === 'master' ? '/master' : '/turnos';
    try {
      window.history.pushState(null, '', targetUrl);
    } catch {
      window.location.hash = route;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Monitor scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAppointmentCreated = (newAppointment: Appointment) => {
    setAppointmentSyncTrigger(Date.now());
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // RENDER MASTER PANEL (Hidden admin, accessible only via /master)
  if (currentRoute === 'master') {
    return <MasterPanel onNavigateHome={() => navigateTo('turnos')} />;
  }

  // RENDER CLIENT BOOKING PAGE (/turnos)
  return (
    <div className="min-h-screen bg-[#050505] text-stone-100 flex flex-col font-sans selection:bg-[#D6001C] selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />

        {/* Booking Form with Cascade Cells */}
        <BookingSection
          onAppointmentCreated={handleAppointmentCreated}
        />

        {/* Consult and Manage Appointments (36hs policy) */}
        <ClientAppointmentsSection lastUpdatedTrigger={appointmentSyncTrigger} />

        {/* Location & Gallery Entrances (Av Pueyrredon 1357 & Av Santa Fe 2450) */}
        <HoursAndLocation />
      </main>

      {/* Philosophy & Footer */}
      <FooterSection />

      {/* Floating Action Buttons */}
      {/* Floating WhatsApp button */}
      <a
        href="https://wa.me/5491165804616?text=Hola%20me%20gustaria%20pedir%20un%20Turno%20para%20..."
        target="_blank"
        rel="noopener noreferrer"
        title="Pedir un Turno por WhatsApp"
        aria-label="Pedir un Turno por WhatsApp"
        className="fixed bottom-6 right-6 z-[99999] p-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-[0_4px_25px_rgba(37,211,102,0.5)] transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer group"
      >
        <WhatsAppIcon className="w-7 h-7 text-white drop-shadow-sm group-hover:rotate-6 transition-transform" />
      </a>

      {/* Back to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Volver arriba"
          className="fixed bottom-6 left-6 z-40 p-3 bg-[#111] hover:bg-[#D6001C] text-[#D4AF37] hover:text-white border border-[#2a2415] hover:border-[#D6001C] rounded-full shadow-lg transition-all duration-300 cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
