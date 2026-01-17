import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateDMY } from '@/lib/date-utils';
import { supabaseAPI, getCurrentUser } from '@/lib/supabaseClient';
import {
  Trophy,
  Star,
  Award,
  Gift,
  Zap,
  Target,
  Flame
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const generateFallbackId = () => Math.random().toString(36).slice(2, 10);

type ChallengeType = 'weekly' | 'monthly' | 'competition' | 'general';

interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  deadline?: string | null;
  type: ChallengeType | string;
  participants?: number;
}

interface RewardItem {
  id: string;
  name: string;
  description?: string;
  points: number;
  icon?: string;
  available?: number;
}

interface AchievementItem {
  id: string;
  name: string;
  icon?: string;
  unlocked: boolean;
}

export default function GamificationScreen() {
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser().catch(() => null);

      const [profile, achievementsData, challengesData, rewardsData] = await Promise.all([
        user ? supabaseAPI.getGamificationProfile(user.id).catch(() => null) : null,
        user ? supabaseAPI.getUserAchievements(user.id).catch(() => []) : supabaseAPI.getAchievements().catch(() => []),
        supabaseAPI.getChallenges().catch(() => []),
        supabaseAPI.getRewards().catch(() => [])
      ]);

      if (profile) {
        setUserPoints(profile.points || 0);
        setUserLevel(profile.level || 1);
      } else {
        setUserPoints(0);
        setUserLevel(1);
      }

      const normalizedAchievements = (achievementsData || []).map((item: any) => {
        const base = item.achievement || item;
        return {
          id: base?.id || item.id || generateFallbackId(),
          name: base?.title || base?.name || item.name || 'إنجاز',
          icon: base?.icon || item.icon || '🏆',
          unlocked: Boolean(item.earned ?? item.unlocked ?? item.completed ?? item.claimed ?? false)
        } as AchievementItem;
      });

      const normalizedChallenges = (challengesData || []).map((challenge: any) => ({
        id: challenge.id || generateFallbackId(),
        title: challenge.title || 'تحدي بلا اسم',
        description: challenge.description || 'تفاصيل التحدي غير متوفرة',
        progress: Number(challenge.progress ?? challenge.progress_value ?? 0),
        target: Number(challenge.target ?? challenge.target_value ?? challenge.goal ?? 100),
        reward: Number(challenge.reward ?? challenge.points ?? 0),
        deadline: challenge.deadline || challenge.end_date || challenge.due_date || null,
        type: challenge.type || challenge.category || 'general',
        participants: challenge.participants ?? challenge.participants_count ?? 0
      }));

      const normalizedRewards = (rewardsData || []).map((reward: any) => ({
        id: reward.id || generateFallbackId(),
        name: reward.title || reward.name || 'مكافأة',
        description: reward.description,
        points: Number(reward.points ?? reward.cost ?? reward.points_required ?? 0),
        icon: reward.icon || reward.emoji || '🎁',
        available: reward.available ?? reward.available_quantity ?? reward.stock ?? undefined
      }));

      setAchievements(normalizedAchievements);
      setChallenges(normalizedChallenges);
      setRewards(normalizedRewards);
    } catch (error) {
      console.error('Error loading gamification data:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات نظام التحفيز',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = (rewardId: string) => {
    const reward = rewards.find((item) => item.id === rewardId);
    if (!reward) return;

    if (reward.available !== undefined && reward.available <= 0) {
      toast({
        title: 'غير متاح',
        description: 'هذه المكافأة غير متوفرة حالياً',
        variant: 'destructive'
      });
      return;
    }

    if (userPoints < reward.points) {
      toast({
        title: 'نقاط غير كافية',
        description: `تحتاج إلى ${reward.points.toLocaleString()} نقطة لاستبدال ${reward.name}`,
        variant: 'destructive'
      });
      return;
    }

    setUserPoints((prev) => prev - reward.points);
    setRewards((prev) =>
      prev.map((item) =>
        item.id === rewardId
          ? {
              ...item,
              available:
                item.available !== undefined ? Math.max(item.available - 1, 0) : item.available
            }
          : item
      )
    );

    toast({
      title: 'تم الاستبدال',
      description: `تم استبدال ${reward.name} بنجاح`
    });
  };

  const handleJoinChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((challenge) =>
        challenge.id === challengeId
          ? { ...challenge, participants: (challenge.participants || 0) + 1 }
          : challenge
      )
    );

    const joinedChallenge = challenges.find((challenge) => challenge.id === challengeId);
    toast({
      title: 'تم الانضمام للتحدي',
      description: joinedChallenge ? `بالتوفيق في ${joinedChallenge.title}` : 'تم الانضمام بنجاح'
    });
  };

  const getProgressPercentage = (progress: number, target: number) => {
    if (!target) return 0;
    return Math.min(Math.round((progress / target) * 100), 100);
  };

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'أسبوعي';
      case 'monthly':
        return 'شهري';
      case 'competition':
        return 'منافسة';
      default:
        return 'عام';
    }
  };

  const getChallengeBadgeVariant = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'info';
      case 'monthly':
        return 'warning';
      case 'competition':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const formatRemainingDays = (deadline?: string | null) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل نظام التحفيز...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-sm text-purple-100">الإنجازات المفتوحة</p>
                <p className="text-4xl font-bold">
                  {achievements.filter((achievement) => achievement.unlocked).length}/{achievements.length}
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
              {challenges.length ? (
                challenges.map((challenge) => {
                const progressPercent = getProgressPercentage(challenge.progress, challenge.target);
                const remainingDays = formatRemainingDays(challenge.deadline);

                return (
                  <Card key={challenge.id} className="border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{challenge.title}</h3>
                            <p className="text-sm text-gray-600">{challenge.description}</p>
                          </div>
                          <Badge variant={getChallengeBadgeVariant(challenge.type)}>
                            {getChallengeTypeLabel(challenge.type)}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">التقدم</span>
                            <span className="font-semibold">
                              {typeof challenge.progress === 'number' && challenge.progress > 1000
                                ? challenge.progress.toLocaleString()
                                : challenge.progress}{' '}
                              / {challenge.target.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Gift className="h-5 w-5 text-orange-500" />
                            <span className="font-semibold text-gray-700">
                              المكافأة: {challenge.reward.toLocaleString()} نقطة
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {challenge.deadline ? `ينتهي في ${formatDateDMY(challenge.deadline)}` : 'بدون موعد نهائي'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>المشاركون: {challenge.participants ?? 0}</span>
                          {typeof remainingDays === 'number' && (
                            <span>
                              متبقي {remainingDays > 0 ? `${remainingDays} يوم` : 'أقل من يوم'}
                            </span>
                          )}
                        </div>

                        <Button className="w-full" variant="outline" onClick={() => handleJoinChallenge(challenge.id)}>
                          انضم للتحدي
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد تحديات متاحة حالياً
                </div>
              )}
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
                {achievements.length ? (
                  achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg text-center ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400'
                        : 'bg-gray-100 opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{achievement.icon || '🏆'}</div>
                    <p className="text-sm font-semibold">{achievement.name}</p>
                    {achievement.unlocked && (
                      <Badge variant="success" className="mt-2">
                        تم الفتح
                      </Badge>
                    )}
                  </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 col-span-2">
                    لا توجد إنجازات مسجلة
                  </div>
                )}
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
                {rewards.length ? (
                  rewards.map((reward) => {
                  const canAfford = userPoints >= reward.points;
                  const available = reward.available ?? Infinity;

                  return (
                    <div
                      key={reward.id}
                      className={`p-3 rounded-lg border-2 flex items-center justify-between ${
                        canAfford && available !== 0 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{reward.icon || '🎁'}</div>
                        <div>
                          <p className="font-semibold text-sm">{reward.name}</p>
                          <p className="text-xs text-gray-600">{reward.points} نقطة</p>
                          {reward.description && (
                            <p className="text-xs text-gray-500 mt-1">{reward.description}</p>
                          )}
                          {reward.available !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">متوفر: {reward.available}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={!canAfford || available === 0}
                        className={!canAfford || available === 0 ? 'opacity-50' : ''}
                        onClick={() => handleRedeemReward(reward.id)}
                      >
                        {!canAfford ? 'نقاط غير كافية' : available === 0 ? 'غير متوفر' : 'استبدل'}
                      </Button>
                    </div>
                  );
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    لا توجد مكافآت متاحة حالياً
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
