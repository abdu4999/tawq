import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Award, BookOpen, TrendingUp } from 'lucide-react';
import { idpSystem } from '@/lib/idp-system';

export default function EmployeeIdpScreen() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">📈 خطة التطوير الفردية (IDP)</h1>
          <p className="text-slate-600">مسار نمو الموظف، الأهداف، والتدريب المخصص</p>
        </div>
        <Button variant="outline">
          تحديث التقييم
        </Button>
      </div>

      {/* Employee Summary */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              SA
            </div>
            <div>
              <h2 className="text-2xl font-bold">سارة أحمد</h2>
              <p className="text-indigo-100">أخصائي تسويق رقمي • المستوى 3</p>
            </div>
            <div className="mr-auto text-center">
              <div className="text-3xl font-bold">85%</div>
              <div className="text-xs text-indigo-100">معدل النمو</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 30-Day Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-blue-600" />
              أهداف الـ 30 يوم القادمة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <div className="flex justify-between mb-2">
                <span className="font-medium">إتقان تحليل Google Analytics 4</span>
                <span className="text-sm text-blue-600">70%</span>
              </div>
              <Progress value={70} className="h-2" />
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <div className="flex justify-between mb-2">
                <span className="font-medium">إدارة حملة تيك توك بميزانية 5000 ريال</span>
                <span className="text-sm text-slate-500">0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* 90-Day Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-purple-600" />
              أهداف الـ 90 يوم (ربع سنوية)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <div className="flex justify-between mb-2">
                <span className="font-medium">الحصول على شهادة Meta Blueprint</span>
                <span className="text-sm text-green-600">20%</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <Card className="bg-green-50 border-green-100">
          <CardHeader>
            <CardTitle className="text-green-800 text-lg">نقاط القوة 💪</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-green-700 space-y-1">
              <li>كتابة المحتوى الإبداعي</li>
              <li>التواصل مع المؤثرين</li>
              <li>إدارة الوقت</li>
            </ul>
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="bg-red-50 border-red-100">
          <CardHeader>
            <CardTitle className="text-red-800 text-lg">نقاط التحسين 🎯</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              <li>التحليل المالي للحملات</li>
              <li>استخدام أدوات التصميم (Photoshop)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Recommended Training */}
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-800 text-lg">تدريب مقترح 📚</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-blue-700">
                <BookOpen className="w-4 h-4" />
                <span>دورة التحليل المالي لغير الماليين</span>
              </li>
              <li className="flex items-center gap-2 text-blue-700">
                <BookOpen className="w-4 h-4" />
                <span>أساسيات التصميم الجرافيكي</span>
              </li>
            </ul>
            <Button size="sm" className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              الذهاب لمنصة التدريب
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}