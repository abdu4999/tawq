import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { formatDateDMY } from '@/lib/date-utils';
import { supabaseAPI } from '@/lib/supabaseClient';
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
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    weekly: true
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const employees = await supabaseAPI.getEmployees();
      // Find employee by email matching the auth user
      const foundEmployee = employees.find((e: any) => e.email === user?.email);
      
      if (foundEmployee) {
        setEmployeeData(foundEmployee);
      } else {
        // Fallback if no employee record found, use auth user data
        setEmployeeData({
          name: user?.email?.split('@')[0] || 'User',
          email: user?.email,
          role: 'User',
          level: 1,
          points: 0,
          tasksCompleted: 0,
          revenue: 0,
          achievements: 0,
          joinDate: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات الملف الشخصي',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
                  {employeeData?.name?.[0] || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700" onClick={handleUploadPhoto}>
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{employeeData?.name}</h2>
                <p className="text-gray-600">{employeeData?.role || 'موظف'}</p>
                <Badge className="mt-2" variant="info">المستوى {employeeData?.level || 1}</Badge>
              </div>

              <div className="pt-4 border-t space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">النقاط</span>
                  <span className="font-bold text-blue-600">{(employeeData?.points || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">المهام المكتملة</span>
                  <span className="font-bold text-green-600">{employeeData?.tasksCompleted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">العوائد المحققة</span>
                  <span className="font-bold text-purple-600">{(employeeData?.revenue || 0).toLocaleString()} ر.س</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings & Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  المعلومات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الاسم الكامل</label>
                    <div className="relative">
                      <User className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input defaultValue={employeeData?.name} className="pr-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input defaultValue={employeeData?.email} className="pr-10" readOnly />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">رقم الهاتف</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input defaultValue={employeeData?.phone || ''} placeholder="05xxxxxxxx" className="pr-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">تاريخ الانضمام</label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input defaultValue={formatDateDMY(employeeData?.joinDate || new Date().toISOString())} className="pr-10" readOnly />
                    </div>
                  </div>
                </div>
                <Button onClick={handleSaveChanges} className="w-full md:w-auto">حفظ التغييرات</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  إعدادات الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">إشعارات البريد الإلكتروني</label>
                    <p className="text-xs text-gray-500">استلام ملخص أسبوعي وتحديثات المهام</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.email}
                    onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    className="toggle"
                  />
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">إشعارات المتصفح</label>
                    <p className="text-xs text-gray-500">تنبيهات فورية عند تحديث المهام</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.push}
                    onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                    className="toggle"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Lock className="h-5 w-5" />
                  الأمان
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">كلمة المرور</p>
                    <p className="text-sm text-gray-500">آخر تغيير: منذ 3 أشهر</p>
                  </div>
                  <Button variant="outline" onClick={handleChangePassword}>تغيير كلمة المرور</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
