import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, Target, Zap, Heart } from 'lucide-react';
import { formatDateDMY } from '@/lib/date-utils';

import { AIEngine, AIRecommendation, PsychologicalProfile } from '@/lib/ai-engine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface PredictionResult {
  employeeId: string;
  employeeName: string;
  expectedPoints: number;
  expectedEarnings: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
}

interface PerformanceTrendData {
  month: string;
  performance: number;
  prediction: number;
}

interface TeamRadarData {
  skill: string;
  current: number;
  target: number;
}

// بيانات الموظفين التجريبية
const employees = [
  {
    id: '1',
    name: 'أحمد محمد الأحمد',
    role: 'مدير المشاريع',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    points: 1250,
    totalEarnings: 15000,
  },
  {
    id: '2',
    name: 'فاطمة سالم العتيبي',
    role: 'مسؤولة التسويق',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    points: 950,
    totalEarnings: 8000,
  },
  {
    id: '3',
    name: 'محمد خالد الغامدي',
    role: 'منسق المشاهير',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    points: 780,
    totalEarnings: 4500,
  },
  {
    id: '4',
    name: 'نورا علي الشهري',
    role: 'مديرة الموارد البشرية',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    points: 1100,
    totalEarnings: 10000,
  },
  {
    id: '5',
    name: 'عبدالله سعيد القحطاني',
    role: 'محلل بيانات',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    points: 320,
    totalEarnings: 3000,
  }
];

// بيانات المهام التجريبية
const tasks = [
  {
    id: '1',
    title: 'إعداد خطة التسويق الرقمي',
    assigneeId: '2',
    status: 'completed',
    dueDate: new Date('2024-12-15'),
    createdAt: new Date('2024-11-10'),
  },
  {
    id: '2',
    title: 'التواصل مع المؤثرين',
    assigneeId: '3',
    status: 'in_progress',
    dueDate: new Date('2025-01-20'),
    createdAt: new Date('2024-12-01'),
  },
  {
    id: '3',
    title: 'تحضير المواد الإعلامية',
    assigneeId: '2',
    status: 'completed',
    dueDate: new Date('2024-11-30'),
    createdAt: new Date('2024-11-08'),
  },
  {
    id: '4',
    title: 'مراجعة التقارير المالية',
    assigneeId: '1',
    status: 'completed',
    dueDate: new Date('2024-12-01'),
    createdAt: new Date('2024-11-15'),
  },
  {
    id: '5',
    title: 'تنظيم ورشة العمل',
    assigneeId: '4',
    status: 'in_progress',
    dueDate: new Date('2025-01-25'),
    createdAt: new Date('2024-12-01'),
  },
  {
    id: '6',
    title: 'تحليل بيانات الحملة',
    assigneeId: '5',
    status: 'pending',
    dueDate: new Date('2025-01-15'),
    createdAt: new Date('2024-12-01'),
  },
  {
    id: '7',
    title: 'إعداد تقرير الأداء',
    assigneeId: '5',
    status: 'pending',
    dueDate: new Date('2025-01-10'),
    createdAt: new Date('2024-12-01'),
  }
];

