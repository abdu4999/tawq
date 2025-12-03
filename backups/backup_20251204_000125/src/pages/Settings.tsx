import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/components/NotificationSystem';
import Sidebar from '@/components/Sidebar';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Key,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import {
  getUserSettings,
  updateUserSettings,
  resetUserSettings,
  exportUserSettings,
  importUserSettings,
  getOrCreateUserSettings,
  type UserSettings
} from '@/lib/supabaseSettings';

export default function Settings() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsData = await getOrCreateUserSettings();
      setSettings(settingsData);
      
      addNotification({
        type: 'success',
        title: '⚙️ تم تحميل الإعدادات',
        message: 'تم تحميل إعدادات النظام بنجاح',
        duration: 3000
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في تحميل الإعدادات',
        message: 'حدث خطأ أثناء تحميل الإعدادات'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await updateUserSettings({
        language: settings.language,
        theme: settings.theme,
        timezone: settings.timezone,
        date_format: settings.date_format,
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications,
        sms_notifications: settings.sms_notifications,
        sound_enabled: settings.sound_enabled,
        notification_frequency: settings.notification_frequency,
        profile_visibility: settings.profile_visibility,
        activity_tracking: settings.activity_tracking,
        data_collection: settings.data_collection,
        two_factor_auth: settings.two_factor_auth,
        session_timeout: settings.session_timeout,
        password_expiry: settings.password_expiry,
        login_alerts: settings.login_alerts,
        sidebar_collapsed: settings.sidebar_collapsed,
        compact_mode: settings.compact_mode,
        animations_enabled: settings.animations_enabled,
        high_contrast: settings.high_contrast
      });
      
      addNotification({
        type: 'success',
        title: '✅ تم حفظ الإعدادات',
        message: 'تم حفظ جميع الإعدادات بنجاح',
        duration: 4000
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في الحفظ',
        message: 'حدث خطأ أثناء حفظ الإعدادات'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    addNotification({
      type: 'warning',
      title: '🔄 إعادة تعيين الإعدادات',
      message: 'هل أنت متأكد من إعادة تعيين جميع الإعدادات؟',
      duration: 6000,
      action: {
        label: 'تأكيد',
        onClick: async () => {
          try {
            const resetSettings = await resetUserSettings();
            setSettings(resetSettings);
            addNotification({
              type: 'info',
              title: '↩️ تم إعادة التعيين',
              message: 'تم إعادة تعيين جميع الإعدادات للقيم الافتراضية'
            });
          } catch (error) {
            console.error('Error resetting settings:', error);
            addNotification({
              type: 'error',
              title: '❌ خطأ في إعادة التعيين',
              message: 'حدث خطأ أثناء إعادة تعيين الإعدادات'
            });
          }
        }
      }
    });
  };

  const handleExportSettings = async () => {
    try {
      const exportData = await exportUserSettings();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'info',
        title: '📥 تصدير الإعدادات',
        message: 'تم تصدير الإعدادات كملف JSON',
        duration: 4000
      });
    } catch (error) {
      console.error('Error exporting settings:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في التصدير',
        message: 'حدث خطأ أثناء تصدير الإعدادات'
      });
    }
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedSettings = await importUserSettings(text);
        setSettings(importedSettings);
        
        addNotification({
          type: 'success',
          title: '📤 تم استيراد الإعدادات',
          message: 'تم استيراد الإعدادات بنجاح',
          duration: 4000
        });
      } catch (error) {
        console.error('Error importing settings:', error);
        addNotification({
          type: 'error',
          title: '❌ خطأ في الاستيراد',
          message: 'حدث خطأ أثناء استيراد الإعدادات'
        });
      }
    };
    input.click();
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الإعدادات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">لا يمكن تحميل الإعدادات</p>
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
            الإعدادات
          </h1>
          <p className="text-xl text-gray-600">إدارة إعدادات النظام والتفضيلات الشخصية</p>
        </div>

        {/* Settings Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">عام</TabsTrigger>
                <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
                <TabsTrigger value="privacy">الخصوصية</TabsTrigger>
                <TabsTrigger value="security">الأمان</TabsTrigger>
                <TabsTrigger value="display">العرض</TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">الإعدادات العامة</h3>
                  <p className="text-gray-600">إعدادات اللغة والمنطقة الزمنية والتفضيلات الأساسية</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        اللغة والمنطقة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="language">اللغة</Label>
                        <Select value={settings.language} onValueChange={(value: 'ar' | 'en') => updateSetting('language', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ar">العربية</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="timezone">المنطقة الزمنية</Label>
                        <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                            <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                            <SelectItem value="Asia/Kuwait">الكويت (GMT+3)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
                        <Select value={settings.date_format} onValueChange={(value) => updateSetting('date_format', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dd/mm/yyyy">يوم/شهر/سنة</SelectItem>
                            <SelectItem value="mm/dd/yyyy">شهر/يوم/سنة</SelectItem>
                            <SelectItem value="yyyy-mm-dd">سنة-شهر-يوم</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-purple-600" />
                        المظهر
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="theme">المظهر</Label>
                        <Select value={settings.theme} onValueChange={(value: 'light' | 'dark' | 'auto') => updateSetting('theme', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">فاتح</SelectItem>
                            <SelectItem value="dark">داكن</SelectItem>
                            <SelectItem value="auto">تلقائي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="animations">تفعيل الحركات</Label>
                        <Switch
                          id="animations"
                          checked={settings.animations_enabled}
                          onCheckedChange={(checked) => updateSetting('animations_enabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="compact">الوضع المدمج</Label>
                        <Switch
                          id="compact"
                          checked={settings.compact_mode}
                          onCheckedChange={(checked) => updateSetting('compact_mode', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">إعدادات الإشعارات</h3>
                  <p className="text-gray-600">تحكم في طريقة استلام الإشعارات والتنبيهات</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-600" />
                        طرق الإشعار
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="email-notifications">البريد الإلكتروني</Label>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={settings.email_notifications}
                          onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="push-notifications">إشعارات المتصفح</Label>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={settings.push_notifications}
                          onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="sms-notifications">الرسائل النصية</Label>
                        </div>
                        <Switch
                          id="sms-notifications"
                          checked={settings.sms_notifications}
                          onCheckedChange={(checked) => updateSetting('sms_notifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {settings.sound_enabled ? <Volume2 className="h-4 w-4 text-gray-500" /> : <VolumeX className="h-4 w-4 text-gray-500" />}
                          <Label htmlFor="sound-enabled">الأصوات</Label>
                        </div>
                        <Switch
                          id="sound-enabled"
                          checked={settings.sound_enabled}
                          onCheckedChange={(checked) => updateSetting('sound_enabled', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-green-600" />
                        تكرار الإشعارات
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="notification-frequency">تكرار الإشعارات</Label>
                        <Select value={settings.notification_frequency} onValueChange={(value: 'immediate' | 'hourly' | 'daily' | 'weekly') => updateSetting('notification_frequency', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">فوري</SelectItem>
                            <SelectItem value="hourly">كل ساعة</SelectItem>
                            <SelectItem value="daily">يومي</SelectItem>
                            <SelectItem value="weekly">أسبوعي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Privacy Settings */}
              <TabsContent value="privacy" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">إعدادات الخصوصية</h3>
                  <p className="text-gray-600">تحكم في خصوصية بياناتك ومعلوماتك الشخصية</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-600" />
                      الخصوصية والبيانات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="profile-visibility">مستوى رؤية الملف الشخصي</Label>
                      <Select value={settings.profile_visibility} onValueChange={(value: 'public' | 'team' | 'private') => updateSetting('profile_visibility', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">عام</SelectItem>
                          <SelectItem value="team">الفريق فقط</SelectItem>
                          <SelectItem value="private">خاص</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="activity-tracking">تتبع النشاط</Label>
                        <p className="text-sm text-gray-500">السماح بتتبع نشاطك في النظام</p>
                      </div>
                      <Switch
                        id="activity-tracking"
                        checked={settings.activity_tracking}
                        onCheckedChange={(checked) => updateSetting('activity_tracking', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="data-collection">جمع البيانات</Label>
                        <p className="text-sm text-gray-500">السماح بجمع البيانات لتحسين الخدمة</p>
                      </div>
                      <Switch
                        id="data-collection"
                        checked={settings.data_collection}
                        onCheckedChange={(checked) => updateSetting('data_collection', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">إعدادات الأمان</h3>
                  <p className="text-gray-600">حماية حسابك وتأمين بياناتك</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        المصادقة والحماية
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="two-factor">المصادقة الثنائية</Label>
                          <p className="text-sm text-gray-500">طبقة حماية إضافية لحسابك</p>
                        </div>
                        <Switch
                          id="two-factor"
                          checked={settings.two_factor_auth}
                          onCheckedChange={(checked) => updateSetting('two_factor_auth', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="login-alerts">تنبيهات تسجيل الدخول</Label>
                          <p className="text-sm text-gray-500">إشعار عند تسجيل دخول جديد</p>
                        </div>
                        <Switch
                          id="login-alerts"
                          checked={settings.login_alerts}
                          onCheckedChange={(checked) => updateSetting('login_alerts', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-orange-600" />
                        إعدادات الجلسة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="session-timeout">انتهاء الجلسة (دقيقة)</Label>
                        <Input
                          id="session-timeout"
                          type="number"
                          value={settings.session_timeout}
                          onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="password-expiry">انتهاء صلاحية كلمة المرور (يوم)</Label>
                        <Input
                          id="password-expiry"
                          type="number"
                          value={settings.password_expiry}
                          onChange={(e) => updateSetting('password_expiry', parseInt(e.target.value))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Display Settings */}
              <TabsContent value="display" className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">إعدادات العرض</h3>
                  <p className="text-gray-600">تخصيص طريقة عرض النظام والواجهة</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-blue-600" />
                      تخصيص الواجهة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sidebar-collapsed">طي الشريط الجانبي</Label>
                        <p className="text-sm text-gray-500">إخفاء الشريط الجانبي افتراضياً</p>
                      </div>
                      <Switch
                        id="sidebar-collapsed"
                        checked={settings.sidebar_collapsed}
                        onCheckedChange={(checked) => updateSetting('sidebar_collapsed', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="high-contrast">التباين العالي</Label>
                        <p className="text-sm text-gray-500">تحسين الرؤية للمستخدمين ذوي الاحتياجات الخاصة</p>
                      </div>
                      <Switch
                        id="high-contrast"
                        checked={settings.high_contrast}
                        onCheckedChange={(checked) => updateSetting('high_contrast', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                حفظ جميع الإعدادات
              </>
            )}
          </Button>

          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RefreshCw className="h-4 w-4 ml-2" />
            إعادة تعيين
          </Button>

          <Button variant="outline" onClick={handleExportSettings} disabled={saving}>
            <Download className="h-4 w-4 ml-2" />
            تصدير الإعدادات
          </Button>

          <Button variant="outline" onClick={handleImportSettings} disabled={saving}>
            <Upload className="h-4 w-4 ml-2" />
            استيراد الإعدادات
          </Button>
        </div>
      </div>
    </div>
  );
}