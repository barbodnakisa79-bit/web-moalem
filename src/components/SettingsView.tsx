import React, { useState, useRef } from 'react';
import {
  Settings,
  School,
  Moon,
  Sun,
  Heart,
  Database,
  Download,
  Upload,
  Clock,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Shield,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  Palette,
  Info,
  Fingerprint,
  Key,
  Trash2,
  Edit2,
  Plus,
  Building2,
  AlertTriangle,
  Phone,
  MapPin,
  Hash,
  Tag,
  UserCheck,
} from 'lucide-react';
import { Classroom, Student, AttendanceRecord, ScoreRecord, ClassJournalEntry, BehavioralPoint, TimetableItem, SchoolDetails } from '../types';

interface SettingsViewProps {
  onOpenDeveloperModal: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: (dark: boolean) => void;
  classrooms?: Classroom[];
  students?: Student[];
  attendance?: AttendanceRecord[];
  scores?: ScoreRecord[];
  journals?: ClassJournalEntry[];
  behavioralPoints?: BehavioralPoint[];
  timetable?: TimetableItem[];
  onRestoreData?: (data: {
    classrooms?: Classroom[];
    students?: Student[];
    attendance?: AttendanceRecord[];
    scores?: ScoreRecord[];
    journals?: ClassJournalEntry[];
    behavioralPoints?: BehavioralPoint[];
  }) => void;
  onDeleteSchool?: (schoolName: string) => void;
  onRenameSchool?: (oldName: string, newName: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenDeveloperModal,
  isDarkMode = false,
  onToggleDarkMode,
  classrooms = [],
  students = [],
  attendance = [],
  scores = [],
  journals = [],
  behavioralPoints = [],
  timetable = [],
  onRestoreData,
  onDeleteSchool,
  onRenameSchool,
}) => {
  const [teacherName, setTeacherName] = useState(() => localStorage.getItem('teacher_name') || '');
  const [schoolName, setSchoolName] = useState(() => localStorage.getItem('school_name') || '');
  const [academicYear, setAcademicYear] = useState(() => localStorage.getItem('academic_year') || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Schools management state
  const [newSchoolInput, setNewSchoolInput] = useState('');
  const [schoolToDelete, setSchoolToDelete] = useState<string | null>(null);
  const [schoolToEdit, setSchoolToEdit] = useState<{ oldName: string; newName: string } | null>(null);

  const [schoolsDetailsMap, setSchoolsDetailsMap] = useState<Record<string, SchoolDetails>>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_schools_details');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [schoolModalData, setSchoolModalData] = useState<{
    originalName: string;
    name: string;
    schoolType: string;
    schoolCode: string;
    phone: string;
    principalPhone: string;
    address: string;
    postalCode: string;
  } | null>(null);

  const [customSchools, setCustomSchools] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_custom_schools');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Unique aggregated schools list
  const allSchoolsFromClasses = Array.from(
    new Set(classrooms.map((c) => c.schoolName).filter((s): s is string => Boolean(s && s.trim())))
  );
  const allSchools = Array.from(
    new Set([...allSchoolsFromClasses, ...customSchools, schoolName].filter((s): s is string => Boolean(s && s.trim())))
  );

  // Auto Backup state
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);

  // Collapsible Accordion states
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isTeacherInfoOpen, setIsTeacherInfoOpen] = useState(false);

  // Security features state
  const [pinEnabled, setPinEnabled] = useState(() => localStorage.getItem('amoozgar_pin_enabled') === 'true');
  const [fingerprintEnabled, setFingerprintEnabled] = useState(() => localStorage.getItem('amoozgar_fingerprint_enabled') === 'true');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [pinCode, setPinCode] = useState(() => localStorage.getItem('amoozgar_pin_code') || '');
  const [securityAnswer, setSecurityAnswer] = useState(() => localStorage.getItem('amoozgar_security_answer') || '');

  // Backup status notification
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Hidden file input refs
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('teacher_name', teacherName);
    localStorage.setItem('school_name', schoolName);
    localStorage.setItem('academic_year', academicYear);
    setSaveSuccess(true);
    showStatus('success', 'مشخصات معلم و آموزشگاه با موفقیت ذخیره شد.');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddSchool = () => {
    if (!newSchoolInput.trim()) return;
    const name = newSchoolInput.trim();
    if (!customSchools.includes(name)) {
      const updated = [...customSchools, name];
      setCustomSchools(updated);
      localStorage.setItem('amoozgar_custom_schools', JSON.stringify(updated));
    }
    setNewSchoolInput('');
    showStatus('success', `مدرسه «${name}» با موفقیت اضافه شد.`);
  };

  const handleOpenNewSchoolModal = () => {
    setSchoolModalData({
      originalName: '',
      name: newSchoolInput.trim() || '',
      schoolType: 'دولتی',
      schoolCode: '',
      phone: '',
      principalPhone: '',
      address: '',
      postalCode: '',
    });
  };

  const handleOpenEditSchoolModal = (schoolNameStr: string) => {
    const existing = schoolsDetailsMap[schoolNameStr] || {};
    setSchoolModalData({
      originalName: schoolNameStr,
      name: existing.name || schoolNameStr,
      schoolType: existing.schoolType || 'دولتی',
      schoolCode: existing.schoolCode || '',
      phone: existing.phone || '',
      principalPhone: existing.principalPhone || '',
      address: existing.address || '',
      postalCode: existing.postalCode || '',
    });
  };

  const handleSaveSchoolModal = () => {
    if (!schoolModalData || !schoolModalData.name.trim()) return;

    const trimmedName = schoolModalData.name.trim();
    const { originalName, schoolType, schoolCode, phone, principalPhone, address, postalCode } = schoolModalData;

    if (originalName && originalName !== trimmedName) {
      onRenameSchool?.(originalName, trimmedName);
      if (schoolName === originalName) {
        setSchoolName(trimmedName);
        localStorage.setItem('school_name', trimmedName);
      }
    }

    let updatedCustom = customSchools.filter((s) => s !== originalName);
    if (!updatedCustom.includes(trimmedName)) {
      updatedCustom.push(trimmedName);
    }
    setCustomSchools(updatedCustom);
    localStorage.setItem('amoozgar_custom_schools', JSON.stringify(updatedCustom));

    const updatedMap = { ...schoolsDetailsMap };
    if (originalName && originalName !== trimmedName) {
      delete updatedMap[originalName];
    }
    updatedMap[trimmedName] = {
      name: trimmedName,
      schoolType,
      schoolCode,
      phone,
      principalPhone,
      address,
      postalCode,
    };

    setSchoolsDetailsMap(updatedMap);
    localStorage.setItem('amoozgar_schools_details', JSON.stringify(updatedMap));

    setSchoolModalData(null);
    setNewSchoolInput('');
    showStatus('success', `مشخصات مدرسه «${trimmedName}» با موفقیت ذخیره شد.`);
  };

  const confirmDeleteSchool = () => {
    if (!schoolToDelete) return;

    onDeleteSchool?.(schoolToDelete);

    const updated = customSchools.filter((s) => s !== schoolToDelete);
    setCustomSchools(updated);
    localStorage.setItem('amoozgar_custom_schools', JSON.stringify(updated));

    if (schoolName === schoolToDelete) {
      setSchoolName('');
      localStorage.removeItem('school_name');
    }

    const updatedMap = { ...schoolsDetailsMap };
    delete updatedMap[schoolToDelete];
    setSchoolsDetailsMap(updatedMap);
    localStorage.setItem('amoozgar_schools_details', JSON.stringify(updatedMap));

    const deletedName = schoolToDelete;
    setSchoolToDelete(null);
    showStatus('success', `مدرسه «${deletedName}» با موفقیت حذف شد.`);
  };

  const confirmRenameSchool = () => {
    if (!schoolToEdit || !schoolToEdit.newName.trim()) return;
    const { oldName, newName } = schoolToEdit;
    const trimmedNew = newName.trim();

    onRenameSchool?.(oldName, trimmedNew);

    const updated = customSchools.map((s) => (s === oldName ? trimmedNew : s));
    setCustomSchools(updated);
    localStorage.setItem('amoozgar_custom_schools', JSON.stringify(updated));

    if (schoolName === oldName) {
      setSchoolName(trimmedNew);
      localStorage.setItem('school_name', trimmedNew);
    }

    setSchoolToEdit(null);
    showStatus('success', `نام مدرسه با موفقیت به «${trimmedNew}» تغییر یافت.`);
  };

  // 1. Manual JSON Backup Download
  const handleManualBackup = () => {
    try {
      const backupData = {
        app: 'دستیار هوشمند معلم',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        teacherName,
        schoolName,
        academicYear,
        customSchools,
        schoolsDetails: schoolsDetailsMap,
        classrooms,
        students,
        attendance,
        scores,
        journals,
        behavioralPoints,
        timetable,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const todayStr = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
      link.href = url;
      link.download = `پشتیبان_آموزگار_${todayStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showStatus('success', 'فایل پشتیبان کامل برنامه با موفقیت دانلود شد.');
    } catch (err) {
      showStatus('error', 'خطا در ساخت فایل پشتیبان.');
    }
  };

  // 2. JSON Restore Upload
  const handleJSONFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed && (parsed.students || parsed.classrooms)) {
          if (parsed.schoolsDetails) {
            setSchoolsDetailsMap(parsed.schoolsDetails);
            localStorage.setItem('amoozgar_schools_details', JSON.stringify(parsed.schoolsDetails));
          }
          if (parsed.customSchools && Array.isArray(parsed.customSchools)) {
            setCustomSchools(parsed.customSchools);
            localStorage.setItem('amoozgar_custom_schools', JSON.stringify(parsed.customSchools));
          }
          if (onRestoreData) {
            onRestoreData({
              classrooms: parsed.classrooms || [],
              students: parsed.students || [],
              attendance: parsed.attendance || [],
              scores: parsed.scores || [],
              journals: parsed.journals || [],
              behavioralPoints: parsed.behavioralPoints || [],
            });
          }
          showStatus('success', `اطلاعات با موفقیت بازیابی شد (${parsed.students?.length || 0} دانش‌آموز).`);
        } else {
          showStatus('error', 'فرمت فایل پشتیبان معتبر نیست.');
        }
      } catch (err) {
        showStatus('error', 'خطا در خواندن فایل پشتیبان. مطمئن شوید فایل JSON انتخاب شده است.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 3. Export Excel / CSV
  const handleExportExcelAll = () => {
    try {
      let csvContent = '\uFEFF'; // UTF-8 BOM for Persian characters in Excel
      csvContent += 'شناسه,کلاس,کد ملی/دانش‌آموزی,نام و نام خانوادگی,نام پدر,تلفن,تعداد غیبت,امتیاز انضباطی\n';

      students.forEach((std) => {
        const cls = classrooms.find((c) => c.id === std.classId)?.name || 'نامشخص';
        const stdAttendance = attendance.filter((a) => a.studentId === std.id && a.status === 'absent').length;
        const stdPoints = behavioralPoints
          .filter((p) => p.studentId === std.id)
          .reduce((sum, p) => sum + p.scoreValue, 0);

        csvContent += `"${std.id}","${cls}","${std.studentCode || ''}","${std.fullName}","${std.fatherName || ''}","${std.parentPhone || ''}","${stdAttendance}","${stdPoints}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const todayStr = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
      link.href = url;
      link.download = `خروجی_اکسل_کلیه_دروس_${todayStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showStatus('success', 'خروجی فایل اکسل کلیه دروس با موفقیت تولید و دریافت شد.');
    } catch (err) {
      showStatus('error', 'خطا در تولید فایل اکسل.');
    }
  };

  // 4. Import Excel / CSV
  const handleExcelFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

        if (lines.length > 1) {
          const newStudentsList: Student[] = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
            if (cols.length >= 4 && cols[3]) {
              newStudentsList.push({
                id: cols[0] || `std-${Date.now()}-${i}`,
                classId: classrooms[0]?.id || 'c1',
                studentCode: cols[2] || '',
                fullName: cols[3],
                fatherName: cols[4] || '',
                parentPhone: cols[5] || '',
              });
            }
          }

          if (newStudentsList.length > 0 && onRestoreData) {
            onRestoreData({
              students: [...students, ...newStudentsList],
            });
            showStatus('success', `${newStudentsList.length} دانش‌آموز از فایل اکسل وارد شد.`);
          } else {
            showStatus('info', 'اطلاعات معتبری در فایل اکسل پیدا نشد.');
          }
        }
      } catch (err) {
        showStatus('error', 'خطا در بارگذاری فایل اکسل.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-3.5 max-w-5xl mx-auto pb-6">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={jsonInputRef}
        accept=".json"
        className="hidden"
        onChange={handleJSONFileSelect}
      />
      <input
        type="file"
        ref={excelInputRef}
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleExcelFileSelect}
      />

      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">تنظیمات برنامه</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              تنظیمات عمومی، پشتیبان‌گیری، مشخصات معلم و ارتباط مستقیم با سازنده نرم‌افزار
            </p>
          </div>
        </div>

        <button
          onClick={onOpenDeveloperModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-98"
        >
          <Heart className="w-4 h-4 fill-white/20" />
          <span>ارتباط با سازنده</span>
        </button>
      </div>

      {/* Global Toast / Status Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 shadow-md border animate-fade-in text-sm font-bold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-sky-50 text-sky-800 border-sky-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Collapsible System Settings & Security Section */}
        <div className="space-y-4">
          
          {/* Accordion: Teacher and School Settings Form (مشخصات معلم و آموزشگاه) */}
          <div className={`rounded-2xl border overflow-hidden transition-all shadow-md ${
            isDarkMode
              ? 'bg-[#102A36] text-white border-slate-700/60'
              : 'bg-white text-slate-800 border-slate-200 shadow-xs'
          }`}>
            <button
              type="button"
              onClick={() => setIsTeacherInfoOpen(!isTeacherInfoOpen)}
              className={`w-full flex items-center justify-between p-5 text-right font-bold text-base transition-colors ${
                isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
              }`}
            >
              <div className={`flex items-center gap-3 ${isDarkMode ? 'text-cyan-300' : 'text-indigo-600'}`}>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isTeacherInfoOpen ? 'rotate-180' : ''}`} />
                <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-extrabold text-base sm:text-lg`}>مشخصات معلم و آموزشگاه</span>
              </div>
              <School className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-indigo-600'}`} />
            </button>

            {isTeacherInfoOpen && (
              <form onSubmit={handleSaveSettings} className={`p-5 pt-3 border-t space-y-5 animate-fade-in ${
                isDarkMode ? 'border-slate-700/60' : 'border-slate-100'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>نام و نام خانوادگی معلم:</label>
                    <input
                      type="text"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="نام و نام خانوادگی معلم"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border focus:outline-none transition-all ${
                        isDarkMode
                          ? 'bg-slate-800/80 border-slate-700 text-white focus:border-teal-400 placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 placeholder:text-slate-400'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>نام مدرسه / آموزشگاه:</label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="نام مدرسه یا آموزشگاه"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border focus:outline-none transition-all ${
                        isDarkMode
                          ? 'bg-slate-800/80 border-slate-700 text-white focus:border-teal-400 placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 placeholder:text-slate-400'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>سال تحصیلی:</label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="مثال: ۱۴۰۳-۱۴۰۴"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border focus:outline-none transition-all ${
                        isDarkMode
                          ? 'bg-slate-800/80 border-slate-700 text-white focus:border-teal-400 placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Registered Schools Management Section */}
                <div className={`pt-4 border-t space-y-4 ${
                  isDarkMode ? 'border-slate-700/60' : 'border-slate-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                      <Building2 className="w-4 h-4 text-teal-500" />
                      <span>لیست مدارس و آموزشگاه‌های ثبت‌شده</span>
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {allSchools.length} مدرسه
                    </span>
                  </div>

                  {/* Add New School Inputs & Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={newSchoolInput}
                      onChange={(e) => setNewSchoolInput(e.target.value)}
                      placeholder="نام مدرسه یا آموزشگاه جدید..."
                      className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-medium border focus:outline-none transition-all ${
                        isDarkMode
                          ? 'bg-slate-800/80 border-slate-700 text-white focus:border-teal-400 placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 placeholder:text-slate-400'
                      }`}
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleAddSchool}
                        disabled={!newSchoolInput.trim()}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          newSchoolInput.trim()
                            ? isDarkMode
                              ? 'bg-teal-400 hover:bg-teal-300 text-slate-950'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>افزودن سریع</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenNewSchoolModal}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                          isDarkMode
                            ? 'bg-slate-800 text-teal-300 border-teal-500/40 hover:bg-slate-700'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>ثبت با جزئیات کامل</span>
                      </button>
                    </div>
                  </div>

                  {/* Schools Cards List */}
                  {allSchools.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">هنوز مدرسه‌ای ثبت نشده است.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {allSchools.map((school) => {
                        const count = classrooms.filter((c) => c.schoolName === school).length;
                        const details = schoolsDetailsMap[school] || {};

                        return (
                          <div
                            key={school}
                            className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all shadow-xs ${
                              isDarkMode
                                ? 'bg-slate-800/70 border-slate-700/80 text-white hover:border-teal-500/40'
                                : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300'
                            }`}
                          >
                            <div className="space-y-2">
                              {/* Header & School Type Tag */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                    isDarkMode ? 'bg-teal-500/10 text-teal-300' : 'bg-indigo-50 text-indigo-600'
                                  }`}>
                                    <Building2 className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-xs truncate" title={school}>{school}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                      <span>{count > 0 ? `${count} کلاس درس` : 'بدون کلاس'}</span>
                                      {details.schoolCode && (
                                        <>
                                          <span>•</span>
                                          <span>کد: {details.schoolCode}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {details.schoolType && (
                                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 border ${
                                    isDarkMode
                                      ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  }`}>
                                    {details.schoolType}
                                  </span>
                                )}
                              </div>

                              {/* Optional Details preview */}
                              {(details.phone || details.principalPhone || details.address) && (
                                <div className={`p-2 rounded-xl text-[11px] space-y-1 border ${
                                  isDarkMode
                                    ? 'bg-[#102A36]/60 border-slate-700/60 text-slate-300'
                                    : 'bg-slate-50 border-slate-100 text-slate-600'
                                }`}>
                                  {details.phone && (
                                    <div className="flex items-center gap-1.5 truncate">
                                      <Phone className="w-3 h-3 text-teal-500 shrink-0" />
                                      <span className="font-medium">تلفن: {details.phone}</span>
                                    </div>
                                  )}
                                  {details.principalPhone && (
                                    <div className="flex items-center gap-1.5 truncate">
                                      <UserCheck className="w-3 h-3 text-indigo-500 dark:text-teal-400 shrink-0" />
                                      <span className="font-medium">شماره مدیر: {details.principalPhone}</span>
                                    </div>
                                  )}
                                  {details.address && (
                                    <div className="flex items-start gap-1.5 line-clamp-2">
                                      <MapPin className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                                      <span>{details.address} {details.postalCode ? `(کدپستی: ${details.postalCode})` : ''}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Card Footer Actions */}
                            <div className={`pt-2 border-t flex items-center justify-between gap-1 text-[11px] ${
                              isDarkMode ? 'border-slate-700/60' : 'border-slate-100'
                            }`}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditSchoolModal(school)}
                                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                  isDarkMode
                                    ? 'bg-slate-700/60 hover:bg-slate-700 text-teal-300'
                                    : 'bg-slate-100 hover:bg-slate-200 text-indigo-700'
                                }`}
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>ویرایش و جزئیات</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setSchoolToDelete(school)}
                                title="حذف مدرسه"
                                className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-500 transition-colors cursor-pointer flex items-center gap-1 px-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">حذف</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className={`flex items-center justify-between pt-2 border-t ${
                  isDarkMode ? 'border-slate-700/60' : 'border-slate-100'
                }`}>
                  {saveSuccess ? (
                    <span className={`text-xs font-bold border px-3 py-1.5 rounded-lg ${
                      isDarkMode
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-emerald-600 bg-emerald-50 border-emerald-200'
                    }`}>
                      ✓ تنظیمات با موفقیت ذخیره شد
                    </span>
                  ) : (
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>تغییرات به صورت محلی ذخیره می‌شوند.</span>
                  )}

                  <button
                    type="submit"
                    className={`font-extrabold py-2.5 px-5 rounded-xl text-xs transition-all active:scale-98 ${
                      isDarkMode
                        ? 'bg-teal-400 hover:bg-teal-300 text-slate-950'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    ذخیره اطلاعات
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Accordion 1: Appearance, Font & Theme */}
            <div className={`rounded-2xl border overflow-hidden transition-all shadow-md ${
              isDarkMode
                ? 'bg-[#102A36] text-white border-slate-700/60'
                : 'bg-white text-slate-800 border-slate-200 shadow-xs'
            }`}>
              <button
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className={`w-full flex items-center justify-between p-5 text-right font-bold text-base transition-colors ${
                  isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                }`}
              >
                <div className={`flex items-center gap-3 ${isDarkMode ? 'text-cyan-300' : 'text-indigo-600'}`}>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isThemeOpen ? 'rotate-180' : ''}`} />
                  <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-extrabold text-base sm:text-lg`}>تم و ظاهر سامانه</span>
                </div>
                <Palette className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-indigo-600'}`} />
              </button>

              {isThemeOpen && (
                <div className={`p-5 pt-0 border-t space-y-4 text-xs animate-fade-in mt-3 ${
                  isDarkMode ? 'border-slate-700/60 text-slate-300' : 'border-slate-100 text-slate-600'
                }`}>
                  <p className="leading-relaxed">تنظیمات رسم‌الخط فارسی و حالت شب / روز سامانه:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onToggleDarkMode?.(false)}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        !isDarkMode
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      حالت روشن (روز)
                    </button>
                    <button
                      onClick={() => onToggleDarkMode?.(true)}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        isDarkMode
                          ? 'bg-teal-500 text-slate-950 border-teal-400 font-extrabold'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      حالت تاریک (شب)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Security & Privacy (امنیت و حریم خصوصی سامانه) - Matching Screenshot */}
            <div className={`rounded-2xl border overflow-hidden transition-all shadow-md ${
              isDarkMode
                ? 'bg-[#102A36] text-white border-slate-700/60'
                : 'bg-white text-slate-800 border-slate-200 shadow-xs'
            }`}>
              <button
                onClick={() => setIsSecurityOpen(!isSecurityOpen)}
                className={`w-full flex items-center justify-between p-5 text-right font-bold transition-colors ${
                  isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                }`}
              >
                <div className={`flex items-center gap-3 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isSecurityOpen ? 'rotate-180' : ''}`} />
                  <span className={`${isDarkMode ? 'text-purple-300' : 'text-slate-900'} font-extrabold text-base sm:text-lg`}>امنیت و حریم خصوصی سامانه</span>
                </div>
                <Shield className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </button>

              {isSecurityOpen && (
                <div className={`p-5 pt-2 border-t space-y-5 animate-fade-in ${
                  isDarkMode ? 'border-slate-700/60' : 'border-slate-100'
                }`}>
                  
                  {/* Item 1: PIN Lock */}
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <div className="space-y-1 text-right">
                      <h3 className={`text-sm sm:text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        محافظت با رمز عبور (پین ۴ رقمی)
                      </h3>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {pinEnabled
                          ? 'فعال - ورود به برنامه نیازمند رمز عبور ۴ رقمی است'
                          : 'غیرفعال - ورود بدون نیاز به رمز عبور'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (!pinEnabled) {
                          setShowPinModal(true);
                        } else {
                          setPinEnabled(false);
                          setFingerprintEnabled(false);
                          localStorage.setItem('amoozgar_pin_enabled', 'false');
                          localStorage.setItem('amoozgar_fingerprint_enabled', 'false');
                          showStatus('info', 'محافظت با رمز عبور غیرفعال شد.');
                        }
                      }}
                      className={`w-14 h-7 rounded-full transition-colors relative flex items-center p-1 flex-shrink-0 ${
                        pinEnabled
                          ? isDarkMode ? 'bg-purple-500' : 'bg-indigo-600'
                          : isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          pinEnabled ? 'translate-x-[-28px]' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className={`h-px ${isDarkMode ? 'bg-slate-700/60' : 'bg-slate-200'}`} />

                  {/* Item 2: Fingerprint Unlock */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 text-right">
                      <h3 className={`text-sm sm:text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        فعالسازی ورود با اثر انگشت
                      </h3>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {pinEnabled
                          ? fingerprintEnabled
                            ? 'فعال - احراز هویت زیست‌سنجی در دسترس است'
                            : 'غیرفعال - جهت ورود سریع با اثر انگشت لمس کنید'
                          : 'ابتدا قفل رمز عبور را فعال نمایید'}
                      </p>
                    </div>

                    <button
                      disabled={!pinEnabled}
                      onClick={() => {
                        if (pinEnabled) {
                          const next = !fingerprintEnabled;
                          setFingerprintEnabled(next);
                          localStorage.setItem('amoozgar_fingerprint_enabled', next ? 'true' : 'false');
                          showStatus('success', next ? 'ورود با اثر انگشت فعال شد.' : 'ورود با اثر انگشت غیرفعال شد.');
                        }
                      }}
                      className={`w-14 h-7 rounded-full transition-colors relative flex items-center p-1 flex-shrink-0 ${
                        !pinEnabled
                          ? (isDarkMode ? 'bg-slate-800 opacity-50' : 'bg-slate-200 opacity-50') + ' cursor-not-allowed'
                          : fingerprintEnabled
                          ? (isDarkMode ? 'bg-teal-400' : 'bg-emerald-500')
                          : (isDarkMode ? 'bg-slate-700' : 'bg-slate-200')
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          fingerprintEnabled ? 'translate-x-[-28px]' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => setShowPinModal(true)}
                      className={`w-full font-bold py-3.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm transition-all active:scale-98 ${
                        isDarkMode
                          ? 'bg-slate-800 hover:bg-slate-700/80 text-slate-200 border-slate-700'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <Lock className={`w-4 h-4 ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'}`} />
                      <span>تغییر رمز عبور ورود</span>
                    </button>

                    <button
                      onClick={() => setShowQuestionModal(true)}
                      className={`w-full font-extrabold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all active:scale-98 ${
                        isDarkMode
                          ? 'bg-white hover:bg-slate-100 text-slate-900'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <ShieldCheck className={`w-5 h-5 ${isDarkMode ? 'text-purple-700' : 'text-white'}`} />
                      <span>تنظیم سوال امنیتی بازیابی (توصیه شده)</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Card 4: About Project */}
            <div className={`rounded-2xl p-5 border flex items-center justify-between ${
              isDarkMode
                ? 'bg-[#132B38] text-white border-slate-700/60'
                : 'bg-white text-slate-800 border-slate-200 shadow-xs'
            }`}>
              <div className="space-y-1 text-right">
                <div className={`flex items-center gap-2 font-extrabold text-base ${
                  isDarkMode ? 'text-teal-300' : 'text-teal-700'
                }`}>
                  <Info className="w-5 h-5" />
                  <span>درباره پروژه</span>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                  نسخه فعلی برنامه: <span className={`font-bold dir-ltr ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>1.0</span>
                </p>
              </div>

              <span className={`text-xs px-3 py-1.5 rounded-xl font-bold border ${
                isDarkMode
                  ? 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                  : 'bg-teal-50 text-teal-700 border-teal-200'
              }`}>
                دستیار هوشمند معلم
              </span>
            </div>

            {/* Accordion 5: Backup and Recovery (پشتیبان‌گیری و بازیابی اطلاعات) */}
            <div className={`rounded-2xl border overflow-hidden transition-all shadow-md ${
              isDarkMode
                ? 'bg-[#102A36] text-white border-slate-700/60'
                : 'bg-white text-slate-800 border-slate-200 shadow-xs'
            }`}>
              <button
                type="button"
                onClick={() => setIsBackupOpen(!isBackupOpen)}
                className={`w-full flex items-center justify-between p-5 text-right font-bold text-base transition-colors ${
                  isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                }`}
              >
                <div className={`flex items-center gap-3 ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isBackupOpen ? 'rotate-180' : ''}`} />
                  <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-extrabold text-base sm:text-lg`}>پشتیبان‌گیری و بازیابی اطلاعات</span>
                </div>
                <Database className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
              </button>

              {isBackupOpen && (
                <div className={`p-5 pt-3 border-t space-y-5 animate-fade-in ${
                  isDarkMode ? 'border-slate-700/60' : 'border-slate-100'
                }`}>
                  
                  {/* Card 1: Manual Backup & Recovery */}
                  <div className={`border rounded-2xl p-5 space-y-4 ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700/80 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div className={`flex items-center gap-2 font-bold text-sm ${
                      isDarkMode ? 'text-teal-300' : 'text-teal-700'
                    }`}>
                      <Database className="w-4 h-4" />
                      <span>پشتیبان‌گیری و بازیابی دستی</span>
                    </div>

                    <p className={`text-xs leading-relaxed ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      برای جلوگیری از پاک شدن ناگهانی اطلاعات یا انتقال کلاس‌ها به دستگاه جدید، بکاپ منظم توصیه می‌شود. فایل‌های پشتیبان دستی و خودکار در پوشه «دانلود/آموزگار/پشتیبان» ذخیره می‌شوند.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={handleManualBackup}
                        className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-98 text-xs sm:text-sm ${
                          isDarkMode
                            ? 'bg-teal-400 hover:bg-teal-300 text-slate-950'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        <Download className="w-4 h-4 stroke-[2.5]" />
                        <span>پشتیبان‌گیری دستی</span>
                      </button>

                      <button
                        onClick={() => jsonInputRef.current?.click()}
                        className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl border transition-all active:scale-98 text-xs sm:text-sm ${
                          isDarkMode
                            ? 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border-teal-500/40'
                            : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200'
                        }`}
                      >
                        <Upload className="w-4 h-4 stroke-[2.5]" />
                        <span>بازیابی اطلاعات</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Daily Auto Backup */}
                  <div
                    onClick={() => {
                      setAutoBackupEnabled(!autoBackupEnabled);
                      showStatus('info', !autoBackupEnabled ? 'پشتیبان‌گیری خودکار روزانه فعال شد.' : 'پشتیبان‌گیری خودکار غیرفعال شد.');
                    }}
                    className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-colors group ${
                      isDarkMode
                        ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'
                      }`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`text-sm font-bold transition-colors ${
                          isDarkMode ? 'text-white group-hover:text-purple-300' : 'text-slate-800 group-hover:text-purple-700'
                        }`}>
                          پشتیبان‌گیری خودکار روزانه
                        </h3>
                        <p className={`text-xs mt-0.5 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {autoBackupEnabled ? 'فعال (ذخیره خودکار روزانه ساعت ۲۰:۰۰)' : 'غیرفعال (جهت فعال‌سازی لمس کنید)'}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                        autoBackupEnabled
                          ? (isDarkMode ? 'bg-teal-400' : 'bg-teal-600')
                          : (isDarkMode ? 'bg-slate-700' : 'bg-slate-300')
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-transform ${
                          isDarkMode ? 'bg-slate-950' : 'bg-white'
                        } ${
                          autoBackupEnabled ? 'translate-x-[-24px]' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Card 3: Excel Export & Import All Subjects */}
                  <div className={`border rounded-2xl p-5 space-y-4 ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700/80 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div className={`flex items-center gap-2 font-bold text-sm ${
                      isDarkMode ? 'text-teal-300' : 'text-teal-700'
                    }`}>
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>پشتیبان‌گیری و انتقال اطلاعات به اکسل</span>
                    </div>
                    <p className={`text-xs font-semibold ${
                      isDarkMode ? 'text-teal-400/80' : 'text-teal-600'
                    }`}>
                      خروجی و ورودی اکسل (جهت کلیه دروس)
                    </p>

                    <p className={`text-xs leading-relaxed ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      دریافت فایل اکسل شامل کلیه دروس، اسامی دانش‌آموزان، نمرات عددی و توصیفی و غیبت‌ها به صورت یکجا، یا بازیابی و ورود کامل اطلاعات تمام دروس از فایل اکسل.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={handleExportExcelAll}
                        className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-98 text-xs sm:text-sm ${
                          isDarkMode
                            ? 'bg-teal-400 hover:bg-teal-300 text-slate-950'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        <Download className="w-4 h-4 stroke-[2.5]" />
                        <span>خروجی همه دروس</span>
                      </button>

                      <button
                        onClick={() => excelInputRef.current?.click()}
                        className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl border transition-all active:scale-98 text-xs sm:text-sm ${
                          isDarkMode
                            ? 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border-teal-500/40'
                            : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200'
                        }`}
                      >
                        <Upload className="w-4 h-4 stroke-[2.5]" />
                        <span>ورودی همه دروس</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Quick Info & Developer Banner */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-2 z-10 text-center sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-purple-200 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>دستیار هوشمند معلم</span>
              </div>
              <h3 className="text-lg font-extrabold">طراحی شده جهت سهولت تدریس و ارزیابی کلاسی</h3>
              <p className="text-xs text-purple-200 leading-relaxed max-w-lg">
                در صورت نیاز به افزودن قابلیت‌های سفارشی، تبدیل کدهای پروژه یا گزارش مشکلات، می‌توانید مستقیماً با طراح و سازنده سامانه ارتباط برقرار کنید.
              </p>
            </div>

            <button
              onClick={onOpenDeveloperModal}
              className="z-10 flex-shrink-0 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs px-4 py-3 rounded-xl shadow-md transition-all active:scale-95"
            >
              مشاهده اطلاعات تماس سازنده
            </button>
          </div>
        </div>

      {/* PIN Code Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">تنظیم رمز عبور ۴ رقمی</h3>
                <p className="text-xs text-slate-400">یک پین ۴ رقمی جهت حفاظت وارد کنید</p>
              </div>
            </div>

            <div className="space-y-2 dir-ltr text-center">
              <input
                type="password"
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center tracking-[1em] text-2xl font-bold py-3 bg-slate-800 border border-slate-700 rounded-2xl text-purple-300 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (pinCode.length === 4) {
                    setPinEnabled(true);
                    localStorage.setItem('amoozgar_pin_enabled', 'true');
                    localStorage.setItem('amoozgar_pin_code', pinCode);
                    setShowPinModal(false);
                    showStatus('success', 'رمز عبور ۴ رقمی با موفقیت فعال شد.');
                  } else {
                    showStatus('error', 'لطفا یک پین ۴ رقمی کامل وارد کنید.');
                  }
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
              >
                ذخیره رمز عبور
              </button>
              <button
                onClick={() => setShowPinModal(false)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">سوال امنیتی بازیابی</h3>
                <p className="text-xs text-slate-400">جهت بازیابی حساب در صورت فراموشی پین</p>
              </div>
            </div>

            <div className="space-y-3 text-right">
              <label className="text-xs font-bold text-slate-300">نام اولین معلم یا نام شهر محل تولد:</label>
              <input
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="پاسخ امنیتی..."
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (securityAnswer.trim()) {
                    localStorage.setItem('amoozgar_security_answer', securityAnswer.trim());
                    setShowQuestionModal(false);
                    showStatus('success', 'سوال امنیتی بازیابی با موفقیت ثبت گردید.');
                  } else {
                    showStatus('error', 'لطفاً پاسخ سوال امنیتی را وارد کنید.');
                  }
                }}
                className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs transition-all"
              >
                ثبت و ذخیره
              </button>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete School Confirmation Modal */}
      {schoolToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className={`rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border ${
            isDarkMode ? 'bg-[#102A36] text-white border-slate-700' : 'bg-white text-slate-800 border-slate-200'
          }`}>
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">حذف مدرسه و آموزشگاه</h3>
                <p className="text-xs text-slate-400">این عملیات غیرقابل بازگشت است</p>
              </div>
            </div>

            <p className="text-sm font-medium leading-relaxed">
              آیا از حذف مدرسه <span className="font-bold text-rose-500">«{schoolToDelete}»</span> اطمینان دارید؟
            </p>

            {classrooms.filter((c) => c.schoolName === schoolToDelete).length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>هشدار مهم:</span>
                </div>
                <p className="leading-normal">
                  تعداد <strong className="font-bold">{classrooms.filter((c) => c.schoolName === schoolToDelete).length} کلاس درس</strong> وابسته به این مدرسه در سیستم وجود دارد. با حذف این مدرسه، تمام این کلاس‌ها و دانش‌آموزان مربوطه نیز حذف خواهند شد.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={confirmDeleteSchool}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
              >
                بله، حذف مدرسه و کلاس‌ها
              </button>
              <button
                type="button"
                onClick={() => setSchoolToDelete(null)}
                className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Rename School Modal */}
      {schoolToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className={`rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border ${
            isDarkMode ? 'bg-[#102A36] text-white border-slate-700' : 'bg-white text-slate-800 border-slate-200'
          }`}>
            <div className="flex items-center gap-3 text-indigo-500 dark:text-teal-400">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-teal-500/10 flex items-center justify-center shrink-0">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">ویرایش نام مدرسه</h3>
                <p className="text-xs text-slate-400">تغییر نام در تمام کلاس‌های مربوطه نیز اعمال خواهد شد</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">نام جدید مدرسه:</label>
              <input
                type="text"
                value={schoolToEdit.newName}
                onChange={(e) => setSchoolToEdit({ ...schoolToEdit, newName: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border focus:outline-none transition-all ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-400'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={confirmRenameSchool}
                disabled={!schoolToEdit.newName.trim()}
                className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs ${
                  isDarkMode
                    ? 'bg-teal-400 hover:bg-teal-300 text-slate-950'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                ذخیره تغییرات
              </button>
              <button
                type="button"
                onClick={() => setSchoolToEdit(null)}
                className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Detailed School Modal (Create/Edit full metadata) */}
      {schoolModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className={`rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border my-8 ${
            isDarkMode ? 'bg-[#102A36] text-white border-slate-700' : 'bg-white text-slate-800 border-slate-200'
          }`}>
            <div className="flex items-center gap-3 text-teal-500">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">
                  {schoolModalData.originalName ? `ویرایش مشخصات «${schoolModalData.originalName}»` : 'ثبت مدرسه یا آموزشگاه جدید'}
                </h3>
                <p className="text-xs text-slate-400">مشخصات زیر اختیاری هستند و جهت نمایش در گزارش‌ها و برنامه‌ها استفاده می‌شوند.</p>
              </div>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {/* School Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <span>نام مدرسه یا آموزشگاه:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={schoolModalData.name}
                  onChange={(e) => setSchoolModalData({ ...schoolModalData, name: e.target.value })}
                  placeholder="نام کامل مدرسه (مثلا: دبیرستان شهدا)..."
                  className={`w-full px-3.5 py-2.5 rounded-xl font-medium border focus:outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* School Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-200">نوع مدرسه (اختیاری):</label>
                <div className="flex flex-wrap gap-1.5">
                  {['دولتی', 'غیرانتفاعی', 'هیئت امنایی', 'نمونه دولتی', 'تیزهوشان', 'سایر'].map((t) => {
                    const isSelected = schoolModalData.schoolType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSchoolModalData({ ...schoolModalData, schoolType: t })}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? isDarkMode
                              ? 'bg-teal-400 text-slate-950 border-teal-400 shadow-xs'
                              : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : isDarkMode
                              ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* School Code & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span>کد مدرسه:</span>
                  </label>
                  <input
                    type="text"
                    value={schoolModalData.schoolCode}
                    onChange={(e) => setSchoolModalData({ ...schoolModalData, schoolCode: e.target.value })}
                    placeholder="کد مدرسه / شناسه مرکز..."
                    className={`w-full px-3.5 py-2 rounded-xl font-medium border focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-400'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>شماره تلفن مدرسه:</span>
                  </label>
                  <input
                    type="text"
                    value={schoolModalData.phone}
                    onChange={(e) => setSchoolModalData({ ...schoolModalData, phone: e.target.value })}
                    placeholder="مثلا: ۰۲۱۸۸۸۸۸۸۸۸"
                    className={`w-full px-3.5 py-2 rounded-xl font-medium border focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-400'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              {/* Principal Phone & Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>شماره تلفن مدیر:</span>
                  </label>
                  <input
                    type="text"
                    value={schoolModalData.principalPhone}
                    onChange={(e) => setSchoolModalData({ ...schoolModalData, principalPhone: e.target.value })}
                    placeholder="مثلا: ۰۹۱۲۳۴۵۶۷۸۹"
                    className={`w-full px-3.5 py-2 rounded-xl font-medium border focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-400'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>کد پستی:</span>
                  </label>
                  <input
                    type="text"
                    value={schoolModalData.postalCode}
                    onChange={(e) => setSchoolModalData({ ...schoolModalData, postalCode: e.target.value })}
                    placeholder="کد پستی ۱۰ رقمی..."
                    className={`w-full px-3.5 py-2 rounded-xl font-medium border focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-400'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>آدرس مدرسه:</span>
                </label>
                <textarea
                  rows={2}
                  value={schoolModalData.address}
                  onChange={(e) => setSchoolModalData({ ...schoolModalData, address: e.target.value })}
                  placeholder="آدرس دقیق خیابان، کوچه و پلاک..."
                  className={`w-full px-3.5 py-2 rounded-xl font-medium border focus:outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={handleSaveSchoolModal}
                disabled={!schoolModalData.name.trim()}
                className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs ${
                  schoolModalData.name.trim()
                    ? isDarkMode
                      ? 'bg-teal-400 hover:bg-teal-300 text-slate-950'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                ذخیره مشخصات مدرسه
              </button>
              <button
                type="button"
                onClick={() => setSchoolModalData(null)}
                className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
