import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown } from 'lucide-react';

export default function DonorFunnelScreen() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen" dir="rtl">
      <h1 className="text-3xl font-bold text-slate-900">🌪️ رحلة المتبرع (Funnel Analytics)</h1>
      
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Stage 1 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-blue-900">مشاهدة الإعلان</h3>
              <p className="text-blue-600">عدد المشاهدات الفريدة</p>
            </div>
            <div className="text-3xl font-bold text-blue-800">150,000</div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <div className="bg-slate-200 px-4 py-1 rounded-full text-sm font-bold text-slate-600 flex items-center gap-1">
            <ArrowDown className="w-4 h-4" /> 12% نسبة النقر (CTR)
          </div>
        </div>

        {/* Stage 2 */}
        <Card className="bg-indigo-50 border-indigo-200 w-[90%] mx-auto">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-indigo-900">زيارة المتجر</h3>
              <p className="text-indigo-600">عدد الزوار</p>
            </div>
            <div className="text-3xl font-bold text-indigo-800">18,000</div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <div className="bg-slate-200 px-4 py-1 rounded-full text-sm font-bold text-slate-600 flex items-center gap-1">
            <ArrowDown className="w-4 h-4" /> 25% إضافة للسلة
          </div>
        </div>

        {/* Stage 3 */}
        <Card className="bg-purple-50 border-purple-200 w-[80%] mx-auto">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-purple-900">إضافة للسلة</h3>
              <p className="text-purple-600">بدء عملية التبرع</p>
            </div>
            <div className="text-3xl font-bold text-purple-800">4,500</div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <div className="bg-slate-200 px-4 py-1 rounded-full text-sm font-bold text-slate-600 flex items-center gap-1">
            <ArrowDown className="w-4 h-4" /> 60% إتمام التبرع
          </div>
        </div>

        {/* Stage 4 */}
        <Card className="bg-green-50 border-green-200 w-[70%] mx-auto shadow-lg ring-2 ring-green-100">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-green-900">تبرع ناجح</h3>
              <p className="text-green-600">عمليات مكتملة</p>
            </div>
            <div className="text-3xl font-bold text-green-800">2,700</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}