import { Student, Classroom } from '../types';

/**
 * Checks whether a student belongs to a given classroom/subject.
 * Matches by explicit classId, classIds array, or grade + class name match.
 */
export const isStudentInClassroom = (student: Student, classroom?: Classroom | null): boolean => {
  if (!classroom) return false;
  if (student.classId === classroom.id) return true;
  if (student.classIds && student.classIds.includes(classroom.id)) return true;
  if (
    student.grade &&
    student.grade === classroom.grade &&
    student.className &&
    classroom.name &&
    student.className === classroom.name
  ) {
    return true;
  }
  return false;
};
