import React from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  GraduationCap,
  BookOpen,
  ThumbsUp,
  Calendar,
  BarChart3,
  Settings,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'students'
  | 'attendance'
  | 'grades'
  | 'journal'
  | 'behavior'
  | 'timetable'
  | 'reports'
  | 'settings'
  | 'android_importer';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  attendanceCountToday: number;
  isDarkMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  attendanceCountToday,
  isDarkMode = true,
}) => {
  const menuItems = [
    { id: 'dashboard' as TabType, label: 'داشبورد اصلی', shortLabel: 'داشبورد', icon: LayoutDashboard },
    { id: 'attendance' as TabType, label: 'حضور و غیاب', shortLabel: 'حضور و غیاب', icon: ClipboardCheck, badge: attendanceCountToday > 0 ? `${attendanceCountToday} ثبت شده` : null },
    { id: 'students' as TabType, label: 'لیست دانش‌آموزان', shortLabel: 'دانش‌آموزان', icon: Users },
    { id: 'grades' as TabType, label: 'نمره‌دهی و ارزیابی', shortLabel: 'نمره‌دهی', icon: GraduationCap },
    { id: 'journal' as TabType, label: 'گزارش روزانه', shortLabel: 'گزارش روزانه', icon: BookOpen },
    { id: 'timetable' as TabType, label: 'برنامه هفتگی', shortLabel: 'برنامه', icon: Calendar },
    { id: 'settings' as TabType, label: 'تنظیمات برنامه', shortLabel: 'تنظیمات', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar (visible on large screens lg and above) */}
      <aside className={`hidden lg:block w-64 flex-shrink-0 p-4 space-y-1 transition-colors border-l ${
        isDarkMode
          ? 'bg-[#102A36] border-slate-700/60 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className={`text-xs font-bold px-3 pb-2 uppercase tracking-wider ${
          isDarkMode ? 'text-teal-400/80' : 'text-slate-400'
        }`}>
          منوی مدیریت کلاس
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? isDarkMode
                      ? 'bg-teal-500 text-slate-950 font-extrabold shadow-md shadow-teal-950/40'
                      : 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : isDarkMode
                      ? 'text-slate-300 hover:bg-[#153443] hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${
                    isActive
                      ? isDarkMode ? 'text-slate-950' : 'text-white'
                      : isDarkMode ? 'text-teal-400' : 'text-slate-500'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? isDarkMode ? 'bg-slate-950/20 text-slate-950' : 'bg-white/20 text-white'
                      : isDarkMode ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile & Tablet Bottom Navigation Bar (visible below lg breakpoint - minimized icon-only) */}
      <nav className={`lg:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-md border-t shadow-[0_-4px_20px_rgba(0,0,0,0.25)] py-2 px-3 flex items-center justify-around gap-1 overflow-x-auto ${
        isDarkMode
          ? 'bg-[#102A36]/95 border-slate-700/80 text-white'
          : 'bg-slate-900/95 border-slate-800 text-white'
      }`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              className={`flex items-center justify-center p-2.5 rounded-2xl transition-all relative ${
                isActive
                  ? isDarkMode
                    ? 'text-slate-950 bg-teal-400 shadow-md font-bold scale-110'
                    : 'text-white bg-indigo-600 shadow-md scale-110'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />

              {item.badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
