import React, { useState, useEffect } from 'react';
import { Classroom, Student, EvaluationSystem } from '../types';
import { isStudentInClassroom } from '../utils/studentUtils';
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
} from 'lucide-react';

interface SubjectCardsViewProps {
  classrooms: Classroom[];
  students: Student[];
  onSelectClassroom: (classroom: Classroom) => void;
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

  // Modals for edit & delete
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [deletingClassroom, setDeletingClassroom] = useState<Classroom | null>(null);

  // Edit form state
  const [editSubject, setEditSubject] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editGrade, setEditGrade] = useState<string>('');
  const [editSchoolName, setEditSchoolName] = useState<string>('');
  const [editAcademicYear, setEditAcademicYear] = useState<string>('');
  const [editEvaluationSystem, setEditEvaluationSystem] = useState<EvaluationSystem>('numeric');

  // Open edit modal
  const handleStartEdit = (cls: Classroom) => {
    setEditingClassroom(cls);
    setEditSubject(cls.subject);
    setEditName(cls.name);
    setEditGrade(cls.grade);
    setEditSchoolName(cls.schoolName || '');
    setEditAcademicYear(cls.academicYear);
    setEditEvaluationSystem(cls.evaluationSystem);
  };

  // Submit edit form
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClassroom || !editSubject.trim() || !editName.trim()) return;

    onUpdateClassroom({
      ...editingClassroom,
      subject: editSubject.trim(),
      name: editName.trim(),
      grade: editGrade.trim(),
      schoolName: editSchoolName.trim(),
      academicYear: editAcademicYear.trim(),
      evaluationSystem: editEvaluationSystem,
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
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white shrink-0">
            داشبورد
          </h1>

          {/* School Filter Chips directly next to 'داشبورد' */}
          {availableSchools.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {availableSchools.map((school) => {
                const count = classrooms.filter((c) =>
                  school === 'سایر' ? !c.schoolName || !c.schoolName.trim() : c.schoolName === school
                ).length;

                const isSelected = selectedSchoolFilter === school;

                return (
                  <button
                    key={school}
                    type="button"
                    onClick={() => {
                      setSelectedSchoolFilter(school);
                    }}
                    className={`px-3 py-1 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-teal-500/20 text-teal-300 border-2 border-teal-400 shadow-xs'
                          : 'bg-indigo-600 text-white shadow-xs'
                        : isDarkMode
                        ? 'bg-[#143242] text-slate-300 border border-slate-700/80 hover:bg-[#184255] hover:border-teal-400 hover:text-teal-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {school} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {/* Add New Subject Circular Button with + inside */}
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
      {availableGrades.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pr-1">
          {availableGrades.map((grade) => {
            const count = classroomsForSchool.filter((c) => c.grade === grade).length;
            const isSelected = selectedGradeFilter === grade;

            return (
              <button
                key={grade}
                type="button"
                onClick={() => {
                  setSelectedGradeFilter(grade);
                }}
                className={`px-3 py-1 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-teal-500/20 text-teal-300 border-2 border-teal-400 shadow-xs'
                      : 'bg-indigo-600 text-white shadow-xs'
                    : isDarkMode
                    ? 'bg-[#143242] text-slate-300 border border-slate-700/80 hover:bg-[#184255] hover:border-teal-400 hover:text-teal-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {grade} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Subject Cards */}
      {filteredClassrooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClassrooms.map((cls) => {
            const classStudentCount = students.filter((s) => isStudentInClassroom(s, cls)).length;
            const { icon, bgColor } = getSubjectIcon(cls.subject);

            return (
              <div
                key={cls.id}
                onClick={() => onSelectClassroom(cls)}
                className={`group relative rounded-3xl p-4 sm:p-5 border transition-all cursor-pointer shadow-2xs hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-between gap-3 ${
                  isDarkMode
                    ? 'bg-[#143242] border-slate-700/80 hover:bg-[#184255] hover:border-teal-400 hover:shadow-teal-500/15 text-white'
                    : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                }`}
              >
                {/* Subject Title & Details */}
                <div className="flex-1 space-y-1 text-right min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-base sm:text-lg font-black truncate text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-teal-300 transition-colors">
                      {cls.subject}
                    </h3>
                  </div>

                  {cls.schoolName && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-teal-300 truncate">
                      <School className="w-3 h-3 shrink-0" />
                      <span className="truncate">{cls.schoolName}</span>
                    </div>
                  )}

                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                    {cls.grade} • {cls.name}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{classStudentCount} دانش‌آموز</span>
                    </span>

                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {cls.evaluationSystem === 'numeric' ? 'عددی' : 'توصیفی'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons & Arrow */}
                <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2">
                  {/* Edit and Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="ویرایش درس"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(cls);
                      }}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 hover:text-indigo-600 dark:hover:text-teal-300 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="حذف درس"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingClassroom(cls);
                      }}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-950/80 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-teal-300 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}


        </div>
      ) : (
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
          <div className="bg-white dark:bg-[#102A36] dark:text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-700">
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
              <div className="space-y-1">
                <label className="font-bold">نام درس *</label>
                <input
                  type="text"
                  required
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="مثلا: ریاضی"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">نام مدرسه</label>
                <input
                  type="text"
                  value={editSchoolName}
                  onChange={(e) => setEditSchoolName(e.target.value)}
                  placeholder="مثلا: دبستان شهید شهیدرفیعی یا دبیرستان امیرکبیر"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">نام کلاس *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="مثلا: کلاس ۳A"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">پایه تحصیلی *</label>
                  <input
                    type="text"
                    required
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    placeholder="مثلا: پایه سوم"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold">سال تحصیلی</label>
                  <input
                    type="text"
                    value={editAcademicYear}
                    onChange={(e) => setEditAcademicYear(e.target.value)}
                    placeholder="۱۴۰۳-۱۴۰۴"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold">سیستم ارزشیابی *</label>
                <select
                  value={editEvaluationSystem}
                  onChange={(e) => setEditEvaluationSystem(e.target.value as EvaluationSystem)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400"
                >
                  <option value="numeric">عددی (نمره‌دهی ۰ الی ۲۰)</option>
                  <option value="descriptive">توصیفی (خیلی خوب، خوب، قابل قبول...)</option>
                </select>
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
          <div className="bg-white dark:bg-[#102A36] dark:text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-slate-800 dark:text-white text-base">
                حذف کارت درس {deletingClassroom.subject}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                آیا از حذف کارت درس <strong className="text-slate-800 dark:text-white">{deletingClassroom.subject} ({deletingClassroom.grade} - {deletingClassroom.name})</strong> اطمینان دارید؟
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

    </div>
  );
};

