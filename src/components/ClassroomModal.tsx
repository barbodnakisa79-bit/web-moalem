import React, { useState, useEffect, useMemo } from 'react';
import { Classroom, EvaluationSystem } from '../types';
import { Plus, X, School } from 'lucide-react';

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
  const [grade, setGrade] = useState('پایه دهم');
  const [subject, setSubject] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [academicYear, setAcademicYear] = useState('۱۴۰۳-۱۴۰۴');
  const [evaluationSystem, setEvaluationSystem] = useState<EvaluationSystem>('numeric');

  const [isCustomSchool, setIsCustomSchool] = useState(false);

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
    if (!name.trim() || !subject.trim()) return;

    onAddClassroom({
      name: name.trim(),
      grade: grade.trim(),
      subject: subject.trim(),
      schoolName: schoolName.trim(),
      academicYear: academicYear.trim(),
      evaluationSystem,
    });

    setName('');
    setSubject('');
    setSchoolName('');
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
          <div className="space-y-1">
            <label>نام کلاس (مثلاً: کلاس ۱۰۱ یا کلاس ششم A) *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلا: کلاس ۱۰۱ - تجربی"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center justify-between font-bold">
              <span>نام مدرسه یا آموزشگاه *</span>
              {registeredSchools.length > 0 && (
                <span className="text-[10px] text-indigo-600 font-normal">
                  ({registeredSchools.length} مدرسه در لیست)
                </span>
              )}
            </label>

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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label>پایه تحصیلی</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="پایه دهم"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label>نام درس *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="ریاضی ۱"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label>سیستم ارزشیابی *</label>
            <select
              value={evaluationSystem}
              onChange={(e) => setEvaluationSystem(e.target.value as EvaluationSystem)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500"
            >
              <option value="numeric">عددی (نمره‌دهی ۰ الی ۲۰)</option>
              <option value="descriptive">توصیفی (خیلی خوب، خوب، قابل قبول...)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label>سال تحصیلی</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="۱۴۰۳-۱۴۰۴"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
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
