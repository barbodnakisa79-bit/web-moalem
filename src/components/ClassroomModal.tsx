import React, { useState, useEffect, useMemo } from 'react';
import { Classroom, EvaluationSystem, GRADE_OPTIONS, EDUCATION_STAGES, STAGE_GRADES_MAP } from '../types';
import { matchGradeToStage } from '../utils/studentUtils';
import { Plus, X, School, Eye, EyeOff, Users, Layers } from 'lucide-react';
import { ColorPickerSelector } from './ColorPickerSelector';

interface ClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClassroom: (classroom: Omit<Classroom, 'id'>) => void;
  classrooms?: Classroom[];
}

export const ClassroomModal: React.FC<ClassroomModalProps> = ({
  isOpen,
  onClose,
  onAddClassroom,
  classrooms = [],
}) => {
  const [name, setName] = useState('');
  const [educationStage, setEducationStage] = useState('متوسطه دوم - نظری تجربی');
  const [grade, setGrade] = useState('پایه دهم (نظری تجربی)');
  const [subject, setSubject] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [academicYear, setAcademicYear] = useState('۱۴۰۳-۱۴۰۴');
  const [evaluationSystem, setEvaluationSystem] = useState<EvaluationSystem>('numeric');
  const [cardBgColor, setCardBgColor] = useState<string>('default');

  // Eye toggle state for showing/hiding fields on card
  const [showName, setShowName] = useState(true);
  const [showGrade, setShowGrade] = useState(true);
  const [showEducationStage, setShowEducationStage] = useState(true);
  const [showSchoolName, setShowSchoolName] = useState(true);
  const [showAcademicYear, setShowAcademicYear] = useState(false);
  const [showStudentCount, setShowStudentCount] = useState(false);
  const [showEvaluationSystem, setShowEvaluationSystem] = useState(false);

  const [isCustomSchool, setIsCustomSchool] = useState(false);

  // Compute grade options based on selected education stage
  const currentGradeOptions = useMemo(() => {
    if (educationStage && STAGE_GRADES_MAP[educationStage]) {
      return STAGE_GRADES_MAP[educationStage];
    }
    return GRADE_OPTIONS;
  }, [educationStage]);

  // Synchronize grade if educationStage changes
  const handleStageChange = (newStage: string) => {
    setEducationStage(newStage);
    setGrade(matchGradeToStage(grade, newStage));
  };

  const registeredSchools = useMemo(() => {
    const list = new Set<string>();

    // 1. From classrooms prop
    if (classrooms && Array.isArray(classrooms)) {
      classrooms.forEach((c) => {
        if (c.schoolName && typeof c.schoolName === 'string' && c.schoolName.trim()) {
          list.add(c.schoolName.trim());
        }
      });
    }

    try {
      // 2. From localStorage amoozgar_classrooms
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

      // 3. Primary school name from teacher settings
      const p = localStorage.getItem('school_name');
      if (p && typeof p === 'string' && p.trim()) {
        list.add(p.trim());
      }

      // 4. Custom schools list
      const c = localStorage.getItem('amoozgar_custom_schools');
      if (c) {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed)) {
          parsed.forEach((s) => s && typeof s === 'string' && s.trim() && list.add(s.trim()));
        }
      }

      // 5. Schools details map
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
  }, [isOpen, classrooms]);

  useEffect(() => {
    if (isOpen) {
      try {
        const filter = localStorage.getItem('amoozgar_selectedSchoolFilter');
        if (
          filter &&
          filter !== 'همه' &&
          filter !== 'همه مدارس' &&
          filter !== 'سایر'
        ) {
          setSchoolName(filter);
          setIsCustomSchool(false);
        } else if (registeredSchools.length > 0) {
          setSchoolName(registeredSchools[0]);
          setIsCustomSchool(false);
        } else {
          setIsCustomSchool(true);
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen, registeredSchools]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    onAddClassroom({
      name: name.trim(),
      educationStage,
      grade: grade.trim(),
      subject: subject.trim(),
      schoolName: schoolName.trim(),
      academicYear: academicYear.trim(),
      evaluationSystem,
      cardBgColor,
      showName,
      showGrade,
      showEducationStage,
      showSchoolName,
      showAcademicYear,
      showStudentCount,
      showEvaluationSystem,
    });

    setName('');
    setSubject('');
    setSchoolName('');
    setCardBgColor('default');
    setShowName(true);
    setShowGrade(true);
    setShowSchoolName(true);
    setShowAcademicYear(false);
    setShowStudentCount(false);
    setShowEvaluationSystem(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-600" />
            <span>تعریف کلاس / درس جدید</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-medium text-slate-700">
          {/* Subject Name - Mandatory on card, no toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold">نام درس *</label>
              <span className="text-[10px] text-slate-400 font-normal">نمایش همیشگی روی کارت</span>
            </div>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثلا: ریاضی ۱"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* School Name - Eye toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-bold">
              <div className="flex items-center gap-1">
                <span>نام مدرسه یا آموزشگاه *</span>
                {registeredSchools.length > 0 && (
                  <span className="text-[10px] text-indigo-600 font-normal">
                    ({registeredSchools.length} مدرسه در لیست)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowSchoolName(!showSchoolName)}
                title={showSchoolName ? 'نمایش نام مدرسه روی کارت' : 'عدم نمایش نام مدرسه روی کارت'}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                  showSchoolName
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {showSchoolName ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{showSchoolName ? 'نمایش در کارت' : 'عدم نمایش'}</span>
              </button>
            </div>

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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="" disabled>-- انتخاب مدرسه از لیست ثبت‌شده --</option>
                {schoolName && !isCustomSchool && !registeredSchools.includes(schoolName) && (
                  <option value={schoolName}>{schoolName}</option>
                )}
                {registeredSchools.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="__custom__">➕ تایپ نام جدید...</option>
              </select>
            ) : (
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="نام مدرسه یا آموزشگاه..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            )}

            {isCustomSchool && registeredSchools.length > 0 && (
              <div className="pt-1">
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="نام مدرسه جدید را وارد کنید..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Education Stage / Track - Eye toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold">مقطع و شاخه تحصیلی *</label>
              <button
                type="button"
                onClick={() => setShowEducationStage(!showEducationStage)}
                title={showEducationStage ? 'نمایش مقطع تحصیلی روی کارت' : 'عدم نمایش مقطع روی کارت'}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                  showEducationStage
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {showEducationStage ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{showEducationStage ? 'نمایش در کارت' : 'عدم نمایش'}</span>
              </button>
            </div>
            <select
              required
              value={educationStage}
              onChange={(e) => handleStageChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
                onClick={() => setShowName(!showName)}
                title={showName ? 'نمایش نام کلاس روی کارت' : 'عدم نمایش نام کلاس روی کارت'}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                  showName
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {showName ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{showName ? 'نمایش در کارت' : 'عدم نمایش'}</span>
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلا: کلاس ۱۰۱ - تجربی (اختیاری)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Grade - Eye toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold">پایه تحصیلی</label>
                <button
                  type="button"
                  onClick={() => setShowGrade(!showGrade)}
                  title={showGrade ? 'نمایش پایه تحصیلی روی کارت' : 'عدم نمایش پایه روی کارت'}
                  className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                    showGrade
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {showGrade ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
              <select
                required
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {currentGradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year - Eye toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold">سال تحصیلی</label>
                <button
                  type="button"
                  onClick={() => setShowAcademicYear(!showAcademicYear)}
                  title={showAcademicYear ? 'نمایش سال تحصیلی روی کارت' : 'عدم نمایش سال تحصیلی روی کارت'}
                  className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                    showAcademicYear
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {showAcademicYear ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="۱۴۰۳-۱۴۰۴"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Evaluation System - Eye toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold">سیستم ارزشیابی *</label>
              <button
                type="button"
                onClick={() => setShowEvaluationSystem(!showEvaluationSystem)}
                title={showEvaluationSystem ? 'نمایش سیستم ارزشیابی روی کارت' : 'عدم نمایش روی کارت'}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                  showEvaluationSystem
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {showEvaluationSystem ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{showEvaluationSystem ? 'نمایش در کارت' : 'عدم نمایش'}</span>
              </button>
            </div>
            <select
              value={evaluationSystem}
              onChange={(e) => setEvaluationSystem(e.target.value as EvaluationSystem)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500"
            >
              <option value="numeric">عددی (نمره‌دهی ۰ الی ۲۰)</option>
              <option value="descriptive">توصیفی (خیلی خوب، خوب، قابل قبول...)</option>
            </select>
          </div>

          {/* Color Selector for Classroom Card */}
          <ColorPickerSelector
            selectedColor={cardBgColor}
            onChangeColor={(col) => setCardBgColor(col)}
            label="رنگ پس‌زمینه کارت درس:"
          />

          {/* Student Count - Eye toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-500" />
              <span>تعداد / آمار دانش‌آموزان</span>
            </span>
            <button
              type="button"
              onClick={() => setShowStudentCount(!showStudentCount)}
              title={showStudentCount ? 'نمایش تعداد دانش‌آموزان روی کارت' : 'عدم نمایش روی کارت'}
              className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer select-none ${
                showStudentCount
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
            >
              {showStudentCount ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{showStudentCount ? 'نمایش در کارت' : 'عدم نمایش'}</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
            >
              ایجاد کلاس
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
