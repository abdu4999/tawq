import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, DollarSign, User, FileText, MessageSquare, Lightbulb, Paperclip, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TaskDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [task, setTask] = useState<any>({
    id: id,
    title: 'التواصل مع متبرع محتمل',
    description: 'التواصل مع أحمد محمد للحصول على تبرع لمشروع رمضان',
    status: 'in_progress',
    priority: 'high',
    project: 'مشروع رمضان',
    assignedTo: 'أحمد محمد',
    dueDate: '2025-12-10',
    revenue: 5000,
    notes: 'المتبرع أبدى اهتماماً كبيراً بالمشروع',
    files: ['عرض_المشروع.pdf'],
    comments: [
      { id: 1, author: 'المشرف', text: 'ممتاز، حاول زيادة المبلغ', date: '2025-12-01' }
    ]
  });

  const [newComment, setNewComment] = useState('');
  const [aiSuggestions] = useState([
    'حاول التركيز على الجانب الإنساني للمشروع',
    'اذكر قصص نجاح سابقة لمشاريع مشابهة',
    'قدم خيارات متعددة للتبرع (شهري، سنوي، لمرة واحدة)'
  ]);

  const handleSave = () => {
    toast({
      title: 'تم الحفظ',
      description: 'تم حفظ تعديلات المهمة بنجاح'
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    toast({
      title: 'تم إضافة التعليق',
      description: 'تم إضافة تعليقك بنجاح'
    });
    setNewComment('');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/tasks')} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للمهام
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            حفظ التغييرات
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-2xl">{task.title}</CardTitle>
                  <Badge variant={
                    task.priority === 'high' ? 'destructive' :
                    task.priority === 'medium' ? 'warning' : 'default'
                  }>
                    {task.priority === 'high' ? 'عاجل' : task.priority === 'medium' ? 'متوسط' : 'عادي'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>عنوان المهمة</Label>
                  <Input
                    value={task.title}
                    onChange={(e) => setTask({ ...task, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Textarea
                    value={task.description}
                    onChange={(e) => setTask({ ...task, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المشروع</Label>
                    <Input value={task.project} readOnly className="bg-gray-50" />
                  </div>

                  <div className="space-y-2">
                    <Label>المكلف</Label>
                    <Input value={task.assignedTo} readOnly className="bg-gray-50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>تاريخ الاستحقاق</Label>
                    <Input
                      type="date"
                      value={task.dueDate}
                      onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الإيراد المتوقع (ر.س)</Label>
                    <Input
                      type="number"
                      value={task.revenue}
                      onChange={(e) => setTask({ ...task, revenue: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  ملاحظات ومشاكل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={task.notes}
                  onChange={(e) => setTask({ ...task, notes: e.target.value })}
                  rows={4}
                  placeholder="أضف ملاحظات عن المشاكل التي واجهتها..."
                />
              </CardContent>
            </Card>

            {/* Files */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  الملفات المرفقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.files.map((file: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{file}</span>
                      </div>
                      <Button variant="ghost" size="sm">تحميل</Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2">
                    رفع ملف جديد
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  التعليقات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.comments.map((comment: any) => (
                  <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                ))}

                <div className="space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="أضف تعليقاً..."
                    rows={3}
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    إضافة تعليق
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">حالة المهمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className="w-full justify-center py-2 text-sm" variant={
                  task.status === 'completed' ? 'success' :
                  task.status === 'in_progress' ? 'info' : 'warning'
                }>
                  {task.status === 'completed' ? 'مكتملة' :
                   task.status === 'in_progress' ? 'قيد التنفيذ' : 'قيد الانتظار'}
                </Badge>

                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setTask({ ...task, status: 'pending' })}>
                    انتظار
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTask({ ...task, status: 'in_progress' })}>
                    تنفيذ
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTask({ ...task, status: 'completed' })}>
                    إكمال
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معلومات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">تاريخ الإنشاء:</span>
                  <span className="font-semibold">2025-12-01</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">المنشئ:</span>
                  <span className="font-semibold">المشرف</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">الإيراد:</span>
                  <span className="font-semibold text-green-600">{task.revenue} ر.س</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  توصيات AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm bg-white p-3 rounded-lg flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
