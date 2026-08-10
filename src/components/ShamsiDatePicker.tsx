import React, { useState, useRef, useEffect } from 'react';
import {
  JalaliDate,
  JALALI_MONTH_NAMES,
  PERSIAN_WEEK_DAYS,
  getJalaliMonthDays,
  getJalaliDayOfWeek,
  getTodayJalali,
  isoStringToJalali,
  jalaliToIsoString,
  getIranianHolidayInfo,
  formatJalaliDate,
  toPersianDigits,
} from '../utils/jalali';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';

interface ShamsiDatePickerProps {
  selectedDateIso: string; // YYYY-MM-DD
  onChange: (isoDate: string, jalaliDateStr: string) => void;
  label?: string;
  isDarkMode?: boolean;
  inline?: boolean;
  align?: 'right' | 'left' | 'center' | 'auto';
}

export const ShamsiDatePicker: React.FC<ShamsiDatePickerProps> = ({
  selectedDateIso,
  onChange,
  label = 'تاریخ',
  isDarkMode = false,
  inline = false,
  align = 'auto',
}) => {
  const isDark = isDarkMode || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const selectedJalali = isoStringToJalali(selectedDateIso);
  const today = getTodayJalali();

  const [viewJalali, setViewJalali] = useState<JalaliDate>({
    jy: selectedJalali.jy,
    jm: selectedJalali.jm,
    jd: selectedJalali.jd,
  });

  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; positionAbove: boolean }>({
    top: 0,
    left: 0,
    positionAbove: false,
  });

  const updatePopoverPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popWidth = Math.min(320, window.innerWidth - 24);
      const popHeight = Math.min(390, window.innerHeight - 24);

      const isSmallScreen = window.innerWidth < 640 || window.innerHeight < 520;

      if (isSmallScreen) {
        // Center in viewport on small screens to ensure all days are fully visible
        const top = Math.max(12, (window.innerHeight - popHeight) / 2);
        const left = Math.max(12, (window.innerWidth - popWidth) / 2);
        setPopoverPos({ top, left, positionAbove: false });
      } else {
        // Position as close as possible to trigger button while staying 100% within viewport
        let top = rect.bottom + 6;
        let positionAbove = false;
        if (top + popHeight > window.innerHeight - 12) {
          top = rect.top - popHeight - 6;
          positionAbove = true;
        }
        top = Math.max(12, Math.min(top, window.innerHeight - popHeight - 12));

        const btnCenter = rect.left + rect.width / 2;
        let left = btnCenter - popWidth / 2;
        left = Math.max(12, Math.min(left, window.innerWidth - popWidth - 12));

        setPopoverPos({ top, left, positionAbove });
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePopoverPosition();
      const handleScrollOrResize = () => updatePopoverPosition();
      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);
      return () => {
        window.removeEventListener('resize', handleScrollOrResize);
        window.removeEventListener('scroll', handleScrollOrResize, true);
      };
    }
  }, [isOpen]);

  // Month navigation
  const handlePrevMonth = () => {
    setViewJalali((prev) => {
      if (prev.jm === 1) {
        return { ...prev, jy: prev.jy - 1, jm: 12 };
      }
      return { ...prev, jm: prev.jm - 1 };
    });
  };

  const handleNextMonth = () => {
    setViewJalali((prev) => {
      if (prev.jm === 12) {
        return { ...prev, jy: prev.jy + 1, jm: 1 };
      }
      return { ...prev, jm: prev.jm + 1 };
    });
  };

  // Days grid calculation
  const monthDaysCount = getJalaliMonthDays(viewJalali.jy, viewJalali.jm);
  const firstDayOfWeekIndex = getJalaliDayOfWeek(viewJalali.jy, viewJalali.jm, 1);

  // Handle day select
  const handleSelectDay = (dayNum: number) => {
    const targetJalali: JalaliDate = { jy: viewJalali.jy, jm: viewJalali.jm, jd: dayNum };
    const isoStr = jalaliToIsoString(targetJalali);
    const jalaliStr = formatJalaliDate(targetJalali, false);
    onChange(isoStr, jalaliStr);
    if (!inline) {
      setIsOpen(false);
    }
  };

  const activeHolidayInfo = getIranianHolidayInfo(selectedJalali.jy, selectedJalali.jm, selectedJalali.jd);

  const yearsList = Array.from({ length: 11 }, (_, i) => 1398 + i); // 1398 to 1408

  const calendarGrid = (
    <div className={`p-4 rounded-2xl border ${
      isDark
        ? 'bg-[#0F2834] border-slate-600 text-white shadow-2xl shadow-slate-950/90 ring-1 ring-slate-700/80'
        : 'bg-white border-slate-200 text-slate-800 shadow-xl'
    }`}>
      {/* Month & Year Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-700/80 mb-3">
        <button
          type="button"
          onClick={handleNextMonth}
          title="ماه بعدی"
          className={`p-1.5 rounded-xl border transition-colors ${
            isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-200' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <select
            value={viewJalali.jm}
            onChange={(e) => setViewJalali({ ...viewJalali, jm: Number(e.target.value) })}
            className={`font-bold text-xs rounded-lg px-2 py-1 border focus:outline-hidden cursor-pointer ${
              isDark
                ? 'bg-[#183B4D] border-slate-600 text-teal-300 [&>option]:bg-[#0F2834] [&>option]:text-white'
                : 'bg-slate-100 border-slate-200 text-indigo-700'
            }`}
          >
            {JALALI_MONTH_NAMES.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={viewJalali.jy}
            onChange={(e) => setViewJalali({ ...viewJalali, jy: Number(e.target.value) })}
            className={`font-bold text-xs rounded-lg px-2 py-1 border focus:outline-hidden cursor-pointer ${
              isDark
                ? 'bg-[#183B4D] border-slate-600 text-teal-300 [&>option]:bg-[#0F2834] [&>option]:text-white'
                : 'bg-slate-100 border-slate-200 text-indigo-700'
            }`}
          >
            {yearsList.map((y) => (
              <option key={y} value={y}>
                {toPersianDigits(y)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handlePrevMonth}
          title="ماه قبلی"
          className={`p-1.5 rounded-xl border transition-colors ${
            isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-200' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {PERSIAN_WEEK_DAYS.map((day, idx) => (
          <div
            key={day}
            className={`text-[10px] font-black py-1 rounded-md ${
              idx === 6
                ? 'text-rose-500'
                : idx === 5
                ? 'text-amber-500'
                : isDark
                ? 'text-slate-400'
                : 'text-slate-500'
            }`}
          >
            {day.charAt(0)}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {/* Empty cells before month start */}
        {Array.from({ length: firstDayOfWeekIndex }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-8" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: monthDaysCount }, (_, i) => i + 1).map((dayNum) => {
          const isSelected =
            selectedJalali.jy === viewJalali.jy &&
            selectedJalali.jm === viewJalali.jm &&
            selectedJalali.jd === dayNum;

          const isToday =
            today.jy === viewJalali.jy &&
            today.jm === viewJalali.jm &&
            today.jd === dayNum;

          const holiday = getIranianHolidayInfo(viewJalali.jy, viewJalali.jm, dayNum);

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => handleSelectDay(dayNum)}
              title={holiday.title || (isToday ? 'امروز' : undefined)}
              className={`relative h-8 w-full rounded-xl font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? isDark
                    ? 'bg-teal-400 text-slate-950 font-black shadow-md ring-2 ring-teal-300'
                    : 'bg-indigo-600 text-white font-black shadow-md ring-2 ring-indigo-300'
                  : isToday
                  ? isDark
                    ? 'border-2 border-teal-400 text-teal-300 bg-teal-950/40'
                    : 'border-2 border-indigo-500 text-indigo-700 bg-indigo-50'
                  : holiday.isHoliday
                  ? 'bg-rose-500/10 text-rose-500 font-black hover:bg-rose-500/20'
                  : holiday.isThursday
                  ? 'text-amber-600 hover:bg-amber-500/10'
                  : isDark
                  ? 'hover:bg-slate-800 text-slate-200'
                  : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              <span>{toPersianDigits(dayNum)}</span>

              {/* Red dot for official holiday */}
              {holiday.isHoliday && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Holiday Info Banner */}
      {activeHolidayInfo.isHoliday && activeHolidayInfo.title && (
        <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] font-bold text-rose-500">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>تعطیل رسمی: {activeHolidayInfo.title}</span>
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className="space-y-2">
        {label && <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</label>}
        {calendarGrid}
      </div>
    );
  }

  return (
    <div className="relative inline-block text-right">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
          isDark
            ? 'bg-[#143242] hover:bg-[#1A3D50] border-slate-700 text-teal-200'
            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
        }`}
      >
        <CalendarIcon className="w-4 h-4 text-teal-400" />
        <span>{formatJalaliDate(selectedJalali, false)}</span>
        {activeHolidayInfo.isHoliday && (
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title={activeHolidayInfo.title || 'تعطیل رسمی'} />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[9990] bg-black/20 dark:bg-black/40" onClick={() => setIsOpen(false)} />
          {/* Fixed Popover positioned cleanly without animations */}
          <div
            style={{
              position: 'fixed',
              zIndex: 9999,
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              width: '320px',
              maxWidth: 'calc(100vw - 24px)',
            }}
            className="select-none"
          >
            {calendarGrid}
          </div>
        </>
      )}
    </div>
  );
};
