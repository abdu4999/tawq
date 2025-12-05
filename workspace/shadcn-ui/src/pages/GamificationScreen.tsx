import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { formatDateDMY } from '@/lib/date-utils';
import { 
  Trophy, 
  Star, 
  Award, 
  Gift, 
  TrendingUp,
  Zap,
  Target,
  Flame
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const challenges = [
  {
    id: 1,
    title: 'تحدي الأسبوع: 50 مهمة',
    description: 'أكمل 50 مهمة هذا الأسبوع',
    progress: 35,
    target: 50,
    reward: 500,
    endDate: '2025-12-08',
    type: 'weekly'
  },
  {
    id: 2,
    title: 'محقق المليون',
    description: 'حقق إيراد مليون ريال هذا الشهر',
    progress: 750000,
    target: 1000000,
    reward: 5000,
    endDate: '2025-12-31',
    type: 'monthly'
  },
  {
    id: 3,
    title: 'النجم الصاعد',
    description: 'كن ضمن أفضل 3 موظفين',
    progress: 4,
    target: 3,
    reward: 1000,
    endDate: '2025-12-15',
    type: 'competition'
  },
];

const rewards = [
  { id: 1, name: 'بطاقة هدايا 500 ر.س', points: 1000, icon: Gift },
  { id: 2, name: 'يوم إجازة إضافي', points: 2000, icon: Star },
  { id: 3, name: 'جائزة نقدية 1000 ر.س', points: 3000, icon: Award },
  { id: 4, name: 'دورة تدريبية مجانية', points: 1500, icon: TrendingUp },
];

export default function GamificationScreen() {
  const [userPoints, setUserPoints] = useState(8500);
  const [userLevel, setUserLevel] = useState(12);
  const [achievements, setAchievements] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    // Mock achievements
    setAchievements([
      { id: 1, name: 'أول مهمة', icon: '🎯', unlocked: true },
      { id: 2, name: 'محقق الـ 100', icon: '💯', unlocked: true },
      { id: 3, name: 'الأسبوع الذهبي', icon: '⭐', unlocked: true },
      { id: 4, name: 'النجم المتألق', icon: '🌟', unlocked: false },
    ]);
  };

  const handleRedeemReward = async (reward: any) => {
    if (userPoints < reward.points) {
      toast({
        title: 'نقاط غير كافية',
        description: `تحتاج إلى ${reward.points} نقطة لاستبدال هذه المكافأة`,
        variant: 'destructive'
      });
      return;
    }

    try {
      // Deduct points
      setUserPoints(prevPoints => prevPoints - reward.points);
      
      toast({
        title: 'تم الاستبدال بنجاح!',
        description: `تم استبدال ${reward.name}. النقاط المتبقية: ${userPoints - reward.points}`,
      });
    } catch (error) {
      console.error('خطأ في استبدال المكافأة:', error);
      toast({
        title: 'خطأ',
        description: 'فشل استبدال المكافأة',
        variant: 'destructive'
      });
    }
  };

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-12 w-12 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              نظام النقاط والتحفيز
            </h1>
            <Flame className="h-12 w-12 text-orange-500" />
          </div>
          <p className="text-gray-600">اكسب النقاط وافتح الإنجازات واحصل على المكافآت</p>
        </div>

        {/* User Stats */}
        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Star className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
                <p className="text-sm text-purple-100">المستوى الحالي</p>
                <p className="text-4xl font-bold">{userLevel}</p>
              </div>
              <div className="text-center">
                <Zap className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
                <p className="text-sm text-purple-100">نقاطي</p>
                <p className="text-4xl font-bold">{userPoints.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
                <p className="text-sm text-purple-100">الإنجازات</p>
                <p className="text-4xl font-bold">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              التحديات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challenges.map((challenge) => {
                const progressPercent = getProgressPercentage(challenge.progress, challenge.target);
                
                return (
                  <Card key={challenge.id} className="border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{challenge.title}</h3>
                            <p className="text-sm text-gray-600">{challenge.description}</p>
                          </div>
                          <Badge variant={challenge.type === 'weekly' ? 'info' : challenge.type === 'monthly' ? 'warning' : 'success'}>
                            {challenge.type === 'weekly' ? 'أسبوعي' : challenge.type === 'monthly' ? 'شهري' : 'منافسة'}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">التقدم</span>
                            <span className="font-semibold">
                              {typeof challenge.progress === 'number' && challenge.progress > 1000 
                                ? challenge.progress.toLocaleString() 
                                : challenge.progress} / {challenge.target.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Gift className="h-5 w-5 text-orange-500" />
                            <span className="text-sm font-semibold text-gray-700">
                              المكافأة: {challenge.reward} نقطة
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ينتهي: {formatDateDMY(challenge.endDate)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-purple-600" />
                الإنجازات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg text-center ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400'
                        : 'bg-gray-100 opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="text-sm font-semibold">{achievement.name}</p>
                    {achievement.unlocked && (
                      <Badge variant="success" className="mt-2">تم الفتح</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rewards Shop */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-6 w-6 text-pink-600" />
                متجر المكافآت
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rewards.map((reward) => {
                  const Icon = reward.icon;
                  const canAfford = userPoints >= reward.points;
                  
                  return (
                    <div
                      key={reward.id}
                      className={`p-3 rounded-lg border-2 flex items-center justify-between ${
                        canAfford ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-8 w-8 ${canAfford ? 'text-green-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="font-semibold text-sm">{reward.name}</p>
                          <p className="text-xs text-gray-600">{reward.points} نقطة</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={!canAfford}
                        className={canAfford ? '' : 'opacity-50'}
                        onClick={() => handleRedeemReward(reward)}
                      >
                        استبدل
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
