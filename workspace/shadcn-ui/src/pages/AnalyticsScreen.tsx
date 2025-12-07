import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, BarChart3, LineChart, PieChart, Lightbulb } from 'lucide-react';
import { supabaseAPI, type Transaction } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

type PeriodOption = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

const PERIOD_SETTINGS: Record<PeriodOption, { label: string; bucketSizeDays: number; buckets: number }> = {
  weekly: { label: 'أسبوعي', bucketSizeDays: 7, buckets: 8 },
  monthly: { label: 'شهري', bucketSizeDays: 30, buckets: 6 },
  quarterly: { label: 'ربع سنوي', bucketSizeDays: 90, buckets: 6 },
  yearly: { label: 'سنوي', bucketSizeDays: 365, buckets: 5 }
};

const STATUS_LABELS: Record<string, string> = {
  active: 'نشط',
  completed: 'مكتمل',
  on_hold: 'متوقف'
};

const DISTRIBUTION_COLORS = ['#6366f1', '#14b8a6', '#f97316', '#0ea5e9', '#f43f5e', '#facc15'];
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatCurrency = (value: number) => `${Math.round(value).toLocaleString()} ر.س`;

const formatBucketLabel = (period: PeriodOption, start: Date) => {
  if (period === 'yearly') {
    return start.getFullYear().toString();
  }
  if (period === 'quarterly') {
    const quarter = Math.floor(start.getMonth() / 3) + 1;
    return `ر${quarter} ${start.getFullYear()}`;
  }
  const options = period === 'monthly'
    ? { month: 'short' as const }
    : { month: 'short' as const, day: 'numeric' as const };
  return start.toLocaleDateString('ar-SA', options);
};

