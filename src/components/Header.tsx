import React from 'react';
import { Classroom } from '../types';
import { School, Sun, Moon } from 'lucide-react';
import { getTodayJalali, formatJalaliDate } from '../utils/jalali';

interface HeaderProps {
  classrooms?: Classroom[];
  selectedClassId?: string;
  onSelectClassroom?: (id: string) => void;
  onOpenAddClassModal?: () => void;
  onOpenAndroidImporter?: () => void;
  studentCount?: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode = true,
  onToggleDarkMode,
}) => {
  const todayJalali = getTodayJalali();
  const todayStr = formatJalaliDate(todayJalali, true);

  return (
    <header className={`sticky top-0 z-30 transition-colors border-b shadow-xs ${
      isDarkMode
        ? 'bg-[#102A36] border-slate-700/60 text-white'
        : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Right side: Brand & Title */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-900/40">
                <School className="w-5 h-5 font-bold" />
              </div>
              <div>
                <h1 className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>وب آموزگار</h1>
                <p className={`text-xs font-medium ${isDarkMode ? 'text-teal-300/80' : 'text-slate-500'}`}>دستیار هوشمند مدیریت کلاس درس</p>
              </div>
            </div>
          </div>

          {/* Left side: Date & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Today's Date Badge */}
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 text-xs font-semibold ${
              isDarkMode
                ? 'bg-[#143242] border-slate-700 text-teal-200'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <span>{todayStr}</span>
            </div>

            {/* Theme Toggle Button (Moon / Sun) */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                title={isDarkMode ? 'تغییر به حالت روشن (روز)' : 'تغییر به حالت تاریک (شب)'}
                className={`p-2 rounded-xl transition-all border flex items-center justify-center cursor-pointer active:scale-95 ${
                  isDarkMode
                    ? 'bg-[#143242] hover:bg-[#1A3D50] border-slate-700 text-amber-400 hover:border-amber-400/50'
                    : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-indigo-600 hover:border-indigo-300'
                }`}
              >
                {isDarkMode ? (
                  <Sun className="w-4.5 h-4.5 text-amber-400" />
                ) : (
                  <Moon className="w-4.5 h-4.5 text-indigo-600" />
                )}
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

