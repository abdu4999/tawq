import React from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/NotificationSystem';

export default function TestErrorPage() {
  const { addErrorNotification } = useNotifications();

  const testNetworkError = () => {
    addErrorNotification(new Error('Network connection failed'), 'Network Request');
  };

  const testDatabaseError = () => {
    addErrorNotification(new Error('Database query timeout'), 'Database Query');
  };

  const testValidationError = () => {
    addErrorNotification(new Error('Invalid input data'), 'Form Validation');
  };

  const testUnknownError = () => {
    addErrorNotification(new Error('Something unexpected happened'), 'Unknown Context');
  };

  return (
    <div className="space-y-6" dir="rtl">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            صفحة اختبار الأخطاء
          </h1>
          <p className="text-xl text-gray-600">اختبار نظام تسجيل الأخطاء والإشعارات</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-4">اختبار أنواع الأخطاء</h3>
            <div className="space-y-3">
              <Button onClick={testNetworkError} variant="outline" className="w-full">
                اختبار خطأ الشبكة
              </Button>
              <Button onClick={testDatabaseError} variant="outline" className="w-full">
                اختبار خطأ قاعدة البيانات
              </Button>
              <Button onClick={testValidationError} variant="outline" className="w-full">
                اختبار خطأ التحقق
              </Button>
              <Button onClick={testUnknownError} variant="outline" className="w-full">
                اختبار خطأ غير معروف
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-4">التعليمات</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• سيتم عرض رقم مرجعي فقط للمستخدم</p>
              <p>• سيتم حفظ تفاصيل الخطأ الكاملة في صفحة إدارة الأخطاء</p>
              <p>• يمكن للمسؤولين عرض التفاصيل الكاملة في لوحة التحكم</p>
              <p>• الأخطاء مسجلة في قاعدة البيانات وذاكرة النظام</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-4xl mx-auto">
          <h4 className="font-semibold text-yellow-800 mb-2">ما سيحدث:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• سيظهر إشعار خطأ باللغة العربية</li>
            <li>• سيتم عرض رقم مرجعي فقط (بدون تفاصيل الخطأ)</li>
            <li>• سيتم حفظ الخطأ في قاعدة البيانات</li>
            <li>• يمكن عرض التفاصيل الكاملة في صفحة إدارة الأخطاء</li>
          </ul>
        </div>
    </div>
  );
}