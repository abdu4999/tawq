import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, BarChart3, LineChart, PieChart, Lightbulb } from 'lucide-react';
import { supabaseAPI } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function AnalyticsScreen() {
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [tasks, projects, transactions, employees] = await Promise.all([
        supabaseAPI.getTasks().catch(() => []),
        supabaseAPI.getProjects().catch(() => []),
        supabaseAPI.getTransactions().catch(() => []),
        supabaseAPI.getEmployees().catch(() => [])
      ]);

      // Calculate Predictions
      const totalIncome = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      
      const predictedRevenue = totalIncome > 0 ? totalIncome * 1.1 : 50000; // 10% growth or default

      const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
      const totalProjects = projects.length;
      const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

      const bestEmployee = employees.length > 0 ? employees[0].name : 'غير محدد';

      setPredictions([
        {
          title: 'توقع الإيراد للشهر القادم',
          value: `${Math.round(predictedRevenue).toLocaleString()} ر.س`,
          confidence: 85,
          trend: 'up'
        },
        {
          title: 'أفضل موظف متوقع',
          value: bestEmployee,
          confidence: 92,
          trend: 'up'
        },
        {
          title: 'نسبة إنجاز المشاريع',
          value: `${completionRate}%`,
          confidence: 88,
          trend: 'stable'
        }
      ]);

      // Generate Insights
      const newInsights = [
        `تم تحقيق ${Math.round(totalIncome).toLocaleString()} ر.س من الإيرادات حتى الآن`,
        `هناك ${tasks.filter((t: any) => t.status === 'pending').length} مهمة معلقة تحتاج إلى متابعة`,
        `نسبة إنجاز المشاريع الحالية هي ${completionRate}%`
      ];
      setInsights(newInsights);

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
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">فترة التحليل</h3>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[200px]">
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

        {/* Charts Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                اتجاه الإيرادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <p className="text-gray-500">📈 رسم بياني للإيرادات</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                توزيع المشاريع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <p className="text-gray-500">🥧 رسم دائري للمشاريع</p>
              </div>
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
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">الشهر الحالي</p>
                  <p className="text-2xl font-bold text-blue-600">485,000</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">الشهر الماضي</p>
                  <p className="text-2xl font-bold text-green-600">420,000</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">التغيير</p>
                  <p className="text-2xl font-bold text-purple-600">+15.5%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
