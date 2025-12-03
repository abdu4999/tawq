import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Sidebar from '@/components/Sidebar';
import { Shield, History, FileText, Plus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PoliciesLogScreen() {
  const { toast } = useToast();
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const [policyForm, setPolicyForm] = useState({ title: '', content: '' });

  const [policies] = useState([
    {
      id: 1,
      title: 'سياسة التعامل مع المتبرعين',
      category: 'donors',
      version: '2.1',
      updatedBy: 'المدير',
      updatedAt: '2025-11-15',
      status: 'active'
    },
    {
      id: 2,
      title: 'سياسة عمولات المشاهير',
      category: 'influencers',
      version: '1.5',
      updatedBy: 'المحاسب',
      updatedAt: '2025-11-10',
      status: 'active'
    },
    {
      id: 3,
      title: 'سياسة تقييم الأداء',
      category: 'hr',
      version: '3.0',
      updatedBy: 'المشرف',
      updatedAt: '2025-11-01',
      status: 'active'
    }
  ]);

  const [auditLog] = useState([
    {
      id: 1,
      action: 'إنشاء مستخدم جديد',
      user: 'المشرف',
      details: 'إضافة موظف: فاطمة علي',
      timestamp: '2025-12-01 14:30',
      type: 'create'
    },
    {
      id: 2,
      action: 'تعديل معاملة',
      user: 'المحاسب',
      details: 'تعديل معاملة #1523',
      timestamp: '2025-12-01 13:15',
      type: 'update'
    },
    {
      id: 3,
      action: 'حذف مشروع',
      user: 'المدير',
      details: 'حذف مشروع: مشروع تجريبي',
      timestamp: '2025-12-01 10:45',
      type: 'delete'
    },
    {
      id: 4,
      action: 'تحديث سياسة',
      user: 'المدير',
      details: 'تحديث سياسة التعامل مع المتبرعين',
      timestamp: '2025-11-30 16:20',
      type: 'update'
    }
  ]);

  const handleCreatePolicy = () => {
    toast({
      title: 'تم إنشاء السياسة',
      description: 'تم إضافة السياسة الجديدة بنجاح'
    });
    setIsPolicyDialogOpen(false);
    setPolicyForm({ title: '', content: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 mr-80 p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              السياسات وسجل العمليات
            </h1>
          </div>
          <p className="text-gray-600">إدارة السياسات ومراقبة جميع العمليات</p>
        </div>

        <Tabs defaultValue="policies" dir="rtl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="policies">السياسات</TabsTrigger>
            <TabsTrigger value="audit">سجل العمليات</TabsTrigger>
          </TabsList>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">السياسات النشطة</h2>
              <Button onClick={() => setIsPolicyDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                سياسة جديدة
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policies.map((policy) => (
                <Card key={policy.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{policy.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge>
                            {policy.category === 'donors' ? 'متبرعون' :
                             policy.category === 'influencers' ? 'مشاهير' :
                             policy.category === 'hr' ? 'موارد بشرية' : 'عام'}
                          </Badge>
                          <Badge variant="secondary">v{policy.version}</Badge>
                          <Badge variant="success">نشطة</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p>آخر تحديث: {policy.updatedAt}</p>
                      <p>بواسطة: {policy.updatedBy}</p>
                    </div>
                    <Button variant="outline" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      عرض التفاصيل
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <History className="h-6 w-6" />
                سجل جميع العمليات
              </h2>
              <Button variant="outline">تصدير السجل</Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {auditLog.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`p-2 rounded-lg ${
                        log.type === 'create' ? 'bg-green-100' :
                        log.type === 'update' ? 'bg-blue-100' :
                        log.type === 'delete' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        {log.type === 'create' ? '➕' :
                         log.type === 'update' ? '✏️' :
                         log.type === 'delete' ? '🗑️' : '📝'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{log.action}</h3>
                          <span className="text-sm text-gray-500">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{log.details}</p>
                        <p className="text-xs text-gray-500">المستخدم: {log.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Policy Dialog */}
        <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء سياسة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">عنوان السياسة *</label>
                <Input
                  placeholder="مثال: سياسة التعامل مع المتبرعين"
                  value={policyForm.title}
                  onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">محتوى السياسة *</label>
                <Textarea
                  placeholder="اكتب محتوى السياسة هنا..."
                  value={policyForm.content}
                  onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
                  rows={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPolicyDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreatePolicy} disabled={!policyForm.title || !policyForm.content}>
                إنشاء السياسة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
