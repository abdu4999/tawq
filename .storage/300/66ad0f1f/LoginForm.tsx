import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!showOtp) {
      // Request OTP
      if (email && phone) {
        // In real app, send OTP to phone/email
        setShowOtp(true);
      } else {
        setError('يرجى إدخال البريد الإلكتروني ورقم الجوال');
      }
      return;
    }

    // Verify OTP and login
    const success = await login({ email, phone, otp });
    if (!success) {
      setError('فشل تسجيل الدخول. يرجى التحقق من البيانات ورمز التحقق');
    }
  };

  const handleBack = () => {
    setShowOtp(false);
    setOtp('');
    setError('');
  };

  const demoCredentials = [
    { role: 'مدير', email: 'admin@charity.org', phone: '+966500000001' },
    { role: 'محاسب', email: 'accountant@charity.org', phone: '+966500000002' },
    { role: 'مشرف', email: 'supervisor@charity.org', phone: '+966500000003' },
    { role: 'موظف', email: 'employee@charity.org', phone: '+966500000004' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-600">
            قياس وتطور
          </CardTitle>
          <CardDescription className="text-gray-600">
            نظام إدارة أداء فرق التسويق الخيري
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!showOtp ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@charity.org"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الجوال
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966500000001"
                    required
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رمز التحقق (OTP)
                  </label>
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    className="w-full text-center text-2xl"
                    maxLength={6}
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    تم إرسال رمز التحقق إلى {phone}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                    رجوع
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                  </Button>
                </div>
              </>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">
                بيانات تجريبية للتجربة:
              </h4>
              <div className="space-y-2">
                {demoCredentials.map((cred, index) => (
                  <div key={index} className="text-xs text-gray-600 border rounded p-2">
                    <div><strong>{cred.role}:</strong></div>
                    <div>البريد: {cred.email}</div>
                    <div>الجوال: {cred.phone}</div>
                    <div className="text-green-600">رمز التحقق: 123456</div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};