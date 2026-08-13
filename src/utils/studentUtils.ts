import { Student, Classroom, STAGE_GRADES_MAP, GRADE_OPTIONS } from '../types';

/**
 * Checks whether a student belongs to a given classroom/subject.
 * Matches by explicit classId, classIds array, or grade + school match.
 */
export const isStudentInClassroom = (student: Student, classroom?: Classroom | null): boolean => {
  if (!classroom) return false;

  // 1. Direct match by classId
  if (student.classId === classroom.id) return true;

  // 2. Direct match by classIds array
  if (student.classIds && Array.isArray(student.classIds) && student.classIds.includes(classroom.id)) {
    return true;
  }

  // 3. School check: If both student and classroom have non-empty schoolNames, they must match
  const studentSchool = student.schoolName ? student.schoolName.trim() : '';
  const classSchool = classroom.schoolName ? classroom.schoolName.trim() : '';
  if (studentSchool && classSchool && studentSchool !== classSchool) {
    return false;
  }

  // 4. Grade check: If student.grade and classroom.grade match
  const stdGrade = student.grade ? student.grade.trim() : '';
  const clsGrade = classroom.grade ? classroom.grade.trim() : '';
  if (stdGrade && clsGrade && stdGrade === clsGrade) {
    // 5. Branch/ClassName check: If both specify a branch/className and they differ, don't match
    const stdClass = student.className ? student.className.trim() : '';
    const clsName = classroom.name ? classroom.name.trim() : '';
    if (stdClass && clsName && stdClass !== clsName) {
      return false;
    }
    return true;
  }

  return false;
};

/**
 * Matches a grade title (e.g. "پایه دوازدهم (متوسطه دوم)" or "پایه دوازدهم")
 * to the appropriate grade string corresponding to the given education stage
 * (e.g., "پایه دوازدهم (نظری انسانی)").
 */
export const matchGradeToStage = (currentGrade: string | undefined, stage: string | undefined): string => {
  if (!stage || !STAGE_GRADES_MAP[stage]) {
    return currentGrade || GRADE_OPTIONS[0];
  }

  const validGradesForStage = STAGE_GRADES_MAP[stage];
  if (!currentGrade || !currentGrade.trim()) {
    return validGradesForStage[0];
  }

  const trimmed = currentGrade.trim();

  // If it's already an exact match in validGradesForStage
  if (validGradesForStage.includes(trimmed)) {
    return trimmed;
  }

  // Find match by grade level keywords
  const keywords = [
    { key: 'دوازدهم', idx: 2 },
    { key: '12', idx: 2 },
    { key: 'یازدهم', idx: 1 },
    { key: '11', idx: 1 },
    { key: 'دهم', idx: 0 },
    { key: '10', idx: 0 },
    { key: 'نهم', idx: 2 },
    { key: '9', idx: 2 },
    { key: 'هشتم', idx: 1 },
    { key: '8', idx: 1 },
    { key: 'هفتم', idx: 0 },
    { key: '7', idx: 0 },
    { key: 'ششم', idx: 5 },
    { key: '6', idx: 5 },
    { key: 'پنجم', idx: 4 },
    { key: '5', idx: 4 },
    { key: 'چهارم', idx: 3 },
    { key: '4', idx: 3 },
    { key: 'سوم', idx: 2 },
    { key: '3', idx: 2 },
    { key: 'دوم', idx: 1 },
    { key: '2', idx: 1 },
    { key: 'اول', idx: 0 },
    { key: '1', idx: 0 },
  ];

  for (const { key, idx } of keywords) {
    if (trimmed.includes(key)) {
      if (validGradesForStage[idx]) {
        return validGradesForStage[idx];
      }
      const matchedByText = validGradesForStage.find((g) => g.includes(key));
      if (matchedByText) return matchedByText;
    }
  }

  return validGradesForStage[0];
};

/**
 * Extracts the last name (نام خانوادگی) from a student's full name.
 */
export const getLastName = (fullName: string | undefined): string => {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] || '';
  return parts.slice(1).join(' ');
};

/**
 * Sorts an array of students by Persian alphabetical order of their last name.
 * If last names match, falls back to full name comparison.
 */
export const sortStudentsByLastName = (students: Student[]): Student[] => {
  return [...students].sort((a, b) => {
    const lastNameA = getLastName(a.fullName);
    const lastNameB = getLastName(b.fullName);
    const comp = lastNameA.localeCompare(lastNameB, 'fa', { sensitivity: 'base' });
    if (comp !== 0) return comp;
    return (a.fullName || '').localeCompare(b.fullName || '', 'fa', { sensitivity: 'base' });
  });
};

/**
 * Normalizes Persian/Arabic digits, commas, slashes, and Persian decimal characters
 * to standard ASCII numbers and decimal point.
 */
export const normalizePersianNumbers = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '';
  const str = String(val);
  return str
    .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString())
    .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
    .replace(/[٫,/]/g, '.');
};

/**
 * Parses a string or number into a valid grade number bounded between min and max (default 0 to 20).
 * Returns undefined if string is empty or invalid.
 */
export const parseGradeNumber = (
  val: string | number | undefined | null,
  min: number = 0,
  max: number = 20
): number | undefined => {
  if (val === undefined || val === null || String(val).trim() === '') return undefined;
  const normalized = normalizePersianNumbers(val);
  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) return undefined;
  return Math.min(max, Math.max(min, parsed));
};


