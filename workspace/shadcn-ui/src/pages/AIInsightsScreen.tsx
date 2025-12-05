import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { generateAIInsights, analyzeEmployeePerformance } from '@/lib/openai-service';
import { Brain, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target } from 'lucide-react';

export default function AIInsightsScreen() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [employeeAnalysis, setEmployeeAnalysis] = useState<any>(null);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .order('total_revenue', { ascending: false })
        .limit(10);

      const { data: projects } = await supabase
        .from('projects')
        .select('*');

      const insights = await generateAIInsights(
        employees || [],
        projects || []
      );
      
      setInsights(insights);

      // Analyze top employee
      if (employees && employees.length > 0) {
        const topEmployee = employees[0];
        const analysis = await analyzeEmployeePerformance(
          topEmployee.name,
          topEmployee.completed_tasks || 0,
          topEmployee.total_revenue || 0,
          topEmployee.performance_score || 0
        );
        setEmployeeAnalysis(analysis);
      }
    } catch (error) {
      console.error('خطأ في تحميل التحليلات:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'أداء': return <TrendingUp className="h-5 w-5" />;
      case 'تحذير': return <AlertTriangle className="h-5 w-5" />;
      case 'فرصة': return <Lightbulb className="h-5 w-5" />;
      case 'هدف': return <Target className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'أداء': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'تحذير': return 'bg-red-100 text-red-800 border-red-200';
      case 'فرصة': return 'bg-green-100 text-green-800 border-green-200';
      case 'هدف': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-12 w-12 text-purple-600 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              التحليلات الذكية
            </h1>
            <Sparkles className="h-12 w-12 text-pink-500 animate-pulse" />
          </div>
          <p className="text-gray-600">رؤى وتوصيات مدعومة بالذكاء الاصطناعي</p>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button
            onClick={loadInsights}
            disabled={loading}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                جاري التحليل...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                تحديث التحليلات
              </>
            )}
          </Button>
        </div>

        {/* Employee Analysis */}
        {employeeAnalysis && (
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                تحليل الموظف الأفضل أداءً
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-purple-100 mb-1">التقييم العام</p>
                <p className="text-xl font-bold">{employeeAnalysis.overallScore}/100</p>
              </div>
              
              <div>
                <p className="text-sm text-purple-100 mb-2">نقاط القوة</p>
                <div className="space-y-1">
                  {employeeAnalysis.strengths?.map((strength: string, i: number) => (
                    <p key={i} className="text-sm">✓ {strength}</p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-purple-100 mb-2">مجالات التحسين</p>
                <div className="space-y-1">
                  {employeeAnalysis.improvements?.map((improvement: string, i: number) => (
                    <p key={i} className="text-sm">• {improvement}</p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-purple-100 mb-2">التوصيات</p>
                <div className="space-y-1">
                  {employeeAnalysis.recommendations?.map((rec: string, i: number) => (
                    <p key={i} className="text-sm">→ {rec}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && insights.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحليل البيانات...</p>
            </div>
          ) : insights.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>لا توجد رؤى متاحة حالياً</p>
              <p className="text-sm mt-2">اضغط على "تحديث التحليلات" للحصول على رؤى جديدة</p>
            </div>
          ) : (
            insights.map((insight, index) => (
              <Card
                key={index}
                className={`border-2 hover:shadow-lg transition-shadow ${getCategoryColor(insight.category)}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-start gap-3">
                    {getIconForCategory(insight.category)}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{insight.title}</h3>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getCategoryColor(insight.category)}`}>
                        {insight.category}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{insight.description}</p>
                  
                  {insight.priority && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">الأولوية:</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.priority === 'عالية' ? 'bg-red-200 text-red-800' :
                        insight.priority === 'متوسطة' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {insight.priority}
                      </span>
                    </div>
                  )}
                  
                  {insight.expectedImpact && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-semibold mb-1">التأثير المتوقع:</p>
                      <p className="text-sm">{insight.expectedImpact}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
    </div>
  );
}
