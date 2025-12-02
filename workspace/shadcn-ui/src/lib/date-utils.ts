/**
 * نظام التاريخ الموحد - Gregorian Calendar System
 * 
 * جميع التواريخ في النظام بالميلادي فقط
 * استخدام صيغة ISO 8601 الموحدة
 */

// ===============================
// تنسيقات التاريخ القياسية
// ===============================

/**
 * تنسيق التاريخ للعرض
 * @param date - كائن Date أو نص ISO
 * @param format - نوع التنسيق المطلوب
 * @returns نص التاريخ المنسق
 */
export function formatDate(
  date: Date | string,
  format: 'full' | 'short' | 'date-only' | 'time-only' | 'datetime' = 'full'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'تاريخ غير صالح';
  }

  const options: Intl.DateTimeFormatOptions = {
    calendar: 'gregory', // التقويم الميلادي فقط
    numberingSystem: 'latn', // الأرقام الإنجليزية
  };

  switch (format) {
    case 'full':
      // مثال: الأحد، 2 ديسمبر 2025، 3:45 م
      return dateObj.toLocaleString('ar-SA', {
        ...options,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

    case 'short':
      // مثال: 2/12/2025
      return dateObj.toLocaleDateString('ar-SA', {
        ...options,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

    case 'date-only':
      // مثال: 2 ديسمبر 2025
      return dateObj.toLocaleDateString('ar-SA', {
        ...options,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    case 'time-only':
      // مثال: 3:45 م
      return dateObj.toLocaleTimeString('ar-SA', {
        ...options,
        hour: '2-digit',
        minute: '2-digit',
      });

    case 'datetime':
      // مثال: 2/12/2025 3:45 م
      return dateObj.toLocaleString('ar-SA', {
        ...options,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

    default:
      return dateObj.toLocaleString('ar-SA', options);
  }
}

/**
 * تحويل التاريخ إلى صيغة ISO 8601
 * @param date - كائن Date
 * @returns نص بصيغة ISO (مثال: 2025-12-02T15:45:00.000Z)
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * الحصول على التاريخ الحالي
 * @returns كائن Date للحظة الحالية
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * الحصول على التاريخ الحالي بصيغة ISO
 * @returns نص ISO للحظة الحالية
 */
export function getCurrentISODate(): string {
  return new Date().toISOString();
}

/**
 * تحويل نص تاريخ إلى كائن Date
 * @param dateString - نص التاريخ (ISO أو أي صيغة صالحة)
 * @returns كائن Date
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

// ===============================
// عمليات على التواريخ
// ===============================

/**
 * إضافة أيام لتاريخ معين
 * @param date - التاريخ الأساسي
 * @param days - عدد الأيام المراد إضافتها (يمكن أن يكون سالب)
 * @returns تاريخ جديد
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * إضافة أشهر لتاريخ معين
 * @param date - التاريخ الأساسي
 * @param months - عدد الأشهر المراد إضافتها
 * @returns تاريخ جديد
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * إضافة سنوات لتاريخ معين
 * @param date - التاريخ الأساسي
 * @param years - عدد السنوات المراد إضافتها
 * @returns تاريخ جديد
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * حساب الفرق بين تاريخين بالأيام
 * @param date1 - التاريخ الأول
 * @param date2 - التاريخ الثاني
 * @returns عدد الأيام بين التاريخين
 */
export function diffInDays(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((date1.getTime() - date2.getTime()) / oneDay);
}

/**
 * حساب الفرق بين تاريخين بالساعات
 * @param date1 - التاريخ الأول
 * @param date2 - التاريخ الثاني
 * @returns عدد الساعات بين التاريخين
 */
export function diffInHours(date1: Date, date2: Date): number {
  const oneHour = 60 * 60 * 1000;
  return Math.round((date1.getTime() - date2.getTime()) / oneHour);
}

/**
 * التحقق من أن التاريخ في المستقبل
 * @param date - التاريخ المراد فحصه
 * @returns true إذا كان في المستقبل
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * التحقق من أن التاريخ في الماضي
 * @param date - التاريخ المراد فحصه
 * @returns true إذا كان في الماضي
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * التحقق من أن التاريخ هو اليوم
 * @param date - التاريخ المراد فحصه
 * @returns true إذا كان اليوم
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * الحصول على بداية اليوم (00:00:00)
 * @param date - التاريخ المراد
 * @returns تاريخ بداية اليوم
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * الحصول على نهاية اليوم (23:59:59)
 * @param date - التاريخ المراد
 * @returns تاريخ نهاية اليوم
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * الحصول على بداية الشهر
 * @param date - التاريخ المراد
 * @returns تاريخ بداية الشهر
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * الحصول على نهاية الشهر
 * @param date - التاريخ المراد
 * @returns تاريخ نهاية الشهر
 */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * الحصول على بداية السنة
 * @param date - التاريخ المراد
 * @returns تاريخ بداية السنة
 */
export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

/**
 * الحصول على نهاية السنة
 * @param date - التاريخ المراد
 * @returns تاريخ نهاية السنة
 */
export function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

// ===============================
// تنسيقات نسبية (Relative Time)
// ===============================

/**
 * تنسيق التاريخ بشكل نسبي (مثل: منذ 5 دقائق، قبل ساعتين)
 * @param date - التاريخ المراد تنسيقه
 * @returns نص نسبي
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'منذ لحظات';
  } else if (diffMinutes < 60) {
    return `منذ ${diffMinutes} ${diffMinutes === 1 ? 'دقيقة' : 'دقائق'}`;
  } else if (diffHours < 24) {
    return `منذ ${diffHours} ${diffHours === 1 ? 'ساعة' : 'ساعات'}`;
  } else if (diffDays < 7) {
    return `منذ ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `منذ ${years} ${years === 1 ? 'سنة' : 'سنوات'}`;
  }
}

// ===============================
// Validation
// ===============================

/**
 * التحقق من صحة التاريخ
 * @param date - التاريخ المراد التحقق منه
 * @returns true إذا كان التاريخ صالح
 */
export function isValidDate(date: any): boolean {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }
  return false;
}

/**
 * التحقق من أن التاريخ ضمن نطاق معين
 * @param date - التاريخ المراد فحصه
 * @param min - الحد الأدنى
 * @param max - الحد الأقصى
 * @returns true إذا كان ضمن النطاق
 */
export function isDateInRange(date: Date, min: Date, max: Date): boolean {
  return date.getTime() >= min.getTime() && date.getTime() <= max.getTime();
}

// ===============================
// Constants
// ===============================

/**
 * ثوابت مفيدة
 */
export const DATE_CONSTANTS = {
  MILLISECONDS_IN_SECOND: 1000,
  SECONDS_IN_MINUTE: 60,
  MINUTES_IN_HOUR: 60,
  HOURS_IN_DAY: 24,
  DAYS_IN_WEEK: 7,
  MONTHS_IN_YEAR: 12,
  
  // أيام الأسبوع بالعربي
  WEEKDAYS_AR: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  
  // أشهر السنة الميلادية بالعربي
  MONTHS_AR: [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ],
};

/**
 * الحصول على اسم الشهر بالعربي
 * @param monthIndex - رقم الشهر (0-11)
 * @returns اسم الشهر
 */
export function getMonthName(monthIndex: number): string {
  return DATE_CONSTANTS.MONTHS_AR[monthIndex] || '';
}

/**
 * الحصول على اسم اليوم بالعربي
 * @param dayIndex - رقم اليوم (0-6)
 * @returns اسم اليوم
 */
export function getWeekdayName(dayIndex: number): string {
  return DATE_CONSTANTS.WEEKDAYS_AR[dayIndex] || '';
}

// ===============================
// تصدير افتراضي
// ===============================

export default {
  formatDate,
  toISOString,
  getCurrentDate,
  getCurrentISODate,
  parseDate,
  addDays,
  addMonths,
  addYears,
  diffInDays,
  diffInHours,
  isFuture,
  isPast,
  isToday,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  formatRelativeTime,
  isValidDate,
  isDateInRange,
  getMonthName,
  getWeekdayName,
  DATE_CONSTANTS,
};
