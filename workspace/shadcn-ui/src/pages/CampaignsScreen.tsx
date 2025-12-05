import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, DollarSign, BarChart2, Users } from 'lucide-react';

export default function CampaignsScreen() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">📢 إدارة الحملات التسويقية</h1>
          <p className="text-slate-600">تتبع أداء الحملات، المصروفات، والعائد على الإعلان (ROAS)</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Megaphone className="ml-2 h-4 w-4" />
          حملة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-500">إجمالي المصروف</p>
                <h3 className="text-2xl font-bold text-slate-900">45,200 ر.س</h3>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-500">إجمالي العائد</p>
                <h3 className="text-2xl font-bold text-slate-900">189,500 ر.س</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-500">ROAS</p>
                <h3 className="text-2xl font-bold text-slate-900">4.19x</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-500">المتبرعون الجدد</p>
                <h3 className="text-2xl font-bold text-slate-900">1,240</h3>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الحملات النشطة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            جدول الحملات (سناب شات، تيك توك، جوجل) سيظهر هنا
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrendingUpIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}