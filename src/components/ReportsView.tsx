import React, { useState } from 'react';
import { Classroom, Student, ScoreRecord, AttendanceRecord } from '../types';
import { isStudentInClassroom } from '../utils/studentUtils';
import { BarChart3, Printer, Download, Award, GraduationCap, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ReportsViewProps {
  classroom: Classroom;
  students: Student[];
  scores: ScoreRecord[];
  attendance: AttendanceRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  classroom,
  students,
  scores,
  attendance,
}) => {
  const classStudents = students.filter((s) => isStudentInClassroom(s, classroom));
  const classScores = scores.filter((s) => s.classId === classroom.id);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(classStudents[0]?.id || '');

  // Calculate student numeric average data for chart
  const studentChartData = classStudents.map((student) => {
    const stScores = classScores.filter((s) => s.studentId === student.id && s.scoreNumeric !== undefined);
    const numScores = stScores.map((s) => s.scoreNumeric as number);
    const avg = numScores.length > 0 ? Number((numScores.reduce((a, b) => a + b, 0) / numScores.length).toFixed(1)) : 0;

    return {
      name: student.fullName.split(' ')[0], // short name
      average: avg,
      fullName: student.fullName,
    };
  });

  const selectedStudent = classStudents.find((s) => s.id === selectedStudentId);
  const selectedStudentScores = classScores.filter((s) => s.studentId === selectedStudentId);
  const selectedStudentAttendance = attendance.filter((a) => a.studentId === selectedStudentId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-3.5">
      
      {/* Top Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>آمار، گزارشات و صدور کارنامه کلاسی</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">نمودار پیشرفت تحصیلی کلاس و پرینت کارنامه فردی</p>
        </div>

        <button
          onClick={handlePrint}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>چاپ کارنامه / PDF</span>
        </button>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 print:hidden">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span>نمودار مقایسه‌ای میانگین نمرات دانش‌آموزان کلاس</span>
        </h3>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(value: any) => [`${value} از ۲۰`, 'میانگین نمره‌ها']}
                labelFormatter={(label) => `دانش‌آموز: ${label}`}
              />
              <Bar dataKey="average" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Printable Report Card Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 print:shadow-none print:border-none print:p-0">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 print:hidden">
          <label className="font-bold text-xs text-slate-700">انتخاب دانش‌آموز جهت صدور کارنامه:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-700"
          >
            {classStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.studentCode})
              </option>
            ))}
          </select>
        </div>

        {selectedStudent ? (
          <div className="border border-slate-300 rounded-2xl p-6 space-y-6 bg-white">
            
            {/* Report Header */}
            <div className="text-center space-y-2 border-b border-slate-200 pb-4">
              <h1 className="text-xl font-black text-slate-900">کارنامه ارزشیابی کلاسی</h1>
              <p className="text-xs text-slate-600">
                سال تحصیلی {classroom.academicYear} | {classroom.name} | درس {classroom.subject}
              </p>
            </div>

            {/* Student Info Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block">نام و نام خانوادگی:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedStudent.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">کد دانش‌آموزی:</span>
                <span className="font-mono font-bold text-slate-800">{selectedStudent.studentCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block">نام پدر:</span>
                <span className="font-bold text-slate-800">{selectedStudent.fatherName || '---'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">تعداد غیبت‌ها:</span>
                <span className="font-bold text-rose-600">
                  {selectedStudentAttendance.filter((a) => a.status === 'absent').length} جلسه
                </span>
              </div>
            </div>

            {/* Scores Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700">ریز نمرات و ارزیابی‌ها:</h4>
              <table className="w-full text-right text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">عنوان آزمون / فعالیت</th>
                    <th className="p-2.5">تاریخ</th>
                    <th className="p-2.5">نوع ارزیابی</th>
                    <th className="p-2.5 text-center">نمره / نتیجه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedStudentScores.map((sc) => (
                    <tr key={sc.id}>
                      <td className="p-2.5 font-bold text-slate-800">{sc.title}</td>
                      <td className="p-2.5 text-slate-500">{sc.date}</td>
                      <td className="p-2.5 text-slate-600">
                        {sc.type === 'exam' ? 'آزمون کتبی' : sc.type === 'oral' ? 'شفاهی' : 'مستمر کلاسی'}
                      </td>
                      <td className="p-2.5 text-center font-bold text-indigo-700">
                        {sc.scoreNumeric !== undefined ? `${sc.scoreNumeric} / ${sc.maxScore || 20}` : sc.scoreDescriptive}
                      </td>
                    </tr>
                  ))}
                  {selectedStudentScores.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">نمره‌ای ثبت نشده است.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Signature Box */}
            <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div>امضاء و مهر آموزگار / دبیر مربوطه</div>
              <div>امضاء مدیریت آموزشگاه</div>
            </div>

          </div>
        ) : (
          <p className="text-center text-slate-400 py-6">دانش‌آموزی انتخاب نشده است.</p>
        )}

      </div>

    </div>
  );
};
