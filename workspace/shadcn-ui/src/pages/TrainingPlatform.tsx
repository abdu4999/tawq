import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNotifications } from '@/components/NotificationSystem';
import Sidebar from '@/components/Sidebar';
import { supabaseAPI } from '@/lib/supabaseClient';
import {
  GraduationCap,
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Users,
  Star,
  Award,
  TrendingUp,
  Target,
  Calendar,
  Eye,
  Download,
  Share2
} from 'lucide-react';

export default function TrainingPlatform() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'أساسيات إدارة المشاريع الخيرية',
      description: 'تعلم كيفية إدارة المشاريع الخيرية بفعالية من التخطيط إلى التنفيذ',
      instructor: 'د. أحمد محمد',
      duration: '4 ساعات',
      level: 'مبتدئ',
      rating: 4.8,
      students: 245,
      progress: 65,
      completed: false,
      category: 'إدارة',
      image: '📊',
      lessons: 12,
      certificate: true
    },
    {
      id: 2,
      title: 'التسويق الرقمي للجمعيات الخيرية',
      description: 'استراتيجيات التسويق الرقمي الحديثة لزيادة الوعي والتبرعات',
      instructor: 'أ. فاطمة أحمد',
      duration: '6 ساعات',
      level: 'متوسط',
      rating: 4.9,
      students: 189,
      progress: 0,
      completed: false,
      category: 'تسويق',
      image: '📱',
      lessons: 18,
      certificate: true
    },
    {
      id: 3,
      title: 'إدارة المتطوعين والفرق',
      description: 'كيفية بناء وإدارة فرق متطوعين فعالة ومحفزة',
      instructor: 'أ. محمد سالم',
      duration: '3 ساعات',
      level: 'متقدم',
      rating: 4.7,
      students: 156,
      progress: 100,
      completed: true,
      category: 'إدارة',
      image: '👥',
      lessons: 10,
      certificate: true
    },
    {
      id: 4,
      title: 'المحاسبة المالية للمؤسسات الخيرية',
      description: 'أساسيات المحاسبة والتقارير المالية للجمعيات الخيرية',
      instructor: 'د. سارة خالد',
      duration: '5 ساعات',
      level: 'متوسط',
      rating: 4.6,
      students: 203,
      progress: 30,
      completed: false,
      category: 'مالية',
      image: '💰',
      lessons: 15,
      certificate: true
    }
  ]);

  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: 'طالب مجتهد',
      description: 'أكمل أول دورة تدريبية',
      icon: GraduationCap,
      earned: true,
      date: '2024-03-15'
    },
    {
      id: 2,
      title: 'خبير إدارة',
      description: 'أكمل 3 دورات في الإدارة',
      icon: Target,
      earned: false,
      progress: 33
    },
    {
      id: 3,
      title: 'متعلم شغوف',
      description: 'اقض 20 ساعة في التعلم',
      icon: BookOpen,
      earned: false,
      progress: 75
    }
  ]);

  useEffect(() => {
    loadTrainingData();
  }, []);

  const loadTrainingData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading real data
      await new Promise(resolve => setTimeout(resolve, 1000));

      addNotification({
        type: 'success',
        title: '📚 منصة التدريب جاهزة',
        message: 'تم تحميل الدورات التدريبية بنجاح',
        duration: 4000
      });

    } catch (error) {
      console.error('Error loading training data:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في تحميل البيانات',
        message: 'حدث خطأ أثناء تحميل الدورات التدريبية'
      });
    } finally {
      setLoading(false);
    }
  };

  const startCourse = (courseId: number, courseTitle: string) => {
    addNotification({
      type: 'info',
      title: '🎓 بدء الدورة',
      message: `تم بدء دورة "${courseTitle}"`,
      duration: 4000
    });
  };

  const continueCourse = (courseId: number, courseTitle: string) => {
    addNotification({
      type: 'success',
      title: '📖 متابعة التعلم',
      message: `متابعة دورة "${courseTitle}"`,
      duration: 3000
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'مبتدئ': return 'bg-green-100 text-green-800';
      case 'متوسط': return 'bg-blue-100 text-blue-800';
      case 'متقدم': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'إدارة': return 'bg-blue-100 text-blue-800';
      case 'تسويق': return 'bg-pink-100 text-pink-800';
      case 'مالية': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const stats = {
    totalCourses: courses.length,
    completedCourses: courses.filter(c => c.completed).length,
    inProgressCourses: courses.filter(c => c.progress > 0 && !c.completed).length,
    totalHours: courses.reduce((sum, c) => sum + parseInt(c.duration), 0),
    averageRating: courses.reduce((sum, c) => sum + c.rating, 0) / courses.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل منصة التدريب...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 lg:mr-80 p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            منصة التدريب والتطوير
          </h1>
          <p className="text-xl text-gray-600">طور مهاراتك واحصل على شهادات معتمدة</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{stats.totalCourses}</div>
              <p className="text-blue-100">إجمالي الدورات</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-3xl font-bold mb-1">{stats.completedCourses}</div>
              <p className="text-green-100">مكتملة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Play className="h-8 w-8 mx-auto mb-3 text-orange-200" />
              <div className="text-3xl font-bold mb-1">{stats.inProgressCourses}</div>
              <p className="text-orange-100">قيد التقدم</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <div className="text-3xl font-bold mb-1">{stats.totalHours}</div>
              <p className="text-purple-100">ساعات التدريب</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-3 text-yellow-200" />
              <div className="text-3xl font-bold mb-1">{stats.averageRating.toFixed(1)}</div>
              <p className="text-yellow-100">متوسط التقييم</p>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl">{course.image}</div>
                  <div className="flex items-center gap-2">
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                    <Badge className={getCategoryColor(course.category)}>
                      {course.category}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students} طالب</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons} درس</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                    <span className="text-sm text-gray-600">بواسطة {course.instructor}</span>
                  </div>
                  {course.certificate && (
                    <Badge variant="outline" className="text-xs">
                      <Award className="h-3 w-3 ml-1" />
                      شهادة معتمدة
                    </Badge>
                  )}
                </div>

                {course.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>التقدم</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {course.completed ? (
                    <Button className="flex-1 bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-4 w-4 ml-2" />
                      مكتملة
                    </Button>
                  ) : course.progress > 0 ? (
                    <Button 
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                      onClick={() => continueCourse(course.id, course.title)}
                    >
                      <Play className="h-4 w-4 ml-2" />
                      متابعة
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={() => startCourse(course.id, course.title)}
                    >
                      <Play className="h-4 w-4 ml-2" />
                      ابدأ الآن
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              إنجازات التعلم
            </CardTitle>
            <CardDescription>
              تتبع تقدمك واحصل على شارات الإنجاز
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`p-4 rounded-lg border ${achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-full ${achievement.earned ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <achievement.icon className={`h-5 w-5 ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{achievement.title}</h3>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  
                  {achievement.earned ? (
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        مُحقق
                      </Badge>
                      <span className="text-xs text-green-600">
                        {achievement.date && new Date(achievement.date).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  ) : achievement.progress ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>التقدم</span>
                        <span>{achievement.progress}%</span>
                      </div>
                      <Progress value={achievement.progress} className="h-1" />
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      قيد التحقيق
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              إجراءات سريعة
            </CardTitle>
            <CardDescription>
              ابدأ رحلة التعلم الخاصة بك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => {
                  addNotification({
                    type: 'info',
                    title: '📚 استكشاف الدورات',
                    message: 'تصفح جميع الدورات المتاحة'
                  });
                }}
              >
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">استكشف الدورات</span>
              </Button>
              
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={() => {
                  addNotification({
                    type: 'success',
                    title: '🎯 خطة التعلم',
                    message: 'إنشاء خطة تعلم شخصية'
                  });
                }}
              >
                <Target className="h-6 w-6" />
                <span className="text-sm">خطة التعلم</span>
              </Button>
              
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                onClick={() => {
                  addNotification({
                    type: 'achievement',
                    title: '🏆 الإنجازات',
                    message: 'عرض جميع إنجازاتك التعليمية'
                  });
                }}
              >
                <Award className="h-6 w-6" />
                <span className="text-sm">إنجازاتي</span>
              </Button>
              
              <Button 
                className="h-20 flex-col gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                onClick={() => {
                  addNotification({
                    type: 'info',
                    title: '📄 الشهادات',
                    message: 'تحميل شهاداتك المعتمدة'
                  });
                }}
              >
                <Download className="h-6 w-6" />
                <span className="text-sm">شهاداتي</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}