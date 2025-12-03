// اختبار سريع لنظام حفظ التمرير
// يمكن حذف هذا الملف بعد التأكد من عمل النظام

import { useEffect } from 'react';

export function testScrollMemory() {
  console.log('🧪 اختبار نظام حفظ التمرير');
  
  // فحص وجود ScrollContext
  try {
    const hasScrollProvider = sessionStorage !== undefined;
    console.log(hasScrollProvider ? '✅ SessionStorage متاح' : '❌ SessionStorage غير متاح');
  } catch (e) {
    console.error('❌ خطأ في الوصول لـ SessionStorage:', e);
  }
  
  // فحص حفظ واسترجاع بسيط
  try {
    const testKey = 'test-scroll-memory';
    const testValue = 1234;
    
    sessionStorage.setItem(`scroll-${testKey}`, testValue.toString());
    const retrieved = sessionStorage.getItem(`scroll-${testKey}`);
    
    if (retrieved === testValue.toString()) {
      console.log('✅ الحفظ والاسترجاع يعملان بشكل صحيح');
      sessionStorage.removeItem(`scroll-${testKey}`);
    } else {
      console.log('❌ مشكلة في الحفظ والاسترجاع');
    }
  } catch (e) {
    console.error('❌ خطأ في اختبار الحفظ:', e);
  }
  
  console.log('🏁 انتهى الاختبار');
}

// استخدم هذا Hook في أي صفحة لاختبار النظام
export function useScrollTest() {
  useEffect(() => {
    testScrollMemory();
  }, []);
}
