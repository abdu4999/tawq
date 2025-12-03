import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/lib/store';

export default function PerformanceChart() {
  const { employees, tasks } = useStore();

  // حساب إحصائيات الأداء
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const totalPoints = employees.reduce((sum, emp) => sum + emp.points, 0);
  const totalEarnings = employees.reduce((sum, emp) => sum + emp.totalEarnings, 0);

  // بيانات تجريبية للرسم البياني
  const monthlyData = [
    { month: 'يناير', tasks: 45, points: 2250, earnings: 18500 },
    { month: 'فبراير', tasks: 52, points: 2600, earnings: 21200 },
    { month: 'مارس', tasks: 48, points: 2400, earnings: 19800 },
    { month: 'أبريل', tasks: 58, points: 2900, earnings: 24100 },
    { month: 'مايو', tasks: 61, points: 3050, earnings: 25800 },
    { month: 'يونيو', tasks: 55, points: 2750, earnings: 23200 }
  ];

  const departmentData = [
    { department: 'التسويق', employees: 2, points: 1570, earnings: 22300 },
    { department: 'التطوير', employees: 2, points: 1410, earnings: 18700 },
    { department: 'الإدارة', employees: 1, points: 920, earnings: 15200 },
    { department: 'التصميم', employees: 1, points: 580, earnings: 7200 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 تحليل الأداء</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="monthly">الأداء الشهري</TabsTrigger>
            <TabsTrigger value="departments">الأقسام</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
                <div className="text-sm text-blue-600">إجمالي المهام</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-sm text-green-600">مهام مكتملة</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{inProgressTasks}</div>
                <div className="text-sm text-yellow-600">قيد التنفيذ</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{pendingTasks}</div>
                <div className="text-sm text-red-600">في الانتظار</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">معدل الإنجاز</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{completionRate.toFixed(1)}%</span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">إجمالي النقاط</h4>
                <div className="text-2xl font-bold text-purple-600">{totalPoints.toLocaleString()}</div>
                <div className="text-sm text-gray-500">نقطة مكتسبة</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="font-medium">{data.month}</div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{data.tasks}</div>
                      <div className="text-gray-500">مهمة</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">{data.points}</div>
                      <div className="text-gray-500">نقطة</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{data.earnings.toLocaleString()}</div>
                      <div className="text-gray-500">ر.س</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <div className="space-y-4">
              {departmentData.map((dept, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">{dept.department}</h4>
                    <span className="text-sm text-gray-500">{dept.employees} موظف</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="font-bold text-purple-600">{dept.points}</div>
                      <div className="text-xs text-purple-600">نقطة</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="font-bold text-green-600">{dept.earnings.toLocaleString()}</div>
                      <div className="text-xs text-green-600">ر.س</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}