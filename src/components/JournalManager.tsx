import React, { useState } from 'react';
import { Classroom, ClassJournalEntry, Student, ScoreRecord, AttendanceRecord, BehavioralPoint } from '../types';
import { BookOpen, Plus, Save, CheckCircle2, BarChart3, ThumbsUp } from 'lucide-react';
import { ShamsiDatePicker } from './ShamsiDatePicker';
import { isoStringToJalali, formatJalaliDate } from '../utils/jalali';
import { ReportsView } from './ReportsView';
import { BehaviorTracker } from './BehaviorTracker';

interface JournalManagerProps {
  classroom: Classroom;
  journals: ClassJournalEntry[];
  onAddJournal: (entry: ClassJournalEntry) => void;
  students?: Student[];
  scores?: ScoreRecord[];
  attendance?: AttendanceRecord[];
  behavioralPoints?: BehavioralPoint[];
  onAddBehaviorPoint?: (point: BehavioralPoint) => void;
  defaultTab?: 'journal' | 'behavior' | 'reports';
}

export const JournalManager: React.FC<JournalManagerProps> = ({
  classroom,
  journals,
  onAddJournal,
  students = [],
  scores = [],
  attendance = [],
  behavioralPoints = [],
  onAddBehaviorPoint,
  defaultTab = 'journal',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'journal' | 'behavior' | 'reports'>(defaultTab);

  const classJournals = journals.filter((j) => j.classId === classroom.id);

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [topicTaught, setTopicTaught] = useState('');
  const [homeworkAssigned, setHomeworkAssigned] = useState('');
  const [absentCount, setAbsentCount] = useState<number>(0);
  const [generalNotes, setGeneralNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTaught.trim()) return;

    onAddJournal({
      id: `journal-${Date.now()}`,
      classId: classroom.id,
      date,
      topicTaught: topicTaught.trim(),
      homeworkAssigned: homeworkAssigned.trim(),
      absentCount: Number(absentCount),
      generalNotes: generalNotes.trim() || undefined,
    });

    setTopicTaught('');
    setHomeworkAssigned('');
    setGeneralNotes('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <span>گزارش روزانه و ارزیابی رفتار</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">{classroom.name}</p>
        </div>
      </div>

      {/* Three Navigation Cards in a single row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Daily Journal */}
        <button
          type="button"
          onClick={() => setActiveSubTab('journal')}
          className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-center sm:justify-start gap-3 cursor-pointer relative overflow-hidden h-full ${
            activeSubTab === 'journal'
              ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${
            activeSubTab === 'journal'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600'
          }`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className={`font-bold text-sm ${
              activeSubTab === 'journal' ? 'text-teal-900' : 'text-slate-800'
            }`}>
              گزارش روزانه
            </div>
          </div>
        </button>

        {/* Card 2: Rewards & Behavior */}
        <button
          type="button"
          onClick={() => setActiveSubTab('behavior')}
          className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-center sm:justify-start gap-3 cursor-pointer relative overflow-hidden h-full ${
            activeSubTab === 'behavior'
              ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${
            activeSubTab === 'behavior'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600'
          }`}>
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <div className={`font-bold text-sm ${
              activeSubTab === 'behavior' ? 'text-amber-900' : 'text-slate-800'
            }`}>
              امتیازات و تشویق
            </div>
          </div>
        </button>

        {/* Card 3: Reports & Analytics */}
        <button
          type="button"
          onClick={() => setActiveSubTab('reports')}
          className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-center sm:justify-start gap-3 cursor-pointer relative overflow-hidden h-full ${
            activeSubTab === 'reports'
              ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${
            activeSubTab === 'reports'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600'
          }`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className={`font-bold text-sm ${
              activeSubTab === 'reports' ? 'text-indigo-900' : 'text-slate-800'
            }`}>
              آمار و گزارشات
            </div>
          </div>
        </button>
      </div>

      {/* Active Tab Content */}
      {activeSubTab === 'journal' && (
        <div className="space-y-3.5">
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>گزارش جلسه با موفقیت ثبت گردید.</span>
            </div>
          )}

          {/* New Journal Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              <span>ثبت گزارش جلسه جدید</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
              <div className="space-y-1">
                <label className="block font-bold">تاریخ جلسه *</label>
                <ShamsiDatePicker
                  selectedDateIso={date}
                  onChange={(isoStr) => setDate(isoStr)}
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold">تعداد غایبین امروز</label>
                <input
                  type="number"
                  min={0}
                  value={absentCount}
                  onChange={(e) => setAbsentCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs font-medium text-slate-700">
              <label>مبحث تدریس شده / موضوع جلسه *</label>
              <input
                type="text"
                required
                value={topicTaught}
                onChange={(e) => setTopicTaught(e.target.value)}
                placeholder="مثلا: تدریس فصل دوم - بخش عبارت‌های جبری"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1 text-xs font-medium text-slate-700">
              <label>تکالیف محوله به دانش‌آموزان</label>
              <input
                type="text"
                value={homeworkAssigned}
                onChange={(e) => setHomeworkAssigned(e.target.value)}
                placeholder="مثلا: تمرینات صفحه ۴۲ شماره‌های ۱ تا ۵"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1 text-xs font-medium text-slate-700">
              <label>ملاحظات و یادداشت‌های عمومی معلم</label>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                rows={2}
                placeholder="یادداشت‌های مهم یا وضعیت مشارکت کلاس..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>ثبت گزارش جلسه</span>
              </button>
            </div>
          </form>

          {/* History Journal List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">سوابق گزارشات روزانه</h3>
            {classJournals.length > 0 ? (
              <div className="space-y-3">
                {classJournals.map((j) => (
                  <div key={j.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="font-bold text-slate-800 text-sm">{j.topicTaught}</span>
                      <span className="text-slate-500 font-medium">{formatJalaliDate(isoStringToJalali(j.date), true)} | غایبین: {j.absentCount} نفر</span>
                    </div>
                    {j.homeworkAssigned && (
                      <div>
                        <span className="font-bold text-slate-700">تکلیف: </span>
                        <span className="text-slate-800">{j.homeworkAssigned}</span>
                      </div>
                    )}
                    {j.generalNotes && (
                      <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">{j.generalNotes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">گزارشی ثبت نشده است.</p>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'behavior' && (
        <BehaviorTracker
          classroom={classroom}
          students={students}
          points={behavioralPoints}
          onAddPoint={onAddBehaviorPoint || (() => {})}
        />
      )}

      {activeSubTab === 'reports' && (
        <ReportsView
          classroom={classroom}
          students={students}
          scores={scores}
          attendance={attendance}
        />
      )}

    </div>
  );
};
