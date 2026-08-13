import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Classroom, Student, ScoreRecord, AttendanceRecord, BehavioralPoint, GRADE_OPTIONS, EDUCATION_STAGES, STAGE_GRADES_MAP } from '../types';
import { isStudentInClassroom, sortStudentsByLastName, matchGradeToStage } from '../utils/studentUtils';
import { Users, Search, Plus, Phone, FileText, Trash2, X } from 'lucide-react';
import { StudentProfileModal } from './StudentProfileModal';

interface StudentManagementProps {
  classroom: Classroom;
  students: Student[];
  scores: ScoreRecord[];
  attendance: AttendanceRecord[];
  behavioralPoints: BehavioralPoint[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onAddScore: (score: ScoreRecord) => void;
  onDeleteScore: (scoreId: string) => void;
  onAddAttendance: (record: AttendanceRecord) => void;
  onAddBehaviorPoint: (point: BehavioralPoint) => void;
  onSelectStudentProfile?: (student: Student) => void;
  onSelectClassroom?: (classroom: Classroom) => void;
  isDarkMode?: boolean;
  classrooms?: Classroom[];
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  classroom,
  students,
  scores,
  attendance,
  behavioralPoints,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddScore,
  onDeleteScore,
  onAddAttendance,
  onAddBehaviorPoint,
  onSelectStudentProfile,
  onSelectClassroom,
  isDarkMode = false,
  classrooms = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleOpenSearch = () => {
    setIsSearchExpanded(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleCloseSearch = () => {
    setSearchTerm('');
    setIsSearchExpanded(false);
  };
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for new student
  const [fullName, setFullName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [schoolName, setSchoolName] = useState(classroom.schoolName || '');
  const [educationStage, setEducationStage] = useState(classroom.educationStage || 'متوسطه دوم - نظری تجربی');
  const [grade, setGrade] = useState(classroom.grade || 'پایه دهم');
  const [isCustomSchool, setIsCustomSchool] = useState(false);
  const [isCustomGrade, setIsCustomGrade] = useState(false);

  // Compute registered schools dropdown list
  const registeredSchools = useMemo(() => {
    const list = new Set<string>();

    if (classrooms && Array.isArray(classrooms)) {
      classrooms.forEach((c) => {
        if (c.schoolName && typeof c.schoolName === 'string' && c.schoolName.trim()) {
          list.add(c.schoolName.trim());
        }
      });
    }

    if (classroom?.schoolName && typeof classroom.schoolName === 'string' && classroom.schoolName.trim()) {
      list.add(classroom.schoolName.trim());
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
  }, [classrooms, classroom]);

  // School and Grade Dashboard-style filter states
  const filterAvailableSchools = useMemo(() => {
    const schoolsSet = new Set<string>();
    let hasNoSchool = false;

    classrooms.forEach((c) => {
      if (c.schoolName && c.schoolName.trim()) {
        schoolsSet.add(c.schoolName.trim());
      } else {
        hasNoSchool = true;
      }
    });

    try {
      const savedPrimary = localStorage.getItem('school_name');
      if (savedPrimary && savedPrimary.trim()) {
        schoolsSet.add(savedPrimary.trim());
      }
    } catch (e) {
      console.error(e);
    }

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

    const registeredList = Array.from(schoolsSet);
    if (hasNoSchool) {
      registeredList.push('سایر');
    }
    return registeredList;
  }, [classrooms, students]);

  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('amoozgar_selectedSchoolFilter');
      return saved && saved !== 'همه مدارس' ? saved : '';
    } catch {
      return '';
    }
  });

  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('');

  useEffect(() => {
    if (filterAvailableSchools.length > 0) {
      if (
        !selectedSchoolFilter ||
        !filterAvailableSchools.includes(selectedSchoolFilter)
      ) {
        setSelectedSchoolFilter(filterAvailableSchools[0]);
      }
    }
  }, [filterAvailableSchools, selectedSchoolFilter]);

  useEffect(() => {
    try {
      if (selectedSchoolFilter) {
        localStorage.setItem('amoozgar_selectedSchoolFilter', selectedSchoolFilter);
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedSchoolFilter]);

  // Helper function to check if a student belongs to a given school filter
  const isStudentInSchool = (s: Student, schoolFilter: string): boolean => {
    if (!schoolFilter || schoolFilter === 'همه مدارس') return true;

    const studentSchools = new Set<string>();
    if (s.schoolName && s.schoolName.trim()) {
      studentSchools.add(s.schoolName.trim());
    }
    classrooms.forEach((c) => {
      if (c.schoolName && c.schoolName.trim() && isStudentInClassroom(s, c)) {
        studentSchools.add(c.schoolName.trim());
      }
    });

    if (schoolFilter === 'سایر') {
      return studentSchools.size === 0;
    }

    return studentSchools.has(schoolFilter.trim());
  };

  // Helper function to check if a student belongs to a given grade filter
  const isStudentInGrade = (s: Student, gradeFilter: string): boolean => {
    if (!gradeFilter) return true;
    if (s.grade && s.grade.trim() === gradeFilter.trim()) return true;
    return classrooms.some(
      (c) => c.grade && c.grade.trim() === gradeFilter.trim() && isStudentInClassroom(s, c)
    );
  };

  const classroomsForSchool = useMemo(() => {
    return classrooms.filter((c) => {
      if (!selectedSchoolFilter || selectedSchoolFilter === 'همه مدارس') return true;
      if (selectedSchoolFilter === 'سایر') return !c.schoolName || !c.schoolName.trim();
      return c.schoolName && c.schoolName.trim() === selectedSchoolFilter.trim();
    });
  }, [classrooms, selectedSchoolFilter]);

  const filterAvailableGrades = useMemo(() => {
    const gradesSet = new Set<string>();
    classroomsForSchool.forEach((c) => {
      if (c.grade && c.grade.trim()) gradesSet.add(c.grade.trim());
    });
    return Array.from(gradesSet);
  }, [classroomsForSchool]);

  // Compute registered grades dropdown list
  const availableGrades = useMemo(() => {
    const baseGrades = STAGE_GRADES_MAP[educationStage] || GRADE_OPTIONS;
    const list = new Set<string>(baseGrades);

    if (classroom?.grade && typeof classroom.grade === 'string' && classroom.grade.trim()) {
      const matched = matchGradeToStage(classroom.grade, educationStage);
      list.add(matched);
    }

    return Array.from(list);
  }, [classroom, educationStage]);

  // Initialize form when opening modal
  useEffect(() => {
    if (showAddModal) {
      const defaultSchool = classroom.schoolName || (registeredSchools.length > 0 ? registeredSchools[0] : '');
      setSchoolName(defaultSchool);
      setIsCustomSchool(false);

      const defaultStage = classroom.educationStage || 'متوسطه دوم - نظری تجربی';
      setEducationStage(defaultStage);

      const defaultGrade = matchGradeToStage(classroom.grade, defaultStage);
      setGrade(defaultGrade);
      setIsCustomGrade(false);
    }
  }, [showAddModal, classroom, registeredSchools]);

  const classStudents = useMemo(() => {
    const list = students.filter((s) => {
      if (!isStudentInSchool(s, selectedSchoolFilter)) return false;
      if (!isStudentInGrade(s, selectedGradeFilter)) return false;
      return true;
    });
    return sortStudentsByLastName(list);
  }, [students, classrooms, selectedSchoolFilter, selectedGradeFilter]);

  const filteredStudents = classStudents.filter(
    (s) =>
      s.fullName.includes(searchTerm) ||
      s.studentCode.includes(searchTerm) ||
      (s.fatherName && s.fatherName.includes(searchTerm))
  );

  const handleSubmitNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !studentCode.trim()) return;

    onAddStudent({
      classId: classroom.id,
      fullName: fullName.trim(),
      studentCode: studentCode.trim(),
      fatherName: fatherName.trim() || undefined,
      parentPhone: parentPhone.trim() || undefined,
      notes: notes.trim() || undefined,
      schoolName: schoolName.trim() || classroom.schoolName || undefined,
      educationStage: educationStage.trim() || classroom.educationStage || undefined,
      grade: grade.trim() || classroom.grade || undefined,
      className: classroom.name,
    });

    setFullName('');
    setStudentCode('');
    setFatherName('');
    setParentPhone('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-3.5">
      
      {/* Top Action Bar */}
      <div className={`rounded-2xl border p-3.5 shadow-2xs space-y-3 ${
        isDarkMode ? 'bg-[#143242] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5 min-w-0">
            {/* School Filter Chips */}
            {filterAvailableSchools.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {filterAvailableSchools.map((school) => {
                  const count = students.filter((s) => isStudentInSchool(s, school)).length;

                  const isSelected = selectedSchoolFilter === school;

                  return (
                    <button
                      key={school}
                      type="button"
                      onClick={() => {
                        setSelectedSchoolFilter(school);
                        setSelectedGradeFilter('');
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
            {/* Collapsible Search Bar */}
            {isSearchExpanded || searchTerm ? (
              <div className="relative flex items-center transition-all duration-300 w-48 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onBlur={() => {
                    if (!searchTerm.trim()) {
                      setIsSearchExpanded(false);
                    }
                  }}
                  placeholder="جستجو نام یا کد..."
                  className={`w-full pr-9 pl-8 py-2 text-xs font-medium rounded-xl border focus:outline-hidden transition-all ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-400' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleCloseSearch}
                  className="absolute left-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
                  title="بستن جستجو"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenSearch}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:border-teal-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300'
                }`}
                title="جستجوی دانش‌آموز"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 rounded-xl shadow-xs transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
              title="افزودن دانش‌آموز"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grade Filter Row */}
        {filterAvailableGrades.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pr-1 border-t pt-3 border-slate-200 dark:border-slate-700/80">
            {filterAvailableGrades.map((grade) => {
              const count = classroomsForSchool.filter((c) => c.grade === grade).length;
              const isSelected = selectedGradeFilter === grade;

              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => {
                    const newGrade = isSelected ? '' : grade;
                    setSelectedGradeFilter(newGrade);
                    if (newGrade && onSelectClassroom) {
                      const matchingClass =
                        classroomsForSchool.find((c) => c.grade === newGrade) ||
                        classrooms.find((c) => c.grade === newGrade);
                      if (matchingClass) {
                        onSelectClassroom(matchingClass);
                      }
                    }
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
      </div>

      {/* Roster Cards - Vertical Stack */}
      {filteredStudents.length > 0 ? (
        <div className="space-y-2.5">
          {filteredStudents.map((student, index) => {
            return (
              <div 
                key={student.id} 
                className={`rounded-2xl border p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 ${
                  isDarkMode ? 'bg-[#1B3E50] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {/* Header: Rank + Student Name */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectStudentProfile) {
                            onSelectStudentProfile(student);
                          } else {
                            setSelectedStudent(student);
                          }
                        }}
                        className="font-bold text-slate-800 dark:text-slate-100 text-sm hover:text-indigo-600 dark:hover:text-teal-300 transition-colors cursor-pointer text-right truncate block w-full"
                      >
                        {student.fullName}
                      </button>
                      <span className="text-[11px] text-slate-400 dark:text-slate-400 block truncate">
                        کد: {student.studentCode}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        if (onSelectStudentProfile) {
                          onSelectStudentProfile(student);
                        } else {
                          setSelectedStudent(student);
                        }
                      }}
                      className="p-1.5 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="مشاهده پروفایل و پرونده کامل"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteStudent(student.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
                      title="حذف دانش‌آموز"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 block">نام پدر:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block">
                      {student.fatherName || '---'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">شماره ولی:</span>
                    {student.parentPhone ? (
                      <a 
                        href={`tel:${student.parentPhone}`} 
                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-teal-300 font-semibold hover:underline truncate"
                      >
                        <Phone className="w-3 h-3 shrink-0" />
                        <span className="dir-ltr">{student.parentPhone}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">---</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className={`rounded-2xl border p-12 text-center text-slate-400 space-y-2 ${
          isDarkMode ? 'bg-[#143242] border-slate-700/80' : 'bg-white border-slate-200'
        }`}>
          <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-500" />
          <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">دانش‌آموزی یافت نشد</p>
          <p className="text-xs text-slate-400">با زدن دکمه افزودن دانش‌آموز یا از طریق بخش کدهای اندروید لیست را وارد کنید.</p>
        </div>
      )}

      {/* Modal: Add New Student */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4 ${
            isDarkMode ? 'bg-[#1B3E50] text-white border border-slate-700' : 'bg-white text-slate-800 border border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600 dark:text-teal-400" />
                <span>افزودن دانش‌آموز جدید</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewStudent} className="space-y-3.5 text-xs font-medium">
              <div className="space-y-1">
                <label className="font-bold block">نام و نام خانوادگی *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثلا: علی رضایی"
                  className={`w-full rounded-xl px-3 py-2 border focus:outline-hidden ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold block">کد دانش‌آموزی / کدملی *</label>
                  <input
                    type="text"
                    required
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="0012345678"
                    className={`w-full rounded-xl px-3 py-2 border focus:outline-hidden ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold block">نام پدر</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="محمد"
                    className={`w-full rounded-xl px-3 py-2 border focus:outline-hidden ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              {/* School Name and Grade Selection Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                {/* School Name Dropdown */}
                <div className="space-y-1">
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
                      className={`w-full rounded-xl px-3 py-2 border font-bold focus:outline-hidden cursor-pointer ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
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
                      placeholder="نام مدرسه..."
                      className={`w-full rounded-xl px-3 py-2 border focus:outline-hidden ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
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
                      className={`w-full mt-1 rounded-xl px-3 py-2 border focus:outline-hidden ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  )}
                </div>

                {/* Education Stage / Track */}
                <div className="space-y-1">
                  <label className="font-bold block">مقطع و شاخه تحصیلی *</label>
                  <select
                    required
                    value={educationStage}
                    onChange={(e) => {
                      const newStage = e.target.value;
                      setEducationStage(newStage);
                      const newMatched = matchGradeToStage(grade, newStage);
                      setGrade(newMatched);
                      setIsCustomGrade(false);
                    }}
                    className={`w-full rounded-xl px-3 py-2 border font-bold focus:outline-hidden cursor-pointer ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {EDUCATION_STAGES.map((stg) => (
                      <option key={stg} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>

                {/* Grade Dropdown */}
                <div className="space-y-1">
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
                    className={`w-full rounded-xl px-3 py-2 border font-bold focus:outline-hidden cursor-pointer ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
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
                      className={`w-full mt-1 rounded-xl px-3 py-2 border focus:outline-hidden ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold block">شماره همراه ولی</label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="09121112233"
                  className={`w-full rounded-xl px-3 py-2 border focus:outline-hidden ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block">یادداشت معلم / ملاحظات خاص</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="مثلا: علاقمند به فیزیک، نیازمند تمرین بیشتر..."
                  className={`w-full rounded-xl p-3 border focus:outline-hidden resize-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Informative Note for Grade-wide Student Auto-linking */}
              <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
                isDarkMode ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200' : 'bg-indigo-50 border-indigo-100 text-indigo-900'
              }`}>
                <span className="text-base leading-none">💡</span>
                <div>
                  <strong>عضویت هم‌زمان در تمام دروس این پایه:</strong> با ثبت این دانش‌آموز، نام وی به‌صورت خودکار در تمام کارت‌های درس مربوط به <strong>{grade || classroom.grade || 'این پایه'}</strong> قرار می‌گیرد و نیازی به تعریف مجدد در دروس دیگر نیست.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  ثبت دانش‌آموز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full Student Profile Modal */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          classroom={classroom}
          scores={scores}
          attendance={attendance}
          behavioralPoints={behavioralPoints}
          onClose={() => setSelectedStudent(null)}
          onUpdateStudent={(updatedStudent) => {
            onUpdateStudent(updatedStudent);
            setSelectedStudent(updatedStudent);
          }}
          onAddScore={onAddScore}
          onDeleteScore={onDeleteScore}
          onAddAttendance={onAddAttendance}
          onAddBehaviorPoint={onAddBehaviorPoint}
          isDarkMode={isDarkMode}
        />
      )}

    </div>
  );
};
