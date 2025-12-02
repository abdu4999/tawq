/**
 * 🧪 ملف اختبار نظام إدارة الأخطاء
 * يمكن استخدامه للتأكد من عمل جميع المكونات
 */

import { 
  generateErrorReference, 
  handleApiError, 
  showSuccessNotification,
  showWarningNotification,
  showInfoNotification 
} from '../lib/error-handler';
import { errorStorage } from '../lib/error-storage';

/**
 * اختبار 1: توليد رقم مرجعي
 */
export async function testGenerateErrorReference() {
  console.log('🧪 Test 1: Generate Error Reference');
  
  const ref1 = generateErrorReference();
  const ref2 = generateErrorReference();
  
  console.log('  Reference 1:', ref1);
  console.log('  Reference 2:', ref2);
  
  // التحقق من النمط الصحيح
  const pattern = /^ERR-\d{8}-[A-Z0-9]{6}$/;
  const isValid1 = pattern.test(ref1);
  const isValid2 = pattern.test(ref2);
  const isUnique = ref1 !== ref2;
  
  console.log('  ✅ Pattern valid:', isValid1 && isValid2);
  console.log('  ✅ Unique refs:', isUnique);
  
  return isValid1 && isValid2 && isUnique;
}

/**
 * اختبار 2: معالجة أخطاء API
 */
export async function testHandleApiError() {
  console.log('🧪 Test 2: Handle API Error');
  
  try {
    const testError = new Error('Test API Error');
    const errorRef = await handleApiError(testError, {
      message: 'Test error',
      context: 'Test - API Call',
      severity: 'medium',
      userFriendlyMessage: 'هذا خطأ اختباري',
      payload: { test: true },
    });
    
    console.log('  Error Ref:', errorRef);
    
    // التحقق من وجود الخطأ في التخزين
    const savedError = await errorStorage.getErrorById(errorRef);
    console.log('  ✅ Error saved:', !!savedError);
    console.log('  ✅ Context correct:', savedError?.context === 'Test - API Call');
    console.log('  ✅ Severity correct:', savedError?.severity === 'medium');
    
    return !!savedError && savedError.context === 'Test - API Call';
  } catch (error) {
    console.error('  ❌ Test failed:', error);
    return false;
  }
}

/**
 * اختبار 3: الإشعارات
 */
export function testNotifications() {
  console.log('🧪 Test 3: Notifications');
  
  try {
    showSuccessNotification('اختبار نجاح', 'هذا إشعار نجاح تجريبي');
    console.log('  ✅ Success notification shown');
    
    setTimeout(() => {
      showWarningNotification('اختبار تحذير', 'هذا إشعار تحذير تجريبي');
      console.log('  ✅ Warning notification shown');
    }, 1000);
    
    setTimeout(() => {
      showInfoNotification('اختبار معلومات', 'هذا إشعار معلومات تجريبي');
      console.log('  ✅ Info notification shown');
    }, 2000);
    
    return true;
  } catch (error) {
    console.error('  ❌ Test failed:', error);
    return false;
  }
}

/**
 * اختبار 4: error-storage
 */
export async function testErrorStorage() {
  console.log('🧪 Test 4: Error Storage');
  
  try {
    // حذف جميع الأخطاء السابقة
    await errorStorage.clearAllErrors();
    console.log('  Cleared all errors');
    
    // إضافة أخطاء تجريبية
    const ref1 = await errorStorage.logError({
      error_code: 'ERR-TEST-001',
      error_message: 'Test error 1',
      error_details: 'Details 1',
      context: 'Test Context 1',
      severity: 'high',
      resolved: false,
    });
    
    const ref2 = await errorStorage.logError({
      error_code: 'ERR-TEST-002',
      error_message: 'Test error 2',
      error_details: 'Details 2',
      context: 'Test Context 2',
      severity: 'low',
      resolved: false,
    });
    
    console.log('  Created errors:', ref1, ref2);
    
    // الحصول على جميع الأخطاء
    const allErrors = await errorStorage.getAllErrors();
    console.log('  ✅ All errors count:', allErrors.length);
    
    // البحث
    const searchResults = await errorStorage.searchErrors('Test error 1');
    console.log('  ✅ Search results:', searchResults.length);
    
    // وضع علامة كمحلول
    const resolved = await errorStorage.markAsResolved(ref1, 'test-user', 'Fixed');
    console.log('  ✅ Mark as resolved:', resolved);
    
    // الإحصائيات
    const stats = await errorStorage.getErrorStats();
    console.log('  ✅ Stats:', stats);
    
    return allErrors.length === 2 && searchResults.length > 0 && resolved;
  } catch (error) {
    console.error('  ❌ Test failed:', error);
    return false;
  }
}