export default function AIInsights() {
  
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [psychProfiles, setPsychProfiles] = useState<PsychologicalProfile[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    generateAIInsights();
  }, []);

  const generateAIInsights = async () => {
    setIsAnalyzing(true);
    
    // تحليل جميع الموظفين
    const allRecommendations: AIRecommendation[] = [];
    const allProfiles: PsychologicalProfile[] = [];
    const allPredictions: PredictionResult[] = [];

    for (const employee of employees) {
      // توليد التوصيات
      const empRecommendations = AIEngine.analyzeEmployeePerformance(employee, tasks);
      allRecommendations.push(...empRecommendations);

      // تحليل الحالة النفسية
      const psychProfile = AIEngine.analyzePsychologicalState(employee, tasks);
      allProfiles.push(psychProfile);

      // التنبؤ بالأداء المستقبلي
      const prediction = AIEngine.predictFuturePerformance(employee, tasks);
      allPredictions.push({
        employeeId: employee.id,
        employeeName: employee.name,
        ...prediction
      });
    }

    setRecommendations(allRecommendations);
    setPsychProfiles(allProfiles);
    setPredictions(allPredictions);
    setIsAnalyzing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <Target className="h-4 w-4" />;
      case 'training': return <Lightbulb className="h-4 w-4" />;
      case 'motivation': return <Heart className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'task': return 'مهام';
      case 'training': return 'تدريب';
      case 'motivation': return 'تحفيز';
      case 'performance': return 'أداء';
      default: return type;
    }
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMotivationColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // بيانات تجريبية للرسوم البيانية
  const performanceTrendData: PerformanceTrendData[] = [
    { month: 'يناير', performance: 75, prediction: 78 },
    { month: 'فبراير', performance: 82, prediction: 85 },
    { month: 'مارس', performance: 78, prediction: 82 },
    { month: 'أبريل', performance: 85, prediction: 88 },
    { month: 'مايو', performance: 90, prediction: 92 },
    { month: 'يونيو', performance: 87, prediction: 90 }
  ];

  const teamRadarData: TeamRadarData[] = [
    { skill: 'الإنتاجية', current: 85, target: 90 },
    { skill: 'التعاون', current: 78, target: 85 },
    { skill: 'الإبداع', current: 82, target: 88 },
    { skill: 'التواصل', current: 75, target: 80 },
    { skill: 'القيادة', current: 70, target: 85 },
    { skill: 'التعلم', current: 88, target: 92 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            🧠 الذكاء الاصطناعي والتحليلات المتقدمة
          </h1>
          <p className="text-gray-600 text-lg">تحليلات ذكية وتوصيات مخصصة لتحسين الأداء</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">توصيات نشطة</p>
                  <p className="text-2xl font-bold">{recommendations.filter(r => r.actionRequired).length}</p>
                </div>
                <Brain className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">موظفين بأداء عالي</p>
                  <p className="text-2xl font-bold">{predictions.filter(p => p.riskLevel === 'low').length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">تحذيرات متوسطة</p>
                  <p className="text-2xl font-bold">{predictions.filter(p => p.riskLevel === 'medium').length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">تحذيرات عالية</p>
                  <p className="text-2xl font-bold">{predictions.filter(p => p.riskLevel === 'high').length}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommendations">التوصيات الذكية</TabsTrigger>
            <TabsTrigger value="psychology">التحليل النفسي</TabsTrigger>
            <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات المتقدمة</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            {isAnalyzing && (
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  جاري تحليل البيانات بالذكاء الاصطناعي...
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((rec) => {
                const employee = employees.find(e => e.id === rec.employeeId);
                return (
                  <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(rec.type)}
                          <div>
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                            <p className="text-sm text-gray-500">{employee?.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={`${getPriorityColor(rec.priority)} text-white`}>
                            {getPriorityText(rec.priority)}
                          </Badge>
                          <Badge variant="outline">
                            {getTypeText(rec.type)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">{rec.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>مستوى الثقة:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={rec.confidence * 100} className="w-20" />
                          <span className="font-medium">{Math.round(rec.confidence * 100)}%</span>
                        </div>
                      </div>

                      {rec.actionRequired && (
                        <Alert className="border-orange-200 bg-orange-50">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-800">
                            يتطلب إجراء فوري من الإدارة
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          عرض التفاصيل
                        </Button>
                        <Button size="sm" className="flex-1">
                          تطبيق التوصية
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="psychology" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {psychProfiles.map((profile) => {
                const employee = employees.find(e => e.id === profile.employeeId);
                return (
                  <Card key={profile.employeeId} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={employee?.avatar} />
                          <AvatarFallback>{employee?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{employee?.name}</CardTitle>
                          <p className="text-sm text-gray-500">{employee?.role}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Psychological Indicators */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg ${getMotivationColor(profile.motivation)}`}>
                          <div className="text-center">
                            <Heart className="h-5 w-5 mx-auto mb-1" />
                            <p className="text-xs font-medium">الدافعية</p>
                            <p className="text-sm font-bold">{profile.motivation === 'high' ? 'عالية' : profile.motivation === 'medium' ? 'متوسطة' : 'منخفضة'}</p>
                          </div>
                        </div>
                        
                        <div className={`p-3 rounded-lg ${getStressColor(profile.stress)}`}>
                          <div className="text-center">
                            <AlertTriangle className="h-5 w-5 mx-auto mb-1" />
                            <p className="text-xs font-medium">التوتر</p>
                            <p className="text-sm font-bold">{profile.stress === 'high' ? 'عالي' : profile.stress === 'medium' ? 'متوسط' : 'منخفض'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Burnout Level */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>مستوى الإرهاق:</span>
                          <span className={profile.burnout > 60 ? 'text-red-600 font-bold' : profile.burnout > 30 ? 'text-yellow-600' : 'text-green-600'}>
                            {profile.burnout}%
                          </span>
                        </div>
                        <Progress 
                          value={profile.burnout} 
                          className={`h-2 ${profile.burnout > 60 ? '[&>div]:bg-red-500' : profile.burnout > 30 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
                        />
                      </div>

                      {/* Engagement Level */}
                      <div className={`p-3 rounded-lg ${getMotivationColor(profile.engagement)}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">مستوى المشاركة</span>
                          <span className="text-sm font-bold">
                            {profile.engagement === 'high' ? 'عالي' : profile.engagement === 'medium' ? 'متوسط' : 'منخفض'}
                          </span>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">توصيات نفسية:</h4>
                        <div className="space-y-1">
                          {profile.recommendations.slice(0, 3).map((rec, index) => (
                            <p key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              • {rec}
                            </p>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        آخر تحديث: {formatDateDMY(profile.lastUpdated)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {predictions.map((prediction) => (
                <Card key={prediction.employeeId} className={`hover:shadow-lg transition-shadow border-2 ${getRiskColor(prediction.riskLevel)}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{prediction.employeeName}</span>
                      <Badge className={getRiskColor(prediction.riskLevel)}>
                        {prediction.riskLevel === 'high' ? 'خطر عالي' : 
                         prediction.riskLevel === 'medium' ? 'خطر متوسط' : 'أداء جيد'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Predictions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">النقاط المتوقعة</p>
                        <p className="text-xl font-bold text-blue-700">{prediction.expectedPoints.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">الأرباح المتوقعة</p>
                        <p className="text-xl font-bold text-green-700">{prediction.expectedEarnings.toLocaleString()} ر.س</p>
                      </div>
                    </div>

                    {/* Risk Indicators */}
                    {prediction.riskLevel === 'high' && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          يحتاج إلى تدخل فوري لتحسين الأداء
                        </AlertDescription>
                      </Alert>
                    )}

                    {prediction.riskLevel === 'medium' && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          يحتاج إلى متابعة ودعم إضافي
                        </AlertDescription>
                      </Alert>
                    )}

                    {prediction.riskLevel === 'low' && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          أداء ممتاز، استمر على هذا المنوال
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Suggestions */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">اقتراحات التحسين:</h4>
                      <div className="space-y-1">
                        {prediction.suggestions.map((suggestion: string, index: number) => (
                          <p key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            • {suggestion}
                          </p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>اتجاه الأداء والتنبؤات</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={2} name="الأداء الحالي" />
                      <Line type="monotone" dataKey="prediction" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="التنبؤ" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Team Skills Radar */}
              <Card>
                <CardHeader>
                  <CardTitle>مهارات الفريق</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={teamRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="الحالي" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Radar name="الهدف" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Summary */}
            <Card>
              <CardHeader>
                <CardTitle>ملخص التحليلات الذكية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <Brain className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold text-blue-800">دقة التنبؤات</h3>
                    <p className="text-3xl font-bold text-blue-600">94.2%</p>
                    <p className="text-sm text-blue-600 mt-2">بناءً على البيانات التاريخية</p>
                  </div>
                  
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <TrendingUp className="h-12 w-12 mx-auto text-green-600 mb-4" />
                    <h3 className="text-lg font-semibold text-green-800">تحسن الأداء</h3>
                    <p className="text-3xl font-bold text-green-600">+18%</p>
                    <p className="text-sm text-green-600 mt-2">منذ تطبيق التوصيات</p>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <Zap className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                    <h3 className="text-lg font-semibold text-purple-800">توفير الوقت</h3>
                    <p className="text-3xl font-bold text-purple-600">32 ساعة</p>
                    <p className="text-sm text-purple-600 mt-2">شهرياً في اتخاذ القرارات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}