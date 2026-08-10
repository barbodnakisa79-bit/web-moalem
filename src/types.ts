export interface SchoolDetails {
  name: string;
  schoolType?: 'دولتی' | 'غیرانتفاعی' | 'هیئت امنایی' | 'نمونه دولتی' | 'تیزهوشان' | 'سایر' | string;
  educationStage?: string; // مقطع و شاخه تحصیلی (مثلاً: متوسطه دوم - نظری تجربی، هنرستان - فنی و حرفه‌ای...)
  schoolCode?: string;
  phone?: string;
  principalPhone?: string;
  address?: string;
  postalCode?: string;
  cardBgColor?: string; // رنگ پس‌زمینه کارت/دکمه مدرسه
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type AssessmentType = 'continuous' | 'oral' | 'homework' | 'exam' | 'behavioral';

export type EvaluationSystem = 'numeric' | 'descriptive'; // numeric (0-20) or descriptive (خیلی خوب، خوب، قابل قبول، نیاز به تلاش)

export const EDUCATION_STAGES = [
  'ابتدایی (دبستان)',
  'متوسطه اول (راهنمایی)',
  'متوسطه دوم - نظری انسانی',
  'متوسطه دوم - نظری تجربی',
  'متوسطه دوم - نظری ریاضی و فیزیک',
  'متوسطه دوم - علوم و معارف اسلامی',
  'هنرستان - فنی و حرفه‌ای',
  'هنرستان - کاردانش',
  'سایر / عموم',
] as const;

export type EducationStage = typeof EDUCATION_STAGES[number] | string;

export const STAGE_GRADES_MAP: Record<string, string[]> = {
  'ابتدایی (دبستان)': [
    'پایه اول ابتدایی',
    'پایه دوم ابتدایی',
    'پایه سوم ابتدایی',
    'پایه چهارم ابتدایی',
    'پایه پنجم ابتدایی',
    'پایه ششم ابتدایی',
  ],
  'متوسطه اول (راهنمایی)': [
    'پایه هفتم (متوسطه اول)',
    'پایه هشتم (متوسطه اول)',
    'پایه نهم (متوسطه اول)',
  ],
  'متوسطه دوم - نظری انسانی': [
    'پایه دهم (نظری انسانی)',
    'پایه یازدهم (نظری انسانی)',
    'پایه دوازدهم (نظری انسانی)',
  ],
  'متوسطه دوم - نظری تجربی': [
    'پایه دهم (نظری تجربی)',
    'پایه یازدهم (نظری تجربی)',
    'پایه دوازدهم (نظری تجربی)',
  ],
  'متوسطه دوم - نظری ریاضی و فیزیک': [
    'پایه دهم (نظری ریاضی)',
    'پایه یازدهم (نظری ریاضی)',
    'پایه دوازدهم (نظری ریاضی)',
  ],
  'متوسطه دوم - علوم و معارف اسلامی': [
    'پایه دهم (معارف اسلامی)',
    'پایه یازدهم (معارف اسلامی)',
    'پایه دوازدهم (معارف اسلامی)',
  ],
  'هنرستان - فنی و حرفه‌ای': [
    'پایه دهم (فنی و حرفه‌ای)',
    'پایه یازدهم (فنی و حرفه‌ای)',
    'پایه دوازدهم (فنی و حرفه‌ای)',
  ],
  'هنرستان - کاردانش': [
    'پایه دهم (کاردانش)',
    'پایه یازدهم (کاردانش)',
    'پایه دوازدهم (کاردانش)',
  ],
  'سایر / عموم': [
    'پایه اول',
    'پایه دوم',
    'پایه سوم',
    'پایه چهارم',
    'پایه پنجم',
    'پایه ششم',
    'پایه هفتم',
    'پایه هشتم',
    'پایه نهم',
    'پایه دهم',
    'پایه یازدهم',
    'پایه دوازدهم',
  ],
};

export const GRADE_OPTIONS = [
  'پایه اول ابتدایی',
  'پایه دوم ابتدایی',
  'پایه سوم ابتدایی',
  'پایه چهارم ابتدایی',
  'پایه پنجم ابتدایی',
  'پایه ششم ابتدایی',
  'پایه هفتم',
  'پایه هشتم',
  'پایه نهم',
  'پایه دهم انسانی',
  'پایه دهم تجربی',
  'پایه دهم ریاضی',
  'پایه دهم فنی و حرفه‌ای',
  'پایه دهم کاردانش',
  'پایه یازدهم انسانی',
  'پایه یازدهم تجربی',
  'پایه یازدهم ریاضی',
  'پایه یازدهم فنی و حرفه‌ای',
  'پایه یازدهم کاردانش',
  'پایه دوازدهم انسانی',
  'پایه دوازدهم تجربی',
  'پایه دوازدهم ریاضی',
  'پایه دوازدهم فنی و حرفه‌ای',
  'پایه دوازدهم کاردانش',
];

export interface Student {
  id: string;
  classId: string;
  classIds?: string[]; // شناسه تمام کلاس‌ها و درس‌هایی که دانش‌آموز در آن‌ها عضو است
  fullName: string;
  studentCode: string; // شماره دانش‌آموزی / کد ملی
  fatherName?: string;
  parentPhone?: string;
  schoolName?: string; // نام مدرسه
  educationStage?: string; // مقطع و شاخه تحصیلی
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
  educationStage?: string; // مقطع و شاخه تحصیلی (مثلا: متوسطه دوم - نظری تجربی)
  academicYear: string; // سال تحصیلی (مثلا: ۱۴۰۳-۱۴۰۴)
  evaluationSystem: EvaluationSystem;
  cardBgColor?: string; // رنگ پس‌زمینه کارت درس
  showName?: boolean; // نمایش نام کلاس روی کارت درس
  showGrade?: boolean; // نمایش پایه تحصیلی روی کارت درس
  showSchoolName?: boolean; // نمایش نام مدرسه روی کارت درس
  showEducationStage?: boolean; // نمایش مقطع روی کارت درس
  showAcademicYear?: boolean; // نمایش سال تحصیلی روی کارت درس
  showStudentCount?: boolean; // نمایش آمار تعداد دانش‌آموزان روی کارت درس
  showEvaluationSystem?: boolean; // نمایش نوع سیستم ارزشیابی روی کارت درس
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
