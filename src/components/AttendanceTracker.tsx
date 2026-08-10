import React, { useState, useEffect, useMemo } from 'react';
import { Classroom, Student, AttendanceRecord, AttendanceStatus } from '../types';
import { isStudentInClassroom, sortStudentsByLastName } from '../utils/studentUtils';
import { ClipboardCheck, Save, CheckCircle2, ChevronDown, Check, X } from 'lucide-react';
import { ShamsiDatePicker } from './ShamsiDatePicker';

interface AttendanceTrackerProps {
  classroom: Classroom;
  students: Student[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
  isDarkMode?: boolean;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  classroom,
  students,
  attendance,
  onSaveAttendance,
  isDarkMode = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const classStudents = useMemo(() => {
    return sortStudentsByLastName(students.filter((s) => isStudentInClassroom(s, classroom)));
  }, [students, classroom]);

  // State for students attendance for selected date
  const [attendanceMap, setAttendanceMap] = useState<{ [studentId: string]: { status: AttendanceStatus; note?: string } }>({});

  // Sync state whenever selectedDate, classroom, attendance, or students change
  useEffect(() => {
    const existing = attendance.filter((a) => a.classId === classroom.id && a.date === selectedDate);
    const initial: { [studentId: string]: { status: AttendanceStatus; note?: string } } = {};
    classStudents.forEach((s) => {
      const record = existing.find((e) => e.studentId === s.id);
      initial[s.id] = {
        status: record ? record.status : 'present',
        note: record ? record.note : '',
      };
    });
    setAttendanceMap(initial);
  }, [selectedDate, classroom.id, attendance, students]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
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

  return (
    <div className="space-y-3.5">
      
      {/* Top Header Card */}
      <div className={`rounded-2xl border p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-40 ${
        isDarkMode ? 'bg-[#143242] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <ClipboardCheck className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-indigo-600'}`} />
              <span>حضور و غیاب</span>
            </h2>

            {/* Present and Absent Badges in Title Bar */}
            <div className="flex items-center gap-1.5 mr-1 pr-2 border-r border-slate-200 dark:border-slate-700">
              <div 
                title="تعداد حاضرین"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-black border ${
                  isDarkMode 
                    ? 'bg-teal-950/60 border-teal-800/80 text-emerald-400' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                <span>{presentCount}</span>
              </div>

              <div 
                title="تعداد غایبین"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-black border ${
                  isDarkMode 
                    ? 'bg-rose-950/60 border-rose-800/80 text-rose-400' 
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                <X className="w-4 h-4 text-rose-500 stroke-[3]" />
                <span>{absentCount}</span>
              </div>
            </div>
          </div>

          <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{classroom.name}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-50">
          {/* Shamsi Date Picker with Holiday Badges */}
          <ShamsiDatePicker
            selectedDateIso={selectedDate}
            onChange={(isoStr) => setSelectedDate(isoStr)}
            isDarkMode={isDarkMode}
            align="left"
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
        <div className={`rounded-2xl border p-4 text-xs font-bold flex items-center gap-2 animate-fade-in ${
          isDarkMode ? 'bg-teal-950/60 border-teal-800 text-teal-200' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <CheckCircle2 className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-emerald-600'}`} />
          <span>اطلاعات حضور و غیاب با موفقیت ثبت شد.</span>
        </div>
      )}

      {/* Attendance Student List - Vertical Stack of Cards */}
      <div className="space-y-2.5 relative z-0">
        {classStudents.map((student, idx) => {
          const current = attendanceMap[student.id] || { status: 'present' };
          const showNoteInput = current.status !== 'present';

          return (
            <div 
              key={student.id} 
              className="bg-white dark:bg-[#1B3E50] rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3"
            >
              
              {/* Top Row: Student Info (Right in RTL) & Status Dropdown (Left in RTL) */}
              <div className="flex items-center justify-between gap-2 w-full">
                
                {/* Student Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">
                      {student.fullName}
                    </h4>
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 block truncate">
                      کد: {student.studentCode}
                    </span>
                  </div>
                </div>

                {/* Dropdown Selector for Attendance Status */}
                <div className="relative shrink-0">
                  <select
                    value={current.status}
                    onChange={(e) => handleStatusChange(student.id, e.target.value as AttendanceStatus)}
                    className={`appearance-none text-xs font-bold px-2.5 py-1.5 pr-2.5 pl-7 rounded-xl border transition-all cursor-pointer focus:outline-hidden focus:ring-2 ${
                      current.status === 'absent'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 focus:ring-rose-400'
                        : current.status === 'excused'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 focus:ring-blue-400'
                        : current.status === 'late'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 focus:ring-amber-400'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800 focus:ring-emerald-400'
                    }`}
                  >
                    <option value="present" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">حاضر</option>
                    <option value="absent" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">غیر موجه</option>
                    <option value="excused" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">موجه</option>
                    <option value="late" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">تأخیر</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                </div>

              </div>

              {/* Reason / Note Input Field: ONLY displayed when status is NOT 'present' */}
              {showNoteInput && (
                <div className="w-full pt-1 animate-fade-in">
                  <input
                    type="text"
                    value={current.note || ''}
                    onChange={(e) => handleNoteChange(student.id, e.target.value)}
                    placeholder="علت غیبت یا تأخیر را وارد کنید ..."
                    className="text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 w-full focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400 transition-all placeholder:text-slate-400"
                  />
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};


