import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProjectStorage } from '../lib/project-storage';
import { FinanceStorage } from '../lib/finance-storage';
import { GamificationStorage } from '../lib/gamification-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedTasks: number;
  pendingTasks: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  userPoints: number;
  userRank: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    userPoints: 0,
    userRank: 0
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = () => {
    // Load projects and tasks
    const projects = ProjectStorage.getProjects();
    const tasks = ProjectStorage.getTasks();
    
    // Load financial data
    const financialSummary = FinanceStorage.getOverallFinancialSummary();
    
    // Load gamification data
    const userPoints = user ? GamificationStorage.getUserPoints(user.id) : 0;
    const leaderboardData = GamificationStorage.getLeaderboard();
    const userRank = leaderboardData.find(entry => entry.userId === user?.id)?.rank || 0;

    // Calculate stats
    const userTasks = user ? ProjectStorage.getUserTasks(user.id) : [];
    const completedTasks = userTasks.filter(task => task.status === 'completed').length;
    const pendingTasks = userTasks.filter(task => task.status !== 'completed').length;

    setStats({
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedTasks,
      pendingTasks,
      totalRevenue: financialSummary.totalRevenue,
      totalExpenses: financialSummary.totalExpenses,
      netProfit: financialSummary.netProfit,
      userPoints,
      userRank
    });

    setRecentTasks(userTasks.slice(0, 5));
    setLeaderboard(leaderboardData.slice(0, 5));
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 80) return 'text-green-600';
    if (performance >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (performance: number) => {
    if (performance >= 80) return <Badge variant="default" className="bg-green-100 text-green-800">ممتاز</Badge>;
    if (performance >= 60) return <Badge variant="default" className="bg-yellow-100 text-yellow-800">متوسط</Badge>;
    return <Badge variant="default" className="bg-red-100 text-red-800">منخفض</Badge>;
  };

  const calculatePerformance = () => {
    const totalTasks = stats.completedTasks + stats.pendingTasks;
    return totalTasks > 0 ? Math.round((stats.completedTasks / totalTasks) * 100) : 0;
  };

  const performance = calculatePerformance();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">
          أهلاً بك، {user?.name} 👋
        </h1>
        <p className="text-blue-100">
          نظام قياس وتطور - ما لا يمكن قياسه لا يمكن تطويره
        </p>
      </div>

      {/* Performance Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>مؤشر الأداء</span>
            {getPerformanceBadge(performance)}
          </CardTitle>
          <CardDescription>
            تقدمك في إنجاز المهام هذا الشهر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>مستوى الأداء</span>
              <span className={getPerformanceColor(performance)}>
                {performance}%
              </span>
            </div>
            <Progress value={performance} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats.completedTasks} مهام مكتملة</span>
              <span>{stats.pendingTasks} مهام قيد التنفيذ</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المشاريع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} مشروع نشط
            </p>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المهام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingTasks} مهام معلقة
            </p>
          </CardContent>
        </Card>

        {/* Financial Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الأداء المالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.netProfit.toLocaleString()} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              صافي الربح
            </p>
          </CardContent>
        </Card>

        {/* Points Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">النقاط</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userPoints}</div>
            <p className="text-xs text-muted-foreground">
              المرتبة {stats.userRank}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>المهام الأخيرة</CardTitle>
            <CardDescription>آخر 5 مهام تم تعيينها لك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <p className="text-xs text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <Badge variant={
                    task.status === 'completed' ? 'default' :
                    task.status === 'in-progress' ? 'secondary' : 'outline'
                  }>
                    {task.status === 'completed' ? 'مكتمل' :
                     task.status === 'in-progress' ? 'قيد التنفيذ' : 'معلق'}
                  </Badge>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <p className="text-center text-gray-500 text-sm">لا توجد مهام حالياً</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>لوحة المتصدرين</CardTitle>
            <CardDescription>أفضل 5 موظفين هذا الأسبوع</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div key={entry.userId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      entry.rank === 1 ? 'bg-yellow-500' :
                      entry.rank === 2 ? 'bg-gray-400' :
                      entry.rank === 3 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {entry.rank}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{entry.userName}</h4>
                      <p className="text-xs text-gray-500">{entry.totalPoints} نقطة</p>
                    </div>
                  </div>
                  {entry.userId === user?.id && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      أنت
                    </Badge>
                  )}
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-center text-gray-500 text-sm">لا توجد بيانات للمتصدرين</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
          <CardDescription>الوصول السريع للميزات المهمة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex-col">
              <span>📋</span>
              <span className="text-xs mt-1">المهام</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <span>📊</span>
              <span className="text-xs mt-1">التقارير</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <span>🏆</span>
              <span className="text-xs mt-1">التحديات</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <span>💰</span>
              <span className="text-xs mt-1">المالية</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};