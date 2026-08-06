import React, { useState, useEffect } from 'react';
import { Classroom, TimetableItem } from '../types';
import { Calendar, School, GraduationCap, Plus, Edit3, Trash2, X, Check, Info } from 'lucide-react';

interface TimetableViewProps {
  classrooms: Classroom[];
  timetable: TimetableItem[];
  onUpdateTimetable?: (newTimetable: TimetableItem[]) => void;
  isDarkMode?: boolean;
}

export const TimetableView: React.FC<TimetableViewProps> = ({
  classrooms,
  timetable,
  onUpdateTimetable,
  isDarkMode = false,
}) => {
  // School level state: 'elementary' (5 periods) vs 'secondary' (4 periods)
  const [schoolLevel, setSchoolLevel] = useState<'elementary' | 'secondary'>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_school_level');
      if (saved === 'elementary' || saved === 'secondary') return saved;
    } catch {}
    return 'elementary'; // default to elementary (5 periods)
  });

  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_school_level', schoolLevel);
    } catch (e) {
      console.error(e);
    }
  }, [schoolLevel]);

  const days: Array<'شنبه' | 'یکشنبه' | 'دوشنبه' | 'سه‌شنبه' | 'چهارشنبه' | 'پنجشنبه'> = [
    'شنبه',
    'یکشنبه',
    'دوشنبه',
    'سه‌شنبه',
    'چهارشنبه',
    'پنجشنبه',
  ];

  // Elementary = 5 periods, Secondary = 4 periods
  const periods = schoolLevel === 'elementary' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];

  // Slot editing modal state
  const [editingSlot, setEditingSlot] = useState<{
    dayOfWeek: 'شنبه' | 'یکشنبه' | 'دوشنبه' | 'سه‌شنبه' | 'چهارشنبه' | 'پنجشنبه';
    period: number;
    existingItem?: TimetableItem;
  } | null>(null);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [roomName, setRoomName] = useState('');

  const handleOpenEditModal = (
    dayOfWeek: 'شنبه' | 'یکشنبه' | 'دوشنبه' | 'سه‌شنبه' | 'چهارشنبه' | 'پنجشنبه',
    period: number,
    existingItem?: TimetableItem
  ) => {
    setEditingSlot({ dayOfWeek, period, existingItem });
    if (existingItem) {
      setSelectedClassId(existingItem.classId || '');
      setCustomSubject(existingItem.subject || '');
      setRoomName(existingItem.room || '');
    } else {
      setSelectedClassId(classrooms[0]?.id || '');
      const cls = classrooms[0];
      setCustomSubject(cls ? `${cls.subject}` : '');
      setRoomName('');
    }
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const cls = classrooms.find((c) => c.id === classId);
    if (cls) {
      setCustomSubject(cls.subject);
    }
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || !onUpdateTimetable) return;

    const { dayOfWeek, period, existingItem } = editingSlot;
    const finalSubject = customSubject.trim() || 'درس بدون عنوان';

    const newItem: TimetableItem = {
      id: existingItem ? existingItem.id : `tt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      dayOfWeek,
      period,
      classId: selectedClassId,
      subject: finalSubject,
      room: roomName.trim() || undefined,
    };

    const filtered = timetable.filter(
      (t) => !(t.dayOfWeek === dayOfWeek && t.period === period)
    );

    onUpdateTimetable([...filtered, newItem]);
    setEditingSlot(null);
  };

  const handleDeleteSlot = () => {
    if (!editingSlot || !onUpdateTimetable) return;
    const { dayOfWeek, period } = editingSlot;
    const filtered = timetable.filter(
      (t) => !(t.dayOfWeek === dayOfWeek && t.period === period)
    );
    onUpdateTimetable(filtered);
    setEditingSlot(null);
  };

  return (
    <div className="space-y-3.5">
      {/* Header & School Level Switcher */}
      <div className={`rounded-2xl border p-3.5 sm:p-4 shadow-sm transition-all ${
        isDarkMode
          ? 'bg-[#143242] border-slate-700/80 text-white'
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2.5">
              <Calendar className={`w-6 h-6 ${isDarkMode ? 'text-teal-400' : 'text-indigo-600'}`} />
              <span>برنامه هفتگی کلاس‌ها</span>
            </h2>
            <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              تنظیم و مدیریت زنگ‌های درسی هفتگی معلم
            </p>
          </div>

          {/* School Level Selector Toggle */}
          <div className={`p-1.5 rounded-2xl border flex items-center gap-1 self-start md:self-auto ${
            isDarkMode
              ? 'bg-[#143242] border-slate-700/80'
              : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setSchoolLevel('elementary')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                schoolLevel === 'elementary'
                  ? isDarkMode
                    ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : isDarkMode
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <School className="w-4 h-4" />
              <span>مدارس ابتدایی (۵ زنگ)</span>
            </button>

            <button
              type="button"
              onClick={() => setSchoolLevel('secondary')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                schoolLevel === 'secondary'
                  ? isDarkMode
                    ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : isDarkMode
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>متوسطه دوم (۴ زنگ)</span>
            </button>
          </div>
        </div>

        {/* Informative Banner */}
        <div className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
          isDarkMode
            ? 'bg-teal-500/10 border-teal-500/30 text-teal-200'
            : 'bg-indigo-50/80 border-indigo-100 text-indigo-900'
        }`}>
          <Info className="w-4 h-4 flex-shrink-0 text-teal-400" />
          <span>
            {schoolLevel === 'elementary' ? (
              <>برنامه هفتگی <strong>دبستان و مدارس ابتدایی</strong> دارای <strong>۵ زنگ آموزشی</strong> در روز می‌باشد.</>
            ) : (
              <>برنامه هفتگی <strong>دبیرستان و مقطع متوسطه دوم</strong> دارای <strong>۴ زنگ آموزشی</strong> در روز می‌باشد.</>
            )}
          </span>
        </div>
      </div>

      {/* Timetable Grid Table */}
      <div className={`rounded-3xl border shadow-sm overflow-x-auto p-4 transition-all ${
        isDarkMode
          ? 'bg-[#143242] border-slate-700/80'
          : 'bg-white border-slate-200'
      }`}>
        <table className="w-full text-center border-collapse text-xs min-w-[640px]">
          <thead>
            <tr className={`font-bold border-b ${
              isDarkMode
                ? 'bg-[#143242] text-teal-300 border-slate-700/80'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              <th className="p-2 border-r border-slate-200 dark:border-slate-700 w-24">روز / زنگ</th>
              {periods.map((p) => (
                <th key={p} className="p-2 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                  زنگ {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
            {days.map((day) => (
              <tr key={day} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}>
                <td className={`p-2 font-bold border-r border-slate-200 dark:border-slate-700 text-xs ${
                  isDarkMode ? 'bg-[#143242] text-slate-200' : 'bg-slate-50 text-slate-800'
                }`}>
                  {day}
                </td>
                {periods.map((p) => {
                  const item = timetable.find((t) => t.dayOfWeek === day && t.period === p);
                  const cls = item ? classrooms.find((c) => c.id === item.classId) : null;

                  return (
                    <td
                      key={p}
                      onClick={() => handleOpenEditModal(day, p, item)}
                      className={`p-1 border-r border-slate-200 dark:border-slate-700 last:border-r-0 align-top cursor-pointer transition-colors ${
                        isDarkMode ? 'hover:bg-teal-500/10' : 'hover:bg-indigo-50/50'
                      }`}
                    >
                      {item ? (
                        <div className={`rounded-lg py-1.5 px-1 font-medium transition-all group relative border flex flex-col items-center justify-center text-center space-y-0.5 min-h-[44px] ${
                          isDarkMode
                            ? 'bg-[#143242] border-teal-500/30 text-teal-100 hover:border-teal-400'
                            : 'bg-indigo-50/90 border-indigo-200 text-indigo-950 hover:border-indigo-400'
                        }`}>
                          <div className={`font-bold text-xs leading-tight text-center w-full truncate ${isDarkMode ? 'text-teal-300' : 'text-indigo-700'}`}>
                            {item.subject}
                          </div>
                          <div className={`text-[10px] leading-tight text-center w-full truncate ${isDarkMode ? 'text-slate-300' : 'text-indigo-600'}`}>
                            {cls?.name || 'کلاس'}
                          </div>
                          {item.room && (
                            <div className={`text-[9px] leading-tight text-center w-full truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              مکان: {item.room}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-indigo-950/85 dark:bg-slate-900/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-[10px] font-bold">
                            <Edit3 className="w-3 h-3 text-teal-300" />
                            <span>ویرایش</span>
                          </div>
                        </div>
                      ) : (
                        <div className={`py-1.5 px-1 rounded-lg border border-dashed flex items-center justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity ${
                          isDarkMode
                            ? 'border-slate-700 text-slate-400 hover:border-teal-400 hover:text-teal-300'
                            : 'border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600'
                        }`}>
                          <Plus className="w-3 h-3" />
                          <span className="text-[9px]">ثبت زنگ</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border ${
            isDarkMode ? 'bg-[#102A36] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-indigo-600'}`} />
                <span>
                  تنظیم زنگ {editingSlot.period} - {editingSlot.dayOfWeek}
                </span>
              </h3>
              <button
                onClick={() => setEditingSlot(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs font-medium">
              <div className="space-y-1.5">
                <label className="font-bold">انتخاب کلاس مربوطه</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 font-bold border focus:ring-2 ${
                    isDarkMode
                      ? 'bg-[#143242] border-slate-700 text-white focus:ring-teal-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-indigo-500'
                  }`}
                >
                  <option value="">کلاس انتخاب نشده</option>
                  {classrooms.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.grade} ({cls.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold">نام درس / عنوان زنگ *</label>
                <input
                  type="text"
                  required
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="مثلا: ریاضی ۱ یا علوم تجربی"
                  className={`w-full rounded-xl px-3.5 py-2.5 border focus:ring-2 ${
                    isDarkMode
                      ? 'bg-[#143242] border-slate-700 text-white focus:ring-teal-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-indigo-500'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold">مکان / شماره کلاس (اختیاری)</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="مثلا: کلاس ۱۰۱ یا آزمایشگاه علوم"
                  className={`w-full rounded-xl px-3.5 py-2.5 border focus:ring-2 ${
                    isDarkMode
                      ? 'bg-[#143242] border-slate-700 text-white focus:ring-teal-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-indigo-500'
                  }`}
                />
              </div>

              <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-700">
                {editingSlot.existingItem ? (
                  <button
                    type="button"
                    onClick={handleDeleteSlot}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف از برنامه</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSlot(null)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className={`flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold shadow-md transition-all ${
                      isDarkMode
                        ? 'bg-teal-500 text-slate-950 hover:bg-teal-400'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>ذخیره برنامه</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
