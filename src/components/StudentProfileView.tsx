import React, { useState, useMemo } from 'react';
import { Student, Classroom, ScoreRecord, AttendanceRecord, BehavioralPoint } from '../types';
import {
  ArrowRight,
  User,
  Edit2,
  Save,
  Phone,
  GraduationCap,
  ClipboardCheck,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Check,
  FileText,
  School,
  BookOpen,
} from 'lucide-react';
import { ShamsiDatePicker } from './ShamsiDatePicker';
import { isoStringToJalali, formatJalaliDate, getTodayJalali, jalaliToIsoString } from '../utils/jalali';

interface StudentProfileViewProps {
  student: Student;
  classroom: Classroom;
  scores: ScoreRecord[];
  attendance: AttendanceRecord[];
  behavioralPoints: BehavioralPoint[];
  onClose: () => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onAddScore: (score: ScoreRecord) => void;
  onDeleteScore: (scoreId: string) => void;
  onAddAttendance: (record: AttendanceRecord) => void;
  onAddBehaviorPoint: (point: BehavioralPoint) => void;
  onDeleteBehaviorPoint?: (pointId: string) => void;
  isDarkMode?: boolean;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  classroom,
  scores,
  attendance,
  behavioralPoints,
  onClose,
  onUpdateStudent,
  onAddScore,
  onDeleteScore,
  onAddAttendance,
  onAddBehaviorPoint,
  onDeleteBehaviorPoint,
  isDarkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'grades' | 'attendance' | 'behavior'>('info');

  // Edit Basic Info state
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [fullName, setFullName] = useState(student.fullName);
  const [studentCode, setStudentCode] = useState(student.studentCode);
  const [fatherName, setFatherName] = useState(student.fatherName || '');
  const [parentPhone, setParentPhone] = useState(student.parentPhone || '');
  const [notes, setNotes] = useState(student.notes || '');
  const [schoolName, setSchoolName] = useState(student.schoolName || classroom.schoolName || '');
  const [grade, setGrade] = useState(student.grade || classroom.grade || 'پایه دهم');
  const [isCustomSchool, setIsCustomSchool] = useState(false);
  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Compute registered schools dropdown list
  const registeredSchools = useMemo(() => {
    const list = new Set<string>();

    if (classroom?.schoolName && typeof classroom.schoolName === 'string' && classroom.schoolName.trim()) {
      list.add(classroom.schoolName.trim());
    }
    if (student?.schoolName && typeof student.schoolName === 'string' && student.schoolName.trim()) {
      list.add(student.schoolName.trim());
    }

    try {
      const cls = localStorage.getItem('amoozgar_classrooms');
      if (cls) {
        const parsedCls = JSON.parse(cls);
        if (Array.isArray(parsedCls)) {
          parsedCls.forEach((item: any) => {
            if (item?.schoolName && typeof item.schoolName === 'string' && item.schoolName.trim()) {
              list.add(item.schoolName.trim());
            }
          });
        }
      }

      const p = localStorage.getItem('school_name');
      if (p && typeof p === 'string' && p.trim()) {
        list.add(p.trim());
      }

      const c = localStorage.getItem('amoozgar_custom_schools');
      if (c) {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed)) {
          parsed.forEach((s) => s && typeof s === 'string' && s.trim() && list.add(s.trim()));
        }
      }

      const d = localStorage.getItem('amoozgar_schools_details');
      if (d) {
        const parsed = JSON.parse(d);
        if (parsed && typeof parsed === 'object') {
          Object.keys(parsed).forEach((s) => s && typeof s === 'string' && s.trim() && list.add(s.trim()));
        }
      }
    } catch {
      // ignore
    }

