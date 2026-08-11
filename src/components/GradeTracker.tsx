import React, { useState, useMemo } from 'react';
import { Classroom, Student, ScoreRecord, AssessmentType } from '../types';
import { isStudentInClassroom, sortStudentsByLastName, normalizePersianNumbers, parseGradeNumber } from '../utils/studentUtils';
import { GraduationCap, Plus, Calendar, Save, CheckCircle2, Award, FileSpreadsheet } from 'lucide-react';
import { ShamsiDatePicker } from './ShamsiDatePicker';

interface GradeTrackerProps {
  classroom: Classroom;
  students: Student[];
  scores: ScoreRecord[];
  onAddScores: (newScores: ScoreRecord[]) => void;
  isDarkMode?: boolean;
}

export const GradeTracker: React.FC<GradeTrackerProps> = ({
  classroom,
  students,
  scores,
  onAddScores,
  isDarkMode = false,
}) => {
  const classStudents = useMemo(() => {
    return sortStudentsByLastName(students.filter((s) => isStudentInClassroom(s, classroom)));
  }, [students, classroom]);
  const classScores = scores.filter((s) => s.classId === classroom.id);

  // New Score Session parameters
  const [assessmentTitle, setAssessmentTitle] = useState('ارزیابی کلاسی');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('continuous');
  const [assessmentDate, setAssessmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [maxScore, setMaxScore] = useState<number>(20);

  // Score mapping for active form (supports raw string and parsed number)
  const [scoresForm, setScoresForm] = useState<{
    [studentId: string]: { rawNumeric?: string; numeric?: number; descriptive?: 'خیلی خوب' | 'خوب' | 'قابل قبول' | 'نیاز به تلاش بیشتر'; note?: string };
  }>(() => {
    const initial: any = {};
    classStudents.forEach((s) => {
      initial[s.id] = { rawNumeric: '20', numeric: 20, descriptive: 'خیلی خوب', note: '' };
    });
    return initial;
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleRawScoreChange = (studentId: string, val: string) => {
    const normalized = normalizePersianNumbers(val);
    setScoresForm((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        rawNumeric: normalized,
        numeric: parseGradeNumber(normalized, 0, maxScore),
      },
    }));
  };

  const handleRawScoreBlur = (studentId: string) => {
    setScoresForm((prev) => {
      const current = prev[studentId];
      if (!current) return prev;
      const parsed = parseGradeNumber(current.rawNumeric ?? current.numeric, 0, maxScore);
      const finalVal = parsed !== undefined ? parsed : 0;
      return {
        ...prev,
        [studentId]: {
          ...current,
          rawNumeric: String(finalVal),
          numeric: finalVal,
        },
      };
    });
  };

  const handleDescriptiveChange = (studentId: string, val: any) => {
    setScoresForm((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        descriptive: val,
      },
    }));
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecords: ScoreRecord[] = classStudents.map((student) => {
      const entry = scoresForm[student.id] || {};
      const parsedVal = parseGradeNumber(entry.rawNumeric ?? entry.numeric, 0, maxScore) ?? 20;
      return {
        id: `sc-${student.id}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        classId: classroom.id,
        studentId: student.id,
        date: assessmentDate,
        type: assessmentType,
        title: assessmentTitle,
        maxScore: maxScore,
        scoreNumeric: classroom.evaluationSystem === 'numeric' ? parsedVal : undefined,
        scoreDescriptive: classroom.evaluationSystem === 'descriptive' ? entry.descriptive || 'خیلی خوب' : undefined,
        note: entry.note,
      };
    });

    onAddScores(newRecords);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };


  // Group existing scores by assessment title
  const titleGroups = Array.from(new Set(classScores.map((s) => s.title)));

  return (
    <div className="space-y-3.5">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#1B3E50] rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-teal-300" />
            <span>ثبت نمره - {classroom.subject || classroom.name}</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            {classroom.name}
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 dark:bg-teal-950/60 border border-emerald-200 dark:border-teal-800 rounded-2xl p-3 text-emerald-800 dark:text-teal-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-teal-400" />
          <span>نمرات عنوان «{assessmentTitle}» با موفقیت برای کل کلاس ثبت شد.</span>
        </div>
      )}

      {/* New Grade Sheet Form */}
      <form onSubmit={handleSaveSession} className="bg-white dark:bg-[#1B3E50] rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 sm:p-5 shadow-2xs space-y-4 relative z-30">
        
        {/* Form Controls Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium text-slate-700 dark:text-slate-200">
          
          <div className="space-y-1">
            <label className="block font-bold text-[11px] sm:text-xs text-slate-800 dark:text-slate-100">عنوان آزمون / پرسش *</label>
            <input
              type="text"
              required
              value={assessmentTitle}
              onChange={(e) => setAssessmentTitle(e.target.value)}
              placeholder="مثلا: آزمون فصل اول یا پرسش کلاسی"
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 sm:px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1 relative z-50">
            <label className="block font-bold text-[11px] sm:text-xs text-slate-800 dark:text-slate-100">تاریخ ثبت</label>
            <ShamsiDatePicker
              selectedDateIso={assessmentDate}
              onChange={(isoStr) => setAssessmentDate(isoStr)}
              isDarkMode={isDarkMode}
              align="left"
            />
          </div>

        </div>

        {/* Student Grade Entry List - Vertical Stack of Cards */}
        <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-3 relative z-0">
          {classStudents.map((student, idx) => {
            const current = scoresForm[student.id] || {};

            return (
              <div 
                key={student.id} 
                className="bg-slate-50/70 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-3 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between gap-3"
              >
                {/* Student Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-7 h-7 rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-600">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">
                      {student.fullName}
                    </h4>
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 block truncate">
                      کد: {student.studentCode}
                    </span>
                  </div>
                </div>

                {/* Score Input Control */}
                <div className="shrink-0">
                  {classroom.evaluationSystem === 'numeric' ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const curr = parseGradeNumber(current.rawNumeric ?? current.numeric, 0, maxScore) ?? 0;
                          const next = Math.max(0, Math.round((curr - 0.5) * 2) / 2);
                          handleRawScoreChange(student.id, String(next));
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 text-slate-800 dark:text-slate-100 font-black text-base flex items-center justify-center shrink-0 cursor-pointer select-none transition-all"
                        title="کاهش نیم نمره"
                      >
                        -
                      </button>

                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        value={current.rawNumeric ?? (current.numeric !== undefined ? String(current.numeric) : '20')}
                        onChange={(e) => handleRawScoreChange(student.id, e.target.value)}
                        onBlur={() => handleRawScoreBlur(student.id)}
                        placeholder="0-20"
                        className="w-16 sm:w-20 text-center font-black text-indigo-700 dark:text-teal-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl py-1 px-1 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400 focus:outline-hidden"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const curr = parseGradeNumber(current.rawNumeric ?? current.numeric, 0, maxScore) ?? 0;
                          const next = Math.min(maxScore, Math.round((curr + 0.5) * 2) / 2);
                          handleRawScoreChange(student.id, String(next));
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 text-slate-800 dark:text-slate-100 font-black text-base flex items-center justify-center shrink-0 cursor-pointer select-none transition-all"
                        title="افزایش نیم نمره"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <select
                      value={current.descriptive || 'خیلی خوب'}
                      onChange={(e) => handleDescriptiveChange(student.id, e.target.value)}
                      className="w-24 sm:w-28 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-1.5 py-1 text-[11px] font-bold text-indigo-700 dark:text-teal-300 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400 focus:outline-hidden cursor-pointer truncate"
                    >
                      <option value="خیلی خوب" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">خیلی خوب</option>
                      <option value="خوب" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">خوب</option>
                      <option value="قابل قبول" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">قابل قبول</option>
                      <option value="نیاز به تلاش بیشتر" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">نیاز به تلاش</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>ثبت نهایی این نمرات</span>
          </button>
        </div>

      </form>

      {/* History of Assessments */}
      <div className="bg-white dark:bg-[#1B3E50] rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-teal-400" />
          <span>تاریخچه ارزیابی‌های قبلی ثبت شده</span>
        </h3>

        {titleGroups.length > 0 ? (
          <div className="space-y-3">
            {titleGroups.map((title) => {
              const groupScores = classScores.filter((s) => s.title === title);
              const sample = groupScores[0];

              return (
                <div key={title} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{title}</span>
                    <span className="text-slate-400 dark:text-slate-400">{sample?.date}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {groupScores.map((sc) => {
                      const st = students.find((s) => s.id === sc.studentId);
                      return (
                        <span key={sc.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200">
                          <strong className="text-slate-900 dark:text-slate-100">{st?.fullName}: </strong>
                          <span className="text-indigo-600 dark:text-teal-300 font-bold">{sc.scoreNumeric !== undefined ? sc.scoreNumeric : sc.scoreDescriptive}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-400 text-center py-4">هنوز هیچ ارزیابی قبلی ثبت نشده است.</p>
        )}
      </div>

    </div>
  );
};
