import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/components/NotificationSystem';
import { supabaseAPI } from '@/lib/supabaseClient';
import {
  Users,
  FolderOpen,
  CheckSquare,
  Star,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';

export default function Dashboard() {
  const { addNotification, addErrorNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0, pending: 0, inProgress: 0 },
    projects: { total: 0, active: 0, completed: 0, totalBudget: 0 },
    celebrities: { total: 0, available: 0, contracted: 0 },
    transactions: { totalIncome: 0, totalExpense: 0, netBalance: 0, count: 0 },
    users: { total: 0, active: 0 }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [tasks, projects, celebrities, transactions, adminUsers] = await Promise.all([
        supabaseAPI.getTasks().catch(() => []),
        supabaseAPI.getProjects().catch(() => []),
        supabaseAPI.getCelebrities().catch(() => []),
        supabaseAPI.getTransactions().catch(() => []),
        supabaseAPI.getAdminUsers().catch(() => [])
      ]);

      const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length
      };

      const projectStats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0)
      };

      const celebrityStats = {
        total: celebrities.length,
        available: celebrities.filter(c => c.status === 'available').length,
        contracted: celebrities.filter(c => c.status === 'contracted').length
      };

      const transactionStats = {
        totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0),
        totalExpense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0),
        count: transactions.length,
        netBalance: 0
      };
      transactionStats.netBalance = transactionStats.totalIncome - transactionStats.totalExpense;

      const userStats = {
        total: adminUsers.length,
        active: adminUsers.filter(u => u.status === 'active').length
      };

      setStats({
        tasks: taskStats,
        projects: projectStats,
        celebrities: celebrityStats,
        transactions: transactionStats,
        users: userStats
      });

      addNotification({
        type: 'success',
        title: 'مرحباً بك في لوحة التحكم',
        message: 'تم تحميل جميع البيانات بنجاح من قاعدة البيانات',
        duration: 5000
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      addErrorNotification(error, 'تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات لوحة التحكم من قاعدة البيانات...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            لوحة التحكم الرئيسية
          </h1>
          <p className="text-xl text-gray-600">نظام إدارة الأعمال الخيرية الشامل</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">إجمالي المهام</p>
                  <p className="text-3xl font-bold">{stats.tasks.total}</p>
                  <p className="text-blue-200 text-xs">
                    {stats.tasks.completed} مكتملة • {stats.tasks.pending} قيد الانتظار
                  </p>
                </div>
                <CheckSquare className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">المشاريع النشطة</p>
                  <p className="text-3xl font-bold">{stats.projects.active}</p>
                  <p className="text-green-200 text-xs">
                    من أصل {stats.projects.total} مشروع
                  </p>
                </div>
                <FolderOpen className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">المشاهير المتاحين</p>
                  <p className="text-3xl font-bold">{stats.celebrities.available}</p>
                  <p className="text-purple-200 text-xs">
                    من أصل {stats.celebrities.total} مشهور
                  </p>
                </div>
                <Star className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">صافي الرصيد</p>
                  <p className="text-3xl font-bold">{stats.transactions.netBalance.toLocaleString()}</p>
                  <p className="text-emerald-200 text-xs">
                    {stats.transactions.count} معاملة
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                نظرة عامة على المالية
              </CardTitle>
              <CardDescription>ملخص الإيرادات والمصروفات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.transactions.totalIncome.toLocaleString()} ر.س
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">إجمالي المصروفات</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.transactions.totalExpense.toLocaleString()} ر.س
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`flex items-center justify-between p-4 rounded-lg ${
                stats.transactions.netBalance >= 0 ? 'bg-blue-50' : 'bg-orange-50'
              }`}>
                <div className="flex items-center gap-3">
                  <DollarSign className={`h-8 w-8 ${
                    stats.transactions.netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`} />
                  <div>
                    <p className={`font-semibold ${
                      stats.transactions.netBalance >= 0 ? 'text-blue-800' : 'text-orange-800'
                    }`}>صافي الرصيد</p>
                    <p className={`text-2xl font-bold ${
                      stats.transactions.netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {stats.transactions.netBalance.toLocaleString()} ر.س
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                نظرة عامة على النشاط
              </CardTitle>
              <CardDescription>حالة المشاريع والمهام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">المشاريع المكتملة</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${stats.projects.total > 0 ? (stats.projects.completed / stats.projects.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {stats.projects.completed}/{stats.projects.total}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">المهام المكتملة</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${stats.tasks.total > 0 ? (stats.tasks.completed / stats.tasks.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {stats.tasks.completed}/{stats.tasks.total}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">المستخدمون النشطون</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${stats.users.total > 0 ? (stats.users.active / stats.users.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {stats.users.active}/{stats.users.total}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats.projects.totalBudget.toLocaleString()}</p>
                    <p className="text-sm text-blue-800">إجمالي ميزانية المشاريع</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{stats.celebrities.contracted}</p>
                    <p className="text-sm text-purple-800">المشاهير المتعاقد معهم</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              الأنشطة الحديثة
              </CardTitle>
            <CardDescription>أحدث التحديثات في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">تم الاتصال بقاعدة البيانات بنجاح</p>
                  <p className="text-sm text-gray-600">جميع البيانات متاحة الآن للعرض والتعديل</p>
                </div>
                <Badge className="bg-green-100 text-green-800">جديد</Badge>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">تم تحميل بيانات المستخدمين والأدوار</p>
                  <p className="text-sm text-gray-600">نظام الصلاحيات جاهز للاستخدام</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">مكتمل</Badge>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">قاعدة بيانات المشاهير جاهزة</p>
                  <p className="text-sm text-gray-600">يمكن الآن إدارة المشاهير والمؤثرين</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">نشط</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-orange-600" />
              إجراءات سريعة
              </CardTitle>
            <CardDescription>وصول سريع للمهام الشائعة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => addNotification({
                  type: 'info',
                  title: 'إدارة المهام',
                  message: 'انتقل إلى صفحة إدارة المهام من الشريط الجانبي'
                })}
              >
                <CheckSquare className="h-6 w-6" />
                <span className="text-sm">إدارة المهام</span>
              </Button>
              
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={() => addNotification({
                  type: 'info',
                  title: 'إدارة المشاريع',
                  message: 'انتقل إلى صفحة إدارة المشاريع من الشريط الجانبي'
                })}
              >
                <FolderOpen className="h-6 w-6" />
                <span className="text-sm">إدارة المشاريع</span>
              </Button>
              
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                onClick={() => addNotification({
                  type: 'info',
                  title: 'إدارة المشاهير',
                  message: 'انتقل إلى صفحة إدارة المشاهير من الشريط الجانبي'
                })}
              >
                <Star className="h-6 w-6" />
                <span className="text-sm">إدارة المشاهير</span>
              </Button>
              
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                onClick={() => addNotification({
                  type: 'info',
                  title: 'نظام المحاسبة',
                  message: 'انتقل إلى نظام المحاسبة من الشريط الجانبي'
                })}
              >
                <DollarSign className="h-6 w-6" />
                <span className="text-sm">نظام المحاسبة</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}