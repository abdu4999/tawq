import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { formatDateDMY } from '@/lib/date-utils';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Settings,
  Bell,
  Lock,
  Camera,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    weekly: true
  });

  const userStats = {
    level: 12,
    points: 8500,
    tasksCompleted: 156,
    revenue: 450000,
    achievements: 24,
    joinDate: '2024-01-15'
  };

  const handleSaveChanges = () => {
    toast({
      title: 'تم حفظ التغييرات',
      description: 'تم تحديث معلوماتك الشخصية بنجاح',
    });
  };

  const handleChangePassword = () => {
    toast({
      title: 'تغيير كلمة المرور',
      description: 'سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
    });
  };

  const handleUploadPhoto = () => {
    toast({
      title: 'تحميل الصورة',
      description: 'ميزة تحميل الصورة قيد التطوير',
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            الملف الشخصي
          </h1>
          <p className="text-gray-600">إدارة معلوماتك وإعداداتك الشخصية</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6 text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mx-auto">
                  أم
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700" onClick={handleUploadPhoto}>
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900">أحمد محمد</h2>
                <p className="text-gray-600">موظف - فريق التسويق</p>
                <Badge className="mt-2" variant="info">المستوى {userStats.level}</Badge>
              </div>

              <div className="pt-4 border-t space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">النقاط</span>
                  <span className="font-bold text-blue-600">{userStats.points.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">المهام المكتملة</span>
                  <span className="font-bold text-green-600">{userStats.tasksCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الإيراد الكلي</span>
                  <span className="font-bold text-purple-600">{userStats.revenue.toLocaleString()} ر.س</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الإنجازات</span>
                  <span className="font-bold text-orange-600">{userStats.achievements}</span>
                </div>
              </div>

              <div className="pt-4 border-t text-xs text-gray-500">
                <div className="flex items-center justify-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>انضم في {formatDateDMY(userStats.joinDate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details & Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-600" />
                  المعلومات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم الكامل
                    </label>
                    <Input defaultValue="أحمد محمد السالم" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المسمى الوظيفي
                    </label>
                    <Input defaultValue="موظف تسويق" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      البريد الإلكتروني
                    </label>
                    <Input type="email" defaultValue="ahmed@mgx.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      رقم الجوال
                    </label>
                    <Input type="tel" defaultValue="+966 50 123 4567" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      العنوان
                    </label>
                    <Input defaultValue="الرياض، المملكة العربية السعودية" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveChanges}>حفظ التغييرات</Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-6 w-6 text-purple-600" />
                  إعدادات الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'email', label: 'إشعارات البريد الإلكتروني', icon: Mail },
                  { key: 'push', label: 'الإشعارات الفورية', icon: Bell },
                  { key: 'sms', label: 'رسائل SMS', icon: Phone },
                  { key: 'weekly', label: 'التقرير الأسبوعي', icon: Calendar },
                ].map((setting) => {
                  const Icon = setting.icon;
                  return (
                    <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-800">{setting.label}</span>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, [setting.key]: !prev[setting.key as keyof typeof prev] }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications[setting.key as keyof typeof notifications] ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications[setting.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Performance Pattern */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  نمط الأداء (تحليل AI)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-gray-800">النمط</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">المنجز المتميز</p>
                    <p className="text-xs text-gray-600 mt-1">أداء مستقر وعالي</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-800">نقاط القوة</span>
                    </div>
                    <p className="text-sm text-gray-700">• التسويق الإبداعي</p>
                    <p className="text-sm text-gray-700">• إدارة العلاقات</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-gray-800">التوصية</span>
                    </div>
                    <p className="text-sm text-gray-700">مؤهل لقيادة فريق</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-6 w-6 text-red-600" />
                  الأمان
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="gap-2" onClick={handleChangePassword}>
                  <Lock className="h-4 w-4" />
                  تغيير كلمة المرور
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
