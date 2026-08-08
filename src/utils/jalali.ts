// Utility functions for Jalali (Shamsi) Calendar & Iranian Official Holidays

export interface JalaliDate {
  jy: number; // e.g. 1403
  jm: number; // 1 to 12
  jd: number; // 1 to 31
}

export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const PERSIAN_WEEK_DAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
];

// Check if Jalali year is leap year
export function isJalaliLeapYear(jy: number): boolean {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 2678];
  let bl = breaks.length;
  let jp = breaks[0];
  let jump = 0;

  if (jy < jp || jy >= breaks[bl - 1]) return false;

  for (let i = 1; i < bl; i++) {
    let jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    jp = jm;
  }

  let N = jy - jp;
  if (jump - N < 6) N = N - jump + Math.floor((jump + 4) / 33) * 33;
  let leap = ((((N + 1) % 33) - 1) % 4);
  if (leap === -1) leap = 4;
  return leap === 0;
}

// Get number of days in a Jalali month
export function getJalaliMonthDays(jy: number, jm: number): number {
  if (jm >= 1 && jm <= 6) return 31;
  if (jm >= 7 && jm <= 11) return 30;
  if (jm === 12) return isJalaliLeapYear(jy) ? 30 : 29;
  return 30;
}

// Gregorian to Jalali
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd;
  for (let i = 0; i < gm; ++i) days += g_d_m[i];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  let jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

// Jalali to Gregorian
export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  let jy_adj = jy - 979;
  let gy = 1600 + 33 * Math.floor(jy_adj / 33);
  let days = (jy_adj % 33);
  let gy_inc = 4 * Math.floor(days / 4);
  gy += gy_inc;
  days %= 4;
  if (days > 0) {
    gy += days;
  }
  let j_day_no = (jm <= 6) ? (jm - 1) * 31 + jd : 186 + (jm - 7) * 30 + jd;
  let g_day_no = j_day_no + 79;
  let gy_leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  if (g_day_no > 365 + (gy_leap ? 1 : 0)) {
    g_day_no -= 365 + (gy_leap ? 1 : 0);
    gy++;
  }
  const g_d_m = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  let gd = 0;
  for (let i = 1; i <= 12; i++) {
    if (g_day_no <= g_d_m[i]) {
      gm = i;
      gd = g_day_no;
      break;
    }
    g_day_no -= g_d_m[i];
  }
  return { gy, gm, gd };
}

// Get day of week index (0 = Shanbe (شنبه), 1 = Yekshanbe (یکشنبه), ..., 6 = Jomeh (جمعه))
export function getJalaliDayOfWeek(jy: number, jm: number, jd: number): number {
  const { gy, gm, gd } = jalaliToGregorian(jy, jm, jd);
  const date = new Date(gy, gm - 1, gd);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Convert JS Day (0: Sun, 1: Mon, ..., 6: Sat) to Shanbe-based index (0: Sat, 1: Sun, ..., 6: Fri)
  const map: { [key: number]: number } = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
  return map[day];
}

