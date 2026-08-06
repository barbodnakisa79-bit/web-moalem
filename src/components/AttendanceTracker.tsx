import React, { useState } from 'react';
import { Classroom, Student, AttendanceRecord, AttendanceStatus } from '../types';
import { isStudentInClassroom } from '../utils/studentUtils';
import { ClipboardCheck, X, Clock, ShieldAlert, Save, CheckCircle2 } from 'lucide-react';
import { ShamsiDatePicker } from './ShamsiDatePicker';

interface AttendanceTrackerProps {
  classroom: Classroom;
  students: Student[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  classroom,
  students,
  attendance,
  onSaveAttendance,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const classStudents = students.filter((s) => isStudentInClassroom(s, classroom));

  // Initialize current day state for students
  const [attendanceMap, setAttendanceMap] = useState<{ [studentId: string]: { status: AttendanceStatus; note?: string } }>(() => {
    const existing = attendance.filter((a) => a.classId === classroom.id && a.date === selectedDate);
    const initial: { [studentId: string]: { status: AttendanceStatus; note?: string } } = {};
    classStudents.forEach((s) => {
      const record = existing.find((e) => e.studentId === s.id);
      initial[s.id] = {
        status: record ? record.status : 'present',
        note: record ? record.note : '',
      };
    });
    return initial;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Toggle status: clicking an active status returns it to 'present' (default)
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => {
      const currentStatus = prev[studentId]?.status || 'present';
      const nextStatus = currentStatus === status ? 'present' : status;
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          status: nextStatus,
        },
      };
    });
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const handleSave = () => {
    const newRecords: AttendanceRecord[] = classStudents.map((student) => ({
      id: `att-${student.id}-${selectedDate}`,
      classId: classroom.id,
      studentId: student.id,
      date: selectedDate,
      status: attendanceMap[student.id]?.status || 'present',
      note: attendanceMap[student.id]?.note,
    }));

    onSaveAttendance(newRecords);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Stats for selected date
  const statusList = Object.values(attendanceMap) as Array<{ status: AttendanceStatus; note?: string }>;
  const presentCount = statusList.filter((v) => v.status === 'present').length;
  const absentCount = statusList.filter((v) => v.status === 'absent').length;
  const lateCount = statusList.filter((v) => v.status === 'late').length;
  const excusedCount = statusList.filter((v) => v.status === 'excused').length;

  return (
    <div className="space-y-3.5">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            <span>حضور و غیاب</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">{classroom.name}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Shamsi Date Picker with Holiday Badges */}
          <ShamsiDatePicker
            selectedDateIso={selectedDate}
            onChange={(isoStr) => setSelectedDate(isoStr)}
          />

          <button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>ثبت غیبت</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>اطلاعات حضور و غیاب با موفقیت ثبت شد.</span>
        </div>
      )}

      {/* Stats Badges Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800">حاضرین</span>
          <span className="text-lg font-black text-emerald-700">{presentCount} نفر</span>
        </div>
        <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-xs font-bold text-rose-800">غایبین</span>
          <span className="text-lg font-black text-rose-700">{absentCount} نفر</span>
        </div>
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-xs font-bold text-amber-800">تأخیر</span>
          <span className="text-lg font-black text-amber-700">{lateCount} نفر</span>
        </div>
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-xs font-bold text-blue-800">غیبت موجه</span>
          <span className="text-lg font-black text-blue-700">{excusedCount} نفر</span>
        </div>
      </div>

      {/* Attendance Student List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="divide-y divide-slate-100">
          {classStudents.map((student, idx) => {
            const current = attendanceMap[student.id] || { status: 'present' };

            return (
              <div key={student.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                
                {/* Student Name */}
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{student.fullName}</h4>
                    <span className="text-xs text-slate-400">کد: {student.studentCode}</span>
                  </div>
                </div>

                {/* Status Toggle Buttons (Only Absent, Late, Excused) */}
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Absent */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      current.status === 'absent'
                        ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400'
                        : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>غایب</span>
                  </button>

                  {/* Late */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      current.status === 'late'
                        ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>تأخیر</span>
                  </button>

                  {/* Excused */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'excused')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      current.status === 'excused'
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>موجه</span>
                  </button>

                  {/* Note input */}
                  <input
                    type="text"
                    value={current.note || ''}
                    onChange={(e) => handleNoteChange(student.id, e.target.value)}
                    placeholder="توضیحات (مثلا تاخیر ۱۰ دقیقه)..."
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 w-44 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />

                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

