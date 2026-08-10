import React, { useState, useEffect } from 'react';
import { Classroom, Student, EvaluationSystem, GRADE_OPTIONS, EDUCATION_STAGES, STAGE_GRADES_MAP, SchoolDetails } from '../types';
import { isStudentInClassroom } from '../utils/studentUtils';
import { ColorPickerSelector } from './ColorPickerSelector';
import { getCardColorClasses, getCardColorStyle } from '../utils/cardColors';
import {
  Plus,
  Ruler,
  GraduationCap,
  Leaf,
  BookOpen,
  Scroll,
  PenTool,
  Gift,
  Users,
  Search,
  Book,
  Sparkles,
  FlaskConical,
  Trophy,
  ChevronLeft,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  School,
  CheckCircle2,
  Eye,
  EyeOff,
  Palette,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Move,
} from 'lucide-react';

interface SubjectCardsViewProps {
  classrooms: Classroom[];
  students: Student[];
  onSelectClassroom: (classroom: Classroom, autoOpenDetail?: boolean) => void;
  onOpenAddClassModal: () => void;
  onUpdateClassroom: (classroom: Classroom) => void;
  onDeleteClassroom: (classroomId: string) => void;
  isDarkMode?: boolean;
}

export const SubjectCardsView: React.FC<SubjectCardsViewProps> = ({
  classrooms,
  students,
  onSelectClassroom,
  onOpenAddClassModal,
  onUpdateClassroom,
  onDeleteClassroom,
  isDarkMode = false,
}) => {
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>(() => {
    try {
      return localStorage.getItem('amoozgar_selectedSchoolFilter') || 'همه';
    } catch {
      return 'همه';
    }
  });
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>(() => {
    try {
      return localStorage.getItem('amoozgar_selectedGradeFilter') || 'همه';
    } catch {
      return 'همه';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_selectedSchoolFilter', selectedSchoolFilter);
    } catch (e) {
      console.error(e);
    }
  }, [selectedSchoolFilter]);

  useEffect(() => {
    try {
      localStorage.setItem('amoozgar_selectedGradeFilter', selectedGradeFilter);
    } catch (e) {
      console.error(e);
    }
  }, [selectedGradeFilter]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Reordering state
  const [schoolsOrder, setSchoolsOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_schools_order');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [gradesOrder, setGradesOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_grades_order');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [classroomsOrder, setClassroomsOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_classrooms_order');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reorderModalType, setReorderModalType] = useState<'school' | 'grade' | 'subject' | null>(null);

  // Long press timer (3 seconds = 3000ms) logic
  const [holdingProgress, setHoldingProgress] = useState<{ type: 'school' | 'grade' | 'subject'; id: string; percent: number } | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const preventClickRef = React.useRef<boolean>(false);
  const touchStartPos = React.useRef<{ x: number; y: number } | null>(null);

  const startPressTimer = (type: 'school' | 'grade' | 'subject', id: string) => {
    cancelPressTimer();
    preventClickRef.current = false;
    let elapsed = 0;
    const total = 3000;
    const step = 50;

    setHoldingProgress({ type, id, percent: 0 });

    intervalRef.current = setInterval(() => {
      elapsed += step;
      const pct = Math.min(100, Math.round((elapsed / total) * 100));
      setHoldingProgress({ type, id, percent: pct });
    }, step);

    timerRef.current = setTimeout(() => {
      cancelPressTimer();
      preventClickRef.current = true;
      try {
        if (navigator.vibrate) navigator.vibrate(100);
      } catch {}
      setReorderModalType(type);
    }, total);
  };

  const cancelPressTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setHoldingProgress(null);
  };

  const handleTouchStart = (e: React.TouchEvent, type: 'school' | 'grade' | 'subject', id: string) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    startPressTimer(type, id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current || !timerRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);
    if (dx > 10 || dy > 10) {
      cancelPressTimer();
    }
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'school' | 'grade' | 'subject', id: string) => {
    if (e.button !== 0) return;
    startPressTimer(type, id);
  };

  const handleMouseUp = () => {
    cancelPressTimer();
  };

  const handleMouseLeave = () => {
    cancelPressTimer();
  };

  // Modals for edit & delete
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [deletingClassroom, setDeletingClassroom] = useState<Classroom | null>(null);

  // Edit form state
  const [editSubject, setEditSubject] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editEducationStage, setEditEducationStage] = useState<string>('متوسطه دوم - نظری تجربی');
  const [editGrade, setEditGrade] = useState<string>('');
  const [editSchoolName, setEditSchoolName] = useState<string>('');
  const [editAcademicYear, setEditAcademicYear] = useState<string>('');
  const [editEvaluationSystem, setEditEvaluationSystem] = useState<EvaluationSystem>('numeric');
  const [editCardBgColor, setEditCardBgColor] = useState<string>('default');

  // Eye toggle state for display on card
  const [editShowName, setEditShowName] = useState<boolean>(true);
  const [editShowEducationStage, setEditShowEducationStage] = useState<boolean>(true);
  const [editShowGrade, setEditShowGrade] = useState<boolean>(true);
  const [editShowSchoolName, setEditShowSchoolName] = useState<boolean>(true);
  const [editShowAcademicYear, setEditShowAcademicYear] = useState<boolean>(false);
  const [editShowStudentCount, setEditShowStudentCount] = useState<boolean>(false);
  const [editShowEvaluationSystem, setEditShowEvaluationSystem] = useState<boolean>(false);

  // Open edit modal
  const handleStartEdit = (cls: Classroom) => {
    setEditingClassroom(cls);
    setEditSubject(cls.subject);
    setEditName(cls.name);
    setEditEducationStage(cls.educationStage || 'متوسطه دوم - نظری تجربی');
    setEditGrade(cls.grade);
    setEditSchoolName(cls.schoolName || '');
    setEditAcademicYear(cls.academicYear);
    setEditEvaluationSystem(cls.evaluationSystem);
    setEditCardBgColor(cls.cardBgColor || 'default');
    setEditShowName(cls.showName ?? true);
    setEditShowEducationStage(cls.showEducationStage ?? true);
    setEditShowGrade(cls.showGrade ?? true);
    setEditShowSchoolName(cls.showSchoolName ?? true);
    setEditShowAcademicYear(cls.showAcademicYear ?? false);
    setEditShowStudentCount(cls.showStudentCount ?? false);
    setEditShowEvaluationSystem(cls.showEvaluationSystem ?? false);
  };

  // Submit edit form
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClassroom || !editSubject.trim()) return;

    onUpdateClassroom({
      ...editingClassroom,
      subject: editSubject.trim(),
      name: editName.trim(),
      educationStage: editEducationStage,
      grade: editGrade.trim(),
      schoolName: editSchoolName.trim(),
      academicYear: editAcademicYear.trim(),
      evaluationSystem: editEvaluationSystem,
      cardBgColor: editCardBgColor,
      showName: editShowName,
      showEducationStage: editShowEducationStage,
      showGrade: editShowGrade,
      showSchoolName: editShowSchoolName,
      showAcademicYear: editShowAcademicYear,
      showStudentCount: editShowStudentCount,
      showEvaluationSystem: editShowEvaluationSystem,
    });

    setEditingClassroom(null);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deletingClassroom) return;
    onDeleteClassroom(deletingClassroom.id);
    setDeletingClassroom(null);
  };

  // Extract unique schools & grades for filter tabs
  const schoolsSet = new Set<string>();
  let hasNoSchool = false;

  classrooms.forEach((c) => {
    if (c.schoolName && c.schoolName.trim()) {
      schoolsSet.add(c.schoolName.trim());
    } else {
      hasNoSchool = true;
    }
  });

  // Include primary school_name from Teacher Settings
  try {
    const savedPrimary = localStorage.getItem('school_name');
    if (savedPrimary && savedPrimary.trim()) {
      schoolsSet.add(savedPrimary.trim());
    }
  } catch (e) {
    console.error(e);
  }

  // Include custom schools from Settings
  try {
    const savedCustom = localStorage.getItem('amoozgar_custom_schools');
    if (savedCustom) {
      const parsed = JSON.parse(savedCustom);
      if (Array.isArray(parsed)) {
        parsed.forEach((s) => {
          if (s && typeof s === 'string' && s.trim()) schoolsSet.add(s.trim());
        });
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Include schools from details map in Settings
  try {
    const savedDetails = localStorage.getItem('amoozgar_schools_details');
    if (savedDetails) {
      const parsedMap = JSON.parse(savedDetails);
      if (parsedMap && typeof parsedMap === 'object') {
        Object.keys(parsedMap).forEach((s) => {
          if (s && typeof s === 'string' && s.trim()) schoolsSet.add(s.trim());
        });
      }
    }
  } catch (e) {
    console.error(e);
  }

  const registeredSchoolsList = Array.from(schoolsSet);
  if (hasNoSchool) {
    registeredSchoolsList.push('سایر');
  }

  const availableSchools = registeredSchoolsList;

  useEffect(() => {
    if (availableSchools.length > 0) {
      if (
        !selectedSchoolFilter ||
        selectedSchoolFilter === 'همه' ||
        selectedSchoolFilter === 'همه مدارس' ||
        !availableSchools.includes(selectedSchoolFilter)
      ) {
        setSelectedSchoolFilter(availableSchools[0]);
      }
    }
  }, [availableSchools, selectedSchoolFilter]);

  // Filter classrooms by selected school first to derive grades available for that school
  const classroomsForSchool = classrooms.filter((c) => {
    if (!selectedSchoolFilter) return true;
    if (selectedSchoolFilter === 'سایر') return !c.schoolName || !c.schoolName.trim();
    return c.schoolName === selectedSchoolFilter;
  });

  const gradesSet = new Set<string>();
  classroomsForSchool.forEach((c) => {
    if (c.grade && c.grade.trim()) gradesSet.add(c.grade.trim());
  });
  const availableGrades = Array.from(gradesSet);

  // Filter classrooms based on school, grade & search term
  const filteredClassrooms = classrooms.filter((c) => {
    const matchesSchool =
      !selectedSchoolFilter
        ? true
        : selectedSchoolFilter === 'سایر'
        ? !c.schoolName || !c.schoolName.trim()
        : c.schoolName === selectedSchoolFilter;

    const matchesGrade =
      !selectedGradeFilter ||
      selectedGradeFilter === 'همه' ||
      selectedGradeFilter === 'همه پایه‌ها' ||
      c.grade === selectedGradeFilter;

    const matchesSearch =
      !searchTerm.trim() ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.schoolName && c.schoolName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSchool && matchesGrade && matchesSearch;
  });

  const sortedAvailableSchools = React.useMemo(() => {
    if (!schoolsOrder || schoolsOrder.length === 0) return availableSchools;
    return [...availableSchools].sort((a, b) => {
      const idxA = schoolsOrder.indexOf(a);
      const idxB = schoolsOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }, [availableSchools, schoolsOrder]);

  const sortedAvailableGrades = React.useMemo(() => {
    if (!gradesOrder || gradesOrder.length === 0) return availableGrades;
    return [...availableGrades].sort((a, b) => {
      const idxA = gradesOrder.indexOf(a);
      const idxB = gradesOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }, [availableGrades, gradesOrder]);

  const sortedFilteredClassrooms = React.useMemo(() => {
    if (!classroomsOrder || classroomsOrder.length === 0) return filteredClassrooms;
    return [...filteredClassrooms].sort((a, b) => {
      const idxA = classroomsOrder.indexOf(a.id);
      const idxB = classroomsOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }, [filteredClassrooms, classroomsOrder]);

  const moveSchool = (index: number, direction: 'up' | 'down') => {
    const arr = [...sortedAvailableSchools];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    const temp = arr[index];
    arr[index] = arr[target];
    arr[target] = temp;
    setSchoolsOrder(arr);
    try {
      localStorage.setItem('amoozgar_schools_order', JSON.stringify(arr));
    } catch (e) {
      console.error(e);
    }
  };

  const moveGrade = (index: number, direction: 'up' | 'down') => {
    const arr = [...sortedAvailableGrades];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    const temp = arr[index];
    arr[index] = arr[target];
    arr[target] = temp;
    setGradesOrder(arr);
    try {
      localStorage.setItem('amoozgar_grades_order', JSON.stringify(arr));
    } catch (e) {
      console.error(e);
    }
  };

  const moveClassroom = (index: number, direction: 'up' | 'down') => {
    const arr = [...sortedFilteredClassrooms];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    const temp = arr[index];
    arr[index] = arr[target];
    arr[target] = temp;
    const ids = arr.map((c) => c.id);
    setClassroomsOrder(ids);
    try {
      localStorage.setItem('amoozgar_classrooms_order', JSON.stringify(ids));
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to get subject icon and pastel container color
  const getSubjectIcon = (subjectName: string) => {
    const s = subjectName.toLowerCase();

    if (s.includes('ریاضی')) {
      return {
        icon: <Ruler className="w-5 h-5 text-sky-600 dark:text-sky-400 rotate-45" />,
        bgColor: 'bg-sky-100 dark:bg-sky-950/80',
      };
    }
    if (s.includes('تربیت بدنی') || s.includes('ورزش')) {
      return {
        icon: <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
        bgColor: 'bg-indigo-100 dark:bg-indigo-950/80',
      };
    }
    if (s.includes('علوم') || s.includes('زیست') || s.includes('شیمی') || s.includes('فیزیک')) {
      return {
        icon: <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        bgColor: 'bg-emerald-100 dark:bg-emerald-950/80',
      };
    }
    if (s.includes('فارسی') || s.includes('ادبیات')) {
      return {
        icon: <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
        bgColor: 'bg-blue-100 dark:bg-blue-950/80',
      };
    }
    if (s.includes('قرآن') || s.includes('دینی')) {
      return {
        icon: <Scroll className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
        bgColor: 'bg-amber-100 dark:bg-amber-950/80',
      };
    }
    if (s.includes('مطالعات') || s.includes('اجتماعی') || s.includes('تاریخ') || s.includes('جغرافیا')) {
      return {
        icon: <Scroll className="w-5 h-5 text-amber-700 dark:text-amber-300" />,
        bgColor: 'bg-amber-100/90 dark:bg-amber-950/80',
      };
    }
    if (s.includes('نگارش') || s.includes('انشا')) {
      return {
        icon: <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
        bgColor: 'bg-purple-100 dark:bg-purple-950/80',
      };
    }
    if (s.includes('هدیه') || s.includes('پیام')) {
      return {
        icon: <Scroll className="w-5 h-5 text-yellow-700 dark:text-yellow-300" />,
        bgColor: 'bg-amber-100 dark:bg-amber-950/80',
      };
    }

    // Default icon
    return {
      icon: <Book className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      bgColor: 'bg-teal-100 dark:bg-teal-950/80',
    };
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header & Actions with School Filters on same row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-0.5 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white shrink-0">
              داشبورد
            </h1>

            {/* Mobile-only smaller Add Class Button right next to 'داشبورد' */}
            <button
              type="button"
              onClick={onOpenAddClassModal}
              title="افزودن درس / کلاس جدید"
              className="md:hidden w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white flex items-center justify-center shadow-xs hover:scale-105 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* School Filter Chips directly next to 'داشبورد' */}
          {sortedAvailableSchools.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {sortedAvailableSchools.map((school) => {
                const count = classrooms.filter((c) =>
                  school === 'سایر' ? !c.schoolName || !c.schoolName.trim() : c.schoolName === school
                ).length;

                const isSelected = selectedSchoolFilter === school;
                const isHoldingThis = holdingProgress?.type === 'school' && holdingProgress?.id === school;

                return (
                  <button
                    key={school}
                    type="button"
                    onMouseDown={(e) => handleMouseDown(e, 'school', school)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={(e) => handleTouchStart(e, 'school', school)}
                    onTouchEnd={handleMouseUp}
                    onTouchMove={handleTouchMove}
                    onTouchCancel={handleMouseUp}
                    onClick={() => {
                      if (preventClickRef.current) {
                        preventClickRef.current = false;
                        return;
                      }
                      setSelectedSchoolFilter(school);
                      const schoolClasses = classrooms.filter((c) =>
                        school === 'سایر'
                          ? !c.schoolName || !c.schoolName.trim()
                          : c.schoolName === school
                      );
                      if (schoolClasses.length > 0) {
                        const matchingClass =
                          selectedGradeFilter && selectedGradeFilter !== 'همه'
                            ? schoolClasses.find((c) => c.grade === selectedGradeFilter) || schoolClasses[0]
                            : schoolClasses[0];
                        if (matchingClass) {
                          onSelectClassroom(matchingClass, false);
                        }
                      }
                    }}
                    className={`relative overflow-hidden px-3 py-1 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-teal-500/20 text-teal-300 border-2 border-teal-400 shadow-xs'
                          : 'bg-indigo-600 text-white shadow-xs'
                        : isDarkMode
                        ? 'bg-[#143242] text-slate-300 border border-slate-700/80 hover:bg-[#184255] hover:border-teal-400 hover:text-teal-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isHoldingThis && (
                      <span
                        className="absolute bottom-0 right-0 top-0 bg-amber-500/40 transition-all duration-75"
                        style={{ width: `${holdingProgress.percent}%` }}
                      />
                    )}
                    <span className="relative z-10">{school} ({count})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 shrink-0 self-end md:self-auto">
          {/* Add New Subject Circular Button with + inside (Desktop view) */}
          <button
            type="button"
            onClick={onOpenAddClassModal}
            title="افزودن درس / کلاس جدید"
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Grade Filter Row (if any) - placed compactly right below header */}
      {sortedAvailableGrades.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pr-1 py-0.5">
          {sortedAvailableGrades.map((grade) => {
            const count = classroomsForSchool.filter((c) => c.grade === grade).length;
            const isSelected = selectedGradeFilter === grade;
            const isHoldingThis = holdingProgress?.type === 'grade' && holdingProgress?.id === grade;

            return (
              <button
                key={grade}
                type="button"
                onMouseDown={(e) => handleMouseDown(e, 'grade', grade)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={(e) => handleTouchStart(e, 'grade', grade)}
                onTouchEnd={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchCancel={handleMouseUp}
                onClick={() => {
                  if (preventClickRef.current) {
                    preventClickRef.current = false;
                    return;
                  }
                  const newGrade = selectedGradeFilter === grade ? 'همه' : grade;
                  setSelectedGradeFilter(newGrade);
                  if (newGrade && newGrade !== 'همه') {
                    const matchingClass =
                      classroomsForSchool.find((c) => c.grade === newGrade) ||
                      classrooms.find((c) => c.grade === newGrade);
                    if (matchingClass) {
                      onSelectClassroom(matchingClass, false);
                    }
                  }
                }}
                className={`relative overflow-hidden px-3 py-1 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-teal-500/20 text-teal-300 border-2 border-teal-400 shadow-xs'
                      : 'bg-indigo-600 text-white shadow-xs'
                    : isDarkMode
                    ? 'bg-[#143242] text-slate-300 border border-slate-700/80 hover:bg-[#184255] hover:border-teal-400 hover:text-teal-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {isHoldingThis && (
                  <span
                    className="absolute bottom-0 right-0 top-0 bg-amber-500/40 transition-all duration-75"
                    style={{ width: `${holdingProgress.percent}%` }}
                  />
                )}
                <span className="relative z-10">{grade} ({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Subject Cards */}
      {sortedFilteredClassrooms.length > 0 ? (() => {
        const getCardDetailsCount = (cls: Classroom) => {
          let count = 0;
          if ((cls.showSchoolName ?? true) && cls.schoolName) count++;
          const hasSubText = ((cls.showGrade ?? true) && cls.grade) || ((cls.showName ?? true) && cls.name) || (cls.showAcademicYear && cls.academicYear);
          if (hasSubText) count++;
          if (cls.showStudentCount || cls.showEvaluationSystem) count++;
          return count;
        };

        const maxDetails = Math.max(...sortedFilteredClassrooms.map(getCardDetailsCount), 0);

        const gridClasses = maxDetails === 0
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5"
          : maxDetails === 1
          ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
          : "grid grid-cols-1 md:grid-cols-2 gap-4";

        return (
          <div className={gridClasses}>
            {sortedFilteredClassrooms.map((cls) => {
              const classStudentCount = students.filter((s) => isStudentInClassroom(s, cls)).length;
              const detailsCount = getCardDetailsCount(cls);

              let cardPaddingClass = 'p-4 sm:p-5 rounded-3xl gap-3';
              let titleSizeClass = 'text-base sm:text-lg';
              let actionBtnClass = 'p-1.5 rounded-xl';
              let actionIconClass = 'w-3.5 h-3.5';
              let chevronClass = 'w-5 h-5';

              if (detailsCount === 0) {
                cardPaddingClass = 'py-2.5 px-3 rounded-2xl gap-1.5';
                titleSizeClass = 'text-xs sm:text-sm';
                actionBtnClass = 'p-1 rounded-lg';
                actionIconClass = 'w-3 h-3';
                chevronClass = 'w-3.5 h-3.5';
              } else if (detailsCount === 1) {
                cardPaddingClass = 'p-3 sm:p-3.5 rounded-2xl gap-2';
                titleSizeClass = 'text-sm sm:text-base';
                actionBtnClass = 'p-1 rounded-lg';
                actionIconClass = 'w-3.5 h-3.5';
                chevronClass = 'w-4 h-4';
              }

              const customClasses = getCardColorClasses(cls.cardBgColor, isDarkMode);
              const customStyle = getCardColorStyle(cls.cardBgColor, isDarkMode);
              const isHoldingCard = holdingProgress?.type === 'subject' && holdingProgress?.id === cls.id;

              return (
                <div
                  key={cls.id}
                  onMouseDown={(e) => handleMouseDown(e, 'subject', cls.id)}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={(e) => handleTouchStart(e, 'subject', cls.id)}
                  onTouchEnd={handleMouseUp}
                  onTouchMove={handleTouchMove}
                  onTouchCancel={handleMouseUp}
                  onClick={() => {
                    if (preventClickRef.current) {
                      preventClickRef.current = false;
                      return;
                    }
                    onSelectClassroom(cls);
                  }}
                  style={customStyle}
                  className={`group relative overflow-hidden border transition-all cursor-pointer shadow-2xs hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-between ${cardPaddingClass} ${
                    customClasses || (
                      isDarkMode
                        ? 'bg-[#143242] border-slate-700/80 hover:bg-[#184255] hover:border-teal-400 hover:shadow-teal-500/15 text-white'
                        : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                    )
                  }`}
                >
                  {isHoldingCard && (
                    <div className="absolute inset-0 bg-amber-500/20 dark:bg-amber-400/20 z-20 pointer-events-none flex items-end">
                      <div
                        className="bg-amber-500 dark:bg-amber-400 h-1.5 transition-all duration-75"
                        style={{ width: `${holdingProgress.percent}%` }}
                      />
                    </div>
                  )}
                  {/* Subject Title & Details */}
                  <div className="flex-1 space-y-0.5 text-right min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className={`${titleSizeClass} font-black truncate text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-teal-300 transition-colors`}>
                        {cls.subject}
                      </h3>
                    </div>

                    {(cls.showSchoolName ?? true) && cls.schoolName && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-teal-300 truncate">
                        <School className="w-3 h-3 shrink-0" />
                        <span className="truncate">{cls.schoolName}</span>
                      </div>
                    )}

                    {((cls.showEducationStage ?? true) || (cls.showGrade ?? true) || (cls.showName ?? true) || cls.showAcademicYear) && (
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                        {[
                          (cls.showEducationStage ?? true) ? cls.educationStage : null,
                          (cls.showGrade ?? true) ? cls.grade : null,
                          (cls.showName ?? true) ? cls.name : null,
                          cls.showAcademicYear ? cls.academicYear : null,
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                    )}

                    {(cls.showStudentCount || cls.showEvaluationSystem) && (
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {cls.showStudentCount && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            <Users className="w-3 h-3 text-indigo-500 dark:text-teal-400" />
                            <span>{classStudentCount} دانش‌آموز</span>
                          </span>
                        )}

                        {cls.showEvaluationSystem && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {cls.evaluationSystem === 'numeric' ? 'عددی' : 'توصیفی'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons & Arrow */}
                  {detailsCount === 0 ? (
                    <div className="flex items-center gap-1 shrink-0 z-30">
                      <button
                        type="button"
                        title="ویرایش درس"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(cls);
                        }}
                        className={`${actionBtnClass} bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 hover:text-indigo-600 dark:hover:text-teal-300 transition-colors cursor-pointer`}
                      >
                        <Edit2 className={actionIconClass} />
                      </button>
                      <button
                        type="button"
                        title="حذف درس"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingClassroom(cls);
                        }}
                        className={`${actionBtnClass} bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-950/80 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer`}
                      >
                        <Trash2 className={actionIconClass} />
                      </button>
                      <div className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-teal-300 transition-colors mr-0.5">
                        <ChevronLeft className={chevronClass} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2 z-30">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="ویرایش درس"
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(cls);
                          }}
                          className={`${actionBtnClass} bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 hover:text-indigo-600 dark:hover:text-teal-300 transition-colors cursor-pointer`}
                        >
                          <Edit2 className={actionIconClass} />
                        </button>
                        <button
                          type="button"
                          title="حذف درس"
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingClassroom(cls);
                          }}
                          className={`${actionBtnClass} bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-950/80 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer`}
                        >
                          <Trash2 className={actionIconClass} />
                        </button>
                      </div>

                      <div className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-teal-300 transition-colors">
                        <ChevronLeft className={chevronClass} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })() : (
        <div className="p-12 text-center text-slate-400 space-y-3 border rounded-3xl border-dashed border-slate-300 dark:border-slate-800">
          <Book className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">هیچ درسی یافت نشد</h3>
          <p className="text-xs">
            {searchTerm ? 'هیچ درسی متناسب با عبارت جستجو پیدا نشد.' : 'هنوز درسی برای این پایه ثبت نشده است.'}
          </p>
          <button
            type="button"
            onClick={onOpenAddClassModal}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs inline-flex items-center gap-2 cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>ایجاد درس جدید</span>
          </button>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingClassroom && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B3E50] dark:text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600 dark:text-teal-400" />
                <span>ویرایش اطلاعات درس / کلاس</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingClassroom(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              {/* Subject Name - Mandatory on card */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold">نام درس *</label>
                  <span className="text-[10px] text-slate-400 font-normal">نمایش همیشگی روی کارت</span>
                </div>
                <input
                  type="text"
                  required
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="مثلا: ریاضی"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400"
                />
              </div>

              {/* School Name - Eye toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold">نام مدرسه</label>
                  <button
                    type="button"
                    onClick={() => setEditShowSchoolName(!editShowSchoolName)}
                    title={editShowSchoolName ? 'نمایش نام مدرسه روی کارت' : 'عدم نمایش نام مدرسه روی کارت'}
                    className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                      editShowSchoolName
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-300 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
                    }`}
                  >
                    {editShowSchoolName ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{editShowSchoolName ? 'نمایش در کارت' : 'عدم نمایش'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={editSchoolName}
                  onChange={(e) => setEditSchoolName(e.target.value)}
                  placeholder="مثلا: دبستان شهید شهیدرفیعی یا دبیرستان امیرکبیر"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400"
                />
              </div>

              {/* Education Stage / Track - Eye toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold">مقطع و شاخه تحصیلی *</label>
                  <button
                    type="button"
                    onClick={() => setEditShowEducationStage(!editShowEducationStage)}
                    title={editShowEducationStage ? 'نمایش مقطع تحصیلی روی کارت' : 'عدم نمایش مقطع روی کارت'}
                    className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                      editShowEducationStage
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-300 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
                    }`}
                  >
                    {editShowEducationStage ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{editShowEducationStage ? 'نمایش در کارت' : 'عدم نمایش'}</span>
                  </button>
                </div>
                <select
                  required
                  value={editEducationStage}
                  onChange={(e) => {
                    const newStage = e.target.value;
                    setEditEducationStage(newStage);
                    const available = STAGE_GRADES_MAP[newStage] || GRADE_OPTIONS;
                    if (available && available.length > 0) {
                      setEditGrade(available[0]);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400 cursor-pointer"
                >
                  {EDUCATION_STAGES.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Name - Eye toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold">نام کلاس (اختیاری)</label>
                  <button
                    type="button"
                    onClick={() => setEditShowName(!editShowName)}
                    title={editShowName ? 'نمایش نام کلاس روی کارت' : 'عدم نمایش نام کلاس روی کارت'}
                    className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                      editShowName
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-300 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
                    }`}
                  >
                    {editShowName ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{editShowName ? 'نمایش در کارت' : 'عدم نمایش'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="مثلا: کلاس ۳A (اختیاری)"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Grade - Eye toggle */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold">پایه تحصیلی *</label>
                    <button
                      type="button"
                      onClick={() => setEditShowGrade(!editShowGrade)}
                      title={editShowGrade ? 'نمایش پایه تحصیلی روی کارت' : 'عدم نمایش پایه روی کارت'}
                      className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                        editShowGrade
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-300 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
                      }`}
                    >
                      {editShowGrade ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <select
                    required
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400 cursor-pointer"
                  >
                    {(() => {
                      const options = STAGE_GRADES_MAP[editEducationStage] || GRADE_OPTIONS;
                      return (
                        <>
                          {!options.includes(editGrade) && editGrade && (
                            <option value={editGrade}>{editGrade}</option>
                          )}
                          {options.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </>
                      );
                    })()}
                  </select>
                </div>

                {/* Academic Year - Eye toggle */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold">سال تحصیلی</label>
                    <button
                      type="button"
                      onClick={() => setEditShowAcademicYear(!editShowAcademicYear)}
                      title={editShowAcademicYear ? 'نمایش سال تحصیلی روی کارت' : 'عدم نمایش سال تحصیلی روی کارت'}
                      className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                        editShowAcademicYear
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-300 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
                      }`}
                    >
                      {editShowAcademicYear ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editAcademicYear}
                    onChange={(e) => setEditAcademicYear(e.target.value)}
                    placeholder="۱۴۰۳-۱۴۰۴"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400"
                  />
                </div>
              </div>

              {/* Evaluation System - Eye toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold">سیستم ارزشیابی *</label>
                  <button
                    type="button"
                    onClick={() => setEditShowEvaluationSystem(!editShowEvaluationSystem)}
                    title={editShowEvaluationSystem ? 'نمایش سیستم ارزشیابی روی کارت' : 'عدم نمایش روی کارت'}
                    className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                      editShowEvaluationSystem
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-300 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
                    }`}
                  >
                    {editShowEvaluationSystem ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{editShowEvaluationSystem ? 'نمایش در کارت' : 'عدم نمایش'}</span>
                  </button>
                </div>
                <select
                  value={editEvaluationSystem}
                  onChange={(e) => setEditEvaluationSystem(e.target.value as EvaluationSystem)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400"
                >
                  <option value="numeric">عددی (نمره‌دهی ۰ الی ۲۰)</option>
                  <option value="descriptive">توصیفی (خیلی خوب، خوب، قابل قبول...)</option>
                </select>
              </div>

              {/* Color Selector for Classroom Card */}
              <ColorPickerSelector
                selectedColor={editCardBgColor}
                onChangeColor={(col) => setEditCardBgColor(col)}
                label="رنگ پس‌زمینه کارت درس:"
                isDarkMode={isDarkMode}
              />

              {/* Student Count - Eye toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>تعداد / آمار دانش‌آموزان</span>
                </span>
                <button
                  type="button"
                  onClick={() => setEditShowStudentCount(!editShowStudentCount)}
                  title={editShowStudentCount ? 'نمایش تعداد دانش‌آموزان روی کارت' : 'عدم نمایش روی کارت'}
                  className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                    editShowStudentCount
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-300 font-bold'
                      : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
                  }`}
                >
                  {editShowStudentCount ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{editShowStudentCount ? 'نمایش در کارت' : 'عدم نمایش'}</span>
                </button>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingClassroom(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold shadow-xs cursor-pointer"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingClassroom && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B3E50] dark:text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-slate-800 dark:text-white text-base">
                حذف کارت درس {deletingClassroom.subject}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                آیا از حذف کارت درس <strong className="text-slate-800 dark:text-white">{deletingClassroom.subject} ({deletingClassroom.grade}{deletingClassroom.name ? ` - ${deletingClassroom.name}` : ''})</strong> اطمینان دارید؟
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingClassroom(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                حذف نهایی درس
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Modal for Schools, Grades, or Subject Cards */}
      {reorderModalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B3E50] dark:text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-700 animate-scale-in">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-teal-400 font-black text-base">
                <ArrowUpDown className="w-5 h-5" />
                <span>
                  {reorderModalType === 'school' && 'تغییر ترتیب قرارگیری مدارس'}
                  {reorderModalType === 'grade' && 'تغییر ترتیب قرارگیری پایه‌ها'}
                  {reorderModalType === 'subject' && 'تغییر ترتیب قرارگیری کارت‌های دروس'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReorderModalType(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-semibold">
              با استفاده از دکمه‌های بالا و پایین، می‌توانید موقعیت و ترتیب نمایش موارد را تغییر دهید:
            </p>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {reorderModalType === 'school' &&
                sortedAvailableSchools.map((school, idx) => (
                  <div
                    key={school}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-teal-950/80 text-indigo-600 dark:text-teal-400 text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {school}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSchool(idx, 'up')}
                        className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="انتقال به بالاتر"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedAvailableSchools.length - 1}
                        onClick={() => moveSchool(idx, 'down')}
                        className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="انتقال به پایین‌تر"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

              {reorderModalType === 'grade' &&
                sortedAvailableGrades.map((grade, idx) => (
                  <div
                    key={grade}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-teal-950/80 text-indigo-600 dark:text-teal-400 text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {grade}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveGrade(idx, 'up')}
                        className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="انتقال به بالاتر"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedAvailableGrades.length - 1}
                        onClick={() => moveGrade(idx, 'down')}
                        className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="انتقال به پایین‌تر"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

              {reorderModalType === 'subject' &&
                sortedFilteredClassrooms.map((cls, idx) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-teal-950/80 text-indigo-600 dark:text-teal-400 text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {cls.subject} {cls.name ? `(${cls.name})` : ''}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {cls.grade} {cls.schoolName ? `• ${cls.schoolName}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveClassroom(idx, 'up')}
                        className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="انتقال به بالاتر"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedFilteredClassrooms.length - 1}
                        onClick={() => moveClassroom(idx, 'down')}
                        className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="انتقال به پایین‌تر"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (reorderModalType === 'school') {
                    setSchoolsOrder([]);
                    localStorage.removeItem('amoozgar_schools_order');
                  } else if (reorderModalType === 'grade') {
                    setGradesOrder([]);
                    localStorage.removeItem('amoozgar_grades_order');
                  } else if (reorderModalType === 'subject') {
                    setClassroomsOrder([]);
                    localStorage.removeItem('amoozgar_classrooms_order');
                  }
                }}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                بازنشانی به ترتیب پیش‌فرض
              </button>

              <button
                type="button"
                onClick={() => setReorderModalType(null)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                تایید و ذخیره ترتیب
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

