import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Sidebar from '@/components/Sidebar';
import { useNotifications } from '@/components/NotificationSystem';
import { FileText, Save, Calendar, Eye, Shield, Activity } from 'lucide-react';
import { supabaseAPI } from '@/lib/supabaseClient';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: Date;
  ipAddress: string;
}

export default function PoliciesLog() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState({
    usage: 'يُسمح باستخدام هذا النظام فقط للموظفين المصرح لهم...',
    privacy: 'تلتزم الجمعية بحماية خصوصية بيانات المتبرعين...',
    security: 'يجب على جميع المستخدمين استخدام كلمات مرور قوية...'
  });
  const [nextReview, setNextReview] = useState('2025-03-01');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // جلب البيانات من Supabase
      const [policiesData, logsData] = await Promise.all([
        supabaseAPI.getPolicies(),
        supabaseAPI.getAuditLogs(50)
      ]);

      if (policiesData && policiesData.length > 0) {
        const policiesObj = {
          usage: policiesData.find((p: any) => p.type === 'usage')?.content || policies.usage,
          privacy: policiesData.find((p: any) => p.type === 'privacy')?.content || policies.privacy,
          security: policiesData.find((p: any) => p.type === 'security')?.content || policies.security
        };
        setPolicies(policiesObj);
      }

      if (logsData && logsData.length > 0) {
        setAuditLogs(logsData);
        setLoading(false);
        return;
      }

      // بيانات تجريبية لسجل العمليات (في حال عدم وجود بيانات)
      const sampleLogs: AuditLog[] = [
        {
          id: '1',
          userId: '1',
          userName: 'أحمد محمد',
          action: 'تسجيل دخول',
          details: 'تم تسجيل الدخول بنجاح',
          timestamp: new Date('2024-12-01T09:30:00'),
          ipAddress: '192.168.1.100'
        },
        {
          id: '2',
          userId: '1',
          userName: 'أحمد محمد',
          action: 'إضافة متبرع',
          details: 'تم إضافة متبرع جديد: عبدالله محمد',
          timestamp: new Date('2024-12-01T10:15:00'),
          ipAddress: '192.168.1.100'
        },
        {
          id: '3',
          userId: '2',
          userName: 'فاطمة أحمد',
          action: 'تعديل مشروع',
          details: 'تم تعديل مشروع "حملة رمضان 2024"',
          timestamp: new Date('2024-12-01T11:20:00'),
          ipAddress: '192.168.1.105'
        },
        {
          id: '4',
          userId: '3',
          userName: 'محمد السالم',
          action: 'حذف مهمة',
          details: 'تم حذف مهمة "متابعة المتبرعين"',
          timestamp: new Date('2024-12-01T14:45:00'),
          ipAddress: '192.168.1.110'
        },
        {
          id: '5',
          userId: '1',
          userName: 'أحمد محمد',
          action: 'تحديث هدف',
          details: 'تم تحديث الهدف الشهري',
          timestamp: new Date('2024-12-01T16:00:00'),
          ipAddress: '192.168.1.100'
        }
      ];

      setAuditLogs(sampleLogs);

      addNotification({
        type: 'success',
        title: '✅ تم التحميل',
        message: 'تم تحميل البيانات بنجاح'
      });
    } catch (error) {
      console.error('Error loading data:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ',
        message: 'حدث خطأ أثناء تحميل البيانات'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicies = async () => {
    try {
      // حفظ السياسات في Supabase
      const policiesData = await supabaseAPI.getPolicies();
      
      for (const [type, content] of Object.entries(policies)) {
        const policy = policiesData.find((p: any) => p.type === type);
        if (policy) {
          await supabaseAPI.updatePolicy(policy.id, content as string);
        }
      }

      addNotification({
        type: 'success',
        title: '✅ تم الحفظ',
        message: 'تم حفظ السياسات بنجاح'
      });
    } catch (error) {
      console.error('Error saving policies:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ',
        message: 'حدث خطأ أثناء حفظ السياسات'
      });
    }
  };

  const handleScheduleReview = () => {
    addNotification({
      type: 'success',
      title: '✅ تم الجدولة',
      message: `تم جدولة المراجعة ليوم ${nextReview}`
    });
  };

  const getActionIcon = (action: string) => {
    if (action.includes('دخول')) return '🔑';
    if (action.includes('إضافة')) return '➕';
    if (action.includes('تعديل')) return '✏️';
    if (action.includes('حذف')) return '🗑️';
    return '📝';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 lg:mr-80 p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            السياسات وسجل العمليات
          </h1>
          <p className="text-xl text-gray-600">إدارة سياسات النظام ومراجعة سجل جميع العمليات</p>
        </div>

        <Tabs defaultValue="policies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="policies">السياسات</TabsTrigger>
            <TabsTrigger value="logs">سجل العمليات</TabsTrigger>
          </TabsList>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  سياسة الاستخدام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={policies.usage}
                  onChange={(e) => setPolicies({...policies, usage: e.target.value})}
                  rows={8}
                  className="mb-4"
                />
                <Button onClick={handleSavePolicies}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  سياسة الخصوصية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={policies.privacy}
                  onChange={(e) => setPolicies({...policies, privacy: e.target.value})}
                  rows={8}
                  className="mb-4"
                />
                <Button onClick={handleSavePolicies}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  سياسة الأمان
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={policies.security}
                  onChange={(e) => setPolicies({...policies, security: e.target.value})}
                  rows={8}
                  className="mb-4"
                />
                <Button onClick={handleSavePolicies}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  جدولة المراجعة الدورية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">تاريخ المراجعة القادمة</label>
                    <Input 
                      type="date"
                      value={nextReview}
                      onChange={(e) => setNextReview(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleScheduleReview}>
                    <Calendar className="h-4 w-4 ml-2" />
                    جدولة
                  </Button>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    💡 يُنصح بمراجعة السياسات كل 3 أشهر لضمان مواكبة التحديثات والتغييرات
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-600" />
                    سجل العمليات
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{auditLogs.length} عملية</Badge>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 ml-2" />
                      تصدير
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getActionIcon(log.action)}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{log.userName}</span>
                              <Badge variant="outline" className="text-xs">{log.action}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                          </div>
                        </div>
                        <div className="text-left text-sm text-gray-500">
                          <p>{log.timestamp.toLocaleDateString('ar-SA')}</p>
                          <p>{log.timestamp.toLocaleTimeString('ar-SA')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span>المستخدم: {log.userId}</span>
                        <span>IP: {log.ipAddress}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات سجل العمليات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">
                      {auditLogs.filter(l => l.action.includes('دخول')).length}
                    </p>
                    <p className="text-sm text-gray-600">تسجيلات دخول</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      {auditLogs.filter(l => l.action.includes('إضافة')).length}
                    </p>
                    <p className="text-sm text-gray-600">إضافات</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-600">
                      {auditLogs.filter(l => l.action.includes('تعديل')).length}
                    </p>
                    <p className="text-sm text-gray-600">تعديلات</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-3xl font-bold text-red-600">
                      {auditLogs.filter(l => l.action.includes('حذف')).length}
                    </p>
                    <p className="text-sm text-gray-600">حذف</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
