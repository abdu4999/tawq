import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Phone, Mail, Calendar, DollarSign, TrendingUp, Heart, MessageSquare } from 'lucide-react';
import { supabaseAPI } from '@/lib/supabaseClient';

export default function DonorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donor, setDonor] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDonorData();
    }
  }, [id]);

  const loadDonorData = async () => {
    try {
      setLoading(true);
      const [donorData, donationsData] = await Promise.all([
        supabaseAPI.getDonorById(id!),
        supabaseAPI.getDonationsByDonor(id!)
      ]);
      
      if (!donorData) {
        // بيانات تجريبية في حال عدم وجود بيانات
        setDonor({
          id: '1',
          name: 'عبدالله محمد الأحمد',
          email: 'abdullah@email.com',
          phone: '+966501234567',
          category: 'vip',
          totalDonations: 250000,
          donationCount: 12,
          lastDonation: new Date('2024-11-25'),
          preferredCauses: ['تعليم', 'صحة'],
          assignedTo: 'أحمد محمد',
          joinDate: new Date('2023-01-15'),
          nextRetarget: new Date('2024-12-06')
        });
        setDonations([
          { date: '2024-11-25', amount: 25000, cause: 'تعليم', method: 'تحويل بنكي' },
          { date: '2024-10-20', amount: 30000, cause: 'صحة', method: 'بطاقة ائتمان' },
          { date: '2024-09-15', amount: 20000, cause: 'تعليم', method: 'تحويل بنكي' }
        ]);
      } else {
        setDonor(donorData);
        setDonations(donationsData);
      }
    } catch (error) {
      console.error('Error loading donor:', error);
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

  if (!donor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 p-6">
          <div className="text-center">لم يتم العثور على المتبرع</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 lg:mr-80 p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/donors')}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-3xl font-bold">ملف المتبرع</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center text-4xl text-white">
                {donor.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{donor.name}</h2>
                <Badge className="bg-purple-500 text-white mt-2">⭐ VIP</Badge>
              </div>
              
              <div className="space-y-3 text-right">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{donor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{donor.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">انضم: {donor.joinDate.toLocaleDateString('ar-SA')}</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">إجمالي التبرعات:</span>
                  <span className="font-bold text-green-600">{donor.totalDonations.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">عدد التبرعات:</span>
                  <span className="font-bold">{donor.donationCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">آخر تبرع:</span>
                  <span>{donor.lastDonation.toLocaleDateString('ar-SA')}</span>
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
              <Tabs defaultValue="history">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="history">تاريخ التبرعات</TabsTrigger>
                  <TabsTrigger value="schedule">جدولة الاستهداف</TabsTrigger>
                  <TabsTrigger value="ai">توصيات AI</TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="space-y-4 mt-6">
                  {donor.donationHistory.map((donation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{donation.amount.toLocaleString()} ر.س</p>
                          <p className="text-sm text-gray-600">{donation.cause}</p>
                          <p className="text-xs text-gray-500">{donation.method}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{donation.date}</span>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4 mt-6">
                  <div className="p-6 bg-blue-50 rounded-lg text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-semibold text-lg mb-2">إعادة الاستهداف القادمة</h3>
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {donor.nextRetarget.toLocaleDateString('ar-SA')}
                    </p>
                    <p className="text-sm text-gray-600">يوم الجمعة - استهداف VIP</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">نص مقترح للحملة:</h4>
                    <p className="text-gray-600 leading-relaxed">
                      السلام عليكم أستاذ {donor.name}،<br/>
                      نشكركم على دعمكم المستمر لمشاريعنا الخيرية. نود إعلامكم بمشروع {donor.preferredCauses[0]} الجديد الذي يحتاج لدعمكم الكريم...
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4 mt-6">
                  <div className="space-y-3">
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-purple-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-purple-900">توصية ذكية</h4>
                          <p className="text-sm text-purple-700 mt-1">
                            المتبرع يفضل التبرع في أشهر رمضان وذو الحجة. خطط للتواصل قبل شهر من هذه الفترات.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Heart className="h-5 w-5 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-green-900">فرصة زيادة التبرع</h4>
                          <p className="text-sm text-green-700 mt-1">
                            متوسط تبرعات المتبرع في ارتفاع. يمكن استهدافه بمشاريع أكبر بقيمة 35,000 ر.س.
                          </p>
                        </div>
                      </div>
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
