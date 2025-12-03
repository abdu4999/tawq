import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Sidebar from '@/components/Sidebar';
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';

export default function InfluencerRevenueScreen() {
  const [period, setPeriod] = useState('monthly');

  const stats = {
    totalRevenue: 450000,
    paidOut: 320000,
    pending: 130000,
    monthlyAvg: 56250
  };

  const revenueData = [
    { month: 'يناير', revenue: 45000, commission: 6750, paid: true },
    { month: 'فبراير', revenue: 38000, commission: 5700, paid: true },
    { month: 'مارس', revenue: 52000, commission: 7800, paid: true },
    { month: 'أبريل', revenue: 61000, commission: 9150, paid: true },
    { month: 'مايو', revenue: 48000, commission: 7200, paid: false },
    { month: 'يونيو', revenue: 55000, commission: 8250, paid: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 mr-80 p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <DollarSign className="h-12 w-12 text-green-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              إيرادات المشاهير
            </h1>
          </div>
          <p className="text-gray-600">متابعة إيرادات وعمولات المشاهير</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100">إجمالي الإيراد</p>
                  <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-100">ر.س</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">المدفوع</p>
                  <p className="text-2xl font-bold">{stats.paidOut.toLocaleString()}</p>
                  <p className="text-xs text-blue-100">ر.س</p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-100">قيد الانتظار</p>
                  <p className="text-2xl font-bold">{stats.pending.toLocaleString()}</p>
                  <p className="text-xs text-yellow-100">ر.س</p>
                </div>
                <Calendar className="h-10 w-10 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">متوسط شهري</p>
                  <p className="text-2xl font-bold">{stats.monthlyAvg.toLocaleString()}</p>
                  <p className="text-xs text-purple-100">ر.س</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                </SelectContent>
              </Select>
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                تصدير التقرير
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Table */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${item.paid ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <p className="font-semibold">{item.month}</p>
                      <p className="text-sm text-gray-500">
                        {item.paid ? 'مدفوع' : 'قيد الانتظار'}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-gray-900">
                      {item.revenue.toLocaleString()} ر.س
                    </p>
                    <p className="text-sm text-green-600">
                      عمولة: {item.commission.toLocaleString()} ر.س
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