// Get today in Jalali
export function getTodayJalali(): JalaliDate {
  const now = new Date();
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

// Convert JalaliDate to ISO string YYYY-MM-DD
export function jalaliToIsoString(j: JalaliDate): string {
  const { gy, gm, gd } = jalaliToGregorian(j.jy, j.jm, j.jd);
  const mm = gm < 10 ? `0${gm}` : `${gm}`;
  const dd = gd < 10 ? `0${gd}` : `${gd}`;
  return `${gy}-${mm}-${dd}`;
}

// Parse ISO date YYYY-MM-DD to JalaliDate
export function isoStringToJalali(isoStr: string): JalaliDate {
  if (!isoStr) return getTodayJalali();
  const parts = isoStr.split('-');
  if (parts.length < 3) return getTodayJalali();
  const gy = parseInt(parts[0], 10);
  const gm = parseInt(parts[1], 10);
  const gd = parseInt(parts[2], 10);
  if (isNaN(gy) || isNaN(gm) || isNaN(gd)) return getTodayJalali();
  return gregorianToJalali(gy, gm, gd);
}

// Format Jalali Date as string e.g. "۱۳ مرداد ۱۴۰۳"
export function formatJalaliDate(j: JalaliDate, includeWeekday = false): string {
  const monthName = JALALI_MONTH_NAMES[j.jm - 1];
  
  if (includeWeekday) {
    const dayName = PERSIAN_WEEK_DAYS[getJalaliDayOfWeek(j.jy, j.jm, j.jd)];
    return `${dayName} ${toPersianDigits(j.jd)} ${monthName} ${toPersianDigits(j.jy)}`;
  }
  return `${toPersianDigits(j.jd)} ${monthName} ${toPersianDigits(j.jy)}`;
}

// Persian Digits Converter
export function toPersianDigits(num: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
}

// Fixed solar Iranian holidays + major religious holidays mapping
export interface HolidayInfo {
  isHoliday: boolean;
  title?: string;
  isFriday?: boolean;
  isThursday?: boolean;
}

export function getIranianHolidayInfo(jy: number, jm: number, jd: number): HolidayInfo {
  const dayOfWeek = getJalaliDayOfWeek(jy, jm, jd);
  const isFriday = dayOfWeek === 6;
  const isThursday = dayOfWeek === 5;

  // Fixed Shamsi official holidays
  const fixedHolidays: { [key: string]: string } = {
    '1-1': 'جشن نوروز / آغاز سال نو',
    '1-2': 'عید نوروز',
    '1-3': 'عید نوروز',
    '1-4': 'عید نوروز',
    '1-12': 'روز جمهوری اسلامی ایران',
    '1-13': 'روز طبیعت (سیزده بدر)',
    '3-14': 'رحلت حضرت امام خمینی (ره)',
    '3-15': 'قیام خونین ۱۵ خرداد',
    '11-22': 'پیروزی انقلاب اسلامی ایران',
    '12-29': 'روز ملی شدن صنعت نفت ایران',
    '12-30': 'آخرین روز سال / عید نوروز',
  };

  const key = `${jm}-${jd}`;
  let holidayTitle = fixedHolidays[key];

  // Specific Lunar/Religious official holidays mapped for 1402, 1403, 1404, 1405
  if (!holidayTitle) {
    const yearHolidays: { [year: number]: { [key: string]: string } } = {
      1402: {
        '1-4': 'شهادت حضرت فاطمه زهرا (س)',
        '1-23': 'عید سعید فطر',
        '1-24': 'تعطیل عید فطر',
        '2-26': 'شهادت امام جعفر صادق (ع)',
        '4-7': 'عید سعید قربان',
        '4-15': 'عید سعید غدیر خم',
        '5-5': 'تاسوعای حسینی',
        '5-6': 'عاشورای حسینی',
        '6-15': 'اربعین حسینی',
        '6-23': 'رحلت پیامبر اکرم (ص) و شهادت امام حسن مجتبی (ع)',
        '6-25': 'شهادت امام رضا (ع)',
        '7-2': 'شهادت امام حسن عسکری (ع)',
        '7-11': 'ولادت پیامبر اکرم (ص) و امام صادق (ع)',
        '9-26': 'شهادت حضرت فاطمه زهرا (س)',
        '10-13': 'ولادت امام علی (ع)',
        '10-27': 'مبعث پیامبر اکرم (ص)',
        '11-6': 'ولادت حضرت قائم (عج)',
      },
      1403: {
        '1-22': 'عید سعید فطر',
        '1-23': 'تعطیل عید فطر',
        '2-15': 'شهادت حضرت امام جعفر صادق (ع)',
        '3-28': 'عید سعید قربان',
        '4-5': 'عید سعید غدیر خم',
        '4-25': 'تاسوعای حسینی',
        '4-26': 'عاشورای حسینی',
        '6-4': 'اربعین حسینی',
        '6-12': 'رحلت پیامبر اکرم (ص) و شهادت امام حسن (ع)',
        '6-14': 'شهادت حضرت امام رضا (ع)',
        '6-22': 'شهادت امام حسن عسکری (ع)',
        '6-31': 'ولادت پیامبر اکرم (ص) و امام صادق (ع)',
        '9-15': 'شهادت حضرت فاطمه زهرا (س)',
        '10-25': 'ولادت حضرت امام علی (ع) (روز پدر)',
        '11-9': 'مبعث حضرت رسول اکرم (ص)',
        '11-25': 'ولادت حضرت قائم (عج) (نیمه شعبان)',
      },
      1404: {
        '1-11': 'عید سعید فطر',
        '1-12': 'تعطیل عید فطر',
        '2-4': 'شهادت امام جعفر صادق (ع)',
        '3-17': 'عید سعید قربان',
        '3-25': 'عید سعید غدیر خم',
        '4-14': 'تاسوعای حسینی',
        '4-15': 'عاشورای حسینی',
        '5-24': 'اربعین حسینی',
        '6-1': 'رحلت پیامبر (ص) و شهادت امام حسن (ع)',
        '6-3': 'شهادت امام رضا (ع)',
        '6-11': 'شهادت امام حسن عسکری (ع)',
        '6-20': 'ولادت پیامبر (ص) و امام صادق (ع)',
        '9-4': 'شهادت حضرت فاطمه (س)',
        '10-14': 'ولادت امام علی (ع)',
        '10-28': 'مبعث پیامبر اکرم (ص)',
        '11-15': 'ولادت حضرت قائم (عج)',
      },
      1405: {
        '1-1': 'عید سعید فطر',
        '1-2': 'تعطیل عید فطر',
        '2-15': 'شهادت امام صادق (ع)',
        '3-6': 'عید سعید قربان',
        '3-14': 'عید سعید غدیر',
        '4-3': 'تاسوعای حسینی',
        '4-4': 'عاشورای حسینی',
        '5-13': 'اربعین حسینی',
        '5-21': 'رحلت پیامبر (ص)',
        '5-23': 'شهادت امام رضا (ع)',
        '5-31': 'شهادت امام حسن عسکری (ع)',
        '6-9': 'ولادت پیامبر (ص) و امام صادق (ع)',
        '8-23': 'شهادت حضرت فاطمه (س)',
        '10-3': 'ولادت امام علی (ع)',
        '10-17': 'مبعث پیامبر (ص)',
        '11-4': 'ولادت حضرت قائم (عج)',
      },
    };

    if (yearHolidays[jy] && yearHolidays[jy][key]) {
      holidayTitle = yearHolidays[jy][key];
    }
  }

  const isHoliday = Boolean(holidayTitle) || isFriday;

  let title = holidayTitle;
  if (!title && isFriday) {
    title = 'جمعه (تعطیل پایان هفته)';
  }

  return {
    isHoliday,
    title,
    isFriday,
    isThursday,
  };
}
