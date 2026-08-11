import { Student, Classroom } from '../types';

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


