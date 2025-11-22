import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GamificationStorage, LeaderboardEntry, Challenge } from '../lib/gamification-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export const Gamification: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [userRank, setUserRank] = useState(0);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'individual' as Challenge['type'],
    target: 0,
    rewardPoints: 0,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadGamificationData();
  }, [user]);

  const loadGamificationData = () => {
    const leaderboardData = GamificationStorage.getLeaderboard();
    const activeChallenges = GamificationStorage.getActiveChallenges();
    
    setLeaderboard(leaderboardData);
    setChallenges(activeChallenges);

    if (user) {
      const points = GamificationStorage.getUserPoints(user.id);
      const rank = leaderboardData.find(entry => entry.userId === user.id)?.rank || 0;
      setUserPoints(points);
      setUserRank(rank);
    }
  };

  const handleJoinChallenge = (challengeId: string) => {
    if (!user) return;

    const success = GamificationStorage.joinChallenge(challengeId, user.id);
    if (success) {
      loadGamificationData(); // Reload to update challenges
    }
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();

    const createdChallenge = GamificationStorage.createChallenge({
      ...newChallenge,
      status: 'active',
      participants: []
    });

    if (createdChallenge) {
      setChallenges([...challenges, createdChallenge]);
      setShowCreateChallenge(false);
      setNewChallenge({
        title: '',
        description: '',
        type: 'individual',
        target: 0,
        rewardPoints: 0,
        startDate: '',
        endDate: ''
      });
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-100 text-yellow-800">🥇 الأول</Badge>;
    if (rank === 2) return <Badge className="bg-gray-100 text-gray-800">🥈 الثاني</Badge>;
    if (rank === 3) return <Badge className="bg-orange-100 text-orange-800">🥉 الثالث</Badge>;
    return <Badge variant="outline">المرتبة {rank}</Badge>;
  };

  const getChallengeTypeBadge = (type: Challenge['type']) => {
    return (
      <Badge variant={type === 'individual' ? 'default' : 'secondary'} className={
        type === 'individual' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
      }>
        {type === 'individual' ? 'فردي' : 'جماعي'}
      </Badge>
    );
  };

  const calculateChallengeProgress = (challenge: Challenge): number => {
    // Simplified progress calculation - in real app, this would track actual progress
    return Math.min(Math.random() * 100, 100);
  };

  const canCreateChallenges = user && (user.role === 'admin' || user.role === 'supervisor');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">نظام التحفيز والتحديات</h1>
          <p className="text-gray-600">اكتسب النقاط وتنافس مع زملائك</p>
        </div>
        {canCreateChallenges && (
          <Button onClick={() => setShowCreateChallenge(true)}>
            + إنشاء تحدي جديد
          </Button>
        )}
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي النقاط</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userPoints}</div>
            <p className="text-xs text-gray-500">نقطة مكتسبة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المرتبة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userRank}</div>
            <p className="text-xs text-gray-500">من أصل {leaderboard.length} مشارك</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">التحديات النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {challenges.filter(c => c.participants.includes(user?.id || '')).length}
            </div>
            <p className="text-xs text-gray-500">تحدي نشط</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>لوحة المتصدرين</CardTitle>
            <CardDescription>أفضل 10 موظفين حسب النقاط</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((entry) => (
                <div key={entry.userId} className={`flex items-center justify-between p-3 border rounded-lg ${
                  entry.userId === user?.id ? 'bg-blue-50 border-blue-200' : ''
                }`}>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      entry.rank === 1 ? 'bg-yellow-500' :
                      entry.rank === 2 ? 'bg-gray-400' :
                      entry.rank === 3 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {entry.rank}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">
                        {entry.userName}
                        {entry.userId === user?.id && (
                          <span className="text-blue-600 text-xs mr-2">(أنت)</span>
                        )}
                      </h4>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>أداء: {entry.performancePoints}</span>
                        <span>إبداع: {entry.creativityPoints}</span>
                        <span>فريق: {entry.teamPoints}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{entry.totalPoints}</div>
                    <div className="text-xs text-gray-500">نقطة</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Challenges */}
        <Card>
          <CardHeader>
            <CardTitle>التحديات النشطة</CardTitle>
            <CardDescription>انضم إلى التحديات واربح النقاط</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challenges.map((challenge) => {
                const isParticipating = challenge.participants.includes(user?.id || '');
                const progress = calculateChallengeProgress(challenge);
                
                return (
                  <div key={challenge.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold mb-1">{challenge.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                        <div className="flex items-center gap-2">
                          {getChallengeTypeBadge(challenge.type)}
                          <Badge variant="outline" className="text-xs">
                            {challenge.rewardPoints} نقطة
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {isParticipating && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>التقدم</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>
                        {new Date(challenge.startDate).toLocaleDateString('ar-SA')} - {new Date(challenge.endDate).toLocaleDateString('ar-SA')}
                      </span>
                      <span>{challenge.participants.length} مشارك</span>
                    </div>

                    {!isParticipating && (
                      <Button 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => handleJoinChallenge(challenge.id)}
                      >
                        الانضمام إلى التحدي
                      </Button>
                    )}

                    {isParticipating && (
                      <Badge variant="default" className="w-full mt-3 justify-center bg-green-100 text-green-800">
                        🎯 أنت مشارك في هذا التحدي
                      </Badge>
                    )}
                  </div>
                );
              })}

              {challenges.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🏆</div>
                  <p>لا توجد تحديات نشطة حالياً</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Challenge Form */}
      {showCreateChallenge && (
        <Card>
          <CardHeader>
            <CardTitle>إنشاء تحدي جديد</CardTitle>
            <CardDescription>صمم تحديًا جديدًا لفريقك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">عنوان التحدي</label>
                  <Input
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                    placeholder="عنوان التحدي"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">نوع التحدي</label>
                  <Select
                    value={newChallenge.type}
                    onValueChange={(value: Challenge['type']) => setNewChallenge({...newChallenge, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">فردي</SelectItem>
                      <SelectItem value="team">جماعي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الهدف</label>
                  <Input
                    type="number"
                    value={newChallenge.target}
                    onChange={(e) => setNewChallenge({...newChallenge, target: Number(e.target.value)})}
                    placeholder="الهدف الرقمي"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">النقاط المكافأة</label>
                  <Input
                    type="number"
                    value={newChallenge.rewardPoints}
                    onChange={(e) => setNewChallenge({...newChallenge, rewardPoints: Number(e.target.value)})}
                    placeholder="عدد النقاط"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تاريخ البدء</label>
                  <Input
                    type="date"
                    value={newChallenge.startDate}
                    onChange={(e) => setNewChallenge({...newChallenge, startDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تاريخ الانتهاء</label>
                  <Input
                    type="date"
                    value={newChallenge.endDate}
                    onChange={(e) => setNewChallenge({...newChallenge, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">وصف التحدي</label>
                <Textarea
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                  placeholder="وصف تفصيلي للتحدي والمتطلبات"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">إنشاء التحدي</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateChallenge(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Points Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>تفصيل النقاط</CardTitle>
          <CardDescription>كيفية كسب النقاط وتحسين أدائك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="border rounded-lg p-4">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold mb-1">نقاط الأداء</h4>
              <p className="text-sm text-gray-600">إكمال المهام وتحقيق الأهداف</p>
              <div className="text-blue-600 font-bold mt-2">100 نقطة/مهمة</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-2xl mb-2">💡</div>
              <h4 className="font-semibold mb-1">نقاط الإبداع</h4>
              <p className="text-sm text-gray-600">تقديم أفكار وحلول مبتكرة</p>
              <div className="text-green-600 font-bold mt-2">50 نقطة/فكرة</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-2xl mb-2">🤝</div>
              <h4 className="font-semibold mb-1">نقاط الفريق</h4>
              <p className="text-sm text-gray-600">التعاون ومساعدة الزملاء</p>
              <div className="text-purple-600 font-bold mt-2">75 نقطة/مساهمة</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-2xl mb-2">⭐</div>
              <h4 className="font-semibold mb-1">نقاط المكافآت</h4>
              <p className="text-sm text-gray-600">إنجازات استثنائية وتحديات</p>
              <div className="text-orange-600 font-bold mt-2">200-500 نقطة</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};