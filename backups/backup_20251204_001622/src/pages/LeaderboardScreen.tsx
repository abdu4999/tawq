import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/Sidebar';
import { supabaseAPI, type Employee } from '@/lib/supabaseClient';
import { Trophy, Medal, Award, TrendingUp, Target, Star } from 'lucide-react';

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'revenue' | 'points' | 'tasks'>('revenue');

  useEffect(() => {
    loadLeaderboard();
  }, [sortBy]);

  const loadLeaderboard = async () => {
    try {
      const employees = await supabaseAPI.getEmployees();

      // Sort based on selected criteria
      const sorted = employees.sort((a, b) => {
        if (sortBy === 'revenue') return (b.total_revenue || 0) - (a.total_revenue || 0);
        if (sortBy === 'points') return (b.performance_score || 0) - (a.performance_score || 0);
        return (b.completed_tasks || 0) - (a.completed_tasks || 0);
      });

      setLeaderboard(sorted);
    } catch (error) {
      console.error('خطأ في تحميل المتصدرين:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-8 w-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-8 w-8 text-gray-400" />;
    if (rank === 3) return <Medal className="h-8 w-8 text-orange-500" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 mr-80 p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-12 w-12 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              لوحة المتصدرين
            </h1>
            <Trophy className="h-12 w-12 text-yellow-500" />
          </div>
          <p className="text-gray-600">ترتيب الموظفين حسب الأداء والإنجازات</p>
        </div>

        {/* Sort Options */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-medium text-gray-700">الترتيب حسب:</span>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'revenue' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('revenue')}
                  className="gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  الإيراد
                </Button>
                <Button
                  variant={sortBy === 'points' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('points')}
                  className="gap-2"
                >
                  <Star className="h-4 w-4" />
                  النقاط
                </Button>
                <Button
                  variant={sortBy === 'tasks' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('tasks')}
                  className="gap-2"
                >
                  <Target className="h-4 w-4" />
                  المهام
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>لا توجد بيانات للعرض</p>
              </CardContent>
            </Card>
          ) : (
            leaderboard.map((employee, index) => {
              const rank = index + 1;
              return (
                <Card
                  key={employee.id}
                  className={`hover:shadow-xl transition-all ${
                    rank <= 3 ? 'border-2' : ''
                  } ${
                    rank === 1 ? 'border-yellow-400 shadow-lg' :
                    rank === 2 ? 'border-gray-400' :
                    rank === 3 ? 'border-orange-400' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      {/* Rank */}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${getRankBadge(rank)}`}>
                        {rank <= 3 ? getRankIcon(rank) : rank}
                      </div>

                      {/* Employee Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{employee.name}</h3>
                        <p className="text-sm text-gray-600">{employee.department || 'الفريق'}</p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {(employee.total_revenue || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">الإيراد (ر.س)</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {employee.performance_score || 0}
                          </p>
                          <p className="text-xs text-gray-600">النقاط</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {employee.completed_tasks || 0}
                          </p>
                          <p className="text-xs text-gray-600">المهام</p>
                        </div>
                      </div>

                      {/* Target Progress */}
                      <div className="w-48">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">الهدف</span>
                          <span className="font-semibold">
                            {employee.target_achievement || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(employee.target_achievement || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
