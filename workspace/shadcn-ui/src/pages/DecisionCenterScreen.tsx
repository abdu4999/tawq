import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Users, Target } from 'lucide-react';
import { aiDecisionEngine } from '@/lib/ai-auto-decision';
import { influencerPrediction } from '@/lib/influencer-prediction';
import { taskDistributor } from '@/lib/smart-task-distribution';

export default function DecisionCenterScreen() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🧠 مركز ذكاء القرار</h1>
          <p className="text-slate-600">اتخاذ قرارات استراتيجية مدعومة بالذكاء الاصطناعي والتنبؤات</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Brain className="ml-2 h-4 w-4" />
          تحليل جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Target className="ml-2" />
              تنبؤات المؤثرين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">94%</div>
            <p className="text-sm text-slate-500">دقة التنبؤ بالعائد (ROI)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Users className="ml-2" />
              توزيع المهام الذكي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">RAG</div>
            <p className="text-sm text-slate-500">توزيع بناءً على الجاهزية والنمو</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <CheckCircle className="ml-2" />
              القرارات الآلية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">12</div>
            <p className="text-sm text-slate-500">قرار مقترح اليوم</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="influencers" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="influencers">تنبؤات المؤثرين</TabsTrigger>
          <TabsTrigger value="tasks">توزيع المهام (RAG)</TabsTrigger>
          <TabsTrigger value="decisions">محرك القرارات</TabsTrigger>
        </TabsList>

        <TabsContent value="influencers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليل العائد المتوقع للمؤثرين</CardTitle>
              <CardDescription>توصيات بالتعاون بناءً على تحليل البيانات التاريخية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                سيتم عرض جدول التنبؤات هنا باستخدام influencer-prediction.ts
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>التوزيع الذكي للمهام</CardTitle>
              <CardDescription>توزيع المهام بناءً على الحالة النفسية والمهارية للموظف</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                سيتم عرض مصفوفة التوزيع هنا باستخدام smart-task-distribution.ts
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}