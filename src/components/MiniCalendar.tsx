import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface MiniCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  minDate?: string; // YYYY-MM-DD, defaults to today
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate,
  onSelectDate,
  minDate
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Initial view month based on selectedDate or today
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Calculate days in month
  const firstDayOfMonth = new Date(year, month, 1);
  // Get day of week where Monday is 0 and Sunday is 6
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6; // Sunday moved to end

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Can we navigate back?
  const canGoPrev = new Date(year, month, 1) > new Date(today.getFullYear(), today.getMonth(), 1);

  // Generate date cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <div className="bg-[#0e0e0e] border border-[#262626] rounded-sm p-4 w-full select-none">
      {/* Month & Nav Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#202020]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-sm font-serif-luxury font-medium text-stone-100 tracking-wider capitalize">
            {monthNames[month]} {year}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            disabled={!canGoPrev}
            className={`p-1.5 rounded transition-colors ${
              canGoPrev
                ? 'hover:bg-[#222] text-[#a0a0a0] hover:text-[#D4AF37] cursor-pointer'
                : 'text-stone-700 cursor-not-allowed'
            }`}
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded hover:bg-[#222] text-[#a0a0a0] hover:text-[#D4AF37] transition-colors cursor-pointer"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map((dayName, idx) => (
          <div
            key={dayName}
            className={`text-[10px] uppercase tracking-wider py-1 font-medium ${
              idx === 6 ? 'text-[#e53935]/70' : 'text-[#888]'
            }`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((dayNum, index) => {
          if (dayNum === null) {
            return <div key={`empty-${index}`} className="h-9" />;
          }

          const cellDate = new Date(year, month, dayNum);
          cellDate.setHours(0, 0, 0, 0);

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const dayOfWeek = cellDate.getDay();
          const isClosed = dayOfWeek === 0 || dayOfWeek === 1; // 0 = Domingo, 1 = Lunes cerrado según Google Maps
          const isPast = cellDate < today;
          const isDisabled = isClosed || isPast;
          const isSelected = selectedDate === dateStr;
          const isToday = cellDate.getTime() === today.getTime();

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(dateStr)}
              className={`h-9 w-full flex flex-col items-center justify-center rounded text-xs transition-all duration-200 relative ${
                isDisabled
                  ? 'text-stone-700 cursor-not-allowed bg-transparent'
                  : isSelected
                  ? 'bg-[#D6001C] text-white font-bold shadow-[0_0_12px_rgba(214,0,28,0.5)] scale-105'
                  : 'text-stone-300 hover:bg-[#1f1a10] hover:text-[#D4AF37] hover:border-[#D4AF37]/40 border border-transparent cursor-pointer'
              } ${isToday && !isSelected ? 'border border-[#D4AF37]/60 text-[#f1d592]' : ''}`}
              title={
                isClosed
                  ? `${dayOfWeek === 1 ? 'Lunes' : 'Domingo'}: Estudio Cerrado (Google Maps)`
                  : isPast
                  ? 'Fecha pasada'
                  : `Seleccionar ${dayNum} de ${monthNames[month]}`
              }
            >
              <span>{dayNum}</span>
              {isClosed && (
                <span className="text-[8px] leading-none text-[#992222] font-mono">cerrado</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[10px] text-[#777] mt-4 pt-3 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D6001C]" />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border border-[#D4AF37]" />
          <span>Hoy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-stone-700" />
          <span>Lun y Dom cerrado</span>
        </div>
      </div>
    </div>
  );
};
