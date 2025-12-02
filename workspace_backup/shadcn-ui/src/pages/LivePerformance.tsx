import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Sidebar from '@/components/Sidebar';
import { useNotifications } from '@/components/NotificationSystem';
import { supabaseAPI } from '@/lib/supabaseClient';
import { RefreshCw, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  department: string;
  tasksCompleted: number;
  tasksTarget: number;
  revenue: number;
  revenueTarget: number;
  efficiency: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export default function LivePerformance() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [filterBy, setFilterBy] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadPerformanceData();
    // تحديث البيانات كل 10 ثوان
    const interval = setInterval(() => {
      loadPerformanceData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const [tasks, employees, projects] = await Promise.all([
        supabaseAPI.getTasks().catch(() => []),
        supabaseAPI.getAdminUsers().catch(() => []),
        supabaseAPI.getProjects().catch(() => [])
      ]);

      // حساب مؤشرات الأداء لكل موظف
      const performanceData: PerformanceMetric[] = employees.map(emp => {
        const empTasks = tasks.filter(t => t.assigned_to?.includes(emp.id));
        const completedTasks = empTasks.filter(t => t.status === 'completed').length;
        const totalTasks = empTasks.length;
        const tasksTarget = 10; // هدف شهري

        const empProjects = projects.filter(p => p.team_members?.includes(emp.id));
        const revenue = empProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const revenueTarget = 50000; // هدف شهري

        const efficiency = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // تحديد الحالة بناءً على الأداء
        let status: 'excellent' | 'good' | 'warning' | 'critical';
        if (efficiency >= 90 && revenue >= revenueTarget * 0.9) status = 'excellent';
        else if (efficiency >= 70 && revenue >= revenueTarget * 0.7) status = 'good';
        else if (efficiency >= 50 && revenue >= revenueTarget * 0.5) status = 'warning';
        else status = 'critical';

        return {
          id: emp.id,
          name: emp.name,
          department: 'الإدارة العامة',
          tasksCompleted: completedTasks,
          tasksTarget,
          revenue,
          revenueTarget,
          efficiency,
          status
        };
      });

      setMetrics(performanceData);
      setLastUpdate(new Date());

      if (!silent) {
        addNotification({
          type: 'success',
          title: '✅ تم تحديث البيانات',
          message: 'تم تحميل بيانات الأداء الحي بنجاح'
        });
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في التحميل',
        message: 'حدث خطأ أثناء تحميل بيانات الأداء'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-50 border-green-200';
      case 'good': return 'bg-blue-50 border-blue-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'critical': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredMetrics = filterBy === 'all' 
    ? metrics 
    : metrics.filter(m => m.status === filterBy);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات الأداء الحي...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 lg:mr-80 p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              شاشة الأداء الحي
            </h1>
            <p className="text-gray-600 mt-2">مراقبة الأداء في الوقت الفعلي</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
            </div>
            <Button onClick={() => loadPerformanceData()} variant="outline">
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-3xl font-bold mb-1">
                {metrics.filter(m => m.status === 'excellent').length}
              </div>
              <p className="text-green-100">أداء ممتاز</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">
                {metrics.filter(m => m.status === 'good').length}
              </div>
              <p className="text-blue-100">أداء جيد</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 mx-auto mb-3 text-yellow-200" />
              <div className="text-3xl font-bold mb-1">
                {metrics.filter(m => m.status === 'warning').length}
              </div>
              <p className="text-yellow-100">يحتاج متابعة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingDown className="h-8 w-8 mx-auto mb-3 text-red-200" />
              <div className="text-3xl font-bold mb-1">
                {metrics.filter(m => m.status === 'critical').length}
              </div>
              <p className="text-red-100">يحتاج تدخل</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="font-medium">تصفية حسب الحالة:</label>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="excellent">أداء ممتاز</SelectItem>
                  <SelectItem value="good">أداء جيد</SelectItem>
                  <SelectItem value="warning">يحتاج متابعة</SelectItem>
                  <SelectItem value="critical">يحتاج تدخل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>مؤشرات الأداء التفصيلية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3 font-semibold">الموظف</th>
                    <th className="text-right p-3 font-semibold">القسم</th>
                    <th className="text-center p-3 font-semibold">المهام المنجزة</th>
                    <th className="text-center p-3 font-semibold">هدف المهام</th>
                    <th className="text-center p-3 font-semibold">الإيراد</th>
                    <th className="text-center p-3 font-semibold">هدف الإيراد</th>
                    <th className="text-center p-3 font-semibold">الكفاءة</th>
                    <th className="text-center p-3 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMetrics.map((metric) => (
                    <tr 
                      key={metric.id} 
                      className={`border-b hover:bg-gray-50 transition-colors ${getStatusBg(metric.status)}`}
                    >
                      <td className="p-3 font-medium">{metric.name}</td>
                      <td className="p-3 text-gray-600">{metric.department}</td>
                      <td className={`p-3 text-center font-bold ${getStatusTextColor(metric.status)}`}>
                        {metric.tasksCompleted}
                      </td>
                      <td className="p-3 text-center text-gray-600">{metric.tasksTarget}</td>
                      <td className={`p-3 text-center font-bold ${getStatusTextColor(metric.status)}`}>
                        {metric.revenue.toLocaleString()} ر.س
                      </td>
                      <td className="p-3 text-center text-gray-600">
                        {metric.revenueTarget.toLocaleString()} ر.س
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getStatusColor(metric.status)}`}
                              style={{ width: `${metric.efficiency}%` }}
                            />
                          </div>
                          <span className={`font-bold ${getStatusTextColor(metric.status)}`}>
                            {metric.efficiency.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge className={`${getStatusColor(metric.status)} text-white`}>
                          {metric.status === 'excellent' && '⭐ ممتاز'}
                          {metric.status === 'good' && '✓ جيد'}
                          {metric.status === 'warning' && '⚠ تحذير'}
                          {metric.status === 'critical' && '❌ حرج'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredMetrics.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد بيانات مطابقة للفلتر المحدد
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle>دليل الألوان</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <div>
                  <p className="font-semibold">ممتاز</p>
                  <p className="text-sm text-gray-600">كفاءة ≥ 90% وإيراد ≥ 90%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <div>
                  <p className="font-semibold">جيد</p>
                  <p className="text-sm text-gray-600">كفاءة ≥ 70% وإيراد ≥ 70%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <div>
                  <p className="font-semibold">تحذير</p>
                  <p className="text-sm text-gray-600">كفاءة ≥ 50% وإيراد ≥ 50%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <div>
                  <p className="font-semibold">حرج</p>
                  <p className="text-sm text-gray-600">كفاءة {'<'} 50% أو إيراد {'<'} 50%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
