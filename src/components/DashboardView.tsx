import React, { useState } from 'react';
import { Classroom, Student, AttendanceRecord, ScoreRecord, ClassJournalEntry } from '../types';
import { isStudentInClassroom } from '../utils/studentUtils';
import { ClipboardCheck, GraduationCap, BookOpen, Calendar, CheckCircle, Plus, Check, X, Clock, ArrowRight } from 'lucide-react';
import { ShamsiDatePicker } from './ShamsiDatePicker';
import { getTodayJalali, jalaliToIsoString } from '../utils/jalali';

interface DashboardViewProps {
  classroom: Classroom;
  students: Student[];
  attendance: AttendanceRecord[];
  scores: ScoreRecord[];
  journals: ClassJournalEntry[];
  onNavigate: (tab: any) => void;
  onSelectStudentProfile: (student: Student) => void;
  onQuickAddScore: (score: ScoreRecord) => void;
  onQuickAddAttendance: (record: AttendanceRecord) => void;
  onBackToCards?: () => void;
  isDarkMode?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  classroom,
  students,
  attendance,
  scores,
  journals,
  onNavigate,
  onSelectStudentProfile,
  onQuickAddScore,
  onQuickAddAttendance,
  onBackToCards,
  isDarkMode = false,
}) => {
  const classStudents = students.filter((s) => isStudentInClassroom(s, classroom));
  const classJournals = journals.filter((j) => j.classId === classroom.id);
  const recentJournal = classJournals[0];

  const todayIsoStr = jalaliToIsoString(getTodayJalali());

  // Quick Grade Modal state
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<Student | null>(null);
  const [quickGradeTitle, setQuickGradeTitle] = useState('نمره کلاسی');
  const [quickGradeValue, setQuickGradeValue] = useState<number | string>(18);
  const [quickGradeDescriptive, setQuickGradeDescriptive] = useState<'خیلی خوب' | 'خوب' | 'قابل قبول' | 'نیاز به تلاش بیشتر'>('خیلی خوب');
  const [quickGradeSuccess, setQuickGradeSuccess] = useState<string | null>(null);

  // Quick Absence Toast/Success indicator
  const [quickAbsenceSuccess, setQuickAbsenceSuccess] = useState<string | null>(null);

  // Handle Quick Grade Submit
  const handleSaveQuickGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForGrade) return;

    const newScore: ScoreRecord = {
      id: `score-quick-${Date.now()}`,
      classId: classroom.id,
      studentId: selectedStudentForGrade.id,
      date: todayIsoStr,
      type: 'continuous',
      title: quickGradeTitle.trim() || 'نمره کلاسی',
      scoreNumeric: classroom.evaluationSystem === 'numeric' ? Number(quickGradeValue) : undefined,
      scoreDescriptive: classroom.evaluationSystem === 'descriptive' ? quickGradeDescriptive : undefined,
      maxScore: 20,
    };

    onQuickAddScore(newScore);
    const studentName = selectedStudentForGrade.fullName;
    setSelectedStudentForGrade(null);
    setQuickGradeSuccess(`نمره برای ${studentName} ثبت شد.`);
    setTimeout(() => setQuickGradeSuccess(null), 3000);
  };

  // Handle Quick Absence Mark
  const handleQuickMarkAbsence = (student: Student) => {
    // Check if student already has attendance recorded today
    const existingRec = attendance.find(
      (a) => a.studentId === student.id && a.classId === classroom.id && a.date === todayIsoStr
    );

    const isCurrentlyAbsent = existingRec?.status === 'absent';
    const newStatus = isCurrentlyAbsent ? 'present' : 'absent';

    const newAttendanceRecord: AttendanceRecord = {
      id: existingRec?.id || `att-quick-${student.id}-${Date.now()}`,
      classId: classroom.id,
      studentId: student.id,
      date: todayIsoStr,
      status: newStatus,
    };

    onQuickAddAttendance(newAttendanceRecord);
    setQuickAbsenceSuccess(
      newStatus === 'absent'
        ? `غیبت ${student.fullName} برای امروز ثبت شد.`
        : `وضعیت ${student.fullName} به حاضر تغییر یافت.`
    );
    setTimeout(() => setQuickAbsenceSuccess(null), 3000);
  };

  return (
    <div className="space-y-3.5">
      
      {/* Header Container: Smaller Class Banner + Moved Top Buttons Outside */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Compact Class Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-3.5 sm:p-4 text-white shadow-xs max-w-md w-full sm:w-auto flex flex-col justify-center gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            {onBackToCards && (
              <button
                type="button"
                onClick={onBackToCards}
                className="bg-white/10 hover:bg-white/20 text-white text-[11px] px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>بازگشت به کارت درس‌ها</span>
              </button>
            )}
            <span className="text-indigo-100 text-xs font-semibold bg-indigo-500/30 px-2.5 py-0.5 rounded-full border border-indigo-400/20">
              درس: {classroom.subject}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold">{classroom.name}</h2>
        </div>

        {/* Action Buttons moved to top (outside the class banner card) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('attendance')}
            className={`p-3 px-4 rounded-2xl border text-right flex items-center gap-3 shadow-2xs transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-[#143242] border-indigo-500/30 text-white hover:bg-[#184255] hover:border-teal-400'
                : 'bg-white border-indigo-200 text-slate-800 hover:bg-indigo-50/50'
            }`}
          >
            <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-indigo-600 dark:text-teal-300">حضور و غیاب</div>
              <div className="text-[10px] text-slate-400 font-medium">ثبت سریع امروز</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('grades')}
            className={`p-3 px-4 rounded-2xl border text-right flex items-center gap-3 shadow-2xs transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-[#143242] border-emerald-500/30 text-white hover:bg-[#184255] hover:border-teal-400'
                : 'bg-white border-emerald-200 text-slate-800 hover:bg-emerald-50/50'
            }`}
          >
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">نمره‌دهی سری</div>
              <div className="text-[10px] text-slate-400 font-medium">ثبت نمرات کلاسی</div>
            </div>
          </button>
        </div>

      </div>

      {/* Success Notification Toasts */}
      {(quickGradeSuccess || quickAbsenceSuccess) && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{quickGradeSuccess || quickAbsenceSuccess}</span>
        </div>
      )}

      {/* Main Content Grid: Class Roster & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        
        {/* Student Roster Card Section */}
        <div className="lg:col-span-2 space-y-3">
          <div className={`rounded-2xl border p-4 shadow-2xs flex items-center justify-between ${
            isDarkMode ? 'bg-[#143242] border-slate-700/80' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white text-base">
              <span>لیست دانش‌آموزان کلاس ({classStudents.length} نفر)</span>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              جهت ورود به پروفایل، روی نام کلیک کنید
            </span>
          </div>

          {classStudents.length > 0 ? (
            <div className="space-y-2.5">
              {classStudents.map((student, idx) => {
                // Check today's attendance record
                const todayAtt = attendance.find(
                  (a) => a.studentId === student.id && a.classId === classroom.id && a.date === todayIsoStr
                );
                const isAbsentToday = todayAtt?.status === 'absent';

                return (
                  <div 
                    key={student.id} 
                    className={`rounded-2xl border p-3 sm:p-3.5 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-2.5 ${
                      isDarkMode ? 'bg-[#1B3E50] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    
                    {/* Student Info */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => onSelectStudentProfile(student)}
                          className="font-bold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-teal-300 text-xs sm:text-sm text-right transition-colors cursor-pointer flex items-center gap-1.5 truncate w-full"
                        >
                          <span className="truncate">{student.fullName}</span>
                        </button>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          کد: <span>{student.studentCode}</span>
                          {student.fatherName && ` | پدر: ${student.fatherName}`}
                        </p>
                      </div>
                    </div>

                    {/* Action Controls: Register Grade / Absence */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      
                      {/* Quick Absence Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleQuickMarkAbsence(student)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${
                          isAbsentToday
                            ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                        }`}
                        title={isAbsentToday ? 'علامت‌گذاری به عنوان حاضر' : 'ثبت غیبت برای امروز'}
                      >
                        {isAbsentToday ? (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">غایب (امروز)</span>
                            <span className="sm:hidden">غایب</span>
                          </>
                        ) : (
                          <>
                            <span>ثبت غیبت</span>
                          </>
                        )}
                      </button>

                      {/* Quick Grade Entry Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForGrade(student)}
                        className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-teal-300 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>ثبت نمره</span>
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`rounded-2xl border p-8 text-center text-slate-400 text-xs ${
              isDarkMode ? 'bg-[#143242] border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              دانش‌آموزی در این کلاس تعریف نشده است.
            </div>
          )}
        </div>

        {/* Left Column: Quick Actions & Recent Journal */}
        <div className="space-y-6">
          
          {/* Recent Journal Card */}
          <div className={`rounded-2xl border p-5 shadow-2xs space-y-3 ${
            isDarkMode ? 'bg-[#143242] border-slate-700/80' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-2">
              <span className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                آخرین گزارش جلسه
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {recentJournal?.date || 'امروز'}
              </span>
            </div>

            {recentJournal ? (
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">مبحث تدریس شده: </span>
                  <p className="text-slate-900 dark:text-white font-medium mt-0.5">{recentJournal.topicTaught}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">تکلیف محوله: </span>
                  <p className="text-slate-800 dark:text-slate-300 mt-0.5">{recentJournal.homeworkAssigned}</p>
                </div>
                {recentJournal.generalNotes && (
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {recentJournal.generalNotes}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">گزارشی برای جلسه اخیر ثبت نشده است.</p>
            )}

            <button
              onClick={() => onNavigate('journal')}
              className="w-full text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 rounded-xl text-center transition-colors cursor-pointer"
            >
              ثبت گزارش جلسه جدید
            </button>
          </div>



        </div>

      </div>

      {/* Modal: Quick Add Grade directly from Dashboard */}
      {selectedStudentForGrade && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-sm w-full p-6 shadow-xl border space-y-4 ${
            isDarkMode ? 'bg-[#1B3E50] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200/60">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>ثبت نمره برای {selectedStudentForGrade.fullName}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedStudentForGrade(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickGrade} className="space-y-3 text-xs font-medium">
              <div className="space-y-1">
                <label className="font-bold block">عنوان ارزیابی</label>
                <input
                  type="text"
                  required
                  value={quickGradeTitle}
                  onChange={(e) => setQuickGradeTitle(e.target.value)}
                  placeholder="مثلا: نمره کلاسی، پرسش شفاهی..."
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-hidden ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {classroom.evaluationSystem === 'numeric' ? (
                <div className="space-y-1">
                  <label className="font-bold block">نمره (۰ تا ۲۰)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    required
                    value={quickGradeValue}
                    onChange={(e) => setQuickGradeValue(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-bold text-sm focus:outline-hidden ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-bold block">ارزیابی توصیفی</label>
                  <select
                    value={quickGradeDescriptive}
                    onChange={(e: any) => setQuickGradeDescriptive(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-bold focus:outline-hidden ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="خیلی خوب">خیلی خوب</option>
                    <option value="خوب">خوب</option>
                    <option value="قابل قبول">قابل قبول</option>
                    <option value="نیاز به تلاش بیشتر">نیاز به تلاش بیشتر</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForGrade(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  ذخیره نمره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
