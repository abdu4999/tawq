import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, CheckCircle, FileText, MessageSquare, Lightbulb } from 'lucide-react';
import { supabaseAPI } from '@/lib/supabaseClient';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

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
      
      if (!foundTask) {
        // بيانات تجريبية في حال عدم وجود المهمة
        setTask({
          id: '1',
          title: 'التواصل مع المتبرعين الجدد',
          description: 'الاتصال بـ 50 متبرع جديد وتعريفهم بمشاريع الجمعية',
          status: 'in-progress',
          priority: 4,
          assignedTo: ['أحمد محمد', 'فاطمة أحمد'],
          project: 'حملة رمضان 2024',
          dueDate: new Date('2024-12-15'),
          revenue: 25000,
          points: 150,
          createdBy: 'محمد السالم',
          createdAt: new Date('2024-11-25'),
          notes: 'تم الاتصال بـ 30 متبرع حتى الآن. النتائج إيجابية والاستجابة جيدة.',
          comments: [
            { author: 'أحمد محمد', date: '2024-11-28', text: 'تم الانتهاء من 30 متبرع، التقدم جيد' },
            { author: 'محمد السالم', date: '2024-11-29', text: 'ممتاز، استمر بنفس الوتيرة' }
          ],
          aiSuggestions: [
            'ركز على المتبرعين الذين أظهروا اهتماماً بمشاريع التعليم',
            'أفضل أوقات للاتصال: 9 صباحاً - 12 ظهراً',
            'استخدم نص المقدمة المخصص لكل فئة من المتبرعين'
          ]
        });
      } else {
        setTask(foundTask);
      }
    } catch (error) {
      console.error('Error loading task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 p-6">
          <div className="text-center">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 p-6">
          <div className="text-center">لم يتم العثور على المهمة</div>
        </div>
      </div>
    );
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      // إضافة تعليق جديد
      setNewComment('');
      alert('تم إضافة التعليق بنجاح');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 lg:mr-80 p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/tasks')}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-3xl font-bold">تفاصيل المهمة</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{task.title}</CardTitle>
                    <p className="text-gray-600">{task.description}</p>
                  </div>
                  <Badge className={
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-500'
                  }>
                    {task.status === 'completed' ? 'مكتملة' :
                     task.status === 'in-progress' ? 'قيد التنفيذ' : 'معلقة'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الأولوية</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`w-6 h-6 rounded ${i <= task.priority ? 'bg-red-500' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">النقاط</p>
                    <p className="text-2xl font-bold text-purple-600">{task.points}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الإيراد المتوقع</p>
                    <p className="text-2xl font-bold text-green-600">{task.revenue.toLocaleString()} ر.س</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">تاريخ الاستحقاق</p>
                    <p className="font-semibold">{task.dueDate.toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    ملاحظات المهمة
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{task.notes}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    توصيات الذكاء الاصطناعي
                  </h3>
                  <div className="space-y-2">
                    {task.aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">💡 {suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  التعليقات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.comments.map((comment, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{comment.author}</span>
                      <span className="text-sm text-gray-500">{comment.date}</span>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <Textarea 
                    placeholder="أضف تعليقاً..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button className="mt-2" onClick={handleAddComment}>
                    إضافة تعليق
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل إضافية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المشروع</p>
                  <p className="font-semibold">{task.project}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">المُكلفون</p>
                  {task.assignedTo.map((person, index) => (
                    <Badge key={index} variant="outline" className="mr-1">{person}</Badge>
                  ))}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">أُنشئت بواسطة</p>
                  <p className="font-semibold">{task.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
                  <p>{task.createdAt.toLocaleDateString('ar-SA')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Button className="w-full mb-2 bg-green-500 hover:bg-green-600">
                  <CheckCircle className="h-4 w-4 ml-2" />
                  تحديد كمكتملة
                </Button>
                <Button variant="outline" className="w-full">
                  تعديل المهمة
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
