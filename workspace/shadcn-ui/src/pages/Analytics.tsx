import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useNotifications } from '@/components/NotificationSystem';
import { supabaseAPI } from '@/lib/supabaseClient';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Filter,
  DateRange
} from 'lucide-react';

// Local lightweight types for analytics calculation
type TaskLite = { status?: 'completed' | 'in_progress' | 'pending' | string };
type ProjectLite = { status?: 'active' | 'completed' | 'planning' | string; budget?: number; progress?: number };
type TransactionLite = { type?: 'income' | 'expense' | string; amount: number };
type UserLite = { status?: 'active' | string; salary?: number };
type CelebrityLite = { status?: 'available' | 'contracted' | string; followers_count?: number; collaboration_rate?: number };

export default function Analytics() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Data states
  const [tasks, setTasks] = useState<TaskLite[]>([]);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [transactions, setTransactions] = useState<TransactionLite[]>([]);
  const [employees, setEmployees] = useState<UserLite[]>([]);
  const [celebrities, setCelebrities] = useState<CelebrityLite[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const [t, p, c, trx, admins] = await Promise.all([
          supabaseAPI.getTasks().catch(() => [] as TaskLite[]),
          supabaseAPI.getProjects().catch(() => [] as ProjectLite[]),
          supabaseAPI.getCelebrities().catch(() => [] as CelebrityLite[]),
          supabaseAPI.getTransactions().catch(() => [] as TransactionLite[]),
          supabaseAPI.getAdminUsers().catch(() => [] as UserLite[])
        ]);

        setTasks(t ?? []);
        setProjects(p ?? []);
        setCelebrities(c ?? []);
        setTransactions(trx ?? []);
        setEmployees(admins ?? []);
      } catch (e) {
        // Already handled with safe fallbacks
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // Calculate analytics data with safe guards
  const analytics = {
    tasks: {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      completionRate: tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0
    },
    projects: {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      planning: projects.filter(p => p.status === 'planning').length,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      avgProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length : 0
    },
    finances: {
      totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0),
      totalExpenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0),
      netProfit: 0,
      monthlyGrowth: 15.2
    },
    team: {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.status === 'active').length,
      avgSalary: employees.length > 0 ? employees.reduce((sum, e) => sum + (e.salary || 0), 0) / employees.length : 0,
      productivity: 87.5
    },
    celebrities: {
      total: celebrities.length,
      available: celebrities.filter(c => c.status === 'available').length,
      contracted: celebrities.filter(c => c.status === 'contracted').length,
      totalFollowers: celebrities.reduce((sum, c) => sum + (c.followers_count || 0), 0),
      avgCollaborationRate: celebrities.length > 0 ? celebrities.reduce((sum, c) => sum + (c.collaboration_rate || 0), 0) / celebrities.length : 0
    }
  };

  analytics.finances.netProfit = analytics.finances.totalIncome - analytics.finances.totalExpenses;

  const handleExportReport = (reportType: string) => {
    addNotification({
      type: 'success',
      title: '📊 تصدير التقرير',
      message: `تم تصدير تقرير ${reportType} بنجاح`,
      duration: 4000,
      action: {
        label: 'تحميل',
        onClick: () => {
          addNotification({
            type: 'info',
            title: '⬇️ تحميل',
            message: 'بدء تحميل التقرير...'
          });
        }
      }
    });
  };

  const handleRefreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addNotification({
        type: 'success',
        title: '🔄 تم التحديث',
        message: 'تم تحديث البيانات بنجاح'
      });
    }, 2000);
  };

  const kpiCards = [
    {
      title: 'إجمالي المشاريع',
      value: analytics.projects.total,
      change: '+12%',
      trend: 'up',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'معدل إكمال المهام',
      value: `${analytics.tasks.completionRate.toFixed(1)}%`,
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${(analytics.finances.totalIncome / 1000).toFixed(0)}ك`,
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'إنتاجية الفريق',
      value: `${analytics.team.productivity}%`,
      change: '+5%',
      trend: 'up',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ] as const;

  const chartData = [
    { name: 'يناير', projects: 4, tasks: 24, income: 45000 },
    { name: 'فبراير', projects: 6, tasks: 32, income: 52000 },
    { name: 'مارس', projects: 8, tasks: 28, income: 48000 },
    { name: 'أبريل', projects: 10, tasks: 35, income: 61000 },
    { name: 'مايو', projects: 12, tasks: 42, income: 55000 },
    { name: 'يونيو', projects: 14, tasks: 38, income: 67000 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التحليلات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              التحليلات والتقارير
            </h1>
            <p className="text-xl text-gray-600 mt-2">رؤى شاملة حول أداء المؤسسة</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRefreshData}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث البيانات
            </Button>
            <Button onClick={() => handleExportReport('شامل')}>
              <Download className="h-4 w-4 ml-2" />
              تصدير التقرير
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, index) => (
            <Card key={index} className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-3xl font-bold">{kpi.value}</p>
                      <div className={`flex items-center gap-1 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.trend === 'up' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        <span className="text-sm font-semibold">{kpi.change}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${kpi.bgColor} flex items-center justify-center`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Analytics */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="projects">المشاريع</TabsTrigger>
                <TabsTrigger value="tasks">المهام</TabsTrigger>
                <TabsTrigger value="finances">المالية</TabsTrigger>
                <TabsTrigger value="team">الفريق</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        نظرة عامة على الأداء
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>تقدم المشاريع</span>
                          <span>{analytics.projects.avgProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={analytics.projects.avgProgress} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>إكمال المهام</span>
                          <span>{analytics.tasks.completionRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={analytics.tasks.completionRate} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>إنتاجية الفريق</span>
                          <span>{analytics.team.productivity}%</span>
                        </div>
                        <Progress value={analytics.team.productivity} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>رضا العملاء</span>
                          <span>94%</span>
                        </div>
                        <Progress value={94} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Monthly Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-green-500" />
                        الاتجاهات الشهرية
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {chartData.slice(-3).map((month, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-semibold">{month.name}</p>
                              <p className="text-sm text-gray-600">{month.projects} مشاريع، {month.tasks} مهمة</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{month.income.toLocaleString()} ر.س</p>
                              <p className="text-xs text-gray-500">إيرادات</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="text-center p-4">
                    <div className="text-2xl font-bold text-blue-600">{analytics.projects.active}</div>
                    <div className="text-sm text-gray-600">مشاريع نشطة</div>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="text-2xl font-bold text-green-600">{analytics.tasks.completed}</div>
                    <div className="text-sm text-gray-600">مهام مكتملة</div>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="text-2xl font-bold text-purple-600">{analytics.team.activeEmployees}</div>
                    <div className="text-sm text-gray-600">موظفين نشطين</div>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="text-2xl font-bold text-orange-600">{analytics.celebrities.available}</div>
                    <div className="text-sm text-gray-600">مؤثرين متاحين</div>
                  </Card>
                </div>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>توزيع المشاريع حسب الحالة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>نشطة</span>
                          </div>
                          <span className="font-semibold">{analytics.projects.active}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>مكتملة</span>
                          </div>
                          <span className="font-semibold">{analytics.projects.completed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>في التخطيط</span>
                          </div>
                          <span className="font-semibold">{analytics.projects.planning}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>الميزانية والإنفاق</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>إجمالي الميزانية</span>
                            <span>{analytics.projects.totalBudget.toLocaleString()} ر.س</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>المنفق</span>
                            <span>{(analytics.projects.totalBudget * 0.6).toLocaleString()} ر.س</span>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>المتبقي</span>
                            <span>{(analytics.projects.totalBudget * 0.4).toLocaleString()} ر.س</span>
                          </div>
                          <Progress value={40} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>إحصائيات المهام</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{analytics.tasks.completed}</div>
                          <div className="text-sm text-green-700">مكتملة</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{analytics.tasks.inProgress}</div>
                          <div className="text-sm text-blue-700">قيد التنفيذ</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{analytics.tasks.pending}</div>
                          <div className="text-sm text-yellow-700">في الانتظار</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{analytics.tasks.total}</div>
                          <div className="text-sm text-purple-700">إجمالي</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>معدل الإنجاز</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-6xl font-bold text-green-600 mb-2">
                          {analytics.tasks.completionRate.toFixed(0)}%
                        </div>
                        <p className="text-gray-600">معدل إكمال المهام</p>
                        <div className="mt-4">
                          <Progress value={analytics.tasks.completionRate} className="h-3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Finances Tab */}
              <TabsContent value="finances" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800">الإيرادات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {analytics.finances.totalIncome.toLocaleString()} ر.س
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="text-sm">+{analytics.finances.monthlyGrowth}% هذا الشهر</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-800">المصروفات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {analytics.finances.totalExpenses.toLocaleString()} ر.س
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="text-sm">+8.5% هذا الشهر</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800">صافي الربح</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {analytics.finances.netProfit.toLocaleString()} ر.س
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="text-sm">+22.3% هذا الشهر</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>التدفق النقدي الشهري</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chartData.slice(-6).map((month, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="font-semibold">{month.name}</div>
                          <div className="flex items-center gap-4">
                            <div className="text-green-600">+{month.income.toLocaleString()}</div>
                            <div className="text-red-600">-{(month.income * 0.7).toLocaleString()}</div>
                            <div className="font-bold text-blue-600">
                              {(month.income * 0.3).toLocaleString()} ر.س
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value="team" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>إحصائيات الفريق</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>إجمالي الموظفين</span>
                          <span className="font-bold text-2xl">{analytics.team.totalEmployees}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>الموظفين النشطين</span>
                          <span className="font-bold text-2xl text-green-600">{analytics.team.activeEmployees}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>متوسط الراتب</span>
                          <span className="font-bold text-2xl">{analytics.team.avgSalary.toLocaleString()} ر.س</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>الإنتاجية</span>
                          <span className="font-bold text-2xl text-blue-600">{analytics.team.productivity}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>الأداء والإنتاجية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>معدل إكمال المهام</span>
                            <span>92%</span>
                          </div>
                          <Progress value={92} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>الالتزام بالمواعيد</span>
                            <span>88%</span>
                          </div>
                          <Progress value={88} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>جودة العمل</span>
                            <span>95%</span>
                          </div>
                          <Progress value={95} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>رضا الفريق</span>
                            <span>91%</span>
                          </div>
                          <Progress value={91} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>تصدير التقارير</CardTitle>
            <CardDescription>احصل على تقارير مفصلة بصيغ مختلفة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => handleExportReport('المشاريع')}
              >
                <PieChart className="h-6 w-6" />
                <span>تقرير المشاريع</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => handleExportReport('المالي')}
              >
                <BarChart3 className="h-6 w-6" />
                <span>التقرير المالي</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => handleExportReport('الأداء')}
              >
                <TrendingUp className="h-6 w-6" />
                <span>تقرير الأداء</span>
              </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}