import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatDateDMY } from '@/lib/date-utils';
import { Users, Crown, Target, TrendingUp, Award, Star, UserPlus, Settings } from 'lucide-react';
import { supabaseAPI, Donor } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  description: string;
  type: 'donors' | 'celebrities' | 'projects' | 'support';
  leaderId: string;
  memberIds: string[];
  createdAt: Date;
  performance: {
    tasksCompleted: number;
    totalTasks: number;
    avgRating: number;
    totalEarnings: number;
  };
  goals: TeamGoal[];
}

interface TeamGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: Date;
  type: 'tasks' | 'earnings' | 'donors' | 'campaigns';
  completed: boolean;
}

export default function Teams() {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsData, donorsData] = await Promise.all([
        supabaseAPI.getTeams(),
        supabaseAPI.getDonors()
      ]);

      // Transform teams data if necessary or use as is if structure matches
      // For now assuming the DB structure matches or we map it
      const formattedTeams = teamsData.map((t: any) => ({
        ...t,
        createdAt: new Date(t.created_at),
        // Ensure other fields are present or provide defaults
        performance: t.performance || {
          tasksCompleted: 0,
          totalTasks: 0,
          avgRating: 0,
          totalEarnings: 0
        },
        goals: t.goals || []
      }));

      setTeams(formattedTeams);
      setDonors(donorsData as Donor[]);
      
      if (formattedTeams.length > 0) {
        setSelectedTeam(formattedTeams[0].id);
      }
    } catch (error) {
      console.error('Error loading teams data:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات الفرق',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for creating team would go here
    // await supabaseAPI.createTeam(...)
    setIsCreatingTeam(false);
    toast({
      title: 'تم',
      description: 'تم إنشاء الفريق بنجاح (محاكاة)',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const currentTeam = teams.find(t => t.id === selectedTeam);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الفرق</h1>
          <p className="text-gray-500 mt-2">إدارة فرق العمل وتوزيع المهام ومتابعة الأداء</p>
        </div>
        <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Users className="h-4 w-4" />
              إنشاء فريق جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء فريق جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label>اسم الفريق</Label>
                <Input placeholder="مثلاً: فريق التسويق" />
              </div>
              <div className="space-y-2">
                <Label>وصف الفريق</Label>
                <Textarea placeholder="وصف مهام ومسؤوليات الفريق" />
              </div>
              <div className="space-y-2">
                <Label>نوع الفريق</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الفريق" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donors">إدارة المتبرعين</SelectItem>
                    <SelectItem value="celebrities">إدارة المشاهير</SelectItem>
                    <SelectItem value="projects">إدارة المشاريع</SelectItem>
                    <SelectItem value="support">الدعم والمساندة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">إنشاء الفريق</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Teams List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">الفرق الحالية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teams.map(team => (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(team.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedTeam === team.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{team.name}</h3>
                  <Badge variant="outline">{team.memberIds.length} أعضاء</Badge>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{team.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Details */}
        <div className="lg:col-span-3 space-y-6">
          {currentTeam ? (
            <>
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">المهام المنجزة</p>
                        <h3 className="text-2xl font-bold mt-1">{currentTeam.performance.tasksCompleted}</h3>
                        <p className="text-xs text-green-600 mt-1">
                          من أصل {currentTeam.performance.totalTasks} مهمة
                        </p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">تقييم الأداء</p>
                        <h3 className="text-2xl font-bold mt-1">{currentTeam.performance.avgRating}</h3>
                        <div className="flex mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= Math.round(currentTeam.performance.avgRating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">العوائد المحققة</p>
                        <h3 className="text-2xl font-bold mt-1">
                          {currentTeam.performance.totalEarnings.toLocaleString()}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">ر.س</p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">قائد الفريق</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${currentTeam.leaderId}`} />
                            <AvatarFallback>QA</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">أحمد محمد</span>
                        </div>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Crown className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="members">
                <TabsList>
                  <TabsTrigger value="members">الأعضاء</TabsTrigger>
                  <TabsTrigger value="goals">الأهداف</TabsTrigger>
                  <TabsTrigger value="tasks">المهام الحالية</TabsTrigger>
                  <TabsTrigger value="settings">الإعدادات</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>أعضاء الفريق</CardTitle>
                      <Button size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        إضافة عضو
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {currentTeam.memberIds.map((memberId, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${memberId}`} />
                                <AvatarFallback>M{index + 1}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">عضو فريق {index + 1}</h4>
                                <p className="text-sm text-gray-500">مسؤول علاقات عامة</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-left">
                                <p className="text-sm text-gray-500">المهام المنجزة</p>
                                <p className="font-semibold">12/15</p>
                              </div>
                              <Badge variant={index === 0 ? 'default' : 'secondary'}>
                                {index === 0 ? 'نشط جداً' : 'نشط'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="goals" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentTeam.goals.map((goal) => (
                      <Card key={goal.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold">{goal.title}</h4>
                              <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                            </div>
                            <Badge variant={goal.completed ? 'success' : 'outline'}>
                              {goal.completed ? 'مكتمل' : 'قيد التنفيذ'}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>التقدم</span>
                              <span>{Math.round((goal.currentValue / goal.targetValue) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                              <span>الهدف: {goal.targetValue}</span>
                              <span>الموعد: {formatDateDMY(goal.deadline.toISOString())}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
              <div className="text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>اختر فريقاً لعرض التفاصيل</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
