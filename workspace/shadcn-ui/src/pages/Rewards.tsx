import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Gift, Target, Clock, Star, Zap, Crown, Award, Users } from 'lucide-react';
import { formatDateDMY } from '@/lib/date-utils';
import { supabaseAPI, getCurrentUser } from '@/lib/supabaseClient';

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  deadline: string;
  progress: number;
  completed: boolean;
  participants: number;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'voucher' | 'bonus' | 'privilege' | 'item';
  available: number;
  icon: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export default function Rewards() {
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedTab, setSelectedTab] = useState('challenges');
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      
      const [challengesData, rewardsData, achievementsData, profile, employeesData] = await Promise.all([
        supabaseAPI.getChallenges().catch(() => []),
        supabaseAPI.getRewards().catch(() => []),
        supabaseAPI.getAchievements().catch(() => []),
        user ? supabaseAPI.getGamificationProfile(user.id).catch(() => null) : null,
        supabaseAPI.getEmployees().catch(() => [])
      ]);

      setChallenges(challengesData || []);
      setRewards(rewardsData || []);
      setAchievements(achievementsData || []);
      setEmployees(employeesData || []);
      
      if (profile) {
        setUserPoints(profile.points || 0);
      }

    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'سهل';
      case 'medium': return 'متوسط';
      case 'hard': return 'صعب';
      default: return difficulty;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 border-gray-300';
      case 'rare': return 'text-blue-600 border-blue-300';
      case 'epic': return 'text-purple-600 border-purple-300';
      case 'legendary': return 'text-yellow-600 border-yellow-300';
      default: return 'text-gray-600 border-gray-300';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'عادي';
      case 'rare': return 'نادر';
      case 'epic': return 'ملحمي';
      case 'legendary': return 'أسطوري';
      default: return rarity;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'voucher': return <Gift className="h-4 w-4" />;
      case 'bonus': return <Zap className="h-4 w-4" />;
      case 'privilege': return <Crown className="h-4 w-4" />;
      case 'item': return <Award className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const redeemReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && userPoints >= reward.cost && reward.available > 0) {
      setUserPoints(prev => prev - reward.cost);
      setRewards(prev => prev.map(r => 
        r.id === rewardId 
          ? { ...r, available: r.available - 1 }
          : r
      ));
      // TODO: Call API to record redemption
    }
  };

  const joinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === challengeId 
        ? { ...c, participants: c.participants + 1 }
        : c
    ));
    // TODO: Call API to join challenge
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل نظام المكافآت...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            🏆 نظام المكافآت والتحفيز
          </h1>
          <p className="text-gray-600 text-lg">تحديات مثيرة ومكافآت رائعة في انتظارك!</p>
        </div>

        {/* User Points */}
        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">نقاطك الحالية</h2>
                <p className="text-yellow-100">استخدم نقاطك لاستبدال المكافآت الرائعة</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{userPoints.toLocaleString()}</p>
                <p className="text-yellow-100">نقطة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="challenges">التحديات</TabsTrigger>
            <TabsTrigger value="rewards">المكافآت</TabsTrigger>
            <TabsTrigger value="achievements">الإنجازات</TabsTrigger>
            <TabsTrigger value="leaderboard">المتصدرون</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.length > 0 ? (
                challenges.map((challenge) => (
                  <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                              {getDifficultyText(challenge.difficulty)}
                            </Badge>
                            <Badge variant="secondary">
                              <Trophy className="h-3 w-3 ml-1" />
                              {challenge.points} نقطة
                            </Badge>
                          </div>
                        </div>
                        {challenge.completed && (
                          <Badge className="bg-green-500 text-white">
                            مكتمل ✓
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                      
                      {!challenge.completed && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>التقدم</span>
                            <span>{challenge.progress ? challenge.progress.toFixed(0) : 0}%</span>
                          </div>
                          <Progress value={challenge.progress || 0} />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{challenge.participants} مشارك</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {challenge.deadline ? Math.ceil((new Date(challenge.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0} يوم
                          </span>
                        </div>
                      </div>

                      {!challenge.completed && (
                        <Button 
                          onClick={() => joinChallenge(challenge.id)}
                          className="w-full"
                          variant={challenge.progress > 0 ? "default" : "outline"}
                        >
                          {challenge.progress > 0 ? "متابعة التحدي" : "انضم للتحدي"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  لا توجد تحديات متاحة حالياً
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.length > 0 ? (
                rewards.map((reward) => (
                  <Card key={reward.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="text-4xl">{reward.icon || '🎁'}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{reward.title}</h3>
                          <p className="text-sm text-gray-600 mt-2">{reward.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2">
                          {getCategoryIcon(reward.category)}
                          <Badge variant="outline">
                            {reward.cost} نقطة
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-500">
                          متوفر: {reward.available} قطعة
                        </div>

                        <Button 
                          onClick={() => redeemReward(reward.id)}
                          disabled={userPoints < reward.cost || reward.available === 0}
                          className="w-full"
                        >
                          {userPoints < reward.cost ? "نقاط غير كافية" : 
                           reward.available === 0 ? "غير متوفر" : "استبدال"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  لا توجد مكافآت متاحة حالياً
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <Card key={achievement.id} className={`hover:shadow-lg transition-shadow border-2 ${getRarityColor(achievement.rarity)}`}>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="text-4xl">{achievement.icon || '🏆'}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{achievement.title}</h3>
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {getRarityText(achievement.rarity)}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-2">{achievement.description}</p>
                        </div>
                        
                        {achievement.unlockedAt ? (
                          <div className="space-y-2">
                            <Badge className="bg-green-500 text-white">
                              ✓ مفتوح
                            </Badge>
                            <p className="text-xs text-gray-500">
                              تم الفتح في: {formatDateDMY(achievement.unlockedAt)}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>التقدم</span>
                              <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  لا توجد إنجازات مسجلة
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">🏆 لوحة المتصدرين الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.length > 0 ? (
                    employees
                      .sort((a, b) => (b.points || 0) - (a.points || 0))
                      .slice(0, 10)
                      .map((employee, index) => (
                      <div key={employee.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                        <div className="flex-shrink-0">
                          {index === 0 && <div className="text-2xl">🥇</div>}
                          {index === 1 && <div className="text-2xl">🥈</div>}
                          {index === 2 && <div className="text-2xl">🥉</div>}
                          {index > 2 && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback>{employee.name ? employee.name.charAt(0) : '?'}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold">{employee.name}</h4>
                          <p className="text-sm text-gray-500">{employee.role}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-lg">{(employee.points || 0).toLocaleString()}</p>
                          <p className="text-sm text-gray-500">نقطة</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد بيانات للمتصدرين
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Challenges Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">⚡ متصدرو التحديات الأسبوعية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {challenges.slice(0, 3).map((challenge, index) => (
                    <div key={challenge.id} className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">{challenge.title}</h4>
                      <div className="text-2xl mb-2">
                        {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      <p className="text-xs text-gray-600">{challenge.participants} مشارك</p>
                      <Progress value={challenge.progress} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
