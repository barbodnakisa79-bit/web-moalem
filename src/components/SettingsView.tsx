import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
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
  X,
} from 'lucide-react';
import { Classroom, Student, AttendanceRecord, ScoreRecord, ClassJournalEntry, BehavioralPoint, TimetableItem, SchoolDetails, EDUCATION_STAGES, STAGE_GRADES_MAP, GRADE_OPTIONS } from '../types';
import { ColorPickerSelector } from './ColorPickerSelector';
import { getCardColorClasses, getCardColorStyle } from '../utils/cardColors';
import { matchGradeToStage, normalizePersianText, normalizePersianNumbers } from '../utils/studentUtils';

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
  onClearAllData?: () => void;
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
  onClearAllData,
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
    educationStage: string;
    schoolCode: string;
    phone: string;
    principalPhone: string;
    address: string;
    postalCode: string;
    cardBgColor: string;
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
  const [isClearDataOpen, setIsClearDataOpen] = useState(false);

  // Clear data modals state
  const [showClearWarningStep1, setShowClearWarningStep1] = useState(false);
  const [showClearWarningStep2, setShowClearWarningStep2] = useState(false);

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

  const handleExecuteClearAllData = () => {
    setCustomSchools([]);
    setSchoolsDetailsMap({});

    try {
      localStorage.removeItem('amoozgar_classrooms');
      localStorage.removeItem('amoozgar_selectedClassId');
      localStorage.removeItem('amoozgar_students');
      localStorage.removeItem('amoozgar_attendance');
      localStorage.removeItem('amoozgar_scores');
      localStorage.removeItem('amoozgar_journals');
      localStorage.removeItem('amoozgar_behavioralPoints');
      localStorage.removeItem('amoozgar_timetable');
      localStorage.removeItem('amoozgar_schools_details');
      localStorage.removeItem('amoozgar_custom_schools');
      localStorage.removeItem('amoozgar_grade_colors');
    } catch (e) {
      console.error(e);
    }

    onClearAllData?.();

    setShowClearWarningStep2(false);
    showStatus('success', 'تمامی اطلاعات ثبت‌شده با موفقیت پاک‌سازی شدند.');
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
      educationStage: 'متوسطه دوم - نظری تجربی',
      schoolCode: '',
      phone: '',
      principalPhone: '',
      address: '',
      postalCode: '',
      cardBgColor: 'default',
    });
  };

  const handleOpenEditSchoolModal = (schoolNameStr: string) => {
    const existing = schoolsDetailsMap[schoolNameStr] || {};
    setSchoolModalData({
      originalName: schoolNameStr,
      name: existing.name || schoolNameStr,
      schoolType: existing.schoolType || 'دولتی',
      educationStage: existing.educationStage || 'متوسطه دوم - نظری تجربی',
      schoolCode: existing.schoolCode || '',
      phone: existing.phone || '',
      principalPhone: existing.principalPhone || '',
      address: existing.address || '',
      postalCode: existing.postalCode || '',
      cardBgColor: existing.cardBgColor || 'default',
    });
  };

  const handleSaveSchoolModal = () => {
    if (!schoolModalData || !schoolModalData.name.trim()) return;

    const trimmedName = schoolModalData.name.trim();
    const { originalName, schoolType, educationStage, schoolCode, phone, principalPhone, address, postalCode, cardBgColor } = schoolModalData;

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
      educationStage,
      schoolCode,
      phone,
      principalPhone,
      address,
      postalCode,
      cardBgColor,
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

  // 1. Manual ZIP Backup Download
  const handleManualBackup = async () => {
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

      const zip = new JSZip();
      zip.file("backup_data.json", JSON.stringify(backupData, null, 2));

      const zipContent = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipContent);
      const link = document.createElement('a');
      const todayStr = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
      link.href = url;
      link.download = `پشتیبان_آموزگار_${todayStr}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showStatus('success', 'فایل پشتیبان کامل برنامه (ZIP) با موفقیت دانلود شد.');
    } catch (err) {
      showStatus('error', 'خطا در ساخت فایل پشتیبان زیپ.');
    }
  };

  // 2. ZIP / JSON Restore Upload
  const handleJSONFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let parsed: any = null;

      if (file.name.endsWith('.zip')) {
        const zip = new JSZip();
        const zipArchive = await zip.loadAsync(file);
        
        // Find backup_data.json or any .json inside zip archive
        const jsonFileName = Object.keys(zipArchive.files).find(name => name.endsWith('.json'));
        if (!jsonFileName) {
          throw new Error('هیچ فایل داده‌ای درون فایل زیپ یافت نشد.');
        }
        
        const jsonContent = await zipArchive.files[jsonFileName].async('string');
        parsed = JSON.parse(jsonContent);
      } else if (file.name.endsWith('.json')) {
        // Fallback support for older raw JSON backups
        const text = await file.text();
        parsed = JSON.parse(text);
      } else {
        showStatus('error', 'فرمت فایل معتبر نیست. لطفاً فایل پشتیبان زیپ (.zip) یا (.json) انتخاب کنید.');
        e.target.value = '';
        return;
      }

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
            timetable: parsed.timetable || [],
          });
        }
        showStatus('success', `اطلاعات با موفقیت از فایل پشتیبان بازیابی شد (${parsed.students?.length || 0} دانش‌آموز).`);
      } else {
        showStatus('error', 'فرمت ساختار فایل پشتیبان معتبر نیست.');
      }
    } catch (err: any) {
      showStatus('error', err?.message || 'خطا در خواندن فایل پشتیبان.');
    }
    e.target.value = '';
  };

  // 3. Download Sample Raw Excel Template (.xlsx)
  const handleDownloadSampleExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // Sample Data
      const sampleRows = [
        {
          'ردیف': 1,
          'نام و نام خانوادگی': 'علی رضایی',
          'کد ملی / دانش‌آموزی': '0012345678',
          'نام مدرسه': 'دبیرستان رازی',
          'مقطع و شاخه تحصیلی': 'متوسطه دوم - نظری تجربی',
          'پایه تحصیلی': 'پایه دهم (نظری تجربی)',
          'عنوان کلاس / شعبه': 'کلاس ۱۰۱',
          'نام درس یا دروس': 'فیزیک ۱، آزمایشگاه علوم',
          'نام پدر': 'حسین',
          'شماره تماس': '09123456789',
          'یادداشت / توضیحات': 'دانش‌آموز نمونه',
        },
        {
          'ردیف': 2,
          'نام و نام خانوادگی': 'محمد حسینی',
          'کد ملی / دانش‌آموزی': '0023456789',
          'نام مدرسه': 'دبیرستان رازی',
          'مقطع و شاخه تحصیلی': 'متوسطه دوم - نظری تجربی',
          'پایه تحصیلی': 'پایه دهم (نظری تجربی)',
          'عنوان کلاس / شعبه': 'کلاس ۱۰۱',
          'نام درس یا دروس': 'فیزیک ۱، شیمی ۱',
          'نام پدر': 'رضا',
          'شماره تماس': '09129876543',
          'یادداشت / توضیحات': '',
        },
        {
          'ردیف': 3,
          'نام و نام خانوادگی': 'سارا احمدی',
          'کد ملی / دانش‌آموزی': '0034567890',
          'نام مدرسه': 'هنرستان شهید بهشتی',
          'مقطع و شاخه تحصیلی': 'هنرستان - فنی و حرفه‌ای',
          'پایه تحصیلی': 'پایه یازدهم (فنی و حرفه‌ای)',
          'عنوان کلاس / شعبه': 'کلاس ۲۰۱',
          'نام درس یا دروس': 'توسعه برنامه‌سازی، شبکه',
          'نام پدر': 'احمد',
          'شماره تماس': '09351234567',
          'یادداشت / توضیحات': '',
        },
        {
          'ردیف': 4,
          'نام و نام خانوادگی': 'مهدی کریمی',
          'کد ملی / دانش‌آموزی': '0045678901',
          'نام مدرسه': 'دبستان دانش',
          'مقطع و شاخه تحصیلی': 'ابتدایی (دبستان)',
          'پایه تحصیلی': 'پایه پنجم ابتدایی',
          'عنوان کلاس / شعبه': 'کلاس ۵۰۲',
          'نام درس یا دروس': 'ریاضی، علوم تجربی',
          'نام پدر': 'مهرداد',
          'شماره تماس': '09191112233',
          'یادداشت / توضیحات': '',
        },
      ];

      const sampleSheet = XLSX.utils.json_to_sheet(sampleRows);

      // Set column widths
      sampleSheet['!cols'] = [
        { wch: 6 },  // ردیف
        { wch: 22 }, // نام و نام خانوادگی
        { wch: 18 }, // کد ملی
        { wch: 20 }, // نام مدرسه
        { wch: 26 }, // مقطع و شاخه
        { wch: 22 }, // پایه
        { wch: 16 }, // عنوان کلاس / شعبه
        { wch: 26 }, // نام درس یا دروس
        { wch: 14 }, // نام پدر
        { wch: 16 }, // شماره تماس
        { wch: 20 }, // یادداشت
      ];

      XLSX.utils.book_append_sheet(workbook, sampleSheet, 'مشخصات دانش‌آموزان');

      // Guide Sheet
      const guideRows = [
        { 'عنوان ستون': 'نام و نام خانوادگی', 'ضرورت': 'ضروری', 'توضیحات و راهنما': 'نام کامل دانش‌آموز. در صورت داشتن دو ستون مجزا (نام و نام خانوادگی) نیز سیستم تشخیص می‌دهد.' },
        { 'عنوان ستون': 'کد ملی / دانش‌آموزی', 'ضرورت': 'توصیه شده', 'توضیحات و راهنما': 'برای جلوگیری از ایجاد دانش‌آموز تکراری و ادغام خودکار درس‌ها بسیار مفید است.' },
        { 'عنوان ستون': 'نام مدرسه', 'ضرورت': 'اختیاری', 'توضیحات و راهنما': 'نام آموزشگاه (مثلاً: دبیرستان رازی). دانش‌آموزان به کارت‌های همان مدرسه متصل می‌شوند.' },
        { 'عنوان ستون': 'مقطع و شاخه تحصیلی', 'ضرورت': 'اختیاری', 'توضیحات و راهنما': 'مثال: متوسطه دوم - نظری تجربی، هنرستان - فنی و حرفه‌ای، ابتدایی و...' },
        { 'عنوان ستون': 'پایه تحصیلی', 'ضرورت': 'اختیاری', 'توضیحات و راهنما': 'مثال: پایه دهم (نظری تجربی)، پایه هفتم، پایه پنجم ابتدایی' },
        { 'عنوان ستون': 'عنوان کلاس / شعبه', 'ضرورت': 'اختیاری', 'توضیحات و راهنما': 'شماره یا نام کلاس/شعبه (مثلاً: کلاس ۱۰۱ یا الف)' },
        { 'عنوان ستون': 'نام درس یا دروس', 'ضرورت': 'اختیاری', 'توضیحات و راهنما': 'اگر یک دانش‌آموز چند درس دارد، نام درس‌ها را با کاما (،) جدا کنید (مثال: فیزیک ۱، آزمایشگاه علوم). سیستم خودکار کارت‌های درس را پیدا کرده یا می‌سازد.' },
        { 'عنوان ستون': 'نام پدر و تلفن', 'ضرورت': 'اختیاری', 'توضیحات و راهنما': 'اطلاعات تماس اولیا جهت ارتباط سریع در برنامه' },
      ];

      const guideSheet = XLSX.utils.json_to_sheet(guideRows);
      guideSheet['!cols'] = [
        { wch: 22 },
        { wch: 12 },
        { wch: 70 },
      ];
      XLSX.utils.book_append_sheet(workbook, guideSheet, 'راهنمای تکمیل اکسل');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `نمونه_فایل_خام_اکسل_دانش‌آموزان.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showStatus('success', 'نمونه فایل خام اکسل (.xlsx) با موفقیت دانلود شد.');
    } catch (err) {
      showStatus('error', 'خطا در ایجاد نمونه فایل اکسل.');
    }
  };

  // 4. Export XLSX Excel File
  const handleExportExcelAll = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // Main Students Sheet
      const studentsRows = students.map((std, idx) => {
        const cls = classrooms.find((c) => c.id === std.classId);
        const allClsNames = (std.classIds && std.classIds.length > 0)
          ? std.classIds.map((cid) => classrooms.find((c) => c.id === cid)?.subject || classrooms.find((c) => c.id === cid)?.name).filter(Boolean).join('، ')
          : (cls?.subject || cls?.name || 'نامشخص');

        const stdAttendance = attendance.filter((a) => a.studentId === std.id && a.status === 'absent').length;
        const stdPoints = behavioralPoints
          .filter((p) => p.studentId === std.id)
          .reduce((sum, p) => sum + p.scoreValue, 0);

        return {
          'ردیف': idx + 1,
          'نام و نام خانوادگی': std.fullName,
          'کد ملی / دانش‌آموزی': std.studentCode || '',
          'نام مدرسه': std.schoolName || cls?.schoolName || '',
          'مقطع و شاخه تحصیلی': std.educationStage || cls?.educationStage || '',
          'پایه تحصیلی': std.grade || cls?.grade || '',
          'عنوان کلاس / شعبه': std.className || cls?.name || '',
          'نام درس یا دروس': allClsNames,
          'نام پدر': std.fatherName || '',
          'شماره تماس': std.parentPhone || '',
          'تعداد غیبت': stdAttendance,
          'امتیاز انضباطی': stdPoints,
          'یادداشت / توضیحات': std.notes || '',
        };
      });

      const studentsSheet = XLSX.utils.json_to_sheet(studentsRows);
      studentsSheet['!cols'] = [
        { wch: 6 },
        { wch: 22 },
        { wch: 18 },
        { wch: 20 },
        { wch: 24 },
        { wch: 20 },
        { wch: 16 },
        { wch: 26 },
        { wch: 14 },
        { wch: 16 },
        { wch: 12 },
        { wch: 14 },
        { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(workbook, studentsSheet, 'دانش‌آموزان');

      // Scores Sheet
      if (scores && scores.length > 0) {
        const scoresRows = scores.map((s, idx) => {
          const std = students.find((st) => st.id === s.studentId);
          const cls = classrooms.find((c) => c.id === (s.classId || std?.classId))?.name || '';
          return {
            'ردیف': idx + 1,
            'نام دانش‌آموز': std?.fullName || '',
            'کلاس/درس': cls,
            'تاریخ': s.date,
            'عنوان نمره': s.title,
            'نوع ارزیابی': s.type === 'continuous' ? 'مستمر' : s.type === 'exam' ? 'امتحان' : s.type === 'homework' ? 'تکلیف' : s.type === 'oral' ? 'شفاهی' : 'انضباطی',
            'مقدار نمره': s.scoreValue,
            'توضیحات': s.description || '',
          };
        });
        const scoresSheet = XLSX.utils.json_to_sheet(scoresRows);
        XLSX.utils.book_append_sheet(workbook, scoresSheet, 'نمرات');
      }

      // Attendance Sheet
      if (attendance && attendance.length > 0) {
        const attendanceRows = attendance.map((a, idx) => {
          const std = students.find((st) => st.id === a.studentId);
          const cls = classrooms.find((c) => c.id === (a.classId || std?.classId))?.name || '';
          return {
            'ردیف': idx + 1,
            'نام دانش‌آموز': std?.fullName || '',
            'کلاس/درس': cls,
            'تاریخ': a.date,
            'وضعیت': a.status === 'present' ? 'حاضر' : a.status === 'absent' ? 'غایب' : a.status === 'excused' ? 'غایب موجه' : 'تأخیر',
            'علت / یادداشت': a.note || '',
          };
        });
        const attendanceSheet = XLSX.utils.json_to_sheet(attendanceRows);
        XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'حضور و غیاب');
      }

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const todayStr = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
      link.href = url;
      link.download = `خروجی_اکسل_کلیه_دروس_${todayStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showStatus('success', 'خروجی اکسل واقعی (.xlsx) با موفقیت دریافت شد.');
    } catch (err) {
      showStatus('error', 'خطا در تولید فایل اکسل XLSX.');
    }
  };

  // 5. Smart Import XLSX / XLS / CSV with School, Grade, and Multi-Subject Mapping
  const handleExcelFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        // Find sheets with students data or default to first sheet
        const sheetName = workbook.SheetNames.find((s) => s.includes('دانش') || s.includes('مشخصات') || s.includes('Student')) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Read as JSON rows
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        // Also get table rows array as fallback
        const rawTable: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        let parsedRows: any[] = [];

        if (rawJson && rawJson.length > 0 && typeof rawJson[0] === 'object') {
          parsedRows = rawJson;
        } else if (rawTable && rawTable.length > 1) {
          const headers = rawTable[0];
          for (let r = 1; r < rawTable.length; r++) {
            const rowData = rawTable[r];
            if (!rowData || rowData.length === 0) continue;
            const obj: any = {};
            headers.forEach((h: any, colIdx: number) => {
              if (h) obj[String(h).trim()] = rowData[colIdx] ?? '';
            });
            parsedRows.push(obj);
          }
        }

        if (!parsedRows || parsedRows.length === 0) {
          showStatus('info', 'هیچ داده‌ای در فایل اکسل یافت نشد.');
          return;
        }

        // Helper to extract field from row object with various Persian & English aliases
        const getField = (row: any, aliases: string[]): string => {
          for (const key of Object.keys(row)) {
            const normKey = normalizePersianText(key).toLowerCase();
            for (const alias of aliases) {
              const normAlias = normalizePersianText(alias).toLowerCase();
              if (normKey === normAlias || normKey.includes(normAlias)) {
                const val = row[key];
                if (val !== undefined && val !== null) return String(val).trim();
              }
            }
          }
          return '';
        };

        const updatedClassrooms = [...classrooms];
        let newClassesCount = 0;

        // Current students map for deduplication
        const studentMap = new Map<string, Student>();
        students.forEach((s) => {
          // Key by student code if present, else by fullName + schoolName
          const key = s.studentCode ? `code:${s.studentCode.trim()}` : `name:${normalizePersianText(s.fullName)}|sch:${normalizePersianText(s.schoolName)}`;
          studentMap.set(key, { ...s, classIds: s.classIds ? [...s.classIds] : (s.classId ? [s.classId] : []) });
        });

        let validCount = 0;

        parsedRows.forEach((row, rowIdx) => {
          // Extract student name
          let fullName = getField(row, ['نام و نام خانوادگی', 'نام کامل', 'دانش آموز', 'دانش‌آموز', 'fullName', 'نام خانوادگی و نام', 'نام خانوادگی و نام دانش آموز']);
          if (!fullName) {
            const firstName = getField(row, ['نام', 'firstName']);
            const lastName = getField(row, ['نام خانوادگی', 'شهرت', 'فامیلی', 'lastName']);
            if (firstName || lastName) {
              fullName = `${firstName} ${lastName}`.trim();
            }
          }

          if (!fullName || fullName === 'نام و نام خانوادگی' || fullName === 'نام') {
            return;
          }

          const rawCode = getField(row, ['کد ملی / دانش‌آموزی', 'کد ملی', 'کد دانش آموزی', 'کد دانش‌آموزی', 'شماره ملی', 'کد ملی/دانش‌آموزی', 'studentCode', 'nationalCode', 'کد']);
          const studentCode = normalizePersianNumbers(rawCode);

          const schoolName = getField(row, ['نام مدرسه', 'مدرسه', 'نام آموزشگاه', 'آموزشگاه', 'schoolName', 'school']);
          const rawStage = getField(row, ['مقطع و شاخه تحصیلی', 'مقطع تحصیلی', 'مقطع', 'شاخه', 'شاخه تحصیلی', 'educationStage']);
          const educationStage = rawStage || (schoolName && classrooms.find((c) => normalizePersianText(c.schoolName) === normalizePersianText(schoolName))?.educationStage) || 'متوسطه دوم - نظری تجربی';
          
          const rawGrade = getField(row, ['پایه تحصیلی', 'پایه', 'کلاس/پایه', 'grade']);
          const matchedGrade = matchGradeToStage(rawGrade || (classrooms[0]?.grade), educationStage);

          const className = getField(row, ['عنوان کلاس / شعبه', 'عنوان کلاس', 'کلاس', 'شعبه', 'نام کلاس', 'className', 'کلاس/شعبه']);
          const subjectStr = getField(row, ['نام درس یا دروس', 'درس یا دروس', 'درس', 'دروس', 'نام درس', 'کلاس / درس', 'کلاس/درس', 'subject', 'subjects']);
          const fatherName = getField(row, ['نام پدر', 'پدر', 'fatherName', 'father']);
          const parentPhone = normalizePersianNumbers(getField(row, ['شماره تماس', 'تلفن', 'موبایل', 'شماره همراه', 'تلفن همراه', 'تلفن اولیا', 'parentPhone', 'phone']));
          const notes = getField(row, ['یادداشت / توضیحات', 'توضیحات', 'یادداشت', 'notes', 'description']);

          // Parse subjects (can be comma-separated or slash-separated)
          const subjectNames: string[] = [];
          if (subjectStr) {
            const rawSubjects = subjectStr.split(/[,،/|\-+]/);
            rawSubjects.forEach((s) => {
              const clean = normalizePersianText(s);
              if (clean && clean.length > 1) subjectNames.push(clean);
            });
          }

          // If no specific subject given, fallback to single generic subject or className
          if (subjectNames.length === 0) {
            subjectNames.push(className || 'درس عمومی');
          }

          // Find or create matching classrooms for this student
          const assignedClassIds: string[] = [];

          subjectNames.forEach((subj) => {
            const normSubj = normalizePersianText(subj);
            const normSchool = normalizePersianText(schoolName);
            const normGrade = normalizePersianText(matchedGrade);

            // 1. Look for existing classroom matching school + grade + subject (or name)
            let existingClass = updatedClassrooms.find((c) => {
              const cSchool = normalizePersianText(c.schoolName);
              const cGrade = normalizePersianText(c.grade);
              const cSubj = normalizePersianText(c.subject);
              const cName = normalizePersianText(c.name);

              const matchSchool = !normSchool || !cSchool || cSchool === normSchool;
              const matchGrade = !normGrade || !cGrade || cGrade === normGrade || cGrade.includes(normGrade) || normGrade.includes(cGrade);
              const matchSubj = cSubj === normSubj || cName.includes(normSubj) || normSubj.includes(cSubj) || (normSubj === 'درس عمومی');

              return matchSchool && matchGrade && matchSubj;
            });

            // 2. If not found, look for any classroom matching school and subject
            if (!existingClass && normSchool) {
              existingClass = updatedClassrooms.find((c) => {
                const cSchool = normalizePersianText(c.schoolName);
                const cSubj = normalizePersianText(c.subject);
                return cSchool === normSchool && (cSubj === normSubj || normSubj.includes(cSubj));
              });
            }

            if (existingClass) {
              if (!assignedClassIds.includes(existingClass.id)) {
                assignedClassIds.push(existingClass.id);
              }
            } else {
              // 3. Create a new classroom automatically!
              const newClassId = `c-excel-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
              const generatedName = subj !== 'درس عمومی'
                ? (className ? `${subj} (${className})` : `${subj} ${matchedGrade || ''}`.trim())
                : (className || `${matchedGrade || 'کلاس'} ${schoolName || ''}`.trim());

              const isElementary = educationStage.includes('ابتدایی');
              const newClass: Classroom = {
                id: newClassId,
                name: generatedName,
                subject: subj !== 'درس عمومی' ? subj : (className || 'عمومی'),
                grade: matchedGrade || 'پایه دهم',
                schoolName: schoolName || (classrooms[0]?.schoolName || ''),
                educationStage: educationStage || 'متوسطه دوم - نظری تجربی',
                academicYear: '۱۴۰۳-۱۴۰۴',
                evaluationSystem: isElementary ? 'descriptive' : 'numeric',
                cardBgColor: '#0284c7',
                showName: true,
                showGrade: true,
                showSchoolName: true,
                showEducationStage: true,
                showAcademicYear: true,
              };

              updatedClassrooms.push(newClass);
              assignedClassIds.push(newClassId);
              newClassesCount++;
            }
          });

          // Deduplicate & save student
          const dedupKey = studentCode ? `code:${studentCode}` : `name:${normalizePersianText(fullName)}|sch:${normalizePersianText(schoolName)}`;
          
          if (studentMap.has(dedupKey)) {
            // Update existing student: merge new classIds
            const existingStd = studentMap.get(dedupKey)!;
            const mergedClassIds = Array.from(new Set([...(existingStd.classIds || [existingStd.classId]), ...assignedClassIds]));
            existingStd.classIds = mergedClassIds;
            if (assignedClassIds.length > 0 && !existingStd.classId) {
              existingStd.classId = assignedClassIds[0];
            }
            if (fatherName && !existingStd.fatherName) existingStd.fatherName = fatherName;
            if (parentPhone && !existingStd.parentPhone) existingStd.parentPhone = parentPhone;
            if (schoolName && !existingStd.schoolName) existingStd.schoolName = schoolName;
            if (educationStage && !existingStd.educationStage) existingStd.educationStage = educationStage;
            if (matchedGrade && !existingStd.grade) existingStd.grade = matchedGrade;
            if (className && !existingStd.className) existingStd.className = className;
            if (notes && !existingStd.notes) existingStd.notes = notes;
            studentMap.set(dedupKey, existingStd);
          } else {
            // Create new student
            const newStudentObj: Student = {
              id: `std-xl-${Date.now()}-${rowIdx}`,
              classId: assignedClassIds[0] || updatedClassrooms[0]?.id || 'c1',
              classIds: assignedClassIds,
              fullName: fullName,
              studentCode: studentCode || `00${Date.now() % 1000000}${rowIdx}`,
              fatherName: fatherName || undefined,
              parentPhone: parentPhone || undefined,
              schoolName: schoolName || undefined,
              educationStage: educationStage || undefined,
              grade: matchedGrade || undefined,
              className: className || undefined,
              notes: notes || undefined,
            };
            studentMap.set(dedupKey, newStudentObj);
          }
          validCount++;
        });

        const finalStudentsList = Array.from(studentMap.values());

        if (validCount > 0 && onRestoreData) {
          onRestoreData({
            classrooms: updatedClassrooms,
            students: finalStudentsList,
          });

          let msg = `تعداد ${validCount} دانش‌آموز با موفقیت از اکسل وارد و در کلاس‌های مربوطه جای‌گذاری شدند.`;
          if (newClassesCount > 0) {
            msg += ` (${newClassesCount} کارت درس جدید نیز به‌صورت خودکار ایجاد شد).`;
          }
          showStatus('success', msg);
        } else {
          showStatus('info', 'اطلاعات معتبری در فایل اکسل پیدا نشد. لطفاً از نمونه فایل خام استفاده فرمایید.');
        }
      } catch (err: any) {
        showStatus('error', err?.message || 'خطا در پردازش فایل اکسل.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-3.5 max-w-5xl mx-auto pb-6">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={jsonInputRef}
        accept=".zip,.json"
        className="hidden"
        onChange={handleJSONFileSelect}
      />
      <input
        type="file"
        ref={excelInputRef}
        accept=".xlsx,.xls,.csv"
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
          </div>
        </div>
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

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {details.educationStage && (
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 border ${
                                      isDarkMode
                                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}>
                                      {details.educationStage}
                                    </span>
                                  )}
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
                      <span>پشتیبان‌گیری و بازیابی اطلاعات (فایل فشرده ZIP)</span>
                    </div>

                    <p className={`text-xs leading-relaxed ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      برای جلوگیری از پاک شدن ناگهانی اطلاعات یا انتقال کلاس‌ها به دستگاه جدید، فایل پشتیبان به‌صورت فشرده (ZIP) دانلود می‌شود. برای بازیابی کافیست فایل زیپ پشتیبان را وارد نمایید.
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
                        <span>پشتیبان‌گیری (فایل ZIP)</span>
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
                        <span>بازیابی اطلاعات (ZIP)</span>
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

                  {/* Card 3: Excel Export, Import & Sample Template */}
                  <div className={`border rounded-2xl p-5 space-y-4 ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700/80 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className={`flex items-center gap-2 font-bold text-sm ${
                        isDarkMode ? 'text-teal-300' : 'text-teal-700'
                      }`}>
                        <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                        <span>پشتیبان‌گیری و انتقال اطلاعات به اکسل (فرمت XLSX)</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg self-start sm:self-auto ${
                        isDarkMode ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        پشتیبانی از چند درس و چند کلاس
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      امکان خروجی گرفتن، دانلود نمونه فایل خام جهت تکمیل اسامی، یا ورود اطلاعات هوشمند از اکسل با تفکیک خودکار مدرسه، پایه و دروس.
                    </p>

                    {/* Quick Guide Box */}
                    <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                      isDarkMode
                        ? 'bg-slate-900/60 border-slate-700 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
                    }`}>
                      <Info className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">نکته هوشمند: </span>
                        اگر در فایل اکسل ستون‌های <strong>نام مدرسه</strong>، <strong>پایه</strong> و <strong>نام درس یا دروس</strong> را پر کنید، سیستم به‌صورت هوشمند دانش‌آموز را در کارت‌های درس مربوطه جای‌گذاری می‌کند. اگر یک دانش‌آموز چند درس دارد، نام دروس را با کاما (<code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">،</code>) بنویسید (مثلاً: <em>فیزیک ۱، شیمی ۱، آزمایشگاه</em>).
                      </div>
                    </div>

                    {/* Action Buttons Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {/* 1. Download Sample Raw Template */}
                      <button
                        type="button"
                        onClick={handleDownloadSampleExcel}
                        className={`flex items-center justify-center gap-2 font-bold py-3 px-3.5 rounded-xl border transition-all active:scale-98 text-xs sm:text-sm shadow-xs ${
                          isDarkMode
                            ? 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border-emerald-600/50'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                        title="دانلود فایل نمونه اکسل جهت تکمیل توسط کاربر"
                      >
                        <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                        <span>دانلود نمونه خام اکسل</span>
                      </button>

                      {/* 2. Export All Excel */}
                      <button
                        type="button"
                        onClick={handleExportExcelAll}
                        className={`flex items-center justify-center gap-2 font-bold py-3 px-3.5 rounded-xl shadow-md transition-all active:scale-98 text-xs sm:text-sm ${
                          isDarkMode
                            ? 'bg-teal-400 hover:bg-teal-300 text-slate-950'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        <Download className="w-4 h-4 stroke-[2.5]" />
                        <span>خروجی اکسل (XLSX)</span>
                      </button>

                      {/* 3. Import Excel */}
                      <button
                        type="button"
                        onClick={() => excelInputRef.current?.click()}
                        className={`flex items-center justify-center gap-2 font-bold py-3 px-3.5 rounded-xl border transition-all active:scale-98 text-xs sm:text-sm ${
                          isDarkMode
                            ? 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border-teal-500/40'
                            : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200'
                        }`}
                      >
                        <Upload className="w-4 h-4 stroke-[2.5]" />
                        <span>ورود فایل اکسل (XLSX)</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Accordion 6: Data Cleanup & Reset (پاکسازی و بازنشانی اطلاعات) */}
            <div className={`rounded-2xl border overflow-hidden transition-all shadow-md ${
              isDarkMode
                ? 'bg-[#102A36] text-white border-rose-900/60'
                : 'bg-white text-slate-800 border-rose-200 shadow-xs'
            }`}>
              <button
                type="button"
                onClick={() => setIsClearDataOpen(!isClearDataOpen)}
                className={`w-full flex items-center justify-between p-5 text-right font-bold text-base transition-colors ${
                  isDarkMode ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50/50'
                }`}
              >
                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isClearDataOpen ? 'rotate-180' : ''}`} />
                  <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-extrabold text-base sm:text-lg`}>
                    پاکسازی و بازنشانی اطلاعات
                  </span>
                </div>
                <Trash2 className="w-5 h-5 text-rose-500 dark:text-rose-400" />
              </button>

              {isClearDataOpen && (
                <div className={`p-5 pt-3 border-t space-y-4 animate-fade-in ${
                  isDarkMode ? 'border-rose-900/40' : 'border-rose-100'
                }`}>
                  <div className={`border rounded-2xl p-5 space-y-4 ${
                    isDarkMode
                      ? 'bg-rose-950/20 border-rose-900/50 text-white'
                      : 'bg-rose-50/60 border-rose-200 text-slate-800'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-sm text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="w-5 h-5" />
                      <span>پاکسازی کامل تمامی داده‌های ثبت‌شده در نرم‌افزار</span>
                    </div>

                    <p className={`text-xs leading-relaxed ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      با اجرای این عملیات، کلیه اسامی مدارس، کلاس‌ها، دروس، دانش‌آموزان، نمرات، حضور و غیاب، یادداشت‌های کلاسی و برنامه هفتگی به صورت کامل پاک خواهند شد.
                    </p>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        توجه: فایل‌های پشتیبان قبلی که در حافظه دستگاه شما (پوشه Downloads) ذخیره شده‌اند، کاملاً محفوظ باقی می‌مانند و حذف نخواهند شد.
                      </span>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowClearWarningStep1(true)}
                        className="w-full sm:w-auto font-extrabold py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center justify-center gap-2 text-sm transition-all active:scale-98 cursor-pointer"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span>پاکسازی کامل اطلاعات وارد شده</span>
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
              <p className="text-xs sm:text-sm text-purple-200 leading-relaxed max-w-lg">
                در صورت نیاز به افزودن قابلیتهای سفارشی،گزارش مشکلات،انتقاد یا پیشنهاد می توانید مستقیماً با طراح و سازنده سامانه ارتباط برقرار کنید.
              </p>
            </div>

            <button
              onClick={onOpenDeveloperModal}
              className="z-10 flex-shrink-0 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs px-4 py-3 rounded-xl shadow-md transition-all active:scale-95"
            >
              مشاهده اطلاعات تماس سازنده
            </button>
          </div>

          {/* Card: About Project */}
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
              دستیار مدیریت کلاس
            </span>
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
            isDarkMode ? 'bg-[#1B3E50] text-white border-slate-700' : 'bg-white text-slate-800 border-slate-200'
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
            isDarkMode ? 'bg-[#1B3E50] text-white border-slate-700' : 'bg-white text-slate-800 border-slate-200'
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
            isDarkMode ? 'bg-[#1B3E50] text-white border-slate-700' : 'bg-white text-slate-800 border-slate-200'
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

              {/* Education Stage / Track - Mandatory */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <span>مقطع و شاخه تحصیلی مدرسه:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={schoolModalData.educationStage || 'متوسطه دوم - نظری تجربی'}
                  onChange={(e) => setSchoolModalData({ ...schoolModalData, educationStage: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl font-bold border focus:outline-none transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
                  }`}
                >
                  {EDUCATION_STAGES.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
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

      {/* Clear Data Warning Modal - Step 1 */}
      {showClearWarningStep1 && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B3E50] dark:text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-rose-200 dark:border-rose-900/60 animate-scale-in">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700/80">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-black text-base">
                <AlertTriangle className="w-6 h-6" />
                <span>هشدار اول: پاکسازی اطلاعات (مرحله ۱ از ۲)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowClearWarningStep1(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                آیا از شروع فرایند پاکسازی کامل اطلاعات اطمینان دارید؟
              </p>
              
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-2 text-xs text-rose-900 dark:text-rose-200">
                <p className="font-bold">با تایید این مرحله، موارد زیر به طور کامل پاک خواهند شد:</p>
                <ul className="list-disc list-inside space-y-1 pr-1 font-semibold opacity-90">
                  <li>لیست تمام مدارس، پایه تحصیلی و کلاس‌ها</li>
                  <li>اسامی و پرونده‌های کامل دانش‌آموزان</li>
                  <li>کلیه نمرات، ارزشیابی‌ها و حضور و غیاب‌ها</li>
                  <li>دفتر کلاسی، موارد انضباطی و برنامه هفتگی</li>
                </ul>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                * نکته: فایل‌های پشتیبان دانلودشده قبلی (ZIP/Excel) روی دستگاه شما کاملاً محفوظ باقی می‌مانند و آسیب نمی‌بینند.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearWarningStep1(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowClearWarningStep1(false);
                  setShowClearWarningStep2(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>تایید و ورود به مرحله بعد (۲ از ۲)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Warning Modal - Step 2 (Final Confirmation) */}
      {showClearWarningStep2 && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B3E50] dark:text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border-2 border-rose-600 animate-scale-in">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700/80">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-black text-base">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                <span>هشدار نهایی (مرحله ۲ از ۲)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowClearWarningStep2(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-rose-600 text-white space-y-2 text-center shadow-inner">
                <p className="font-black text-base">اخطار جدی: حذف دائمی اطلاعات!</p>
                <p className="text-xs text-rose-100 leading-relaxed font-semibold">
                  شما در حال حذف تمامی داده‌های آموزگار هستید. این عملیات غیرقابل بازگشت می‌باشد. آیا از تصمیم خود کاملاً اطمینان دارید؟
                </p>
              </div>

              <p className="text-xs font-bold text-center text-slate-600 dark:text-slate-300">
                با کلیک بر روی دکمه زیر، تمامی اطلاعات نرم‌افزار فوراً پاکسازی خواهند شد.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowClearWarningStep2(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                انصراف و لغو
              </button>

              <button
                type="button"
                onClick={handleExecuteClearAllData}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف نهایی و پاکسازی کامل اطلاعات</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
