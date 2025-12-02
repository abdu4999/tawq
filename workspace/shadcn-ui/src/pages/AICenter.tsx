import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/components/NotificationSystem';
import Sidebar from '@/components/Sidebar';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  Heart,
  Clock,
  Shield,
  Lightbulb,
  Eye,
  MapPin,
  UserX,
  Flame,
  Monitor,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import {
  AIEngine,
  EmployeeIntelligenceMap,
  TurnoverRiskAssessment,
  IntelligentTaskAssignment,
  SystemUsageMetrics,
  BurnoutIndicator
} from '@/lib/ai-engine';
import { Employee, Task } from '@/lib/types';

// Mock data for demonstration
const mockEmployees: Employee[] = [
  { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', role: 'employee', points: 850, monthlyTarget: 10000, yearlyTarget: 120000, currentRevenue: 8500, tasksCompleted: 45, rank: 1, strengths: ['إدارة الوقت', 'التواصل'], weaknesses: ['التخطيط طويل المدى'] },
  { id: '2', name: 'سارة علي', email: 'sara@example.com', role: 'employee', points: 720, monthlyTarget: 8000, yearlyTarget: 96000, currentRevenue: 7200, tasksCompleted: 38, rank: 2, strengths: ['العمل الجماعي', 'الإبداع'], weaknesses: ['إدارة الضغوط'] },
  { id: '3', name: 'محمد خالد', email: 'mohammed@example.com', role: 'employee', points: 580, monthlyTarget: 7000, yearlyTarget: 84000, currentRevenue: 5800, tasksCompleted: 32, rank: 3, strengths: ['التحليل', 'حل المشكلات'], weaknesses: ['التواصل'] },
  { id: '4', name: 'فاطمة حسن', email: 'fatima@example.com', role: 'employee', points: 420, monthlyTarget: 6000, yearlyTarget: 72000, currentRevenue: 4200, tasksCompleted: 25, rank: 4, strengths: ['الدقة', 'الالتزام'], weaknesses: ['السرعة'] },
  { id: '5', name: 'عمر يوسف', email: 'omar@example.com', role: 'employee', points: 350, monthlyTarget: 5000, yearlyTarget: 60000, currentRevenue: 3500, tasksCompleted: 20, rank: 5, strengths: ['المرونة'], weaknesses: ['التخطيط', 'التنظيم'] },
];

const mockTasks: Task[] = [
  { id: '1', title: 'تصميم واجهة المستخدم', description: 'تصميم واجهة جديدة للتطبيق', assignedTo: ['1', '2'], projectId: 'p1', priority: 5, status: 'completed', dueDate: new Date('2024-12-15'), points: 100, createdBy: 'admin', createdAt: new Date('2024-11-01') },
  { id: '2', title: 'تطوير API', description: 'تطوير واجهات برمجية', assignedTo: ['1', '3'], projectId: 'p1', priority: 4, status: 'in-progress', dueDate: new Date('2024-12-20'), points: 150, createdBy: 'admin', createdAt: new Date('2024-11-10') },
  { id: '3', title: 'اختبار النظام', description: 'اختبار شامل للنظام', assignedTo: ['2', '4'], projectId: 'p2', priority: 3, status: 'pending', dueDate: new Date('2024-12-25'), points: 80, createdBy: 'admin', createdAt: new Date('2024-11-15') },
  { id: '4', title: 'كتابة التوثيق', description: 'توثيق النظام والأكواد', assignedTo: ['3', '5'], projectId: 'p2', priority: 2, status: 'pending', dueDate: new Date('2024-12-30'), points: 60, createdBy: 'admin', createdAt: new Date('2024-11-20') },
  { id: '5', title: 'مراجعة الأداء', description: 'تحسين أداء التطبيق', assignedTo: ['1'], projectId: 'p1', priority: 4, status: 'in-progress', dueDate: new Date('2024-12-10'), points: 120, createdBy: 'admin', createdAt: new Date('2024-11-05') },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AICenter() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // AI Center Data States
  const [intelligenceMaps, setIntelligenceMaps] = useState<EmployeeIntelligenceMap[]>([]);
  const [turnoverRisks, setTurnoverRisks] = useState<TurnoverRiskAssessment[]>([]);
  const [taskAssignments, setTaskAssignments] = useState<IntelligentTaskAssignment[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<SystemUsageMetrics[]>([]);
  const [burnoutIndicators, setBurnoutIndicators] = useState<BurnoutIndicator[]>([]);

  useEffect(() => {
    loadAICenterData();
  }, []);

  const loadAICenterData = async () => {
    setLoading(true);
    try {
      // Generate AI analysis for all employees
      const maps: EmployeeIntelligenceMap[] = [];
      const risks: TurnoverRiskAssessment[] = [];
      const usage: SystemUsageMetrics[] = [];
      const burnout: BurnoutIndicator[] = [];

      for (const employee of mockEmployees) {
        maps.push(AIEngine.generateEmployeeIntelligenceMap(employee, mockTasks));
        risks.push(AIEngine.assessTurnoverRisk(employee, mockTasks));
        usage.push(AIEngine.analyzeSystemUsage(employee, mockTasks));
        burnout.push(AIEngine.analyzeBurnoutIndicators(employee, mockTasks));
      }

      // Generate intelligent task assignments
      const assignments: IntelligentTaskAssignment[] = mockTasks
        .filter(t => t.status !== 'completed')
        .map(task => AIEngine.generateIntelligentTaskAssignment(task, mockEmployees, mockTasks));

      setIntelligenceMaps(maps);
      setTurnoverRisks(risks);
      setTaskAssignments(assignments);
      setUsageMetrics(usage);
      setBurnoutIndicators(burnout);

      addNotification({
        type: 'achievement',
        title: '🧠 مركز الذكاء الاصطناعي',
        message: 'تم تحليل جميع البيانات بنجاح',
        duration: 5000
      });
    } catch (error) {
      console.error('Error loading AI Center data:', error);
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'حدث خطأ أثناء تحميل بيانات مركز الذكاء الاصطناعي'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const getOverviewStats = () => {
    const avgPerformance = intelligenceMaps.reduce((sum, m) => sum + m.overallRating, 0) / (intelligenceMaps.length || 1);
    const highRiskCount = turnoverRisks.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length;
    const burnoutAlerts = burnoutIndicators.filter(b => b.burnoutLevel === 'severe' || b.burnoutLevel === 'moderate').length;
    const avgUsage = usageMetrics.reduce((sum, u) => sum + u.productiveTime, 0) / (usageMetrics.length || 1);

    return { avgPerformance, highRiskCount, burnoutAlerts, avgUsage };
  };

  const stats = getOverviewStats();

  // Chart data
  const performanceChartData = intelligenceMaps.map(m => ({
    name: m.employeeName.split(' ')[0],
    أداء: m.performanceScore,
    تعاون: m.collaborationScore,
    ابتكار: m.innovationScore,
    قيادة: m.leadershipPotential
  }));

  const turnoverPieData = [
    { name: 'خطر منخفض', value: turnoverRisks.filter(r => r.riskLevel === 'low').length, color: '#10B981' },
    { name: 'خطر متوسط', value: turnoverRisks.filter(r => r.riskLevel === 'medium').length, color: '#F59E0B' },
    { name: 'خطر عالي', value: turnoverRisks.filter(r => r.riskLevel === 'high').length, color: '#EF4444' },
    { name: 'خطر حرج', value: turnoverRisks.filter(r => r.riskLevel === 'critical').length, color: '#7C2D12' },
  ].filter(d => d.value > 0);

  const usageChartData = usageMetrics.map(u => ({
    name: u.employeeName.split(' ')[0],
    إنتاجية: u.productiveTime,
    خمول: u.idleTime,
    تسجيلات: u.loginFrequency
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
              <Brain className="h-8 w-8 text-purple-400 absolute top-4 left-1/2 -translate-x-1/2 animate-pulse" />
            </div>
            <p className="text-purple-200 text-lg">جاري تحليل البيانات بالذكاء الاصطناعي...</p>
            <p className="text-purple-400 text-sm mt-2">يرجى الانتظار لحظات</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 lg:mr-80 p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-12 w-12 text-purple-400 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              مركز الذكاء الاصطناعي
            </h1>
          </div>
          <p className="text-xl text-purple-200">تحليلات متقدمة ورؤى ذكية لتحسين الأداء المؤسسي</p>
          <Button
            onClick={loadAICenterData}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث التحليلات
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">متوسط الأداء</p>
                  <p className="text-3xl font-bold">{Math.round(stats.avgPerformance)}%</p>
                  <div className="flex items-center mt-1 text-blue-200 text-xs">
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                    <span>+5% من الشهر الماضي</span>
                  </div>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${stats.highRiskCount > 0 ? 'from-red-600 to-red-700' : 'from-green-600 to-green-700'} text-white border-0 shadow-xl`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">مخاطر دوران عالية</p>
                  <p className="text-3xl font-bold">{stats.highRiskCount}</p>
                  <p className="text-white/60 text-xs mt-1">موظفين بحاجة للمتابعة</p>
                </div>
                <UserX className="h-12 w-12 text-white/60" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${stats.burnoutAlerts > 0 ? 'from-orange-600 to-orange-700' : 'from-emerald-600 to-emerald-700'} text-white border-0 shadow-xl`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">تنبيهات الإرهاق</p>
                  <p className="text-3xl font-bold">{stats.burnoutAlerts}</p>
                  <p className="text-white/60 text-xs mt-1">موظفين بحاجة للدعم</p>
                </div>
                <Flame className="h-12 w-12 text-white/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">متوسط الإنتاجية</p>
                  <p className="text-3xl font-bold">{stats.avgUsage.toFixed(1)} ساعة</p>
                  <p className="text-purple-200 text-xs mt-1">يومياً لكل موظف</p>
                </div>
                <Monitor className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-200">
              <BarChart3 className="h-4 w-4 ml-2" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-200">
              <MapPin className="h-4 w-4 ml-2" />
              خريطة الذكاء
            </TabsTrigger>
            <TabsTrigger value="turnover" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-200">
              <Shield className="h-4 w-4 ml-2" />
              مخاطر الدوران
            </TabsTrigger>
            <TabsTrigger value="burnout" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-200">
              <Heart className="h-4 w-4 ml-2" />
              مراقبة الإرهاق
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-200">
              <Target className="h-4 w-4 ml-2" />
              توزيع المهام
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    مقارنة أداء الموظفين
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    تحليل شامل لمؤشرات الأداء الرئيسية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend />
                      <Bar dataKey="أداء" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="تعاون" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ابتكار" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="قيادة" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Turnover Risk Pie Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-400" />
                    توزيع مخاطر الدوران
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    تصنيف الموظفين حسب مستوى خطر المغادرة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={turnoverPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {turnoverPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* System Usage Chart */}
              <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-purple-400" />
                    استخدام النظام والإنتاجية
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    تحليل ساعات العمل والنشاط اليومي
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={usageChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" width={80} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend />
                      <Bar dataKey="إنتاجية" fill="#10B981" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="خمول" fill="#EF4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {turnoverRisks
                .filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical')
                .slice(0, 3)
                .map(risk => (
                  <Alert key={risk.employeeId} className="bg-red-900/30 border-red-800 text-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertTitle className="text-red-300">{risk.employeeName}</AlertTitle>
                    <AlertDescription className="text-red-200">
                      خطر دوران {risk.riskLevel === 'critical' ? 'حرج' : 'عالي'} - 
                      {risk.predictedTimeToLeave && ` متوقع المغادرة خلال ${risk.predictedTimeToLeave} يوم`}
                    </AlertDescription>
                  </Alert>
                ))}
              {burnoutIndicators
                .filter(b => b.burnoutLevel === 'severe')
                .slice(0, 3 - turnoverRisks.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length)
                .map(burnout => (
                  <Alert key={burnout.employeeId} className="bg-orange-900/30 border-orange-800 text-orange-200">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <AlertTitle className="text-orange-300">{burnout.employeeName}</AlertTitle>
                    <AlertDescription className="text-orange-200">
                      مستوى إرهاق شديد ({burnout.burnoutScore}%) - يحتاج تدخل فوري
                    </AlertDescription>
                  </Alert>
                ))}
            </div>
          </TabsContent>

          {/* Intelligence Map Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {intelligenceMaps.map(map => (
                <Card key={map.employeeId} className="bg-slate-800/50 border-slate-700 hover:border-purple-600/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-purple-500">
                          <AvatarFallback className="bg-purple-600 text-white">
                            {map.employeeName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-white">{map.employeeName}</CardTitle>
                          <CardDescription className="text-slate-400">
                            التقييم الكلي: {map.overallRating}%
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={`${
                        map.overallRating >= 80 ? 'bg-green-600' :
                        map.overallRating >= 60 ? 'bg-blue-600' :
                        map.overallRating >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                      } text-white`}>
                        {map.overallRating >= 80 ? 'ممتاز' :
                         map.overallRating >= 60 ? 'جيد جداً' :
                         map.overallRating >= 40 ? 'جيد' : 'يحتاج تحسين'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Radar Chart */}
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={map.skillMatrix.slice(0, 6).map(s => ({
                          skill: s.skillName,
                          current: s.currentLevel,
                          target: s.targetLevel
                        }))}>
                          <PolarGrid stroke="#475569" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                          <Radar name="الحالي" dataKey="current" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                          <Radar name="الهدف" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-blue-900/30 rounded-lg">
                        <p className="text-blue-400 text-xs">الأداء</p>
                        <p className="text-white font-bold">{Math.round(map.performanceScore)}%</p>
                      </div>
                      <div className="p-2 bg-green-900/30 rounded-lg">
                        <p className="text-green-400 text-xs">التعاون</p>
                        <p className="text-white font-bold">{Math.round(map.collaborationScore)}%</p>
                      </div>
                      <div className="p-2 bg-purple-900/30 rounded-lg">
                        <p className="text-purple-400 text-xs">القيادة</p>
                        <p className="text-white font-bold">{Math.round(map.leadershipPotential)}%</p>
                      </div>
                    </div>

                    {/* Skills Progress */}
                    <div className="space-y-2">
                      {map.skillMatrix.slice(0, 4).map((skill, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">{skill.skillName}</span>
                            <span className="text-slate-300">{Math.round(skill.currentLevel)}%</span>
                          </div>
                          <Progress 
                            value={skill.currentLevel} 
                            className="h-1.5 bg-slate-700"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Turnover Risk Tab */}
          <TabsContent value="turnover" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {turnoverRisks.sort((a, b) => b.riskScore - a.riskScore).map(risk => (
                <Card key={risk.employeeId} className={`border-2 ${
                  risk.riskLevel === 'critical' ? 'bg-red-900/20 border-red-700' :
                  risk.riskLevel === 'high' ? 'bg-orange-900/20 border-orange-700' :
                  risk.riskLevel === 'medium' ? 'bg-yellow-900/20 border-yellow-700' :
                  'bg-green-900/20 border-green-700'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className={`h-14 w-14 border-2 ${
                          risk.riskLevel === 'critical' ? 'border-red-500' :
                          risk.riskLevel === 'high' ? 'border-orange-500' :
                          risk.riskLevel === 'medium' ? 'border-yellow-500' : 'border-green-500'
                        }`}>
                          <AvatarFallback className={`text-white ${
                            risk.riskLevel === 'critical' ? 'bg-red-600' :
                            risk.riskLevel === 'high' ? 'bg-orange-600' :
                            risk.riskLevel === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                          }`}>
                            {risk.employeeName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-white text-xl">{risk.employeeName}</CardTitle>
                          <CardDescription className="text-slate-300">
                            نسبة الخطر: {risk.riskScore}% | 
                            {risk.predictedTimeToLeave && ` متوقع المغادرة خلال ${risk.predictedTimeToLeave} يوم`}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={`text-lg px-4 py-2 ${
                        risk.riskLevel === 'critical' ? 'bg-red-600' :
                        risk.riskLevel === 'high' ? 'bg-orange-600' :
                        risk.riskLevel === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                      } text-white`}>
                        {risk.riskLevel === 'critical' ? 'حرج' :
                         risk.riskLevel === 'high' ? 'عالي' :
                         risk.riskLevel === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Risk Factors */}
                    <div>
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        عوامل الخطر
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {risk.factors.map((factor, index) => (
                          <div key={index} className="p-3 bg-slate-800/50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-slate-300 font-medium">{factor.name}</span>
                              <Badge variant="outline" className={`${
                                factor.impact > 20 ? 'border-red-500 text-red-400' :
                                factor.impact > 10 ? 'border-yellow-500 text-yellow-400' :
                                'border-green-500 text-green-400'
                              }`}>
                                تأثير: {factor.impact}%
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm">{factor.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Retention Strategies */}
                    <div>
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-400" />
                        استراتيجيات الاحتفاظ
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {risk.retentionStrategies.map((strategy, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-900/50 text-blue-200 hover:bg-blue-800/50">
                            {strategy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Burnout Monitoring Tab */}
          <TabsContent value="burnout" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {burnoutIndicators.sort((a, b) => b.burnoutScore - a.burnoutScore).map(burnout => (
                <Card key={burnout.employeeId} className={`border ${
                  burnout.burnoutLevel === 'severe' ? 'bg-red-900/20 border-red-700' :
                  burnout.burnoutLevel === 'moderate' ? 'bg-orange-900/20 border-orange-700' :
                  burnout.burnoutLevel === 'mild' ? 'bg-yellow-900/20 border-yellow-700' :
                  'bg-green-900/20 border-green-700'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${
                          burnout.burnoutLevel === 'severe' ? 'bg-red-600' :
                          burnout.burnoutLevel === 'moderate' ? 'bg-orange-600' :
                          burnout.burnoutLevel === 'mild' ? 'bg-yellow-600' : 'bg-green-600'
                        }`}>
                          {burnout.burnoutLevel === 'healthy' ? (
                            <CheckCircle2 className="h-6 w-6 text-white" />
                          ) : (
                            <Flame className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-white">{burnout.employeeName}</CardTitle>
                          <CardDescription className="text-slate-400">
                            مستوى الإرهاق: {burnout.burnoutScore}%
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={`${
                        burnout.burnoutLevel === 'severe' ? 'bg-red-600' :
                        burnout.burnoutLevel === 'moderate' ? 'bg-orange-600' :
                        burnout.burnoutLevel === 'mild' ? 'bg-yellow-600' : 'bg-green-600'
                      } text-white`}>
                        {burnout.burnoutLevel === 'severe' ? 'شديد' :
                         burnout.burnoutLevel === 'moderate' ? 'متوسط' :
                         burnout.burnoutLevel === 'mild' ? 'خفيف' : 'صحي'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Burnout Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">مستوى الإرهاق</span>
                        <span className={`font-bold ${
                          burnout.burnoutScore > 60 ? 'text-red-400' :
                          burnout.burnoutScore > 30 ? 'text-yellow-400' : 'text-green-400'
                        }`}>{burnout.burnoutScore}%</span>
                      </div>
                      <Progress 
                        value={burnout.burnoutScore} 
                        className={`h-3 ${
                          burnout.burnoutScore > 60 ? '[&>div]:bg-red-500' :
                          burnout.burnoutScore > 30 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                        }`}
                      />
                    </div>

                    {/* Workload Balance */}
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">توازن العمل</span>
                        <div className="flex items-center gap-2">
                          {burnout.workloadBalance < 0 ? (
                            <ArrowDownRight className="h-4 w-4 text-red-400" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-green-400" />
                          )}
                          <span className={`font-bold ${
                            burnout.workloadBalance < -30 ? 'text-red-400' :
                            burnout.workloadBalance < 0 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {burnout.workloadBalance > 0 ? '+' : ''}{burnout.workloadBalance}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Indicators */}
                    <div className="space-y-2">
                      <h4 className="text-slate-300 text-sm font-medium">المؤشرات</h4>
                      {burnout.indicators.map((indicator, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">{indicator.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${
                              indicator.trend === 'worsening' ? 'border-red-500 text-red-400' :
                              indicator.trend === 'improving' ? 'border-green-500 text-green-400' :
                              'border-slate-500 text-slate-400'
                            }`}>
                              {indicator.trend === 'worsening' ? '↓ يتدهور' :
                               indicator.trend === 'improving' ? '↑ يتحسن' : '→ مستقر'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    {burnout.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-slate-300 text-sm font-medium mb-2">التوصيات</h4>
                        <ul className="space-y-1">
                          {burnout.recommendations.slice(0, 3).map((rec, index) => (
                            <li key={index} className="text-slate-400 text-sm flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Intelligent Task Assignment Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {taskAssignments.map(assignment => (
                <Card key={assignment.taskId} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-400" />
                          {assignment.taskTitle}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {assignment.assignmentReason}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-purple-500 text-purple-300">
                          <Clock className="h-3 w-3 ml-1" />
                          {assignment.predictedCompletionTime} ساعة
                        </Badge>
                        <Badge className={`${
                          assignment.predictedSuccessRate >= 80 ? 'bg-green-600' :
                          assignment.predictedSuccessRate >= 60 ? 'bg-blue-600' : 'bg-yellow-600'
                        } text-white`}>
                          نسبة النجاح: {assignment.predictedSuccessRate}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        المرشحون المقترحون
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {assignment.recommendedEmployees.map((employee, index) => (
                          <div 
                            key={employee.employeeId}
                            className={`p-4 rounded-lg border ${
                              index === 0 ? 'bg-purple-900/30 border-purple-600' : 'bg-slate-700/50 border-slate-600'
                            }`}
                          >
                            <div className="text-center space-y-2">
                              <Avatar className={`h-12 w-12 mx-auto ${index === 0 ? 'ring-2 ring-purple-500' : ''}`}>
                                <AvatarFallback className={`${
                                  index === 0 ? 'bg-purple-600' : 'bg-slate-600'
                                } text-white`}>
                                  {employee.employeeName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white font-medium text-sm">{employee.employeeName}</p>
                                <p className="text-slate-400 text-xs">تطابق: {employee.matchScore}%</p>
                              </div>
                              <div className="flex items-center justify-center gap-1">
                                {employee.availability ? (
                                  <Badge className="bg-green-600/50 text-green-300 text-xs">متاح</Badge>
                                ) : (
                                  <Badge className="bg-red-600/50 text-red-300 text-xs">مشغول</Badge>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">
                                عبء العمل: {employee.currentWorkload}%
                              </div>
                              {index === 0 && (
                                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-xs mt-2">
                                  تعيين المهمة
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