    return Array.from(list);
  }, [classroom, student]);

  // Compute available grades dropdown list
  const availableGrades = useMemo(() => {
    const list = new Set<string>([
      'پایه اول ابتدایی',
      'پایه دوم ابتدایی',
      'پایه سوم ابتدایی',
      'پایه چهارم ابتدایی',
      'پایه پنجم ابتدایی',
      'پایه ششم ابتدایی',
      'پایه هفتم (متوسطه اول)',
      'پایه هشتم (متوسطه اول)',
      'پایه نهم (متوسطه اول)',
      'پایه دهم (متوسطه دوم)',
      'پایه یازدهم (متوسطه دوم)',
      'پایه دوازدهم (متوسطه دوم)',
    ]);

    if (classroom?.grade && typeof classroom.grade === 'string' && classroom.grade.trim()) {
      list.add(classroom.grade.trim());
    }
    if (student?.grade && typeof student.grade === 'string' && student.grade.trim()) {
      list.add(student.grade.trim());
    }

    return Array.from(list);
  }, [classroom, student]);

  // Quick Add Grade state
  const [showAddGradeForm, setShowAddGradeForm] = useState(false);
  const [gradeTitle, setGradeTitle] = useState('ارزیابی کلاسی');
  const [gradeType] = useState<any>('continuous');
  const [gradeValue, setGradeValue] = useState<number | string>(18);
  const [gradeDescriptive, setGradeDescriptive] = useState<'خیلی خوب' | 'خوب' | 'قابل قبول' | 'نیاز به تلاش بیشتر'>('خیلی خوب');
  const [gradeDate, setGradeDate] = useState(jalaliToIsoString(getTodayJalali()));
  const [gradeNote, setGradeNote] = useState('');

  // Quick Add Attendance state
  const [showAddAttForm, setShowAddAttForm] = useState(false);
  const [attStatus, setAttStatus] = useState<'absent' | 'late' | 'excused' | 'present'>('absent');
  const [attDate, setAttDate] = useState(jalaliToIsoString(getTodayJalali()));
  const [attNote, setAttNote] = useState('');

  // Quick Add Behavior Point state
  const [showAddBehaviorForm, setShowAddBehaviorForm] = useState(false);
  const [behaviorType, setBehaviorType] = useState<'positive' | 'negative'>('positive');
  const [behaviorTitle, setBehaviorTitle] = useState('');
  const [behaviorValue, setBehaviorValue] = useState<number>(1);
  const [behaviorDate, setBehaviorDate] = useState(jalaliToIsoString(getTodayJalali()));

  // Filtered lists for this specific student
  const studentScores = scores.filter((s) => s.studentId === student.id);
  const studentAttendance = attendance.filter((a) => a.studentId === student.id);
  const studentBehavior = behavioralPoints.filter((b) => b.studentId === student.id);

  // Stats calculations
  const numericScores = studentScores.filter((s) => s.scoreNumeric !== undefined).map((s) => s.scoreNumeric as number);
  const averageScore = numericScores.length > 0 ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(2) : null;

  const totalAbsences = studentAttendance.filter((a) => a.status === 'absent').length;
  const totalLateness = studentAttendance.filter((a) => a.status === 'late').length;
  const totalExcused = studentAttendance.filter((a) => a.status === 'excused').length;

  const totalPositivePoints = studentBehavior.filter((b) => b.type === 'positive').reduce((acc, curr) => acc + curr.scoreValue, 0);
  const totalNegativePoints = studentBehavior.filter((b) => b.type === 'negative').reduce((acc, curr) => acc + curr.scoreValue, 0);
  const netBehaviorScore = totalPositivePoints - totalNegativePoints;

  // Handle Save Basic Info
  const handleSaveBasicInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !studentCode.trim()) return;

    const updated: Student = {
      ...student,
      fullName: fullName.trim(),
      studentCode: studentCode.trim(),
      fatherName: fatherName.trim() || undefined,
      parentPhone: parentPhone.trim() || undefined,
      notes: notes.trim() || undefined,
      schoolName: schoolName.trim() || undefined,
      grade: grade.trim() || undefined,
    };

    onUpdateStudent(updated);
    setIsEditingInfo(false);
    setSaveSuccessMsg('اطلاعات اولیه دانش‌آموز با موفقیت به‌روزرسانی شد.');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Handle Save New Grade
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const newScoreRecord: ScoreRecord = {
      id: `score-${Date.now()}`,
      classId: classroom.id,
      studentId: student.id,
      date: gradeDate,
      title: gradeTitle.trim() || 'ارزیابی کلاسی',
      type: gradeType,
      scoreNumeric: classroom.evaluationSystem === 'numeric' ? Number(gradeValue) : undefined,
      scoreDescriptive: classroom.evaluationSystem === 'descriptive' ? gradeDescriptive : undefined,
      maxScore: 20,
      note: gradeNote.trim() || undefined,
    };

    onAddScore(newScoreRecord);
    setShowAddGradeForm(false);
    setGradeNote('');
  };

  // Handle Save New Attendance Record
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const newAttRecord: AttendanceRecord = {
      id: `att-${student.id}-${attDate}-${Date.now()}`,
      classId: classroom.id,
      studentId: student.id,
      date: attDate,
      status: attStatus,
      note: attNote.trim() || undefined,
    };

    onAddAttendance(newAttRecord);
    setShowAddAttForm(false);
    setAttNote('');
  };

  // Handle Save Behavior Point
  const handleSaveBehavior = (e: React.FormEvent) => {
    e.preventDefault();
    if (!behaviorTitle.trim()) return;

    const newPoint: BehavioralPoint = {
      id: `bp-${Date.now()}`,
      classId: classroom.id,
      studentId: student.id,
      date: behaviorDate,
      type: behaviorType,
      title: behaviorTitle.trim(),
      scoreValue: Number(behaviorValue) || 1,
    };

    onAddBehaviorPoint(newPoint);
    setShowAddBehaviorForm(false);
    setBehaviorTitle('');
  };

  return (
    <div className="space-y-3.5">
      
      {/* Top Navigation & Action Bar */}
      <div className={`rounded-2xl border p-3.5 shadow-2xs flex items-center justify-between gap-3 ${
        isDarkMode ? 'bg-[#102A36] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`p-2.5 rounded-xl border transition-colors flex items-center gap-2 font-bold text-xs cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-teal-300'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به لیست دانش‌آموزان</span>
          </button>
          
          <div className="hidden sm:block">
            <h2 className="text-base font-bold">پروفایل و پرونده دانش‌آموز</h2>
            <p className="text-xs text-slate-400">مشاهده و ویرایش کلیه نمرات، حضور و غیاب و موارد انضباطی</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-xl font-bold border ${
            isDarkMode ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
          }`}>
            کلاس: {classroom.name}
          </span>
        </div>
      </div>

      {/* Main Full Page Header Banner */}
      <div className={`rounded-3xl border shadow-md overflow-hidden ${
        isDarkMode ? 'bg-[#102A36] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-2xl flex items-center justify-center shadow-inner shrink-0">
              {student.fullName[0]}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black">{student.fullName}</h1>
                <span className="bg-indigo-500/40 text-indigo-100 text-xs font-bold px-3 py-0.5 rounded-full border border-indigo-400/30">
                  کد: {student.studentCode}
                </span>
              </div>
              <p className="text-xs text-indigo-100 flex items-center gap-4 flex-wrap">
                {student.fatherName && <span>نام پدر: <strong className="text-white">{student.fatherName}</strong></span>}
                {student.parentPhone && (
                  <a href={`tel:${student.parentPhone}`} className="inline-flex items-center gap-1 text-teal-200 hover:underline">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{student.parentPhone}</span>
                  </a>
                )}
              </p>
            </div>
          </div>

          {/* Key Summary Badges Row */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center min-w-[90px]">
              <span className="text-[10px] text-indigo-100 font-semibold block">میانگین کل</span>
              <span className="text-lg font-black text-white">{averageScore || '---'}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center min-w-[90px]">
              <span className="text-[10px] text-indigo-100 font-semibold block">غیبت‌ها</span>
              <span className="text-lg font-black text-amber-200">{totalAbsences} جلسه</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center min-w-[90px]">
              <span className="text-[10px] text-indigo-100 font-semibold block">امتیاز انضباطی</span>
              <span className="text-lg font-black text-teal-200">{netBehaviorScore > 0 ? `+${netBehaviorScore}` : netBehaviorScore}</span>
            </div>
          </div>
        </div>

        {/* Full Width Tab Header Navigation */}
        <div className={`flex border-b text-xs sm:text-sm font-bold px-4 pt-3 gap-2 overflow-x-auto ${
          isDarkMode ? 'bg-[#143242] border-slate-700/80' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-5 py-3 rounded-t-2xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'info'
                ? isDarkMode
                  ? 'bg-[#102A36] text-teal-300 border-t-2 border-teal-400 font-extrabold shadow-xs'
                  : 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs font-extrabold'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>اطلاعات اولیه دانش‌آموز</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grades')}
            className={`px-5 py-3 rounded-t-2xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'grades'
                ? isDarkMode
                  ? 'bg-[#102A36] text-teal-300 border-t-2 border-teal-400 font-extrabold shadow-xs'
                  : 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs font-extrabold'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>نمرات و ارزیابی‌ها ({studentScores.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-5 py-3 rounded-t-2xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'attendance'
                ? isDarkMode
                  ? 'bg-[#102A36] text-teal-300 border-t-2 border-teal-400 font-extrabold shadow-xs'
                  : 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs font-extrabold'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>حضور و غیاب</span>
            {totalAbsences > 0 && (
              <span className="bg-rose-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                {totalAbsences} غایب
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('behavior')}
            className={`px-5 py-3 rounded-t-2xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'behavior'
                ? isDarkMode
                  ? 'bg-[#102A36] text-teal-300 border-t-2 border-teal-400 font-extrabold shadow-xs'
                  : 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs font-extrabold'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>امتیازات و رفتار</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 space-y-6">

          {saveSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-slate-200/50">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-500" />
                  <span>مشخصات فردی و ارتباطی دانش‌آموز</span>
                </h3>

                <button
                  type="button"
                  onClick={() => setIsEditingInfo(!isEditingInfo)}
                  className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors flex items-center gap-2 cursor-pointer ${
                    isEditingInfo
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-teal-300 hover:bg-slate-700'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                  <span>{isEditingInfo ? 'انصراف از ویرایش' : 'ویرایش اطلاعات'}</span>
                </button>
              </div>

              {isEditingInfo ? (
                <form onSubmit={handleSaveBasicInfo} className="space-y-4 text-xs font-medium max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold block">نام و نام خانوادگی *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-bold text-sm focus:outline-hidden ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold block">کد دانش‌آموزی / کدملی *</label>
                      <input
                        type="text"
                        required
                        value={studentCode}
                        onChange={(e) => setStudentCode(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold text-sm focus:outline-hidden ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold block">نام پدر</label>
                      <input
                        type="text"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-bold text-sm focus:outline-hidden ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold block">شماره همراه ولی</label>
                      <input
                        type="tel"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold text-sm focus:outline-hidden ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    {/* School Name Dropdown */}
                    <div className="space-y-1.5">
                      <label className="font-bold block">نام مدرسه *</label>
                      {registeredSchools.length > 0 ? (
                        <select
                          required
                          value={isCustomSchool ? '__custom__' : schoolName}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsCustomSchool(true);
                              setSchoolName('');
                            } else {
                              setIsCustomSchool(false);
                              setSchoolName(e.target.value);
                            }
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl border font-bold text-sm focus:outline-hidden cursor-pointer ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <option value="" disabled>-- انتخاب مدرسه --</option>
                          {schoolName && !isCustomSchool && !registeredSchools.includes(schoolName) && (
                            <option value={schoolName}>{schoolName}</option>
                          )}
                          {registeredSchools.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                          <option value="__custom__">➕ تایپ نام جدید...</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      )}
                      {isCustomSchool && registeredSchools.length > 0 && (
                        <input
                          type="text"
                          required
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          placeholder="نام مدرسه جدید..."
                          className={`w-full mt-1.5 px-3.5 py-2 rounded-xl border text-sm focus:outline-hidden ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      )}
                    </div>

                    {/* Grade Dropdown */}
                    <div className="space-y-1.5">
                      <label className="font-bold block">پایه تحصیلی *</label>
                      <select
                        required
                        value={isCustomGrade ? '__custom__' : grade}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setIsCustomGrade(true);
                            setGrade('');
                          } else {
                            setIsCustomGrade(false);
                            setGrade(e.target.value);
                          }
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-bold text-sm focus:outline-hidden cursor-pointer ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <option value="" disabled>-- انتخاب پایه --</option>
                        {grade && !isCustomGrade && !availableGrades.includes(grade) && (
                          <option value={grade}>{grade}</option>
                        )}
                        {availableGrades.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                        <option value="__custom__">➕ تایپ پایه جدید...</option>
                      </select>
                      {isCustomGrade && (
                        <input
                          type="text"
                          required
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          placeholder="پایه تحصیلی جدید..."
                          className={`w-full mt-1.5 px-3.5 py-2 rounded-xl border text-sm focus:outline-hidden ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold block">ملاحظات و یادداشت ویژه معلم</label>
                    <textarea
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="توضیحات و خصوصیات دانش‌آموز..."
                      className={`w-full p-3.5 rounded-xl border text-xs focus:outline-hidden resize-none ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      className="px-5 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      لغو
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>ذخیره تغییرات</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className={`p-4 rounded-2xl border space-y-1 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-400 font-bold block">نام و نام خانوادگی:</span>
                      <p className="text-base font-black text-slate-800 dark:text-white">{student.fullName}</p>
                    </div>

                    <div className={`p-4 rounded-2xl border space-y-1 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-400 font-bold block">کد دانش‌آموزی / کدملی:</span>
                      <p className="text-base font-mono font-black text-slate-800 dark:text-white">{student.studentCode}</p>
                    </div>

                    <div className={`p-4 rounded-2xl border space-y-1 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-400 font-bold block">نام پدر:</span>
                      <p className="text-base font-bold text-slate-800 dark:text-white">{student.fatherName || 'ثبت نشده'}</p>
                    </div>

                    <div className={`p-4 rounded-2xl border space-y-1 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-400 font-bold block">شماره تماس ولی:</span>
                      {student.parentPhone ? (
                        <a href={`tel:${student.parentPhone}`} className="text-base font-mono font-bold text-indigo-600 dark:text-teal-300 hover:underline flex items-center gap-1.5">
                          <Phone className="w-4 h-4" />
                          <span>{student.parentPhone}</span>
                        </a>
                      ) : (
                        <p className="text-base font-bold text-slate-400">ثبت نشده</p>
                      )}
                    </div>

                    <div className={`p-4 rounded-2xl border space-y-1 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-400 font-bold block">نام مدرسه / آموزشگاه:</span>
                      <p className="text-base font-bold text-indigo-600 dark:text-teal-300 flex items-center gap-1.5">
                        <School className="w-4 h-4" />
                        <span>{student.schoolName || classroom.schoolName || 'ثبت نشده'}</span>
                      </p>
                    </div>

                    <div className={`p-4 rounded-2xl border space-y-1 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-400 font-bold block">پایه تحصیلی:</span>
                      <p className="text-base font-bold text-indigo-600 dark:text-teal-300 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>{student.grade || classroom.grade || 'ثبت نشده'}</span>
                      </p>
                    </div>
                  </div>

                  {student.notes ? (
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-5 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                      <span className="font-bold text-sm block">ملاحظات و یادداشت معلم:</span>
                      <p className="leading-relaxed text-xs">{student.notes}</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                      هیچ یادداشت خاصی برای این دانش‌آموز ثبت نشده است. برای ثبت نکات می‌توانید روی ویرایش اطلاعات کلیک کنید.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GRADES & ASSESSMENTS */}
          {activeTab === 'grades' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-slate-200/50">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    <span>سوابق نمرات و ارزیابی‌های کلاسی</span>
                  </h3>
                  {averageScore && (
                    <span className="text-xs text-indigo-600 dark:text-teal-300 font-black mt-1 block">
                      میانگین کل نمرات ثبت‌شده: {averageScore} از ۲۰
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddGradeForm(!showAddGradeForm)}
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت نمره جدید</span>
                </button>
              </div>

              {/* Add Grade Form */}
              {showAddGradeForm && (
                <form onSubmit={handleSaveGrade} className={`p-5 rounded-2xl border space-y-4 text-xs ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-indigo-50/50 border-indigo-100'
                }`}>
                  <h4 className="font-bold text-sm text-indigo-700 dark:text-teal-300">افزودن نمره جدید برای {student.fullName}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold block">عنوان ارزیابی *</label>
                      <input
                        type="text"
                        required
                        value={gradeTitle}
                        onChange={(e) => setGradeTitle(e.target.value)}
                        placeholder="مثلا: پرسش کلاسی، آزمون فصل ۲..."
                        className={`w-full px-3.5 py-2 rounded-xl border focus:outline-hidden ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold block">تاریخ ارزیابی</label>
                      <ShamsiDatePicker
                        selectedDateIso={gradeDate}
                        onChange={(isoStr) => setGradeDate(isoStr)}
                      />
                    </div>

                    {classroom.evaluationSystem === 'numeric' ? (
                      <div className="space-y-1.5">
                        <label className="font-bold block">نمره (۰ تا ۲۰) *</label>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max="20"
                          required
                          value={gradeValue}
                          onChange={(e) => setGradeValue(e.target.value)}
                          className={`w-full px-3.5 py-2 rounded-xl border font-bold text-sm focus:outline-hidden ${
                            isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="font-bold block">ارزیابی توصیفی *</label>
                        <select
                          value={gradeDescriptive}
                          onChange={(e: any) => setGradeDescriptive(e.target.value)}
                          className={`w-full px-3.5 py-2 rounded-xl border font-bold focus:outline-hidden ${
                            isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <option value="خیلی خوب">خیلی خوب</option>
                          <option value="خوب">خوب</option>
                          <option value="قابل قبول">قابل قبول</option>
                          <option value="نیاز به تلاش بیشتر">نیاز به تلاش بیشتر</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="font-bold block">یادداشت معلم (اختیاری)</label>
                      <input
                        type="text"
                        value={gradeNote}
                        onChange={(e) => setGradeNote(e.target.value)}
                        placeholder="توضیح کوتاه..."
                        className={`w-full px-3.5 py-2 rounded-xl border focus:outline-hidden ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddGradeForm(false)}
                      className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-xs cursor-pointer"
                    >
                      ثبت نمره
                    </button>
                  </div>
                </form>
              )}

              {/* Grades Roster Table */}
              {studentScores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {studentScores.map((score) => (
                    <div
                      key={score.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
                        isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800 dark:text-white">{score.title}</span>
                          <span className="text-[11px] text-slate-400">
                            {formatJalaliDate(isoStringToJalali(score.date), true)}
                          </span>
                        </div>
                        {score.note && <p className="text-slate-500 text-xs">{score.note}</p>}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-base font-black px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-teal-300 border border-indigo-200 dark:border-indigo-800">
                          {score.scoreNumeric !== undefined ? `${score.scoreNumeric} / 20` : score.scoreDescriptive}
                        </span>

                        <button
                          type="button"
                          onClick={() => onDeleteScore(score.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="حذف نمره"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 space-y-2 border rounded-2xl border-dashed">
                  <GraduationCap className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-sm">هنوز هیچ نمره‌ای برای این دانش‌آموز ثبت نشده است.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ATTENDANCE & ABSENCES */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-slate-200/50">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                  <span>سابقه غیبت، تأخیر و حضور دانش‌آموز</span>
                </h3>

                <button
                  type="button"
                  onClick={() => setShowAddAttForm(!showAddAttForm)}
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت غیبت / تأخیر جدید</span>
                </button>
              </div>

              {/* Add Attendance Form */}
              {showAddAttForm && (
                <form onSubmit={handleSaveAttendance} className={`p-5 rounded-2xl border space-y-4 text-xs ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-rose-50/50 border-rose-100'
                }`}>
                  <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400">ثبت وضعیت جدید برای {student.fullName}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold block">وضعیت *</label>
                      <select
                        value={attStatus}
                        onChange={(e: any) => setAttStatus(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border font-bold text-xs focus:outline-hidden ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <option value="absent">غایب غیرموجه</option>
                        <option value="late">تأخیر ورود</option>
                        <option value="excused">غیبت موجه</option>
                        <option value="present">حاضر</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold block">تاریخ</label>
                      <ShamsiDatePicker
                        selectedDateIso={attDate}
                        onChange={(isoStr) => setAttDate(isoStr)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold block">توضیحات یا علت (اختیاری)</label>
                      <input
                        type="text"
                        value={attNote}
                        onChange={(e) => setAttNote(e.target.value)}
                        placeholder="علت غیبت یا میزان تأخیر..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-hidden ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAttForm(false)}
                      className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold cursor-pointer"
                    >
                      ثبت وضعیت
                    </button>
                  </div>
                </form>
              )}

              {/* Attendance Log Grid */}
              {studentAttendance.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {studentAttendance.map((record) => {
                    const isAbsent = record.status === 'absent';
                    const isLate = record.status === 'late';
                    const isExcused = record.status === 'excused';

                    return (
                      <div
                        key={record.id}
                        className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
                          isAbsent
                            ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                            : isLate
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                            : isExcused
                            ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                            : isDarkMode
                            ? 'bg-slate-800/80 border-slate-700'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isAbsent && <span className="p-2 rounded-xl bg-rose-600 text-white"><FileText className="w-4 h-4" /></span>}
                          {isLate && <span className="p-2 rounded-xl bg-amber-600 text-white"><Clock className="w-4 h-4" /></span>}
                          {isExcused && <span className="p-2 rounded-xl bg-blue-600 text-white"><ShieldAlert className="w-4 h-4" /></span>}
                          {!isAbsent && !isLate && !isExcused && <span className="p-2 rounded-xl bg-emerald-600 text-white"><Check className="w-4 h-4" /></span>}

                          <div>
                            <span className="font-bold text-sm block">
                              {isAbsent ? 'غایب' : isLate ? 'تأخیر' : isExcused ? 'غیبت موجه' : 'حاضر'}
                            </span>
                            <span className="text-[11px] opacity-70 block">
                              {formatJalaliDate(isoStringToJalali(record.date), true)}
                            </span>
                          </div>
                        </div>

                        {record.note && <span className="text-xs font-medium opacity-80">{record.note}</span>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 space-y-2 border rounded-2xl border-dashed">
                  <ClipboardCheck className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-sm">هیچ غیبت یا تأخیری برای این دانش‌آموز ثبت نشده است.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BEHAVIOR & DISCIPLINE */}
          {activeTab === 'behavior' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-slate-200/50">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>امتیازات انضباطی، تشویق‌ها و تنبیهات</span>
                  </h3>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 block mt-1">
                    مجموع کل امتیاز انضباطی: {netBehaviorScore > 0 ? `+${netBehaviorScore}` : netBehaviorScore}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddBehaviorForm(!showAddBehaviorForm)}
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت مورد انضباطی</span>
                </button>
              </div>

              {/* Add Behavior Form */}
              {showAddBehaviorForm && (
                <form onSubmit={handleSaveBehavior} className={`p-5 rounded-2xl border space-y-4 text-xs ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-amber-50/50 border-amber-100'
                }`}>
                  <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">ثبت مورد انضباطی برای {student.fullName}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold block">نوع *</label>
                      <select
                        value={behaviorType}
                        onChange={(e: any) => setBehaviorType(e.target.value)}
                        className={`w-full px-3.5 py-2 rounded-xl border font-bold focus:outline-hidden ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <option value="positive">تشویق (امتیاز مثبت +)</option>
                        <option value="negative">تنبیه / کسر امتیاز (-)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold block">عنوان / علت *</label>
                      <input
                        type="text"
                        required
                        value={behaviorTitle}
                        onChange={(e) => setBehaviorTitle(e.target.value)}
                        placeholder="مثلا: مشارکت عالی در کلاس، عدم تحویل تکلیف..."
                        className={`w-full px-3.5 py-2 rounded-xl border focus:outline-hidden ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold block">مقدار امتیاز *</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        required
                        value={behaviorValue}
                        onChange={(e) => setBehaviorValue(Number(e.target.value))}
                        className={`w-full px-3.5 py-2 rounded-xl border font-bold focus:outline-hidden ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold block">تاریخ</label>
                      <ShamsiDatePicker
                        selectedDateIso={behaviorDate}
                        onChange={(isoStr) => setBehaviorDate(isoStr)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBehaviorForm(false)}
                      className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold cursor-pointer"
                    >
                      ثبت امتیاز
                    </button>
                  </div>
                </form>
              )}

              {/* Behavior Records Grid */}
              {studentBehavior.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {studentBehavior.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
                        item.type === 'positive'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50/70 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-sm block">{item.title}</span>
                        <span className="text-[11px] opacity-70">
                          {formatJalaliDate(isoStringToJalali(item.date), true)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`font-black text-sm px-3 py-1 rounded-xl border ${
                          item.type === 'positive'
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                            : 'bg-rose-100 border-rose-300 text-rose-800'
                        }`}>
                          {item.type === 'positive' ? `+${item.scoreValue}` : `-${item.scoreValue}`}
                        </span>

                        {onDeleteBehaviorPoint && (
                          <button
                            type="button"
                            onClick={() => onDeleteBehaviorPoint(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-100 cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 space-y-2 border rounded-2xl border-dashed">
                  <Award className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-sm">هیچ موارد تشویق یا تنبیهی برای این دانش‌آموز ثبت نشده است.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
