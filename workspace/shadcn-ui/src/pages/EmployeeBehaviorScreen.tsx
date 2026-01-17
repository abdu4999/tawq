import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Brain, AlertCircle, Battery } from 'lucide-react';
import { useMicroMeasurement } from '@/hooks/useMicroMeasurement';

export default function EmployeeBehaviorScreen() {
  const { isTracking, sessionDuration } = useMicroMeasurement({
    screenName: 'EmployeeBehavior',
    employeeId: 'current-user', // This should come from auth context
    employeeName: 'Current User' // This should come from auth context
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🧘 مراقبة سلوك الموظف</h1>
          <p className="text-slate-600">تحليل الأداء، التركيز، ومؤشرات الاحتراق الوظيفي</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
          <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm font-medium">
            {isTracking ? 'التتبع نشط' : 'التتبع متوقف'}
          </span>
          <span className="text-xs text-slate-400 mr-2">
            {Math.floor(sessionDuration / 60)} دقيقة
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">مؤشر التركيز</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">85%</div>
            <p className="text-xs text-slate-400 mt-1">عالي جداً</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">مؤشر التشتت</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">12%</div>
            <p className="text-xs text-slate-400 mt-1">منخفض (جيد)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">مستوى الإرهاق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">طبيعي</div>
            <p className="text-xs text-slate-400 mt-1">لا توجد مخاطر</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Burnout Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">2.4/10</div>
            <p className="text-xs text-slate-400 mt-1">آمن</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="behavior" className="w-full">
        <TabsList>
          <TabsTrigger value="behavior">تحليل السلوك (Micro)</TabsTrigger>
          <TabsTrigger value="burnout">معمل الاحتراق (Burnout Lab)</TabsTrigger>
          <TabsTrigger value="recommendations">توصيات AI</TabsTrigger>
        </TabsList>

        <TabsContent value="behavior" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  نشاط الجلسة الحالية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                  رسم بياني للنقرات والتنقل (Micro Measurement)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  خريطة التشتت (Confusion Map)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                  خريطة حرارية للأماكن التي تسبب حيرة للموظف
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="burnout" className="mt-6">
          <Card className="border-red-100 bg-red-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Battery className="h-5 w-5" />
                تحليل مخاطر الاحتراق الوظيفي
              </CardTitle>
              <CardDescription>يتم التحليل بناءً على ساعات العمل، نمط التفاعل، والأخطاء المتكررة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                  <span>الإرهاق الذهني</span>
                  <span className="text-green-600 font-bold">منخفض</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                  <span>تراجع الجودة</span>
                  <span className="text-green-600 font-bold">لا يوجد</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                  <span>ساعات العمل المتواصلة</span>
                  <span className="text-yellow-600 font-bold">متوسط (4 ساعات)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Brain className="h-5 w-5" />
                توصيات الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded mt-1">تحسين</span>
                  <p className="text-slate-700">الموظف يقضي وقتاً طويلاً في شاشة "إدخال البيانات". نقترح تفعيل ميزة الملء التلقائي.</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded mt-1">توجيه</span>
                  <p className="text-slate-700">مستوى التركيز ممتاز في الفترة الصباحية. يفضل جدولة المهام الصعبة قبل الساعة 12 ظهراً.</p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}