import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Star, 
  BarChart3, 
  BookOpen, 
  Calculator,
  Trophy,
  Brain,
  GraduationCap,
  ArrowLeft,
  Sparkles,
  Target,
  Heart
} from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  // Auto redirect to dashboard after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const features = [
    {
      icon: CheckSquare,
      title: 'إدارة المهام',
      description: 'تنظيم وتتبع المهام اليومية'
    },
    {
      icon: FolderOpen,
      title: 'إدارة المشاريع',
      description: 'متابعة المشاريع والتقدم'
    },
    {
      icon: Star,
      title: 'إدارة المشاهير',
      description: 'قاعدة بيانات المؤثرين'
    },
    {
      icon: BarChart3,
      title: 'التحليلات والتقارير',
      description: 'رؤى وإحصائيات مفصلة'
    },
    {
      icon: Brain,
      title: 'التحليلات الذكية',
      description: 'رؤى مدعومة بالذكاء الاصطناعي'
    },
    {
      icon: GraduationCap,
      title: 'منصة التدريب',
      description: 'دورات تدريبية وتطوير المهارات'
    },
    {
      icon: Trophy,
      title: 'نظام النقاط والتحفيز',
      description: 'مكافآت وتحديات تفاعلية'
    },
    {
      icon: Calculator,
      title: 'النظام المحاسبي',
      description: 'إدارة الأموال والمعاملات'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                نظام إدارة الأعمال الخيرية
              </h1>
              <p className="text-lg text-gray-600">منصة شاملة لإدارة المشاريع الخيرية والمؤثرين</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium">مدعوم بالذكاء الاصطناعي والتحفيز التفاعلي</span>
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-200 hover:scale-105 bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-3 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-center">
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <Button
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Target className="h-6 w-6 ml-3" />
              دخول لوحة التحكم
              <ArrowLeft className="h-5 w-5 mr-3" />
            </Button>
            
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <span className="animate-pulse">⏱️</span>
              سيتم التوجيه تلقائياً خلال 3 ثوانٍ
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">8+</div>
              <p className="text-gray-600">وحدات متكاملة</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">AI</div>
              <p className="text-gray-600">ذكاء اصطناعي متقدم</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-pink-100">
              <div className="text-3xl font-bold text-pink-600 mb-2">RTL</div>
              <p className="text-gray-600">دعم كامل للعربية</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            تم تطويره بواسطة فريق MGX • جميع الحقوق محفوظة © 2024
          </p>
        </div>
      </div>
    </div>
  );
}