import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNotifications } from '@/components/NotificationSystem';
import Sidebar from '@/components/Sidebar';
import { supabaseAPI } from '@/lib/supabaseClient';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Star,
  DollarSign,
  Activity,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AIAnalytics() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState({
    performanceScore: 85,
    efficiency: 78,
    riskLevel: 'منخفض',
    recommendations: [],
    predictions: [],
    trends: []
  });

  useEffect(() => {
    loadAIAnalytics();
  }, []);

  const loadAIAnalytics = async () => {
    try {
      setLoading(true);
      
      // Simulate AI analysis with real data
      const [tasks, projects, celebrities, transactions] = await Promise.all([
        supabaseAPI.getTasks().catch(() => []),
        supabaseAPI.getProjects().catch(() => []),
        supabaseAPI.getCelebrities().catch(() => []),
        supabaseAPI.getTransactions().catch(() => [])
      ]);

      // Generate AI insights based on data
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalTasks = tasks.length;
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const activeProjects = projects.filter(p => p.status === 'active').length;
      const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      setAiInsights({
        performanceScore: Math.round(taskCompletionRate),
        efficiency: Math.round((totalIncome / (totalExpense || 1)) * 50),
        riskLevel: totalExpense > totalIncome ? 'عالي' : 'منخفض',
        recommendations: [
          {
            id: 1,
            title: 'تحسين معدل إكمال المهام',
            description: `معدل الإكمال الحالي ${taskCompletionRate.toFixed(1)}%. يُنصح بتحسين التخطيط وتوزيع المهام.`,
            priority: 'عالية',
            impact: 'كبير',
            icon: Target
          },
          {
            id: 2,
            title: 'تحسين الكفاءة المالية',
            description: 'تحليل الإنفاق يشير إلى إمكانية توفير 15% من التكاليف التشغيلية.',
            priority: 'متوسطة',
            impact: 'متوسط',
            icon: DollarSign
          },
          {
            id: 3,
            title: 'زيادة التعاون مع المشاهير',
            description: `لديك ${celebrities.length} مشهور في قاعدة البيانات. يُنصح بزيادة التعاون النشط.`,
            priority: 'منخفضة',
            impact: 'كبير',
            icon: Star
          }
        ],
        predictions: [
          {
            metric: 'إكمال المشاريع',
            current: activeProjects,
            predicted: Math.round(activeProjects * 1.2),
            change: '+20%',
            trend: 'up'
          },
          {
            metric: 'الإيرادات الشهرية',
            current: Math.round(totalIncome / 1000),
            predicted: Math.round(totalIncome * 1.15 / 1000),
            change: '+15%',
            trend: 'up'
          },
          {
            metric: 'كفاءة الفريق',
            current: Math.round(taskCompletionRate),
            predicted: Math.round(taskCompletionRate * 1.1),
            change: '+10%',
            trend: 'up'
          }
        ],
        trends: [
          { name: 'أداء المهام', value: taskCompletionRate, change: '+5%', positive: true },
          { name: 'رضا المتبرعين', value: 88, change: '+12%', positive: true },
          { name: 'التكاليف التشغيلية', value: 72, change: '-8%', positive: true },
          { name: 'مشاركة المتطوعين', value: 65, change: '+3%', positive: true }
        ]
      });

      addNotification({
        type: 'achievement',
        title: '🧠 تحليل ذكي مكتمل',
        message: 'تم إنجاز التحليل الذكي بنجاح مع رؤى قابلة للتنفيذ',
        duration: 5000
      });

    } catch (error) {
      console.error('Error loading AI analytics:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في التحليل',
        message: 'حدث خطأ أثناء تحليل البيانات'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحليل البيانات بالذكاء الاصطناعي...</p>
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
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            التحليلات الذكية
          </h1>
          <p className="text-xl text-gray-600">رؤى مدعومة بالذكاء الاصطناعي لتحسين الأداء</p>
        </div>

        {/* AI Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Brain className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <div className="text-3xl font-bold mb-1">{aiInsights.performanceScore}%</div>
              <p className="text-purple-100">نقاط الأداء الذكي</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{aiInsights.efficiency}%</div>
              <p className="text-blue-100">كفاءة العمليات</p>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${aiInsights.riskLevel === 'منخفض' ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} text-white border-0`}>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-white opacity-80" />
              <div className="text-2xl font-bold mb-1">{aiInsights.riskLevel}</div>
              <p className="text-white opacity-80">مستوى المخاطر</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Lightbulb className="h-8 w-8 mx-auto mb-3 text-indigo-200" />
              <div className="text-3xl font-bold mb-1">{aiInsights.recommendations.length}</div>
              <p className="text-indigo-100">توصيات ذكية</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              التوصيات الذكية
            </CardTitle>
            <CardDescription>
              اقتراحات مدعومة بالذكاء الاصطناعي لتحسين الأداء
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiInsights.recommendations.map((recommendation) => (
                <div key={recommendation.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <recommendation.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                        <Badge className={
                          recommendation.priority === 'عالية' ? 'bg-red-100 text-red-800' :
                          recommendation.priority === 'متوسطة' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          أولوية {recommendation.priority}
                        </Badge>
                        <Badge variant="outline">
                          تأثير {recommendation.impact}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{recommendation.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 ml-2" />
                      عرض التفاصيل
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Predictions & Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                التنبؤات الذكية
              </CardTitle>
              <CardDescription>
                توقعات الأداء للشهر القادم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {aiInsights.predictions.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{prediction.metric}</p>
                      <p className="text-sm text-gray-600">
                        الحالي: {prediction.current} → المتوقع: {prediction.predicted}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {prediction.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <Badge className={prediction.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {prediction.change}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                اتجاهات الأداء
              </CardTitle>
              <CardDescription>
                مؤشرات الأداء الرئيسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {aiInsights.trends.map((trend, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{trend.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{trend.value}%</span>
                      <Badge className={trend.positive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {trend.change}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={trend.value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* AI Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              الإجراءات المقترحة
            </CardTitle>
            <CardDescription>
              خطوات عملية لتحسين الأداء
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                onClick={() => {
                  addNotification({
                    type: 'info',
                    title: '🎯 تحسين المهام',
                    message: 'بدء عملية تحسين توزيع وإدارة المهام'
                  });
                }}
              >
                <Target className="h-6 w-6" />
                <span className="text-sm">تحسين المهام</span>
              </Button>
              
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => {
                  addNotification({
                    type: 'info',
                    title: '💰 تحليل مالي',
                    message: 'بدء تحليل مفصل للوضع المالي'
                  });
                }}
              >
                <DollarSign className="h-6 w-6" />
                <span className="text-sm">تحليل مالي</span>
              </Button>
              
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={() => {
                  addNotification({
                    type: 'achievement',
                    title: '📊 تقرير شامل',
                    message: 'إنشاء تقرير شامل بالتوصيات والخطط'
                  });
                }}
              >
                <PieChart className="h-6 w-6" />
                <span className="text-sm">تقرير شامل</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}