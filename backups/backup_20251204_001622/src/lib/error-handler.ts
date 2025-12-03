/**
 * نظام موحد لمعالجة الأخطاء وعرض الإشعارات
 * يوفر رقم مرجعي موحد لكل خطأ + تسجيل تلقائي
 */

import { errorStorage } from './error-storage';
import { toast } from 'sonner';

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ErrorDetails {
  message: string;
  context: string;
  severity?: ErrorSeverity;
  url?: string;
  userId?: string;
  payload?: any;
  userFriendlyMessage?: string;
}

/**
 * توليد رقم مرجعي موحد للخطأ
 * النمط: ERR-YYYYMMDD-XXXXXX
 */
export function generateErrorReference(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `ERR-${year}${month}${day}-${random}`;
}

/**
 * معالجة الأخطاء من API بشكل موحد
 */
export async function handleApiError(
  error: any,
  details: ErrorDetails
): Promise<string> {
  try {
    // توليد رقم مرجعي
    const errorRef = generateErrorReference();
    
    // استخراج رسالة الخطأ
    const errorMessage = error?.response?.data?.message 
      || error?.message 
      || 'حدث خطأ غير متوقع';
    
    // تحديد الـ URL الحالي
    const currentUrl = details.url || window.location.pathname;
    
    // تسجيل الخطأ في النظام
    await errorStorage.logError({
      error_code: errorRef,
      error_message: errorMessage,
      error_details: JSON.stringify({
        stack: error?.stack,
        response: error?.response?.data,
        status: error?.response?.status,
        payload: details.payload,
      }, null, 2),
      context: details.context,
      user_id: details.userId,
      severity: details.severity || 'medium',
      url: currentUrl,
      resolved: false,
    });

    // عرض إشعار للمستخدم
    const userMessage = details.userFriendlyMessage 
      || 'حدث خطأ في النظام. يرجى المحاولة مرة أخرى.';
    
    toast.error(userMessage, {
      description: `رقم المرجع: ${errorRef}\nالرجاء مشاركة هذا الرقم مع فريق الدعم.`,
      duration: 8000,
      action: {
        label: 'نسخ الرقم',
        onClick: () => navigator.clipboard.writeText(errorRef),
      },
    });

    // طباعة في Console للمطورين
    console.error('❌ Error Details:', {
      ref: errorRef,
      context: details.context,
      message: errorMessage,
      severity: details.severity || 'medium',
      error,
    });

    return errorRef;
  } catch (logError) {
    console.error('⚠️ Failed to log error:', logError);
    toast.error('حدث خطأ في النظام', {
      description: 'يرجى المحاولة مرة أخرى',
    });
    return 'UNKNOWN';
  }
}

/**
 * معالجة الأخطاء العامة (غير API)
 */
export async function handleGeneralError(
  error: Error,
  details: ErrorDetails
): Promise<string> {
  try {
    const errorRef = generateErrorReference();
    
    await errorStorage.logError({
      error_code: errorRef,
      error_message: error.message,
      error_details: error.stack || error.toString(),
      context: details.context,
      user_id: details.userId,
      severity: details.severity || 'medium',
      url: details.url || window.location.pathname,
      resolved: false,
    });

    const userMessage = details.userFriendlyMessage 
      || error.message 
      || 'حدث خطأ غير متوقع';
    
    toast.error(userMessage, {
      description: `رقم المرجع: ${errorRef}`,
      duration: 6000,
    });

    console.error('❌ Error:', {
      ref: errorRef,
      context: details.context,
      error,
    });

    return errorRef;
  } catch (logError) {
    console.error('⚠️ Failed to log error:', logError);
    return 'UNKNOWN';
  }
}

/**
 * إشعار نجاح موحد
 */
export function showSuccessNotification(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: 4000,
  });
}

/**
 * إشعار تحذير موحد
 */
export function showWarningNotification(message: string, description?: string) {
  toast.warning(message, {
    description,
    duration: 5000,
  });
}

/**
 * إشعار معلومات موحد
 */
export function showInfoNotification(message: string, description?: string) {
  toast.info(message, {
    description,
    duration: 4000,
  });
}
