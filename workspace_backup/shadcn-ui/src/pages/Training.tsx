import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabaseAPI } from '@/lib/supabaseClient';
import { useNotifications } from '@/components/NotificationSystem';
import BackButton from '@/components/BackButton';
import { 
  BookOpen, 
  Trophy, 
  Star, 
  Clock, 
  Users, 
  Award, 
  Play, 
  CheckCircle,
  Target,
  Zap
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
  instructor: string;
  rating: number;
  enrolled: number;
  category: string;
}

export default function Training() {
  
  const { addNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userProgress, setUserProgress] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const tasks = await supabaseAPI.getTasks();
      const completedTasks = tasks.filter(t => t.status === 'completed');
      // حساب التقدم بناءً على المهام
      const progress = {
        '1': Math.min((completedTasks.length / 10) * 100, 100),
        '2': Math.min((completedTasks.length / 15) * 100, 100)
      };
      setUserProgress(progress);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const courses: Course[] = [
    {
      id: '1',
      title: 'أساسيات التسويق الرقمي',
      description: 'تعلم أساسيات التسويق الرقمي ووسائل التواصل الاجتماعي',
      duration: '4 ساعات',
      level: 'beginner',
      progress: 75,
      instructor: 'د. أحمد محمد',
      rating: 4.8,
      enrolled: 245,
      category: 'marketing'
    },
    {
      id: '2',
      title: 'إدارة المشاريع الاحترافية',
      description: 'منهجيات إدارة المشاريع وأدوات التخطيط الحديثة',
      duration: '6 ساعات',
      level: 'intermediate',
      progress: 30,
      instructor: 'م. فاطمة العتيبي',
      rating: 4.9,
      enrolled: 189,
      category: 'management'
    },
    {
      id: '3',
      title: 'تحليل البيانات والذكاء الاصطناعي',
      description: 'استخدام البيانات والذكاء الاصطناعي في اتخاذ القرارات',
      duration: '8 ساعات',
      level: 'advanced',
      progress: 0,
      instructor: 'د. محمد الغامدي',
      rating: 4.7,
      enrolled: 156,
      category: 'technology'
    },
    {
      id: '4',
      title: 'القيادة الفعالة',
      description: 'مهارات القيادة وإدارة الفرق في بيئة العمل الحديثة',
      duration: '5 ساعات',
      level: 'intermediate',
      progress: 100,
      instructor: 'أ. نورا الشهري',
      rating: 4.9,
      enrolled: 312,
      category: 'leadership'
    },
    {
      id: '5',
      title: 'التواصل الفعال',
      description: 'تطوير مهارات التواصل والعرض والتقديم',
      duration: '3 ساعات',
      level: 'beginner',
      progress: 60,
      instructor: 'أ. سالم العمري',
      rating: 4.6,
      enrolled: 278,
      category: 'communication'
    },
    {
      id: '6',
      title: 'الابتكار وريادة الأعمال',
      description: 'تنمية الفكر الإبداعي وتطوير المشاريع الريادية',
      duration: '7 ساعات',
      level: 'advanced',
      progress: 15,
      instructor: 'د. خالد الأحمد',
      rating: 4.8,
      enrolled: 134,
      category: 'innovation'
    }
  ];

  const achievements = [
    { title: 'متعلم متميز', description: 'أكمل 5 دورات تدريبية', icon: Trophy, earned: true },
    { title: 'خبير التسويق', description: 'أكمل جميع دورات التسويق', icon: Target, earned: true },
    { title: 'قائد المستقبل', description: 'أكمل دورات القيادة', icon: Star, earned: false },
    { title: 'مبتكر رقمي', description: 'أكمل دورات التكنولوجيا', icon: Zap, earned: false }
  ];

  const handleEnrollCourse = (course: Course) => {
    addNotification({
      type: 'success',
      title: '📚 تم التسجيل بنجاح',
      message: `تم تسجيلك في دورة "${course.title}"`,
      duration: 4000,
      action: {
        label: 'بدء التعلم',
        onClick: () => {
          addNotification({
            type: 'celebration',
            title: '🎉 مرحباً بك!',
            message: 'ابدأ رحلة التعلم واكتسب مهارات جديدة',
          });
        }
      }
    });
  };

  const handleContinueCourse = (course: Course) => {
    addNotification({
      type: 'info',
      title: '📖 متابعة التعلم',
      message: `متابعة دورة "${course.title}" - ${course.progress}% مكتمل`,
      duration: 3000
    });
  };

  const filteredCourses = courses.filter(course => 
    selectedCategory === 'all' || course.category === selectedCategory
  );

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'مبتدئ';
      case 'intermediate': return 'متوسط';
      case 'advanced': return 'متقدم';
      default: return level;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton to="/dashboard" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                منصة التدريب والتطوير
              </h1>
              <p className="text-xl text-gray-600 mt-2">طور مهاراتك واحصل على شهادات معتمدة</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">الدورات المكتملة</p>
                  <p className="text-3xl font-bold">{courses.filter(c => c.progress === 100).length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100">قيد الدراسة</p>
                  <p className="text-3xl font-bold">{courses.filter(c => c.progress > 0 && c.progress < 100).length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-teal-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100">ساعات التعلم</p>
                  <p className="text-3xl font-bold">24</p>
                </div>
                <Clock className="h-8 w-8 text-cyan-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">الشهادات</p>
                  <p className="text-3xl font-bold">3</p>
                </div>
                <Award className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Categories */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
              >
                جميع الدورات
              </Button>
              <Button
                variant={selectedCategory === 'marketing' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('marketing')}
              >
                التسويق
              </Button>
              <Button
                variant={selectedCategory === 'management' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('management')}
              >
                الإدارة
              </Button>
              <Button
                variant={selectedCategory === 'technology' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('technology')}
              >
                التكنولوجيا
              </Button>
              <Button
                variant={selectedCategory === 'leadership' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('leadership')}
              >
                القيادة
              </Button>
              <Button
                variant={selectedCategory === 'communication' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('communication')}
              >
                التواصل
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={`${getLevelColor(course.level)} text-white`}>
                    {getLevelText(course.level)}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm">{course.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="text-sm">{course.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>{course.enrolled} متدرب</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>التقدم</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                
                <div className="text-sm text-gray-600">
                  المدرب: {course.instructor}
                </div>
                
                <div className="flex gap-2">
                  {course.progress === 0 ? (
                    <Button 
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      onClick={() => handleEnrollCourse(course)}
                    >
                      <Play className="h-4 w-4 ml-1" />
                      التسجيل
                    </Button>
                  ) : course.progress === 100 ? (
                    <Button 
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                      disabled
                    >
                      <CheckCircle className="h-4 w-4 ml-1" />
                      مكتمل
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      onClick={() => handleContinueCourse(course)}
                    >
                      <BookOpen className="h-4 w-4 ml-1" />
                      متابعة
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    تفاصيل
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              الإنجازات والشهادات
            </CardTitle>
            <CardDescription>
              اكتسب شارات الإنجاز من خلال إكمال الدورات التدريبية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => {
                const IconComponent = achievement.icon;
                return (
                  <div key={index} className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.earned 
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}>
                    <div className="text-center space-y-2">
                      <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.earned ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      {achievement.earned && (
                        <Badge className="bg-yellow-500 text-white">
                          محقق
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Learning Path */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              مسار التعلم المقترح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="beginner" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="beginner">المبتدئ</TabsTrigger>
                <TabsTrigger value="intermediate">المتوسط</TabsTrigger>
                <TabsTrigger value="advanced">المتقدم</TabsTrigger>
              </TabsList>
              
              <TabsContent value="beginner" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.filter(c => c.level === 'beginner').map((course) => (
                    <div key={course.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {course.progress === 100 ? '✓' : courses.filter(c => c.level === 'beginner').indexOf(course) + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-gray-600">{course.duration}</p>
                      </div>
                      <Progress value={course.progress} className="w-20 h-2" />
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="intermediate" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.filter(c => c.level === 'intermediate').map((course) => (
                    <div key={course.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {course.progress === 100 ? '✓' : courses.filter(c => c.level === 'intermediate').indexOf(course) + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-gray-600">{course.duration}</p>
                      </div>
                      <Progress value={course.progress} className="w-20 h-2" />
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.filter(c => c.level === 'advanced').map((course) => (
                    <div key={course.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {course.progress === 100 ? '✓' : courses.filter(c => c.level === 'advanced').indexOf(course) + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-gray-600">{course.duration}</p>
                      </div>
                      <Progress value={course.progress} className="w-20 h-2" />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}