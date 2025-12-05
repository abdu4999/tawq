import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Clock, FileText, AlertTriangle } from 'lucide-react';
import { mandatoryWorkflow } from '@/lib/mandatory-workflow';

export default function MandatoryWorkflowScreen() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">📋 الخطوات الإلزامية للمشاريع</h1>
          <p className="text-slate-600">ضمان الجودة والامتثال من خلال مسارات عمل إجبارية</p>
        </div>
        <Button>
          مشروع جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="cursor-pointer border-blue-500 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-800">حملة رمضان 1446</h3>
                <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded">قيد التنفيذ</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-500 mb-1">
                  <span>التقدم</span>
                  <span>65%</span>
                </div>
                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-[65%]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-slate-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-800">مشروع كسوة الشتاء</h3>
                <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded">متوقف</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-500 mb-1">
                  <span>التقدم</span>
                  <span>30%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 w-[30%]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Steps */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>خطوات التنفيذ: حملة رمضان 1446</CardTitle>
              <CardDescription>يجب إكمال جميع الخطوات للانتقال للمرحلة التالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:right-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                
                {/* Step 1: Completed */}
                <div className="relative flex gap-4">
                  <div className="z-10 flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-500">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-bold text-slate-800">اعتماد الميزانية والموافقات</h4>
                    <p className="text-sm text-slate-500 mt-1">تم الاعتماد من قبل المدير المالي</p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                        <FileText className="w-3 h-3" /> budget_approval.pdf
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 pt-1">10:00 AM</div>
                </div>

                {/* Step 2: Completed */}
                <div className="relative flex gap-4">
                  <div className="z-10 flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-500">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-bold text-slate-800">تجهيز المواد الإبداعية</h4>
                    <p className="text-sm text-slate-500 mt-1">تم رفع التصاميم والفيديوهات</p>
                  </div>
                  <div className="text-sm text-slate-400 pt-1">11:30 AM</div>
                </div>

                {/* Step 3: Current */}
                <div className="relative flex gap-4">
                  <div className="z-10 flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-500 animate-pulse">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-bold text-blue-700">إعداد صفحة الهبوط (Landing Page)</h4>
                    <p className="text-sm text-slate-600 mt-1">مطلوب: رابط الصفحة + التأكد من عمل بكسل التتبع</p>
                    <div className="mt-4 p-4 bg-slate-50 rounded border border-slate-200">
                      <label className="block text-sm font-medium mb-2">رابط الصفحة</label>
                      <div className="flex gap-2">
                        <input type="text" className="flex-1 border rounded px-3 py-2" placeholder="https://..." />
                        <Button size="sm">تحقق</Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4: Pending */}
                <div className="relative flex gap-4 opacity-50">
                  <div className="z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-slate-300">
                    <Circle className="w-6 h-6 text-slate-300" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-bold text-slate-800">إطلاق الحملة الإعلانية</h4>
                    <p className="text-sm text-slate-500 mt-1">تتطلب إكمال الخطوة السابقة</p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}