import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Gift, Target, Clock, Star, Zap, Crown, Award } from 'lucide-react';

import { AIEngine } from '@/lib/ai-engine';

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  deadline: Date;
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
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export default function Rewards() {
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedTab, setSelectedTab] = useState('challenges');

  // بيانات تجريبية للتحديات والمكافآت
  useEffect(() => {
    const currentEmployee = employees.find(emp => emp.id === currentUser?.id);
    if (currentEmployee) {
      setUserPoints(currentEmployee.points);
      
      // توليد تحديات مخصصة باستخدام الذكاء الاصطناعي
      const personalizedChallenges = AIEngine.generateWeeklyChallenges(currentEmployee);
      
      const sampleChallenges: Challenge[] = [
        ...personalizedChallenges.map(challenge => ({
          ...challenge,
          progress: Math.random() * 100,
          completed: Math.random() > 0.7,
          participants: Math.floor(Math.random() * 20) + 5
        })),
        {
          id: 'team_challenge_1',
          title: 'تحدي الفريق الأسبوعي',
          description: 'تعاون مع فريقك لإكمال 50 مهمة جماعية',
          points: 300,
          difficulty: 'hard' as const,
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          progress: 65,
          completed: false,
          participants: 12
        },
        {
          id: 'speed_challenge',
          title: 'سرعة البرق',
          description: 'أكمل 10 مهام في أقل من ساعتين',
          points: 150,
          difficulty: 'medium' as const,
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          progress: 30,
          completed: false,
          participants: 8
        }
      ];

      const sampleRewards: Reward[] = [
        {
          id: '1',
          title: 'قسيمة شراء 100 ريال',
          description: 'قسيمة شراء من متجر الخير',
          cost: 500,
          category: 'voucher',
          available: 20,
          icon: '🎁'
        },
        {
          id: '2',
          title: 'مكافأة نقدية 200 ريال',
          description: 'مكافأة نقدية تضاف لراتبك',
          cost: 800,
          category: 'bonus',
          available: 10,
          icon: '💰'
        },
        {
          id: '3',
          title: 'يوم إجازة إضافي',
          description: 'يوم إجازة مدفوع الأجر',
          cost: 1000,
          category: 'privilege',
          available: 5,
          icon: '🏖️'
        },
        {
          id: '4',
          title: 'شهادة تقدير',
          description: 'شهادة تقدير رسمية من الإدارة',
          cost: 300,
          category: 'item',
          available: 50,
          icon: '🏆'
        },
        {
          id: '5',
          title: 'دورة تدريبية مجانية',
          description: 'دورة تدريبية في مجال اختيارك',
          cost: 1200,
          category: 'privilege',
          available: 3,
          icon: '📚'
        },
        {
          id: '6',
          title: 'لقب "موظف الشهر"',
          description: 'لقب شرفي مع مميزات خاصة',
          cost: 1500,
          category: 'privilege',
          available: 1,
          icon: '👑'
        }
      ];

      const sampleAchievements: Achievement[] = [
        {
          id: '1',
          title: 'المبتدئ المتحمس',
          description: 'أكمل 10 مهام',
          icon: '🌟',
          rarity: 'common',
          progress: Math.min(currentEmployee.points / 10, 10),
          maxProgress: 10,
          unlockedAt: currentEmployee.points >= 100 ? new Date() : undefined
        },
        {
          id: '2',
          title: 'جامع النقاط',
          description: 'احصل على 500 نقطة',
          icon: '💎',
          rarity: 'rare',
          progress: Math.min(currentEmployee.points, 500),
          maxProgress: 500,
          unlockedAt: currentEmployee.points >= 500 ? new Date() : undefined
        },
        {
          id: '3',
          title: 'الأسطورة الحية',
          description: 'احصل على 1000 نقطة',
          icon: '🏆',
          rarity: 'epic',
          progress: Math.min(currentEmployee.points, 1000),
          maxProgress: 1000,
          unlockedAt: currentEmployee.points >= 1000 ? new Date() : undefined
        },
        {
          id: '4',
          title: 'إمبراطور النقاط',
          description: 'احصل على 2000 نقطة',
          icon: '👑',
          rarity: 'legendary',
          progress: Math.min(currentEmployee.points, 2000),
          maxProgress: 2000,
          unlockedAt: currentEmployee.points >= 2000 ? new Date() : undefined
        },
        {
          id: '5',
          title: 'سريع كالبرق',
          description: 'أكمل 5 مهام في يوم واحد',
          icon: '⚡',
          rarity: 'rare',
          progress: 3,
          maxProgress: 5
        },
        {
          id: '6',
          title: 'قائد الفريق',
          description: 'ساعد 10 زملاء في مهامهم',
          icon: '🤝',
          rarity: 'epic',
          progress: 2,
          maxProgress: 10
        }
      ];

      setChallenges(sampleChallenges);
      setRewards(sampleRewards);
      setAchievements(sampleAchievements);
    }
  }, [employees, currentUser]);

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
      // هنا يمكن إضافة منطق إشعار المستخدم بنجاح الاستبدال
    }
  };

  const joinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === challengeId 
        ? { ...c, participants: c.participants + 1 }
        : c
    ));
  };

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
              {challenges.map((challenge) => (
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
                          <span>{challenge.progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={challenge.progress} />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{challenge.participants} مشارك</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{Math.ceil((challenge.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} يوم</span>
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <Card key={reward.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="text-4xl">{reward.icon}</div>
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`hover:shadow-lg transition-shadow border-2 ${getRarityColor(achievement.rarity)}`}>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="text-4xl">{achievement.icon}</div>
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
                            تم الفتح في: {achievement.unlockedAt.toLocaleDateString('ar-SA')}
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">🏆 لوحة المتصدرين الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees
                    .sort((a, b) => b.points - a.points)
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
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold">{employee.name}</h4>
                        <p className="text-sm text-gray-500">{employee.role}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg">{employee.points.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">نقطة</p>
                      </div>
                    </div>
                  ))}
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