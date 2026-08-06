import React, { useState } from 'react';
import { Classroom, Student, ScoreRecord, AssessmentType } from '../types';
import { isStudentInClassroom } from '../utils/studentUtils';
import { GraduationCap, Plus, Calendar, Save, CheckCircle2, Award, FileSpreadsheet } from 'lucide-react';
import { ShamsiDatePicker } from './ShamsiDatePicker';

interface GradeTrackerProps {
  classroom: Classroom;
  students: Student[];
  scores: ScoreRecord[];
  onAddScores: (newScores: ScoreRecord[]) => void;
}

export const GradeTracker: React.FC<GradeTrackerProps> = ({
  classroom,
  students,
  scores,
  onAddScores,
}) => {
  const classStudents = students.filter((s) => isStudentInClassroom(s, classroom));
  const classScores = scores.filter((s) => s.classId === classroom.id);

  // New Score Session parameters
  const [assessmentTitle, setAssessmentTitle] = useState('ارزیابی کلاسی');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('continuous');
  const [assessmentDate, setAssessmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [maxScore, setMaxScore] = useState<number>(20);

  // Score mapping for active form
  const [scoresForm, setScoresForm] = useState<{
    [studentId: string]: { numeric?: number; descriptive?: 'خیلی خوب' | 'خوب' | 'قابل قبول' | 'نیاز به تلاش بیشتر'; note?: string };
  }>(() => {
    const initial: any = {};
    classStudents.forEach((s) => {
      initial[s.id] = { numeric: 20, descriptive: 'خیلی خوب', note: '' };
    });
    return initial;
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleScoreChange = (studentId: string, val: number) => {
    setScoresForm((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        numeric: Math.min(maxScore, Math.max(0, val)),
      },
    }));
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
      return {
        id: `sc-${student.id}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        classId: classroom.id,
        studentId: student.id,
        date: assessmentDate,
        type: assessmentType,
        title: assessmentTitle,
        maxScore: maxScore,
        scoreNumeric: classroom.evaluationSystem === 'numeric' ? Number(entry.numeric ?? 20) : undefined,
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
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span>ثبت نمره - {classroom.subject || classroom.name}</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {classroom.name}
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>نمرات عنوان «{assessmentTitle}» با موفقیت برای کل کلاس ثبت شد.</span>
        </div>
      )}

      {/* New Grade Sheet Form */}
      <form onSubmit={handleSaveSession} className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-3.5">
        
        {/* Form Controls Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium text-slate-700">
          
          <div className="space-y-1">
            <label>عنوان آزمون / پرسش *</label>
            <input
              type="text"
              required
              value={assessmentTitle}
              onChange={(e) => setAssessmentTitle(e.target.value)}
              placeholder="مثلا: آزمون فصل اول یا پرسش کلاسی"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label>نوع ارزیابی</label>
            <select
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="continuous">مستمر کلاسی</option>
              <option value="oral">پرسش شفاهی</option>
              <option value="homework">تکلیف منزل</option>
              <option value="exam">آزمون کتبی</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-bold">تاریخ ثبت</label>
            <ShamsiDatePicker
              selectedDateIso={assessmentDate}
              onChange={(isoStr) => setAssessmentDate(isoStr)}
            />
          </div>

          {classroom.evaluationSystem === 'numeric' && (
            <div className="space-y-1">
              <label>سقف نمره</label>
              <input
                type="number"
                min={1}
                max={100}
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

        </div>

        {/* Student Grade Entry List */}
        <div className="divide-y divide-slate-100 border-t border-slate-100 pt-3">
          {classStudents.map((student, idx) => {
            const current = scoresForm[student.id] || {};

            return (
              <div key={student.id} className="py-2.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{student.fullName}</h4>
                    <span className="text-xs text-slate-400">کد: {student.studentCode}</span>
                  </div>
                </div>

                {/* Score Input */}
                <div className="flex items-center gap-3">
                  {classroom.evaluationSystem === 'numeric' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.25"
                        min={0}
                        max={maxScore}
                        value={current.numeric ?? 20}
                        onChange={(e) => handleScoreChange(student.id, parseFloat(e.target.value) || 0)}
                        className="w-20 text-center font-bold text-indigo-700 bg-slate-50 border border-slate-300 rounded-xl py-1.5 text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-400 font-bold">از {maxScore}</span>
                    </div>
                  ) : (
                    <select
                      value={current.descriptive || 'خیلی خوب'}
                      onChange={(e) => handleDescriptiveChange(student.id, e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="خیلی خوب">خیلی خوب</option>
                      <option value="خوب">خوب</option>
                      <option value="قابل قبول">قابل قبول</option>
                      <option value="نیاز به تلاش بیشتر">نیاز به تلاش بیشتر</option>
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>ثبت نهایی این نمرات</span>
          </button>
        </div>

      </form>

      {/* History of Assessments */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>تاریخچه ارزیابی‌های قبلی ثبت شده</span>
        </h3>

        {titleGroups.length > 0 ? (
          <div className="space-y-3">
            {titleGroups.map((title) => {
              const groupScores = classScores.filter((s) => s.title === title);
              const sample = groupScores[0];

              return (
                <div key={title} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">{title}</span>
                    <span className="text-slate-400">{sample?.date}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {groupScores.map((sc) => {
                      const st = students.find((s) => s.id === sc.studentId);
                      return (
                        <span key={sc.id} className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
                          <strong className="text-slate-900">{st?.fullName}: </strong>
                          <span className="text-indigo-600 font-bold">{sc.scoreNumeric !== undefined ? sc.scoreNumeric : sc.scoreDescriptive}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">هنوز هیچ ارزیابی قبلی ثبت نشده است.</p>
        )}
      </div>

    </div>
  );
};
