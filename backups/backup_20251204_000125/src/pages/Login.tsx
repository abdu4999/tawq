import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthProvider';
import { useNotifications } from '@/components/NotificationSystem';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      addNotification({
        type: 'warning',
        title: '⚠️ بيانات ناقصة',
        message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
      });
      return;
    }

    try {
      setLoading(true);
      
      if (isLogin) {
        await signIn(formData.email, formData.password);
        addNotification({
          type: 'success',
          title: '✅ تم تسجيل الدخول',
          message: 'مرحباً بك في نظام إدارة الجمعيات الخيرية'
        });
      } else {
        await signUp(formData.email, formData.password);
        addNotification({
          type: 'success',
          title: '✅ تم إنشاء الحساب',
          message: 'تم إنشاء حسابك بنجاح، يرجى تأكيد البريد الإلكتروني'
        });
      }
      
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Auth error:', error);
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      addNotification({
        type: 'error',
        title: isLogin ? '❌ خطأ في تسجيل الدخول' : '❌ خطأ في إنشاء الحساب',
        message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      // Create a demo user or use existing demo credentials
      await signIn('demo@charity.org', 'demo123456');
      addNotification({
        type: 'success',
        title: '✅ تم تسجيل الدخول التجريبي',
        message: 'مرحباً بك في النسخة التجريبية'
      });
      navigate('/dashboard');
    } catch (error) {
      // If demo user doesn't exist, create it
      try {
        await signUp('demo@charity.org', 'demo123456');
        await signIn('demo@charity.org', 'demo123456');
        addNotification({
          type: 'success',
          title: '✅ تم إنشاء حساب تجريبي',
          message: 'تم إنشاء حساب تجريبي وتسجيل الدخول'
        });
        navigate('/dashboard');
      } catch (signupError: unknown) {
        console.error('Demo login error:', signupError);
        addNotification({
          type: 'error',
          title: '❌ خطأ في الدخول التجريبي',
          message: 'حدث خطأ أثناء إنشاء الحساب التجريبي'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'ادخل إلى نظام إدارة الجمعيات الخيرية' : 'أنشئ حساباً جديداً للبدء'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@charity.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pr-10 pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  {isLogin ? 'جاري تسجيل الدخول...' : 'جاري إنشاء الحساب...'}
                </>
              ) : (
                isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">أو</span>
            </div>
          </div>

          <Button
            onClick={handleDemoLogin}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'جاري التحميل...' : 'دخول تجريبي'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
              disabled={loading}
            >
              {isLogin ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : 'لديك حساب؟ سجل الدخول'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}