export default function AnalyticsScreen() {
  const [period, setPeriod] = useState<PeriodOption>('monthly');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData, transactionsData, employeesData] = await Promise.all([
        supabaseAPI.getTasks().catch(() => []),
        supabaseAPI.getProjects().catch(() => []),
        supabaseAPI.getTransactions().catch(() => []),
        supabaseAPI.getEmployees().catch(() => [])
      ]);

      setTasks(tasksData);
      setProjects(projectsData);
      setTransactions(transactionsData as Transaction[]);
      setEmployees(employeesData);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل التحليلات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [transactions]);

  const projectCompletionRate = useMemo(() => {
    if (!projects.length) return 0;
    const completed = projects.filter((p) => p.status === 'completed').length;
    return Math.round((completed / projects.length) * 100);
  }, [projects]);

  const taskStats = useMemo(() => {
    if (!tasks.length) {
      return { completed: 0, pending: 0, inProgress: 0, overdue: 0 };
    }
    const now = new Date();
    return tasks.reduce(
      (acc, task) => {
        if (task.status === 'completed') acc.completed += 1;
        if (task.status === 'pending') acc.pending += 1;
        if (task.status === 'in_progress') acc.inProgress += 1;
        if (task.due_date && task.status !== 'completed') {
          const dueDate = new Date(task.due_date);
          if (dueDate < now) acc.overdue += 1;
        }
        return acc;
      },
      { completed: 0, pending: 0, inProgress: 0, overdue: 0 }
    );
  }, [tasks]);

  const revenueTrendData = useMemo(() => {
    if (!transactions.length) return [] as Array<{ label: string; income: number; expense: number; net: number }>;
    const { bucketSizeDays, buckets } = PERIOD_SETTINGS[period];
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const bucketRanges = Array.from({ length: buckets }, (_, idx) => {
      const end = new Date(now.getTime() - idx * bucketSizeDays * DAY_IN_MS);
      const start = new Date(end.getTime() - bucketSizeDays * DAY_IN_MS);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }).reverse();

    const bucketData = bucketRanges.map(({ start, end }) => ({
      label: formatBucketLabel(period, start),
      income: 0,
      expense: 0,
      net: 0,
      start,
      end
    }));

    transactions.forEach((transaction) => {
      if (!transaction.date) return;
      const txDate = new Date(transaction.date);
      const bucket = bucketData.find(({ start, end }) => txDate > start && txDate <= end);
      if (!bucket) return;
      if (transaction.type === 'income') {
        bucket.income += transaction.amount || 0;
      } else {
        bucket.expense += transaction.amount || 0;
      }
      bucket.net = bucket.income - bucket.expense;
    });

    return bucketData.map(({ start, end, ...rest }) => rest);
  }, [transactions, period]);

  const projectDistributionData = useMemo(() => {
    if (!projects.length) return [] as Array<{ status: string; value: number; color: string }>;
    const counts = projects.reduce<Record<string, number>>((acc, project) => {
      const key = project.status || 'غير محدد';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([status, value], index) => ({
      status,
      value,
      color: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length]
    }));
  }, [projects]);

  const performanceSummary = useMemo(() => {
    if (!transactions.length) {
      return { current: 0, previous: 0, change: 0 };
    }

    const { bucketSizeDays } = PERIOD_SETTINGS[period];
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const currentStart = new Date(now.getTime() - bucketSizeDays * DAY_IN_MS);
    const previousStart = new Date(currentStart.getTime() - bucketSizeDays * DAY_IN_MS);

    let current = 0;
    let previous = 0;

    transactions.forEach((transaction) => {
      if (transaction.type !== 'income' || !transaction.date) return;
      const txDate = new Date(transaction.date);
      if (txDate > currentStart) {
        current += transaction.amount || 0;
      } else if (txDate > previousStart && txDate <= currentStart) {
        previous += transaction.amount || 0;
      }
    });

    const change = previous === 0
      ? (current > 0 ? 100 : 0)
      : ((current - previous) / previous) * 100;

    return { current, previous, change };
  }, [transactions, period]);

  const predictions = useMemo(() => {
    const predictedRevenue = performanceSummary.current
      ? performanceSummary.current * 1.08
      : totalIncome > 0
        ? totalIncome * 1.05
        : 75000;

    const topEmployee = employees.reduce<{ name: string; score: number } | null>((acc, employee) => {
      const score = Number(employee.performance_score ?? employee.points ?? 0);
      if (!acc || score > acc.score) {
        return { name: employee.name, score };
      }
      return acc;
    }, null);

    const completionConfidence = 80 + Math.min(15, projectCompletionRate / 5);

    return [
      {
        title: 'توقع الإيراد للفترة القادمة',
        value: formatCurrency(predictedRevenue),
        confidence: Math.min(95, Math.max(70, Math.round(performanceSummary.change + 80))),
      },
      {
        title: 'أفضل موظف متوقع',
        value: topEmployee?.name || 'غير محدد',
        confidence: Math.min(99, Math.max(75, Math.round((topEmployee?.score || 70)))),
      },
      {
        title: 'نسبة إنجاز المشاريع',
        value: `${projectCompletionRate}%`,
        confidence: Math.round(completionConfidence),
      }
    ];
  }, [performanceSummary, totalIncome, employees, projectCompletionRate]);

  const insights = useMemo(() => {
    if (!transactions.length && !tasks.length && !projects.length) return [] as string[];
    const taskCompletionRate = tasks.length ? Math.round((taskStats.completed / tasks.length) * 100) : 0;
    const activeProjects = projects.filter((p) => p.status === 'active').length;

    return [
      `إجمالي الإيرادات المسجلة حتى الآن ${formatCurrency(totalIncome)}`,
      taskStats.overdue
        ? `${taskStats.overdue} مهمة متأخرة تحتاج متابعة فورية`
        : 'لا توجد مهام متأخرة حالياً',
      `معدل إنجاز المهام ${taskCompletionRate}% من أصل ${tasks.length} مهمة`,
      `المشاريع النشطة الحالية ${activeProjects} من أصل ${projects.length}`
    ];
  }, [transactions.length, tasks.length, projects.length, taskStats, totalIncome]);

  if (loading && !transactions.length && !projects.length && !tasks.length) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحليل البيانات...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحليل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              التحليلات والتوقعات
            </h1>
          </div>
          <p className="text-gray-600">رؤى ذكية وتوقعات مستقبلية بالذكاء الاصطناعي</p>
        </div>

        {/* Period Selector */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h3 className="font-semibold">فترة التحليل</h3>
              <Select value={period} onValueChange={(value) => setPeriod(value as PeriodOption)}>
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="quarterly">ربع سنوي</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {lastUpdated && (
              <p className="text-xs text-gray-500 text-right">
                آخر تحديث: {new Date(lastUpdated).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Predictions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            التوقعات
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictions.map((prediction, index) => (
              <Card key={index} className="bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="text-base">{prediction.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-2xl font-bold text-blue-600">{prediction.value}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">مستوى الثقة</span>
                        <span className="font-bold">{prediction.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${prediction.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                اتجاه الإيرادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueTrendData.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueTrendData} margin={{ left: -10, right: 10 }}>
                    <defs>
                      <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#income)" name="الإيرادات" />
                    <Area type="monotone" dataKey="expense" stroke="#f97316" fillOpacity={1} fill="url(#expense)" name="المصروفات" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  لا توجد بيانات كافية للرسم البياني
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                توزيع المشاريع حسب الحالة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projectDistributionData.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={projectDistributionData}
                        dataKey="value"
                        nameKey="status"
                        outerRadius={90}
                        innerRadius={50}
                        label={({ status, value }) => `${STATUS_LABELS[status] || status}: ${value}`}
                      >
                        {projectDistributionData.map((entry, index) => (
                          <Cell key={`cell-${status}-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value, status) => [`${value}`, STATUS_LABELS[String(status)] || String(status)]} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  لا توجد مشاريع كافية لعرض التوزيع
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              رؤى AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {insights.map((insight, index) => (
                <li key={index} className="bg-white p-4 rounded-lg flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <p className="text-gray-700">{insight}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>مقارنة الأداء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">الفترة الحالية ({PERIOD_SETTINGS[period].label})</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(performanceSummary.current)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">الفترة السابقة</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(performanceSummary.previous)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">نسبة التغير</p>
                  <p className={`text-2xl font-bold ${performanceSummary.change >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    {`${performanceSummary.change >= 0 ? '+' : ''}${performanceSummary.change.toFixed(1)}%`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
