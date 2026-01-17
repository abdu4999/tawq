import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNotifications } from '@/components/NotificationSystem';
import { supabaseAPI, getCurrentUser } from '@/lib/supabaseClient';
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
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [userRank, setUserRank] = useState(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      
      if (!user) {
        // Fallback for demo/testing if no auth
        console.warn('No user logged in, using defaults');
        setLoading(false);
        return;
      }

      const [profile, userAchievementsData, challengesData, leaderboardData] = await Promise.all([
        supabaseAPI.getGamificationProfile(user.id).catch(() => null),
        supabaseAPI.getUserAchievements(user.id).catch(() => []),
        supabaseAPI.getChallenges().catch(() => []),
        supabaseAPI.getLeaderboard().catch(() => [])
      ]);

      if (profile) {
        setUserPoints(profile.points || 0);
        setUserLevel(profile.level || 1);
        setUserRank(profile.rank || 0);
      }

      setAchievements(userAchievementsData || []);
      setChallenges(challengesData || []);
      setLeaderboard(leaderboardData || []);

    } catch (error) {
      console.error('Error loading gamification data:', error);
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'فشل تحميل بيانات التحفيز'
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      CheckCircle, Crown, TrendingUp, Star, Trophy, Award, Zap, Medal, Gift
    };
    return icons[iconName] || Star;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات التحفيز...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-yellow-100 font-medium">نقاطي</p>
                <h3 className="text-4xl font-bold mt-2">{userPoints.toLocaleString()}</h3>
                <p className="text-sm text-yellow-100 mt-2">نقطة مكتسبة</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Star className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 font-medium">المستوى الحالي</p>
                <h3 className="text-4xl font-bold mt-2">{userLevel}</h3>
                <p className="text-sm text-purple-100 mt-2">خبير محترف</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 font-medium">ترتيبي</p>
                <h3 className="text-4xl font-bold mt-2">#{userRank}</h3>
                <p className="text-sm text-blue-100 mt-2">على مستوى الشركة</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-500" />
                الإنجازات والجوائز
              </CardTitle>
              <CardDescription>سجل إنجازاتك والجوائز التي حصلت عليها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.length > 0 ? (
                  achievements.map((achievement) => {
                    const Icon = getIcon(achievement.icon);
                    return (
                      <div 
                        key={achievement.id} 
                        className={`p-4 rounded-xl border ${achievement.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200 opacity-75'}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full ${achievement.earned ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-500'}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{achievement.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                            <div className="flex items-center justify-between mt-3">
                              <Badge variant={achievement.earned ? "success" : "secondary"}>
                                {achievement.points} نقطة
                              </Badge>
                              {achievement.earned && (
                                <span className="text-xs text-gray-500">
                                  {formatDateDMY(achievement.date)}
                                </span>
                              )}
                            </div>
                            {!achievement.earned && achievement.progress && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>التقدم</span>
                                  <span>{achievement.progress}%</span>
                                </div>
                                <Progress value={achievement.progress} className="h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    لا توجد إنجازات مسجلة بعد
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                التحديات النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {challenges.length > 0 ? (
                  challenges.map((challenge) => (
                    <div key={challenge.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-lg">{challenge.title}</h4>
                          <p className="text-sm text-gray-600">{challenge.description}</p>
                        </div>
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                          {challenge.reward} نقطة
                        </Badge>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>التقدم الحالي</span>
                          <span>{challenge.progress}%</span>
                        </div>
                        <Progress value={challenge.progress} className="h-2" />
                        
                        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{challenge.participants} مشارك</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>ينتهي في {formatDateDMY(challenge.deadline)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4" variant="outline">
                        عرض التفاصيل
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد تحديات نشطة حالياً
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Sidebar */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                لوحة المتصدرين
              </CardTitle>
              <CardDescription>أفضل الموظفين أداءً هذا الشهر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.length > 0 ? (
                  leaderboard.map((user, index) => (
                    <div 
                      key={user.id || index} 
                      className={`flex items-center gap-3 p-3 rounded-lg ${user.isCurrentUser ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'}`}
                    >
                      <div className={`
                        w-8 h-8 flex items-center justify-center rounded-full font-bold
                        ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-white text-gray-500 border'}
                      `}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-bold text-sm">{user.name || user.employee?.name || 'مستخدم'}</p>
                        <p className="text-xs text-gray-500">المستوى {user.level}</p>
                      </div>
                      
                      <div className="text-left">
                        <span className="font-bold text-blue-600">{user.points}</span>
                        <span className="text-xs text-gray-400 block">نقطة</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد بيانات
                  </div>
                )}
              </div>
              
              <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                عرض الترتيب الكامل
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
