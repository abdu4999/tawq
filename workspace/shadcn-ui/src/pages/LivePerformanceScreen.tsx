import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabaseAPI, type Employee } from '@/lib/supabaseClient';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PerformanceRow {
  id: string;
  name: string;
  revenue: number;
  tasks: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  achievement: number;
}

export default function LivePerformanceScreen() {
  const [data, setData] = useState<PerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const employees = await supabaseAPI.getEmployees();

      const formatted: PerformanceRow[] = (employees || []).map((emp) => ({
        id: emp.id,
        name: emp.name,
        revenue: emp.total_revenue || 0,
        tasks: emp.completed_tasks || 0,
        target: emp.monthly_target || 100000,
        trend: emp.total_revenue > 50000 ? 'up' : emp.total_revenue < 20000 ? 'down' : 'stable',
        achievement: Math.round(((emp.total_revenue || 0) / (emp.monthly_target || 100000)) * 100),
      }));

      setData(formatted);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (achievement: number) => {
    if (achievement >= 80) return 'bg-green-500';
    if (achievement >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBg = (achievement: number) => {
    if (achievement >= 80) return 'bg-green-50 border-green-200';
    if (achievement >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Minus className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 animate-pulse" />
                <div>
                  <h1 className="text-3xl font-bold">شاشة الأداء الحي</h1>
                  <p className="text-sm text-blue-100">تحديث تلقائي كل 5 ثواني</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm text-blue-100">آخر تحديث</p>
                <p className="text-lg font-mono">{lastUpdate.toLocaleTimeString('ar-SA')}</p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Performance Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-right font-semibold">#</th>
                    <th className="px-6 py-4 text-right font-semibold">الاسم</th>
                    <th className="px-6 py-4 text-center font-semibold">الإيراد (ر.س)</th>
                    <th className="px-6 py-4 text-center font-semibold">المهام</th>
                    <th className="px-6 py-4 text-center font-semibold">الهدف</th>
                    <th className="px-6 py-4 text-center font-semibold">الإنجاز</th>
                    <th className="px-6 py-4 text-center font-semibold">الاتجاه</th>
                    <th className="px-6 py-4 text-center font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                        لا توجد بيانات
                      </td>
                    </tr>
                  ) : (
                    data.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`${getStatusBg(row.achievement)} hover:bg-opacity-70 transition-colors border`}
                      >
                        <td className="px-6 py-4 text-gray-900 font-bold">{index + 1}</td>
                        <td className="px-6 py-4 text-gray-900 font-semibold">{row.name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-mono text-lg font-bold text-gray-900">
                            {row.revenue.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-mono text-lg font-bold text-gray-900">{row.tasks}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700">
                          {row.target.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-bold text-xl text-gray-900">{row.achievement}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">{getTrendIcon(row.trend)}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`w-4 h-4 rounded-full ${getStatusColor(row.achievement)} mx-auto animate-pulse`} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-gray-300">ممتاز (80%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span className="text-gray-300">جيد (50-79%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-gray-300">يحتاج تحسين (&lt;50%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
