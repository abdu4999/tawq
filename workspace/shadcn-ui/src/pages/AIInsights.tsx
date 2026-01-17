import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, 
  Target, Zap, Heart, Activity, Users, Clock, BarChart3, FileText, 
  Shield, AlertCircle, Eye, Database, MousePointer, Keyboard, Monitor,
  UserX, Coffee, Award, BookOpen, Calendar, Play, Bell, Sparkles
} from 'lucide-react';
import { formatDateDMY } from '@/lib/date-utils';
import { 
  AIEngine, 
  AIRecommendation, 
  PsychologicalProfile,
  EmployeeIntelligenceMap,
  TurnoverRisk,
  IndividualDevelopmentPlan,
  NavigationBehavior,
  DataEntryQuality,
  SystemUsageMonitor,
  RealTimeAlert
} from '@/lib/ai-engine';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  BarChart, Bar, Cell, PieChart, Pie, Legend, Area, AreaChart
} from 'recharts';

interface PredictionResult {
  employeeId: string;
  employeeName: string;
  expectedPoints: number;
  expectedEarnings: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export default function AIInsights() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [psychProfiles, setPsychProfiles] = useState<PsychologicalProfile[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [intelligenceMaps, setIntelligenceMaps] = useState<EmployeeIntelligenceMap[]>([]);
  const [turnoverRisks, setTurnoverRisks] = useState<TurnoverRisk[]>([]);
  const [developmentPlans, setDevelopmentPlans] = useState<IndividualDevelopmentPlan[]>([]);
  const [navigationBehaviors, setNavigationBehaviors] = useState<NavigationBehavior[]>([]);
  const [dataEntryQuality, setDataEntryQuality] = useState<DataEntryQuality[]>([]);
  const [systemUsage, setSystemUsage] = useState<SystemUsageMonitor[]>([]);
  const [realTimeAlerts, setRealTimeAlerts] = useState<RealTimeAlert[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    // Load mock data
    const mockEmployees = [
      { id: '1', name: 'أحمد محمد', role: 'مدير', avatar: '', points: 850, totalEarnings: 12000 },
      { id: '2', name: 'فاطمة علي', role: 'موظف', avatar: '', points: 650, totalEarnings: 8500 },
      { id: '3', name: 'سارة أحمد', role: 'موظف', avatar: '', points: 420, totalEarnings: 5500 },
      { id: '4', name: 'محمد حسن', role: 'موظف', avatar: '', points: 780, totalEarnings: 9800 },
      { id: '5', name: 'نورة خالد', role: 'موظف', avatar: '', points: 320, totalEarnings: 4200 }
    ];
    
    const mockTasks = [
      { id: '1', assigneeId: '1', status: 'completed', priority: 'high', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '2', assigneeId: '2', status: 'pending', priority: 'medium', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '3', assigneeId: '3', status: 'completed', priority: 'low', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '4', assigneeId: '1', status: 'completed', priority: 'high', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '5', assigneeId: '4', status: 'in-progress', priority: 'high', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '6', assigneeId: '5', status: 'pending', priority: 'medium', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ];
    
    setEmployees(mockEmployees);
    setTasks(mockTasks);
  }, []);

  useEffect(() => {
    if (employees.length > 0 && tasks.length > 0) {
      generateAIInsights();
    }
  }, [employees, tasks]);

  const generateAIInsights = async () => {
    setIsAnalyzing(true);
    
    const allRecommendations: AIRecommendation[] = [];
    const allProfiles: PsychologicalProfile[] = [];
    const allPredictions: PredictionResult[] = [];
    const allIntelligenceMaps: EmployeeIntelligenceMap[] = [];
    const allTurnoverRisks: TurnoverRisk[] = [];
    const allDevelopmentPlans: IndividualDevelopmentPlan[] = [];
    const allNavigationBehaviors: NavigationBehavior[] = [];
    const allDataEntryQuality: DataEntryQuality[] = [];
    const allSystemUsage: SystemUsageMonitor[] = [];

    for (const employee of employees) {
      // التوصيات
      const empRecommendations = AIEngine.analyzeEmployeePerformance(employee, tasks);
      allRecommendations.push(...empRecommendations);

      // التحليل النفسي
      const psychProfile = AIEngine.analyzePsychologicalState(employee, tasks);
      allProfiles.push(psychProfile);

      // التنبؤات
      const prediction = AIEngine.predictFuturePerformance(employee, tasks);
      allPredictions.push({
        employeeId: employee.id,
        employeeName: employee.name,
        ...prediction
      });

      // خريطة الذكاء
      const intelligenceMap = AIEngine.generateEmployeeIntelligenceMap(employee, tasks);
      allIntelligenceMaps.push(intelligenceMap);

      // مخاطر الاستقالة
      const turnoverRisk = AIEngine.analyzeTurnoverRisk(employee, tasks);
      allTurnoverRisks.push(turnoverRisk);

      // خطة التطوير
      const developmentPlan = AIEngine.generateIndividualDevelopmentPlan(employee, tasks);
      allDevelopmentPlans.push(developmentPlan);

      // سلوك التصفح
      const navigationBehavior = AIEngine.analyzeNavigationBehavior(employee);
      allNavigationBehaviors.push(navigationBehavior);

      // جودة الإدخال
      const dataQuality = AIEngine.analyzeDataEntryQuality(employee, employees);
      allDataEntryQuality.push(dataQuality);

      // استخدام النظام
      const usage = AIEngine.monitorSystemUsage(employee);
      allSystemUsage.push(usage);
    }

    // التنبيهات الفورية
    const alerts = AIEngine.generateRealTimeAlerts(employees, tasks);

    setRecommendations(allRecommendations);
    setPsychProfiles(allProfiles);
    setPredictions(allPredictions);
    setIntelligenceMaps(allIntelligenceMaps);
    setTurnoverRisks(allTurnoverRisks);
    setDevelopmentPlans(allDevelopmentPlans);
    setNavigationBehaviors(allNavigationBehaviors);
    setDataEntryQuality(allDataEntryQuality);
    setSystemUsage(allSystemUsage);
    setRealTimeAlerts(alerts);
    setIsAnalyzing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white border-red-700';
      case 'high': return 'bg-orange-500 text-white border-orange-600';
      case 'medium': return 'bg-yellow-500 text-white border-yellow-600';
      case 'low': return 'bg-blue-500 text-white border-blue-600';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-12 w-12 text-indigo-600 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              🧠 مركز الذكاء الاصطناعي
            </h1>
          </div>
          <p className="text-gray-600 text-lg">نظام شامل لتحليل الأداء والتنبؤ والتطوير</p>
        </div>

        {/* Real-Time Alerts Section */}
        {realTimeAlerts.length > 0 && (
          <Card className="border-2 border-red-200 bg-red-50/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Bell className="h-6 w-6 animate-bounce" />
                تنبيهات فورية ({realTimeAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {realTimeAlerts.map((alert) => (
                    <Alert key={alert.id} className={`${getSeverityColor(alert.severity)} border-2`}>
                      <AlertCircle className="h-5 w-5" />
                      <AlertTitle className="font-bold">{alert.title}</AlertTitle>
                      <AlertDescription>
                        <div className="space-y-2 mt-2">
                          <p className="font-medium">{alert.employeeName}: {alert.message}</p>
                          <p className="text-xs opacity-90">{formatDateDMY(alert.timestamp)}</p>
                          {alert.actionRequired && (
                            <div className="mt-3 space-y-1">
                              <p className="font-semibold text-sm">إجراءات مقترحة:</p>
                              {alert.suggestedActions.map((action, idx) => (
                                <p key={idx} className="text-xs">• {action}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">موظفين نشطين</p>
                  <p className="text-3xl font-bold">{employees.length}</p>
                  <p className="text-xs text-blue-100 mt-1">تحت المراقبة</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">تنبيهات حرجة</p>
                  <p className="text-3xl font-bold">
                    {realTimeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
                  </p>
                  <p className="text-xs text-red-100 mt-1">تحتاج إجراء فوري</p>
                </div>
                <AlertTriangle className="h-12 w-12 text-red-200 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">مخاطر استقالة</p>
                  <p className="text-3xl font-bold">
                    {turnoverRisks.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high').length}
                  </p>
                  <p className="text-xs text-orange-100 mt-1">موظفين في خطر</p>
                </div>
                <UserX className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">أداء ممتاز</p>
                  <p className="text-3xl font-bold">
                    {predictions.filter(p => p.riskLevel === 'low').length}
                  </p>
                  <p className="text-xs text-green-100 mt-1">موظفين متميزين</p>
                </div>
                <Award className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto">
            <TabsTrigger value="overview" className="text-xs lg:text-sm">نظرة عامة</TabsTrigger>
            <TabsTrigger value="intelligence" className="text-xs lg:text-sm">خرائط الذكاء</TabsTrigger>
            <TabsTrigger value="turnover" className="text-xs lg:text-sm">مخاطر الاستقالة</TabsTrigger>
            <TabsTrigger value="psychology" className="text-xs lg:text-sm">التحليل النفسي</TabsTrigger>
            <TabsTrigger value="idp" className="text-xs lg:text-sm">خطط التطوير</TabsTrigger>
            <TabsTrigger value="behavior" className="text-xs lg:text-sm">السلوك والإدخال</TabsTrigger>
            <TabsTrigger value="usage" className="text-xs lg:text-sm">استخدام النظام</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    ملخص الأداء العام
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={employees.map(e => ({ name: e.name.split(' ')[0], points: e.points }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="points" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    توزيع المخاطر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'منخفض', value: turnoverRisks.filter(r => r.riskLevel === 'low').length, fill: '#10b981' },
                          { name: 'متوسط', value: turnoverRisks.filter(r => r.riskLevel === 'medium').length, fill: '#f59e0b' },
                          { name: 'عالي', value: turnoverRisks.filter(r => r.riskLevel === 'high').length, fill: '#f97316' },
                          { name: 'حرج', value: turnoverRisks.filter(r => r.riskLevel === 'critical').length, fill: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        dataKey="value"
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  أهم التوصيات الذكية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.slice(0, 5).map((rec) => {
                    const employee = employees.find(e => e.id === rec.employeeId);
                    return (
                      <div key={rec.id} className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                        <Target className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{rec.title}</p>
                            <Badge className={rec.priority === 'high' ? 'bg-red-500' : rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}>
                              {rec.priority === 'high' ? 'عالية' : rec.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{employee?.name}: {rec.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={rec.confidence * 100} className="w-20 h-2" />
                            <span className="text-xs text-gray-500">{Math.round(rec.confidence * 100)}% ثقة</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Intelligence Maps Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {intelligenceMaps.map((map) => {
                const employee = employees.find(e => e.id === map.employeeId);
                const skillsData = Object.entries(map.skills).map(([key, value]) => ({
                  skill: key.replace(/([A-Z])/g, ' $1').trim(),
                  value: value
                }));

                return (
                  <Card key={map.employeeId} className="hover:shadow-xl transition-all">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-indigo-600 text-white">{employee?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{employee?.name}</CardTitle>
                          <CardDescription>خريطة ذكاء الموظف</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={skillsData.slice(0, 6)}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          <Radar name="المهارات" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-semibold text-green-700 mb-1">نقاط القوة:</p>
                          <div className="flex flex-wrap gap-1">
                            {map.strengths.map((strength, idx) => (
                              <Badge key={idx} className="bg-green-100 text-green-700 border-green-300">{strength}</Badge>
                            ))}
                          </div>
                        </div>

                        {map.weaknesses.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-orange-700 mb-1">نقاط التحسين:</p>
                            <div className="flex flex-wrap gap-1">
                              {map.weaknesses.map((weakness, idx) => (
                                <Badge key={idx} className="bg-orange-100 text-orange-700 border-orange-300">{weakness}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t">
                          <p className="text-sm font-semibold mb-1">التوقعات:</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-blue-50 p-2 rounded">
                              <p className="text-xs text-gray-600">3 أشهر</p>
                              <p className="font-bold text-blue-700">{map.growthPrediction.threeMonths.toFixed(1)}%</p>
                            </div>
                            <div className="bg-purple-50 p-2 rounded">
                              <p className="text-xs text-gray-600">6 أشهر</p>
                              <p className="font-bold text-purple-700">{map.growthPrediction.sixMonths.toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Turnover Risk Tab */}
          <TabsContent value="turnover" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {turnoverRisks.map((risk) => {
                const employee = employees.find(e => e.id === risk.employeeId);
                return (
                  <Card key={risk.employeeId} className={`border-2 ${getRiskColor(risk.riskLevel)}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>{employee?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{employee?.name}</CardTitle>
                            <CardDescription>مؤشر مخاطر الاستقالة</CardDescription>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-4xl font-bold">{risk.riskScore}%</p>
                          <Badge className={getRiskColor(risk.riskLevel)}>
                            {risk.riskLevel === 'critical' ? 'حرج' : risk.riskLevel === 'high' ? 'عالي' : risk.riskLevel === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(risk.factors).slice(0, 8).map(([key, value]) => (
                          <div key={key} className="bg-white/50 p-2 rounded border">
                            <p className="text-xs text-gray-600 truncate">{key}</p>
                            <Progress value={value as number} className="h-1 mt-1" />
                            <p className="text-xs font-bold mt-1">{(value as number).toFixed(0)}%</p>
                          </div>
                        ))}
                      </div>

                      {risk.reasons.length > 0 && (
                        <Alert className="bg-white/70">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>الأسباب الرئيسية:</AlertTitle>
                          <AlertDescription>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                              {risk.reasons.map((reason, idx) => (
                                <li key={idx} className="text-sm">{reason}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="bg-white/70 p-4 rounded-lg border">
                        <p className="font-semibold mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          التوصيات العاجلة:
                        </p>
                        <ul className="space-y-1">
                          {risk.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Psychology Tab */}
          <TabsContent value="psychology" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {psychProfiles.map((profile) => {
                const employee = employees.find(e => e.id === profile.employeeId);
                return (
                  <Card key={profile.employeeId} className="hover:shadow-xl transition-all">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-purple-600 text-white">{employee?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{employee?.name}</CardTitle>
                          <CardDescription>التحليل النفسي</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        <div className={`p-3 rounded-lg text-center ${profile.motivation === 'high' ? 'bg-green-100 text-green-700' : profile.motivation === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          <Heart className="h-5 w-5 mx-auto mb-1" />
                          <p className="text-xs font-medium">الدافعية</p>
                          <p className="text-sm font-bold">{profile.motivation === 'high' ? 'عالية' : profile.motivation === 'medium' ? 'متوسطة' : 'منخفضة'}</p>
                        </div>
                        
                        <div className={`p-3 rounded-lg text-center ${profile.stress === 'low' ? 'bg-green-100 text-green-700' : profile.stress === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          <AlertTriangle className="h-5 w-5 mx-auto mb-1" />
                          <p className="text-xs font-medium">التوتر</p>
                          <p className="text-sm font-bold">{profile.stress === 'high' ? 'عالي' : profile.stress === 'medium' ? 'متوسط' : 'منخفض'}</p>
                        </div>

                        <div className={`p-3 rounded-lg text-center ${profile.engagement === 'high' ? 'bg-green-100 text-green-700' : profile.engagement === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          <Activity className="h-5 w-5 mx-auto mb-1" />
                          <p className="text-xs font-medium">المشاركة</p>
                          <p className="text-sm font-bold">{profile.engagement === 'high' ? 'عالية' : profile.engagement === 'medium' ? 'متوسطة' : 'منخفضة'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">مستوى الإرهاق:</span>
                          <span className={`font-bold ${profile.burnout > 60 ? 'text-red-600' : profile.burnout > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {profile.burnout}%
                          </span>
                        </div>
                        <Progress 
                          value={profile.burnout} 
                          className={`h-3 ${profile.burnout > 60 ? '[&>div]:bg-red-500' : profile.burnout > 30 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
                        />
                      </div>

                      {profile.burnout > 60 && (
                        <Alert className="border-red-200 bg-red-50">
                          <Coffee className="h-4 w-4 text-red-600" />
                          <AlertTitle className="text-red-800">تحذير: إرهاق شديد</AlertTitle>
                          <AlertDescription className="text-red-700 text-sm">
                            يحتاج راحة فورية وخفض الحمل
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold mb-2">التوصيات النفسية:</p>
                        <ul className="space-y-1">
                          {profile.recommendations.slice(0, 3).map((rec, idx) => (
                            <li key={idx} className="text-xs text-gray-700">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* IDP Tab */}
          <TabsContent value="idp" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {developmentPlans.map((plan) => {
                const employee = employees.find(e => e.id === plan.employeeId);
                return (
                  <Card key={plan.employeeId} className="hover:shadow-xl transition-all">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xl">
                            {employee?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-xl">{employee?.name}</CardTitle>
                          <CardDescription>خطة التطوير الفردية (IDP)</CardDescription>
                        </div>
                        <div className="mr-auto">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-indigo-600">{plan.readinessLevel}%</p>
                            <p className="text-xs text-gray-500">مستوى الجاهزية</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Goals Timeline */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Target className="h-5 w-5 text-indigo-600" />
                          الأهداف الزمنية
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="h-5 w-5 text-green-600" />
                              <p className="font-semibold text-green-800">30 يوم</p>
                            </div>
                            <div className="space-y-2">
                              {plan.goals.thirtyDays.map((goal) => (
                                <div key={goal.id} className="bg-white p-2 rounded text-sm">
                                  <p className="font-medium">{goal.title}</p>
                                  <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-1 mt-1" />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <p className="font-semibold text-blue-800">90 يوم</p>
                            </div>
                            <div className="space-y-2">
                              {plan.goals.ninetyDays.map((goal) => (
                                <div key={goal.id} className="bg-white p-2 rounded text-sm">
                                  <p className="font-medium">{goal.title}</p>
                                  <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-1 mt-1" />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="h-5 w-5 text-purple-600" />
                              <p className="font-semibold text-purple-800">6 أشهر</p>
                            </div>
                            <div className="space-y-2">
                              {plan.goals.sixMonths.map((goal) => (
                                <div key={goal.id} className="bg-white p-2 rounded text-sm">
                                  <p className="font-medium">{goal.title}</p>
                                  <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-1 mt-1" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Training Plan */}
                      <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          خطة التدريب
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                            <p className="font-medium mb-2 text-sm">دورات تدريبية:</p>
                            <ul className="space-y-1">
                              {plan.training.courses.map((course, idx) => (
                                <li key={idx} className="text-xs flex items-center gap-2">
                                  <Play className="h-3 w-3 text-blue-600" />
                                  {course}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                            <p className="font-medium mb-2 text-sm">جلسات التوجيه:</p>
                            <ul className="space-y-1">
                              {plan.training.mentoringSessions.map((session, idx) => (
                                <li key={idx} className="text-xs flex items-center gap-2">
                                  <Users className="h-3 w-3 text-purple-600" />
                                  {session}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Performance Improvement */}
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold flex items-center gap-2 mb-3">
                          <Sparkles className="h-5 w-5 text-orange-600" />
                          خطة تحسين الأداء
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">أنواع المهام المناسبة:</p>
                            <p className="text-xs text-gray-600">{plan.performanceImprovement.taskTypes.join(', ')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">حجم الحمل:</p>
                            <p className="text-xs text-gray-600">{plan.performanceImprovement.taskVolume}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">فترات الراحة:</p>
                            <p className="text-xs text-gray-600">{plan.performanceImprovement.restPeriods}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">توزيع الضغط:</p>
                            <p className="text-xs text-gray-600">{plan.performanceImprovement.stressDistribution}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Behavior & Data Entry Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Navigation Behavior */}
              {navigationBehaviors.map((nav) => {
                const employee = employees.find(e => e.id === nav.employeeId);
                return (
                  <Card key={nav.employeeId}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MousePointer className="h-5 w-5 text-purple-600" />
                        {employee?.name} - سلوك التصفح
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded text-center">
                          <Monitor className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                          <p className="text-xs text-gray-600">إجمالي التنقلات</p>
                          <p className="text-xl font-bold text-blue-700">{nav.metrics.totalNavigations}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded text-center">
                          <Eye className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                          <p className="text-xs text-gray-600">صفحات متكررة</p>
                          <p className="text-xl font-bold text-purple-700">{nav.metrics.frequentlyVisitedPages.length}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-2">الصفحات الأكثر زيارة:</p>
                        <div className="space-y-1">
                          {nav.metrics.frequentlyVisitedPages.map((page, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                              <span>{page.page}</span>
                              <Badge variant="outline">{page.visits} زيارة</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {nav.uxIssues.length > 0 && (
                        <Alert className="border-orange-200 bg-orange-50">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <AlertTitle className="text-orange-800">مشاكل UX مكتشفة</AlertTitle>
                          <AlertDescription>
                            {nav.uxIssues.map((issue, idx) => (
                              <div key={idx} className="text-sm mt-2">
                                <p className="font-medium">{issue.page}: {issue.issue}</p>
                                <p className="text-xs text-orange-700">اقتراح: {issue.suggestion}</p>
                              </div>
                            ))}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Data Entry Quality */}
              {dataEntryQuality.map((quality) => {
                const employee = employees.find(e => e.id === quality.employeeId);
                return (
                  <Card key={quality.employeeId}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5 text-green-600" />
                        {employee?.name} - جودة الإدخال
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 p-3 rounded text-center">
                          <p className="text-xs text-gray-600">دقة الإدخال</p>
                          <p className="text-3xl font-bold text-green-700">{quality.metrics.accuracy.toFixed(1)}%</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded text-center">
                          <p className="text-xs text-gray-600">الترتيب</p>
                          <p className="text-3xl font-bold text-blue-700">#{quality.comparison.rankAmongPeers}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>سرعة الإدخال:</span>
                          <span className="font-bold">{quality.metrics.entrySpeed.toFixed(0)} حرف/دقيقة</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>الأخطاء:</span>
                          <span className="font-bold text-red-600">{quality.metrics.errorsDuringEntry}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>الحقول المعدلة:</span>
                          <span className="font-bold text-yellow-600">{quality.metrics.fieldsModified}</span>
                        </div>
                      </div>

                      {quality.metrics.difficultFields.length > 0 && (
                        <div className="bg-yellow-50 p-3 rounded">
                          <p className="text-sm font-semibold mb-1">حقول صعبة:</p>
                          <div className="flex flex-wrap gap-1">
                            {quality.metrics.difficultFields.map((field, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{field}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {quality.recommendations.length > 0 && (
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm font-semibold mb-2">توصيات:</p>
                          <ul className="space-y-1">
                            {quality.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-xs">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* System Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {systemUsage.map((usage) => {
                const employee = employees.find(e => e.id === usage.employeeId);
                return (
                  <Card key={usage.employeeId}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-indigo-600" />
                        {employee?.name} - استخدام النظام
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-indigo-50 p-3 rounded text-center">
                          <Clock className="h-6 w-6 mx-auto text-indigo-600 mb-1" />
                          <p className="text-xs text-gray-600">مدة الجلسة</p>
                          <p className="text-lg font-bold text-indigo-700">{usage.sessions.duration} د</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded text-center">
                          <Activity className="h-6 w-6 mx-auto text-green-600 mb-1" />
                          <p className="text-xs text-gray-600">الإنتاجية</p>
                          <p className="text-lg font-bold text-green-700">{usage.productivity.overallProductivity.toFixed(0)}%</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded text-center">
                          <Zap className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                          <p className="text-xs text-gray-600">أطول جلسة</p>
                          <p className="text-lg font-bold text-purple-700">{usage.sessions.longestSession} د</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-2">أوقات الذروة:</p>
                        <div className="flex flex-wrap gap-2">
                          {usage.productivity.peakHours.map((hour, idx) => (
                            <Badge key={idx} className="bg-green-100 text-green-700">{hour}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-2">الصفحات الأكثر استخداماً:</p>
                        <div className="space-y-1">
                          {usage.pageUsage.mostUsed.map((page, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                              <span>{page.page}</span>
                              <span className="text-xs text-gray-600">{page.time} دقيقة</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {usage.pageUsage.frictionPages.length > 0 && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertTitle className="text-red-800">صفحات تحتاج تحسين</AlertTitle>
                          <AlertDescription>
                            {usage.pageUsage.frictionPages.map((page, idx) => (
                              <p key={idx} className="text-sm mt-1">
                                <span className="font-medium">{page.page}:</span> {page.reason}
                              </p>
                            ))}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Stats */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <Brain className="h-12 w-12 mx-auto mb-2 text-indigo-200" />
                <p className="text-3xl font-bold">94.2%</p>
                <p className="text-sm text-indigo-100">دقة التنبؤات</p>
              </div>
              <div>
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-green-200" />
                <p className="text-3xl font-bold">+18%</p>
                <p className="text-sm text-indigo-100">تحسن الأداء</p>
              </div>
              <div>
                <Zap className="h-12 w-12 mx-auto mb-2 text-yellow-200" />
                <p className="text-3xl font-bold">32 ساعة</p>
                <p className="text-sm text-indigo-100">توفير شهري</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
