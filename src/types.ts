export interface SchoolDetails {
  name: string;
  schoolType?: 'دولتی' | 'غیرانتفاعی' | 'هیئت امنایی' | 'نمونه دولتی' | 'تیزهوشان' | 'سایر' | string;
  schoolCode?: string;
  phone?: string;
  principalPhone?: string;
  address?: string;
  postalCode?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type AssessmentType = 'continuous' | 'oral' | 'homework' | 'exam' | 'behavioral';

export type EvaluationSystem = 'numeric' | 'descriptive'; // numeric (0-20) or descriptive (خیلی خوب، خوب، قابل قبول، نیاز به تلاش)

export interface Student {
  id: string;
  classId: string;
  classIds?: string[]; // شناسه تمام کلاس‌ها و درس‌هایی که دانش‌آموز در آن‌ها عضو است
  fullName: string;
  studentCode: string; // شماره دانش‌آموزی / کد ملی
  fatherName?: string;
  parentPhone?: string;
  schoolName?: string; // نام مدرسه
  grade?: string; // پایه تحصیلی
  className?: string; // نام کلاس
  avatarUrl?: string;
  notes?: string;
}

export interface Classroom {
  id: string;
  name: string; // نام کلاس (مثلا: پایه دهم ریاضی ۱)
  grade: string; // پایه (مثلا: دهم)
  subject: string; // درس (مثلا: ریاضی)
  schoolName?: string; // نام مدرسه
  academicYear: string; // سال تحصیلی (مثلا: ۱۴۰۳-۱۴۰۴)
  evaluationSystem: EvaluationSystem;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
}

export interface ScoreRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  type: AssessmentType;
  title: string; // عنوان ارزیابی (مثلا: پرسش شفاهی فصل ۱، یا آزمون میان‌ترم)
  scoreNumeric?: number; // 0-20
  scoreDescriptive?: 'خیلی خوب' | 'خوب' | 'قابل قبول' | 'نیاز به تلاش بیشتر';
  maxScore?: number;
  note?: string;
}

export interface ClassJournalEntry {
  id: string;
  classId: string;
  date: string;
  topicTaught: string; // مبحث تدریس شده
  homeworkAssigned: string; // تکالیف محوله
  absentCount: number;
  generalNotes?: string; // یادداشت روزانه معلم
}

export interface BehavioralPoint {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  type: 'positive' | 'negative';
  title: string; // عنوان (مثلا: مشارکت فعال، عدم انجام تکلیف)
  scoreValue: number; // مثلا +1 یا -1
}

export interface TimetableItem {
  id: string;
  dayOfWeek: 'شنبه' | 'یکشنبه' | 'دوشنبه' | 'سه‌شنبه' | 'چهارشنبه' | 'پنجشنبه';
  period: number; // زنگ ۱، زنگ ۲ و ...
  classId: string;
  subject: string;
  room?: string;
}
