import React, { useState } from 'react';
import { Classroom, Student, BehavioralPoint } from '../types';
import { isStudentInClassroom } from '../utils/studentUtils';
import { ThumbsUp, ThumbsDown, Plus, Award, CheckCircle2 } from 'lucide-react';

interface BehaviorTrackerProps {
  classroom: Classroom;
  students: Student[];
  points: BehavioralPoint[];
  onAddPoint: (point: BehavioralPoint) => void;
}

export const BehaviorTracker: React.FC<BehaviorTrackerProps> = ({
  classroom,
  students,
  points,
  onAddPoint,
}) => {
  const classStudents = students.filter((s) => isStudentInClassroom(s, classroom));
  const classPoints = points.filter((p) => p.classId === classroom.id);

  const [selectedStudentId, setSelectedStudentId] = useState(classStudents[0]?.id || '');
  const [pointType, setPointType] = useState<'positive' | 'negative'>('positive');
  const [title, setTitle] = useState('');
  const [scoreValue, setScoreValue] = useState<number>(1);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedStudentId) return;

    onAddPoint({
      id: `bp-${Date.now()}`,
      classId: classroom.id,
      studentId: selectedStudentId,
      date: new Date().toISOString().split('T')[0],
      type: pointType,
      title: title.trim(),
      scoreValue: pointType === 'positive' ? Math.abs(scoreValue) : -Math.abs(scoreValue),
    });

    setTitle('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-3.5">
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-amber-500" />
            <span>تشویق و انضباط</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">{classroom.name}</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>امتیاز با موفقیت برای دانش‌آموز ثبت گردید.</span>
        </div>
      )}

      {/* New Point Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">ثبت امتیاز جدید</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium text-slate-700">
          <div className="space-y-1">
            <label>انتخاب دانش‌آموز *</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-amber-500"
            >
              {classStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.studentCode})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label>نوع امتیاز *</label>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPointType('positive')}
                className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 ${
                  pointType === 'positive' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>تشویق (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setPointType('negative')}
                className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 ${
                  pointType === 'negative' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>تذکر (-)</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label>عنوان مورد *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلا: حل چالش کلاسی، عدم آوردن کتاب..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label>مقدار امتیاز</label>
            <input
              type="number"
              min={1}
              max={10}
              value={scoreValue}
              onChange={(e) => setScoreValue(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت امتیاز</span>
          </button>
        </div>
      </form>

      {/* Student Badges Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">جدول امتیازات دانش‌آموزان</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {classStudents.map((st) => {
            const stPoints = classPoints.filter((p) => p.studentId === st.id);
            const totalScore = stPoints.reduce((acc, p) => acc + p.scoreValue, 0);

            return (
              <div key={st.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">{st.fullName}</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-xs ${
                    totalScore >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {totalScore > 0 ? `+${totalScore}` : totalScore} امتیاز
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  {stPoints.map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200/80">
                      <span className="text-slate-700">{p.title}</span>
                      <span className={`font-bold ${p.type === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {p.scoreValue > 0 ? `+${p.scoreValue}` : p.scoreValue}
                      </span>
                    </div>
                  ))}
                  {stPoints.length === 0 && <span className="text-slate-400 text-[11px]">موردی ثبت نشده است.</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
