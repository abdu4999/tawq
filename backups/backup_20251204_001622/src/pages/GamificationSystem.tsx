import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNotifications } from '@/components/NotificationSystem';
import Sidebar from '@/components/Sidebar';
import { supabaseAPI } from '@/lib/supabaseClient';
import { formatDateDMY } from '@/lib/date-utils';
import {
  Trophy,
  Star,
  Target,
  Award,
  Zap,
  Crown,
  Medal,
  Gift,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export default function GamificationSystem() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(1250);
  const [userLevel, setUserLevel] = useState(5);
  const [userRank, setUserRank] = useState(3);
  
  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: 'منجز المهام',
      description: 'أكمل 50 مهمة بنجاح',
      icon: CheckCircle,
      earned: true,
      points: 100,
      date: '2024-03-15'
    },
    {
      id: 2,
      title: 'قائد الفريق',
      description: 'قد فريقاً لإنجاز مشروع كبير',
      icon: Crown,
      earned: true,
      points: 200,
      date: '2024-03-10'
    },
    {
      id: 3,
      title: 'خبير التحليل',
      description: 'أنشئ 10 تقارير تحليلية',
      icon: TrendingUp,
      earned: false,
      points: 150,
      progress: 70
    }
  ]);

  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: 'تحدي الأسبوع',
      description: 'أكمل 20 مهمة خلال هذا الأسبوع',
      reward: 300,
      deadline: '2024-03-31',
      progress: 65,
      participants: 12,
      status: 'active'
    },
    {
      id: 2,
      title: 'مشروع الشهر',
      description: 'شارك في إنجاز مشروع خيري كبير',
      reward: 500,
      deadline: '2024-04-15',
      progress: 30,
      participants: 8,
      status: 'active'
    }
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'أحمد محمد', points: 2150, level: 7, avatar: '👨‍💼' },
    { rank: 2, name: 'فاطمة أحمد', points: 1890, level: 6, avatar: '👩‍💼' },
    { rank: 3, name: 'أنت', points: 1250, level: 5, avatar: '🎯', isCurrentUser: true },
    { rank: 4, name: 'محمد سالم', points: 1100, level: 5, avatar: '👨‍💻' },
    { rank: 5, name: 'سارة خالد', points: 950, level: 4, avatar: '👩‍💻' }
  ]);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      // Load real data from Supabase
      const [tasks, projects] = await Promise.all([
        supabaseAPI.getTasks().catch(() => []),
        supabaseAPI.getProjects().catch(() => [])
      ]);

      // Calculate points based on real data
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      
      const calculatedPoints = (completedTasks * 10) + (completedProjects * 50) + 500;
      setUserPoints(calculatedPoints);
      setUserLevel(Math.floor(calculatedPoints / 250) + 1);

      addNotification({
        type: 'success',
        title: '🎮 نظام النقاط محدث',
        message: `لديك ${calculatedPoints} نقطة - المستوى ${Math.floor(calculatedPoints / 250) + 1}`,
        duration: 4000
      });

    } catch (error) {
      console.error('Error loading gamification data:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في تحميل البيانات',
        message: 'حدث خطأ أثناء تحميل بيانات النقاط'
      });
    } finally {
      setLoading(false);
    }
  };

  const claimReward = (challengeId: number, reward: number) => {
    setUserPoints(prev => prev + reward);
    addNotification({
      type: 'achievement',
      title: '🏆 مكافأة جديدة!',
      message: `تم إضافة ${reward} نقطة إلى رصيدك`,
      duration: 5000
    });
  };

  const getLevelProgress = () => {
    const currentLevelPoints = userLevel * 250;
    const nextLevelPoints = (userLevel + 1) * 250;
    const progress = ((userPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل نظام النقاط والتحفيز...</p>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
            نظام النقاط والتحفيز
          </h1>
          <p className="text-xl text-gray-600">حفز فريقك وحقق إنجازات استثنائية</p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <div className="text-3xl font-bold mb-1">{userPoints.toLocaleString()}</div>
              <p className="text-purple-100">إجمالي النقاط</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{userLevel}</div>
              <p className="text-blue-100">المستوى الحالي</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Medal className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-3xl font-bold mb-1">#{userRank}</div>
              <p className="text-green-100">الترتيب العام</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 mx-auto mb-3 text-orange-200" />
              <div className="text-3xl font-bold mb-1">{achievements.filter(a => a.earned).length}</div>
              <p className="text-orange-100">الإنجازات</p>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              تقدم المستوى
            </CardTitle>
            <CardDescription>
              المستوى {userLevel} - {userPoints.toLocaleString()} نقطة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>المستوى {userLevel}</span>
                <span>المستوى {userLevel + 1}</span>
              </div>
              <Progress value={getLevelProgress()} className="h-3" />
              <p className="text-sm text-gray-600 text-center">
                تحتاج {((userLevel + 1) * 250) - userPoints} نقطة للوصول للمستوى التالي
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Achievements & Challenges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-gold-500" />
                الإنجازات
              </CardTitle>
              <CardDescription>
                شارات الإنجاز والتميز
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-4 rounded-lg border ${achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${achievement.earned ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <achievement.icon className={`h-6 w-6 ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <Badge className={achievement.earned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {achievement.points} نقطة
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {!achievement.earned && achievement.progress && (
                          <div className="mt-2">
                            <Progress value={achievement.progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">{achievement.progress}% مكتمل</p>
                          </div>
                        )}
                        {achievement.earned && achievement.date && (
                          <p className="text-xs text-green-600 mt-1">
                            تم الإنجاز في {formatDateDMY(achievement.date)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                التحديات النشطة
              </CardTitle>
              <CardDescription>
                تحديات محدودة الوقت
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{challenge.title}</h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        {challenge.reward} نقطة
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span>التقدم</span>
                        <span>{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{challenge.participants} مشارك</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>ينتهي {formatDateDMY(challenge.deadline)}</span>
                        </div>
                      </div>
                      {challenge.progress >= 100 && (
                        <Button 
                          size="sm"
                          onClick={() => claimReward(challenge.id, challenge.reward)}
                        >
                          <Gift className="h-4 w-4 ml-1" />
                          استلم المكافأة
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              لوحة المتصدرين
            </CardTitle>
            <CardDescription>
              أفضل المؤدين هذا الشهر
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div key={user.rank} className={`flex items-center gap-4 p-4 rounded-lg ${user.isCurrentUser ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                    user.rank === 2 ? 'bg-gray-100 text-gray-800' :
                    user.rank === 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user.rank}
                  </div>
                  
                  <div className="text-2xl">{user.avatar}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${user.isCurrentUser ? 'text-blue-600' : ''}`}>
                        {user.name}
                      </h3>
                      {user.isCurrentUser && (
                        <Badge className="bg-blue-100 text-blue-800">أنت</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">المستوى {user.level}</p>
                  </div>
                  
                  <div className="text-left">
                    <p className="font-bold text-lg">{user.points.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">نقطة</p>
                  </div>
                  
                  {user.rank <= 3 && (
                    <div className="text-2xl">
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              إجراءات سريعة
            </CardTitle>
            <CardDescription>
              اكسب نقاط إضافية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={() => {
                  setUserPoints(prev => prev + 50);
                  addNotification({
                    type: 'achievement',
                    title: '✅ مهمة مكتملة!',
                    message: 'تم إضافة 50 نقطة لإكمال مهمة'
                  });
                }}
              >
                <CheckCircle className="h-6 w-6" />
                <span className="text-sm">إكمال مهمة (+50)</span>
              </Button>
              
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => {
                  setUserPoints(prev => prev + 100);
                  addNotification({
                    type: 'achievement',
                    title: '🤝 تعاون ممتاز!',
                    message: 'تم إضافة 100 نقطة للمساعدة في مشروع'
                  });
                }}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">مساعدة زميل (+100)</span>
              </Button>
              
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                onClick={() => {
                  setUserPoints(prev => prev + 25);
                  addNotification({
                    type: 'success',
                    title: '📝 تقرير مفيد!',
                    message: 'تم إضافة 25 نقطة لكتابة تقرير'
                  });
                }}
              >
                <Edit className="h-6 w-6" />
                <span className="text-sm">كتابة تقرير (+25)</span>
              </Button>
              
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                onClick={() => {
                  addNotification({
                    type: 'info',
                    title: '🎯 تحدي جديد',
                    message: 'انضم إلى تحدي الأسبوع واكسب نقاط إضافية!'
                  });
                }}
              >
                <Target className="h-6 w-6" />
                <span className="text-sm">انضم لتحدي</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}