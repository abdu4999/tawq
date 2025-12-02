import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Sidebar from '@/components/Sidebar';
import { useNotifications } from '@/components/NotificationSystem';
import { Target, Trophy, TrendingUp, Lightbulb, Calendar, Star } from 'lucide-react';
import { supabaseAPI } from '@/lib/supabaseClient';

export default function EmployeeDashboard() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('daily');
  const [employeeData, setEmployeeData] = useState<any>(null);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      
      // جلب البيانات من Supabase
      const [tasks, projects, users] = await Promise.all([
        supabaseAPI.getTasks(),
        supabaseAPI.getProjects(),
        supabaseAPI.getAdminUsers()
      ]);
      
      // استخدام أول مستخدم كمثال (أو يمكن استخدام المستخدم المسجل دخوله)
      const currentUser = users.length > 0 ? users[0] : null;
      
      if (currentUser) {
        const userTasks = tasks.filter((t: any) => t.assigned_to === currentUser.id);
        const completedTasks = userTasks.filter((t: any) => t.status === 'completed');
        
        // حساب الإحصائيات من البيانات الفعلية
        setEmployeeData({
          name: currentUser.email?.split('@')[0] || 'الموظف',
          email: currentUser.email,
          role: 'موظف',
          avatar: '👨‍💼',
          daily: {
            tasksCompleted: completedTasks.length,
            tasksTarget: 5,
            revenue: 0,
            revenueTarget: 15000,
            points: completedTasks.length * 15,
            rank: 1
          },
          weekly: {
            tasksCompleted: completedTasks.length,
            tasksTarget: 25,
            revenue: 0,
            revenueTarget: 90000,
            points: completedTasks.length * 15,
            rank: 1
          },
          monthly: {
            tasksCompleted: completedTasks.length,
            tasksTarget: 100,
            revenue: 0,
            revenueTarget: 350000,
            points: completedTasks.length * 15,
            rank: 1
          },
          strengths: ['التواصل الفعال', 'إدارة الوقت'],
          weaknesses: ['المتابعة طويلة المدى'],
          weeklyChallenge: {
            title: 'تحدي الأسبوع: إكمال 25 مهمة',
            progress: completedTasks.length,
            target: 25,
            reward: 150
          },
          teamRank: 1,
          teamTotal: 1,
          aiRecommendations: [
            'ركز على إنهاء المهام ذات الأولوية العالية أولاً',
            'خصص وقتاً للمتابعة مع المتبرعين السابقين',
            'استخدم القوالب الجاهزة لتسريع العمل'
          ]
        });
      } else {
        // بيانات تجريبية في حال عدم وجود مستخدم
        setEmployeeData({
          name: 'أحمد محمد الأحمد',
          email: 'ahmed@charity.org',
          role: 'موظف فريق 1',
          avatar: '👨‍💼',
          daily: {
            tasksCompleted: 3,
            tasksTarget: 5,
            revenue: 12000,
            revenueTarget: 15000,
            points: 45,
            rank: 3
          },
          weekly: {
            tasksCompleted: 18,
            tasksTarget: 25,
            revenue: 75000,
            revenueTarget: 90000,
            points: 280,
            rank: 2
          },
          monthly: {
            tasksCompleted: 72,
            tasksTarget: 100,
            revenue: 285000,
            revenueTarget: 350000,
            points: 1150,
            rank: 3
          },
          strengths: ['التواصل الفعال', 'إدارة الوقت', 'الإقناع'],
          weaknesses: ['المتابعة طويلة المدى', 'التقارير المفصلة'],
          weeklyChallenge: {
            title: 'تحدي الأسبوع: استهداف 30 متبرع جديد',
            progress: 22,
            target: 30,
            reward: 150
          },
          teamRank: 2,
          teamTotal: 8,
          aiRecommendations: [
            'ركز على المتابعة مع المتبرعين السابقين، احتمالية التبرع المتكرر عالية',
            'أفضل وقت للاتصال بالمتبرعين الجدد: 10 صباحاً - 12 ظهراً',
            'جرب استخدام رسائل WhatsApp للمتابعة السريعة'
          ]
        });
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStats = () => {
    if (!employeeData) return null;
    switch (timePeriod) {
      case 'daily': return employeeData.daily;
      case 'weekly': return employeeData.weekly;
      case 'monthly': return employeeData.monthly;
      default: return employeeData.daily;
    }
  };

  const stats = getCurrentStats();
  
  if (loading || !employeeData || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 p-6">
          <div className="text-center">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  const taskProgress = (stats.tasksCompleted / stats.tasksTarget) * 100;
  const revenueProgress = (stats.revenue / stats.revenueTarget) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 lg:mr-80 p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              لوحتي
            </h1>
            <p className="text-gray-600 mt-2">مرحباً {employeeData.name}، إليك ملخص أدائك</p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant={timePeriod === 'daily' ? 'default' : 'outline'}
              onClick={() => setTimePeriod('daily')}
              size="sm"
            >
              يومي
            </Button>
            <Button 
              variant={timePeriod === 'weekly' ? 'default' : 'outline'}
              onClick={() => setTimePeriod('weekly')}
              size="sm"
            >
              أسبوعي
            </Button>
            <Button 
              variant={timePeriod === 'monthly' ? 'default' : 'outline'}
              onClick={() => setTimePeriod('monthly')}
              size="sm"
            >
              شهري
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{stats.tasksCompleted}/{stats.tasksTarget}</div>
              <p className="text-blue-100">المهام المنجزة</p>
              <div className="mt-3 w-full bg-blue-400 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: `${taskProgress}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-2xl font-bold mb-1">{stats.revenue.toLocaleString()} ر.س</div>
              <p className="text-green-100">الإيراد الحالي</p>
              <div className="mt-3 w-full bg-green-400 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: `${revenueProgress}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <div className="text-3xl font-bold mb-1">{stats.points}</div>
              <p className="text-purple-100">النقاط المكتسبة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-3 text-orange-200" />
              <div className="text-3xl font-bold mb-1">#{stats.rank}</div>
              <p className="text-orange-100">ترتيبك</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Challenge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              التحدي الأسبوعي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{employeeData.weeklyChallenge.title}</h3>
                <Badge className="bg-yellow-500 text-white">
                  {employeeData.weeklyChallenge.reward} نقطة
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>التقدم: {employeeData.weeklyChallenge.progress}/{employeeData.weeklyChallenge.target}</span>
                  <span className="font-semibold">
                    {Math.round((employeeData.weeklyChallenge.progress / employeeData.weeklyChallenge.target) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full"
                    style={{ width: `${(employeeData.weeklyChallenge.progress / employeeData.weeklyChallenge.target) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths & Weaknesses */}
          <Card>
            <CardHeader>
              <CardTitle>نقاط القوة والضعف</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  ✓ نقاط القوة
                </h4>
                <div className="space-y-1">
                  {employeeData.strengths.map((strength, index) => (
                    <div key={index} className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                      {strength}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-orange-600 mb-2 flex items-center gap-2">
                  ⚠ نقاط التحسين
                </h4>
                <div className="space-y-1">
                  {employeeData.weaknesses.map((weakness, index) => (
                    <div key={index} className="p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                      {weakness}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                توصيات للأسبوع القادم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employeeData.aiRecommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">💡 {rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Standing */}
        <Card>
          <CardHeader>
            <CardTitle>ترتيبك بين الفريق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                #{employeeData.teamRank}
              </div>
              <p className="text-gray-600">من أصل {employeeData.teamTotal} أعضاء في الفريق</p>
              <div className="mt-4 flex justify-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">للوصول للمركز الأول</p>
                  <p className="text-xl font-bold text-blue-600">{employeeData.teamRank - 1} مراكز</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
