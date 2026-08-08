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