/**
 * اختبار 5: مستويات الخطورة
 */
export async function testSeverityLevels() {
  console.log('🧪 Test 5: Severity Levels');
  
  try {
    const severities: ('critical' | 'high' | 'medium' | 'low')[] = [
      'critical',
      'high', 
      'medium',
      'low'
    ];
    
    for (const severity of severities) {
      const testError = new Error(`Test ${severity} error`);
      const ref = await handleApiError(testError, {
        message: `Test ${severity} error`,
        context: 'Test - Severity',
        severity,
        userFriendlyMessage: `اختبار خطورة ${severity}`,
      });
      
      const savedError = await errorStorage.getErrorById(ref);
      console.log(`  ✅ ${severity} error saved:`, savedError?.severity === severity);
    }
    
    return true;
  } catch (error) {
    console.error('  ❌ Test failed:', error);
    return false;
  }
}

/**
 * اختبار 6: الفلترة
 */
export async function testFiltering() {
  console.log('🧪 Test 6: Filtering');
  
  try {
    // إنشاء أخطاء متنوعة
    await errorStorage.clearAllErrors();
    
    await errorStorage.logError({
      error_code: 'ERR-FILTER-001',
      error_message: 'Critical error',
      error_details: 'Details',
      context: 'Test',
      severity: 'critical',
      resolved: false,
    });
    
    await errorStorage.logError({
      error_code: 'ERR-FILTER-002',
      error_message: 'Low error',
      error_details: 'Details',
      context: 'Test',
      severity: 'low',
      resolved: true,
    });
    
    const allErrors = await errorStorage.getAllErrors();
    console.log('  Total errors:', allErrors.length);
    
    // فلترة حسب resolved
    const unresolved = allErrors.filter(e => !e.resolved);
    console.log('  ✅ Unresolved count:', unresolved.length);
    
    // فلترة حسب severity
    const critical = allErrors.filter(e => e.severity === 'critical');
    console.log('  ✅ Critical count:', critical.length);
    
    return unresolved.length === 1 && critical.length === 1;
  } catch (error) {
    console.error('  ❌ Test failed:', error);
    return false;
  }
}

/**
 * تشغيل جميع الاختبارات
 */
export async function runAllTests() {
  console.log('🚀 Starting All Tests...\n');
  
  const results = {
    test1: await testGenerateErrorReference(),
    test2: await testHandleApiError(),
    test3: testNotifications(),
    test4: await testErrorStorage(),
    test5: await testSeverityLevels(),
    test6: await testFiltering(),
  };
  
  console.log('\n📊 Test Results:');
  console.log('================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  console.log('\n' + (allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed'));
  
  return allPassed;
}

/**
 * مثال على الاستخدام في مكون React
 */
export const ExampleUsage = `
// في مكون React:

import { useState } from 'react';
import { LoadingButton } from '@/components/ui/loading-button';
import { handleApiError, showSuccessNotification } from '@/lib/error-handler';

function MyComponent() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.name || !formData.email) {
        toast({
          title: 'خطأ',
          description: 'الرجاء ملء جميع الحقول',
          variant: 'destructive'
        });
        return;
      }

      setIsSaving(true);
      
      // API call or save logic
      await api.save(formData);
      
      // Success
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        \`تمت إضافة \${formData.name} بنجاح\`
      );
      
      // Reset
      setFormData({ name: '', email: '' });
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في الحفظ',
        context: 'MyComponent - Save',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء حفظ البيانات',
        payload: formData,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LoadingButton 
      onClick={handleSave}
      loading={isSaving}
      loadingText="جاري الحفظ..."
      disabled={!formData.name || !formData.email}
    >
      حفظ
    </LoadingButton>
  );
}
`;

// تصدير جميع الاختبارات
export default {
  testGenerateErrorReference,
  testHandleApiError,
  testNotifications,
  testErrorStorage,
  testSeverityLevels,
  testFiltering,
  runAllTests,
  ExampleUsage,
};
