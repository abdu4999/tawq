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
import { supabaseAPI } from '@/lib/supabaseClient';

export default function TaskDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<any>(null);

  const [newComment, setNewComment] = useState('');
  const [aiSuggestions] = useState([
    'حاول التركيز على الجانب الإنساني للمشروع',
    'اذكر قصص نجاح سابقة لمشاريع مشابهة',
    'قدم خيارات متعددة للتبرع (شهري، سنوي، لمرة واحدة)'
  ]);

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const tasks = await supabaseAPI.getTasks();
      const foundTask = tasks.find((t: any) => t.id === id);
      
      if (foundTask) {
        setTask({
          ...foundTask,
          // Mock data for fields not in DB yet
          comments: [
            { id: 1, author: 'المشرف', text: 'ممتاز، حاول زيادة المبلغ', date: '2025-12-01' }
          ],
          files: ['عرض_المشروع.pdf']
        });
      } else {
        toast({
          title: 'خطأ',
          description: 'لم يتم العثور على المهمة',
          variant: 'destructive'
        });
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Error loading task:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات المهمة',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!task) return;

      await supabaseAPI.updateTask(task.id, {
        title: task.title,
        description: task.description,
        status: task.status,
        // assigned_to: task.assigned_to, // Need to handle this properly with types
        // due_date: task.due_date,
        // revenue: task.revenue
      });

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ تعديلات المهمة بنجاح'
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ التعديلات',
        variant: 'destructive'
      });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    // In a real app, we would save the comment to the database
    const newCommentObj = {
      id: Date.now(),
      author: 'أنت',
      text: newComment,
      date: new Date().toISOString().split('T')[0]
    };
    
    setTask({
      ...task,
      comments: [...(task.comments || []), newCommentObj]
    });

    toast({
      title: 'تم إضافة التعليق',
      description: 'تم إضافة تعليقك بنجاح'
    });
    setNewComment('');
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

  if (!task) return null;

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
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المشروع</Label>
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>{task.project || 'غير محدد'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>المسؤول</Label>
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{task.assigned_to || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>تاريخ الاستحقاق</Label>
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{task.due_date || 'غير محدد'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>العائد المتوقع</Label>
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>{task.revenue ? task.revenue.toLocaleString() : '0'} ر.س</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  التعليقات والمناقشات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {task.comments?.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {comment.author[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{comment.author}</span>
                          <span className="text-xs text-gray-500">{comment.date}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="أضف تعليقاً..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button onClick={handleAddComment}>إرسال</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Suggestions */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Lightbulb className="h-5 w-5" />
                  اقتراحات الذكاء الاصطناعي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-blue-500">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  تطبيق الاقتراحات
                </Button>
              </CardContent>
            </Card>

            {/* Files */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  المرفقات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.files?.map((file: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{file}</span>
                      </div>
                      <Button variant="ghost" size="sm">تنزيل</Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2 border-dashed">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة ملف
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>ملاحظات خاصة</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="أضف ملاحظاتك الخاصة هنا..."
                  className="min-h-[150px]"
                  value={task.notes}
                  onChange={(e) => setTask({ ...task, notes: e.target.value })}
                />
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
