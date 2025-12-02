import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/Sidebar';
import { Target, TrendingUp, Award, Zap, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function EmployeeDashboard() {
  const [employee] = useState({
    name: 'أحمد محمد',
    role: 'موظف',
    points: 850,
    rank: 3,
    tasksCompleted: 24,
    tasksInProgress: 5,
    revenue: 45000,
    target: 50000
  });

  const [tasks] = useState([
    {
      id: 1,
      title: 'التواصل مع متبرع محتمل',
      priority: 'high',
      dueDate: '2025-12-05',
      status: 'in_progress'
    },
    {
      id: 2,
      title: 'إعداد تقرير المشروع',
      priority: 'medium',
      dueDate: '2025-12-07',
      status: 'pending'
    },
    {
      id: 3,
      title: 'متابعة حملة المشاهير',
      priority: 'high',
      dueDate: '2025-12-06',
      status: 'in_progress'
    }
  ]);

  const progress = Math.round((employee.revenue / employee.target) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 mr-80 p-6 space-y-6">
        {/* Welcome */}
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-2">مرحباً، {employee.name}</h1>
            <p className="text-blue-100">لديك {employee.tasksInProgress} مهام قيد التنفيذ</p>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100">الإيراد</p>
                  <p className="text-2xl font-bold">{employee.revenue.toLocaleString()}</p>
                  <p className="text-xs text-green-100">من {employee.target.toLocaleString()}</p>
                </div>
                <Target className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">المهام المنجزة</p>
                  <p className="text-3xl font-bold">{employee.tasksCompleted}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">النقاط</p>
                  <p className="text-3xl font-bold">{employee.points}</p>
                </div>
                <Award className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100">الترتيب</p>
                  <p className="text-3xl font-bold">#{employee.rank}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              تقدم الهدف الشهري
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{progress}%</span>
                <span className="text-gray-600">
                  {employee.revenue.toLocaleString()} / {employee.target.toLocaleString()} ر.س
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    progress >= 100 ? 'bg-green-500' :
                    progress >= 70 ? 'bg-blue-500' :
                    progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {progress >= 100 ? '🎉 تهانينا! لقد حققت هدفك' :
                 `باقي ${(employee.target - employee.revenue).toLocaleString()} ر.س لتحقيق الهدف`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              مهامي الحالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        <Badge variant={
                          task.priority === 'high' ? 'destructive' :
                          task.priority === 'medium' ? 'warning' : 'default'
                        }>
                          {task.priority === 'high' ? 'عاجل' :
                           task.priority === 'medium' ? 'متوسط' : 'عادي'}
                        </Badge>
                        <Badge variant={task.status === 'in_progress' ? 'info' : 'secondary'}>
                          {task.status === 'in_progress' ? 'قيد التنفيذ' : 'انتظار'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>الاستحقاق: {task.dueDate}</span>
                      </div>
                    </div>
                    <Button size="sm">عرض التفاصيل</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 mx-auto mb-3 text-purple-600" />
              <h3 className="font-bold mb-1">لوحة المتصدرين</h3>
              <p className="text-sm text-gray-600">انظر ترتيبك</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 mx-auto mb-3 text-blue-600" />
              <h3 className="font-bold mb-1">الأداء المباشر</h3>
              <p className="text-sm text-gray-600">تابع أداءك</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <h3 className="font-bold mb-1">المهام</h3>
              <p className="text-sm text-gray-600">إدارة المهام</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
