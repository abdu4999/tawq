import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Star, Users, DollarSign, FileText, Upload, MessageSquare } from 'lucide-react';
import { supabaseAPI } from '@/lib/supabaseClient';

export default function InfluencerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [negotiationStatus, setNegotiationStatus] = useState('in-progress');
  const [influencer, setInfluencer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInfluencer();
    }
  }, [id]);

  const loadInfluencer = async () => {
    try {
      setLoading(true);
      const celebrities = await supabaseAPI.getCelebrities();
      const foundInfluencer = celebrities.find((c: any) => c.id === id);
      
      if (!foundInfluencer) {
        // بيانات تجريبية في حال عدم وجود المشهور
        setInfluencer({
          id: '1',
          name: 'محمد أحمد المشهور',
          platform: 'Instagram',
          followers: 2500000,
          engagement: 8.5,
          category: 'entertainment',
          status: 'negotiating',
          email: 'mohammed@agency.com',
          phone: '+966501234567',
          proposedAmount: 50000,
          actualRevenue: 0,
          agreement: {
            posts: 3,
            stories: 5,
            duration: '1 شهر',
            exclusivity: true
          }
        });
      } else {
        setInfluencer(foundInfluencer);
      }
    } catch (error) {
      console.error('Error loading influencer:', error);
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

  if (!influencer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 p-6">
          <div className="text-center">لم يتم العثور على المشهور</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 lg:mr-80 p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/celebrities')}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-3xl font-bold">ملف المشهور</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center text-4xl text-white">
                ⭐
              </div>
              <div>
                <h2 className="text-2xl font-bold">{influencer.name}</h2>
                <p className="text-gray-600">{influencer.platform}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{(influencer.followers / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-gray-600">متابع</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{influencer.engagement}%</p>
                  <p className="text-xs text-gray-600">تفاعل</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2 text-right">
                <div className="flex justify-between">
                  <span className="text-gray-600">الحالة:</span>
                  <Badge className="bg-yellow-500 text-white">قيد التفاوض</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ المقترح:</span>
                  <span className="font-bold">{influencer.proposedAmount.toLocaleString()} ر.س</span>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500">
                <MessageSquare className="h-4 w-4 ml-2" />
                بدء محادثة
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <Tabs defaultValue="negotiation">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="negotiation">التفاوض</TabsTrigger>
                  <TabsTrigger value="agreement">الاتفاقية</TabsTrigger>
                  <TabsTrigger value="materials">الحقيبة الإلكترونية</TabsTrigger>
                </TabsList>

                <TabsContent value="negotiation" className="space-y-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">حالة التفاوض</label>
                    <Select value={negotiationStatus} onValueChange={setNegotiationStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial">اتصال أولي</SelectItem>
                        <SelectItem value="in-progress">قيد التفاوض</SelectItem>
                        <SelectItem value="proposal-sent">تم إرسال العرض</SelectItem>
                        <SelectItem value="accepted">تم القبول</SelectItem>
                        <SelectItem value="rejected">تم الرفض</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">ملاحظات التفاوض</label>
                    <Textarea 
                      rows={4}
                      placeholder="أضف ملاحظاتك هنا..."
                      defaultValue="تم الاتصال الأولي. المشهور مهتم بالتعاون. ينتظر تفاصيل المشروع والعرض المالي."
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">نقاط مهمة:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• يفضل المشاريع الخيرية المتعلقة بالتعليم</li>
                      <li>• متاح للتعاون خلال الشهر القادم</li>
                      <li>• يطلب مراجعة المحتوى قبل النشر</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="agreement" className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <FileText className="h-8 w-8 text-blue-600 mb-2" />
                      <h4 className="font-semibold">المنشورات</h4>
                      <p className="text-2xl font-bold">{influencer.agreement.posts}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Star className="h-8 w-8 text-purple-600 mb-2" />
                      <h4 className="font-semibold">القصص</h4>
                      <p className="text-2xl font-bold">{influencer.agreement.stories}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                      <h4 className="font-semibold">المبلغ المتفق عليه</h4>
                      <p className="text-2xl font-bold">{influencer.proposedAmount.toLocaleString()} ر.س</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Users className="h-8 w-8 text-orange-600 mb-2" />
                      <h4 className="font-semibold">الحصرية</h4>
                      <p className="text-2xl font-bold">{influencer.agreement.exclusivity ? 'نعم' : 'لا'}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">حالة الدفع:</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-700">لم يتم الدفع بعد</span>
                      <Button size="sm" variant="outline">تحديث الحالة</Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="materials" className="space-y-4 mt-6">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-3">رفع الحقيبة الإلكترونية للجمعية</p>
                    <Button>
                      <Upload className="h-4 w-4 ml-2" />
                      رفع ملفات
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">الملفات المرفوعة:</h4>
                    <div className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">دليل الهوية البصرية.pdf</p>
                          <p className="text-xs text-gray-500">2.5 MB</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">تحميل</Button>
                    </div>
                    <div className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-sm">معلومات المشروع.docx</p>
                          <p className="text-xs text-gray-500">1.2 MB</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">تحميل</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
