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
import { Users, Crown, Target, TrendingUp, Award, Star, UserPlus, Settings } from 'lucide-react';
import { supabaseAPI } from '@/lib/supabaseClient';


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

interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalDonations: number;
  donationCount: number;
  category: 'vip' | 'regular' | 'new' | 'inactive';
  lastDonation: Date;
  preferredCauses: string[];
  assignedTo?: string;
}

export default function Teams() {
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamsData();
  }, []);

  const loadTeamsData = async () => {
    try {
      setLoading(true);
      const [adminUsers, donorsData, tasksData] = await Promise.all([
        supabaseAPI.getAdminUsers(),
        supabaseAPI.getDonors(),
        supabaseAPI.getTasks()
      ]);

      setDonors(donorsData);

      // إنشاء فرق من البيانات الفعلية
      if (adminUsers.length > 0) {
        const realTeams: Team[] = [];
        
        // فريق إدارة المتبرعين
        const donorTeamMembers = adminUsers.slice(0, Math.min(3, adminUsers.length));
        realTeams.push({
          id: '1',
          name: 'فريق إدارة المتبرعين',
          description: 'فريق متخصص في إدارة علاقات المتبرعين وتصنيفهم حسب الفئات',
          type: 'donors',
          leaderId: donorTeamMembers[0]?.id || '1',
          memberIds: donorTeamMembers.map(m => m.id),
          createdAt: new Date('2024-01-01'),
          performance: {
            tasksCompleted: tasksData.filter(t => t.status === 'completed').length,
            totalTasks: tasksData.length,
            avgRating: 4.7,
            totalEarnings: donorsData.reduce((sum, d) => sum + (d.total_donations || 0), 0)
          },
          goals: [{
            id: '1',
            title: 'تحقيق 50 عملية تبرع جديدة',
            description: 'الوصول إلى 50 متبرع جديد في الشهر الحالي',
            targetValue: 50,
            currentValue: donorsData.filter(d => d.category === 'new').length,
            deadline: new Date('2025-01-31'),
            type: 'donors',
            completed: false
          }]
        });

        setTeams(realTeams);
      }

      // بيانات تجريبية احتياطية
      if (adminUsers.length === 0) {
        const sampleTeams: Team[] = [
      {
        id: '1',
        name: 'فريق إدارة المتبرعين',
        description: 'فريق متخصص في إدارة علاقات المتبرعين وتصنيفهم حسب الفئات',
        type: 'donors',
        leaderId: '1',
        memberIds: ['1', '2'],
        createdAt: new Date('2024-01-01'),
        performance: {
          tasksCompleted: 45,
          totalTasks: 52,
          avgRating: 4.7,
          totalEarnings: 125000
        },
        goals: [
          {
            id: '1',
            title: 'زيادة المتبرعين الجدد',
            description: 'جذب 100 متبرع جديد هذا الشهر',
            targetValue: 100,
            currentValue: 73,
            deadline: new Date('2024-02-28'),
            type: 'donors',
            completed: false
          },
          {
            id: '2',
            title: 'تحسين معدل الاحتفاظ',
            description: 'الوصول لمعدل احتفاظ 85% مع المتبرعين الحاليين',
            targetValue: 85,
            currentValue: 78,
            deadline: new Date('2024-03-15'),
            type: 'donors',
            completed: false
          }
        ]
      },
      {
        id: '2',
        name: 'فريق البحث عن المشاهير',
        description: 'فريق متخصص في البحث عن المؤثرين والمشاهير المناسبين للحملات',
        type: 'celebrities',
        leaderId: '3',
        memberIds: ['3', '4'],
        createdAt: new Date('2024-01-15'),
        performance: {
          tasksCompleted: 28,
          totalTasks: 35,
          avgRating: 4.5,
          totalEarnings: 85000
        },
        goals: [
          {
            id: '3',
            title: 'توقيع اتفاقيات جديدة',
            description: 'توقيع 15 اتفاقية مع مؤثرين جدد',
            targetValue: 15,
            currentValue: 9,
            deadline: new Date('2024-02-20'),
            type: 'campaigns',
            completed: false
          }
        ]
      }
    ];

    // بيانات تجريبية للمتبرعين
    const sampleDonors: Donor[] = [
      {
        id: '1',
        name: 'عبدالله محمد الأحمد',
        email: 'abdullah@email.com',
        phone: '+966501234567',
        totalDonations: 25000,
        donationCount: 8,
        category: 'vip',
        lastDonation: new Date('2024-01-20'),
        preferredCauses: ['تعليم', 'صحة'],
        assignedTo: '1'
      },
      {
        id: '2',
        name: 'فاطمة أحمد السالم',
        email: 'fatima@email.com',
        phone: '+966507654321',
        totalDonations: 8500,
        donationCount: 12,
        category: 'regular',
        lastDonation: new Date('2024-01-18'),
        preferredCauses: ['أيتام', 'كسوة'],
        assignedTo: '2'
      },
      {
        id: '3',
        name: 'محمد سعد العتيبي',
        email: 'mohammed@email.com',
        phone: '+966509876543',
        totalDonations: 45000,
        donationCount: 15,
        category: 'vip',
        lastDonation: new Date('2024-01-22'),
        preferredCauses: ['إغاثة', 'مساجد'],
        assignedTo: '1'
      },
      {
        id: '4',
        name: 'نورا خالد الغامدي',
        email: 'nora@email.com',
        phone: '+966502468135',
        totalDonations: 1200,
        donationCount: 3,
        category: 'new',
        lastDonation: new Date('2024-01-25'),
        preferredCauses: ['تعليم'],
        assignedTo: '2'
      },
      {
        id: '5',
        name: 'سعد علي الشهري',
        email: 'saad@email.com',
        phone: '+966503691470',
        totalDonations: 3200,
        donationCount: 2,
        category: 'inactive',
        lastDonation: new Date('2023-11-15'),
        preferredCauses: ['صحة', 'إغاثة']
      }
    ];

    setTeams(sampleTeams);
    setDonors(sampleDonors);
  }, []);

  const getTeamTypeIcon = (type: string) => {
    switch (type) {
      case 'donors': return '💰';
      case 'celebrities': return '⭐';
      case 'projects': return '🎯';
      case 'support': return '🛠️';
      default: return '👥';
    }
  };

  const getTeamTypeName = (type: string) => {
    switch (type) {
      case 'donors': return 'إدارة المتبرعين';
      case 'celebrities': return 'المشاهير والمؤثرين';
      case 'projects': return 'إدارة المشاريع';
      case 'support': return 'الدعم الفني';
      default: return type;
    }
  };

  const getDonorCategoryColor = (category: string) => {
    switch (category) {
      case 'vip': return 'bg-purple-500 text-white';
      case 'regular': return 'bg-blue-500 text-white';
      case 'new': return 'bg-green-500 text-white';
      case 'inactive': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDonorCategoryName = (category: string) => {
    switch (category) {
      case 'vip': return 'VIP';
      case 'regular': return 'عادي';
      case 'new': return 'جديد';
      case 'inactive': return 'غير نشط';
      default: return category;
    }
  };

  const getTeamLeader = (leaderId: string) => {
    return employees.find(emp => emp.id === leaderId);
  };

  const getTeamMembers = (memberIds: string[]) => {
    return employees.filter(emp => memberIds.includes(emp.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            👥 إدارة الفرق المتخصصة
          </h1>
          <p className="text-gray-600 text-lg">تنظيم وإدارة الفرق لتحقيق أفضل النتائج</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">إجمالي الفرق</p>
                  <p className="text-2xl font-bold">{teams.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">إجمالي الأعضاء</p>
                  <p className="text-2xl font-bold">{teams.reduce((sum, team) => sum + team.memberIds.length, 0)}</p>
                </div>
                <UserPlus className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">المتبرعين المسجلين</p>
                  <p className="text-2xl font-bold">{donors.length}</p>
                </div>
                <Target className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">إجمالي التبرعات</p>
                  <p className="text-2xl font-bold">{donors.reduce((sum, d) => sum + d.totalDonations, 0).toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="teams">الفرق</TabsTrigger>
            <TabsTrigger value="donors">إدارة المتبرعين</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
            <TabsTrigger value="goals">الأهداف</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">الفرق المتخصصة</h2>
              <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
                <DialogTrigger asChild>
                  <Button>إنشاء فريق جديد</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنشاء فريق جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>اسم الفريق</Label>
                      <Input placeholder="اسم الفريق" />
                    </div>
                    <div>
                      <Label>نوع الفريق</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الفريق" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="donors">إدارة المتبرعين</SelectItem>
                          <SelectItem value="celebrities">المشاهير والمؤثرين</SelectItem>
                          <SelectItem value="projects">إدارة المشاريع</SelectItem>
                          <SelectItem value="support">الدعم الفني</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>قائد الفريق</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر قائد الفريق" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>الوصف</Label>
                      <Textarea placeholder="وصف مهام ومسؤوليات الفريق" />
                    </div>
                    <Button className="w-full">إنشاء الفريق</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teams.map((team) => {
                const leader = getTeamLeader(team.leaderId);
                const members = getTeamMembers(team.memberIds);
                
                return (
                  <Card key={team.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getTeamTypeIcon(team.type)}</div>
                          <div>
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                            <Badge variant="outline">{getTeamTypeName(team.type)}</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm">{team.description}</p>

                      {/* Team Leader */}
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Crown className="h-5 w-5 text-yellow-600" />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={leader?.avatar} />
                          <AvatarFallback>{leader?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{leader?.name}</p>
                          <p className="text-xs text-gray-500">قائد الفريق</p>
                        </div>
                      </div>

                      {/* Team Members */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">أعضاء الفريق ({members.length})</h4>
                          <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <UserPlus className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>إضافة عضو جديد</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>اختر الموظف</Label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر موظف" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {employees.filter(emp => !team.memberIds.includes(emp.id)).map(emp => (
                                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button className="w-full">إضافة للفريق</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {members.map(member => (
                            <div key={member.id} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{member.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{team.performance.tasksCompleted}/{team.performance.totalTasks}</p>
                          <p className="text-xs text-gray-500">المهام المكتملة</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold">{team.performance.avgRating}</span>
                          </div>
                          <p className="text-xs text-gray-500">التقييم</p>
                        </div>
                      </div>

                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-800">إجمالي الإنجازات</p>
                        <p className="text-lg font-bold text-blue-600">{team.performance.totalEarnings.toLocaleString()} ر.س</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="donors" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">قاعدة بيانات المتبرعين</h2>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="تصفية حسب الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="regular">عادي</SelectItem>
                    <SelectItem value="new">جديد</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
                <Button>إضافة متبرع جديد</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donors.map((donor) => {
                const assignedEmployee = employees.find(emp => emp.id === donor.assignedTo);
                return (
                  <Card key={donor.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{donor.name}</h3>
                          <p className="text-sm text-gray-500">{donor.email}</p>
                          <p className="text-sm text-gray-500">{donor.phone}</p>
                        </div>
                        <Badge className={getDonorCategoryColor(donor.category)}>
                          {getDonorCategoryName(donor.category)}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded">
                            <p className="text-lg font-bold text-green-600">{donor.totalDonations.toLocaleString()}</p>
                            <p className="text-xs text-green-600">إجمالي التبرعات</p>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded">
                            <p className="text-lg font-bold text-blue-600">{donor.donationCount}</p>
                            <p className="text-xs text-blue-600">عدد التبرعات</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">القضايا المفضلة:</p>
                          <div className="flex flex-wrap gap-1">
                            {donor.preferredCauses.map(cause => (
                              <Badge key={cause} variant="outline" className="text-xs">
                                {cause}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-sm text-gray-500">
                          <p>آخر تبرع: {donor.lastDonation.toLocaleDateString('ar-SA')}</p>
                        </div>

                        {assignedEmployee && (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={assignedEmployee.avatar} />
                              <AvatarFallback className="text-xs">{assignedEmployee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-medium">مسؤول الحساب</p>
                              <p className="text-xs text-gray-500">{assignedEmployee.name}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            تعديل
                          </Button>
                          <Button size="sm" className="flex-1">
                            تواصل
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teams.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-xl">{getTeamTypeIcon(team.type)}</span>
                      {team.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{Math.round((team.performance.tasksCompleted / team.performance.totalTasks) * 100)}%</p>
                        <p className="text-xs text-gray-500">معدل الإنجاز</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xl font-bold">{team.performance.avgRating}</span>
                        </div>
                        <p className="text-xs text-gray-500">التقييم</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-green-600">{team.performance.totalEarnings.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">الإنجازات (ر.س)</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>تقدم المهام:</span>
                        <span>{team.performance.tasksCompleted}/{team.performance.totalTasks}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(team.performance.tasksCompleted / team.performance.totalTasks) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="space-y-6">
              {teams.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-xl">{getTeamTypeIcon(team.type)}</span>
                      أهداف {team.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {team.goals.map((goal) => (
                        <div key={goal.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">{goal.title}</h4>
                              <p className="text-sm text-gray-600">{goal.description}</p>
                            </div>
                            {goal.completed && (
                              <Badge className="bg-green-500 text-white">
                                مكتمل ✓
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>التقدم:</span>
                              <span>{goal.currentValue}/{goal.targetValue}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                            <span>الموعد النهائي: {goal.deadline.toLocaleDateString('ar-SA')}</span>
                            <Badge variant="outline">{goal.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}