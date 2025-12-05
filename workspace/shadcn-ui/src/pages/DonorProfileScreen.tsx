import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, DollarSign, Calendar, TrendingUp, History, Phone, Mail, Heart, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DonorProfileScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [donor] = useState({
    id: id,
    name: 'أحمد محمد السعيد',
    email: 'ahmed@example.com',
    phone: '0501234567',
    type: 'individual',
    segment: 'vip',
    totalDonations: 150000,
    donationsCount: 12,
    avgDonation: 12500,
    firstDonation: '2024-01-15',
    lastDonation: '2025-11-25',
    status: 'active',
    notes: 'متبرع منتظم يهتم بمشاريع التعليم'
  });

  const [donations] = useState([
    {
      id: 1,
      date: '2025-11-25',
      amount: 25000,
      project: 'مشروع رمضان',
      method: 'bank_transfer',
      status: 'completed'
    },
    {
      id: 2,
      date: '2025-10-15',
      amount: 15000,
      project: 'بناء مسجد',
      method: 'credit_card',
      status: 'completed'
    },
    {
      id: 3,
      date: '2025-09-10',
      amount: 10000,
      project: 'كفالة يتيم',
      method: 'bank_transfer',
      status: 'completed'
    }
  ]);

  const [interactions] = useState([
    {
      id: 1,
      date: '2025-11-20',
      type: 'call',
      employee: 'أحمد محمد',
      notes: 'اتصال تذكيري بمشروع رمضان'
    },
    {
      id: 2,
      date: '2025-10-10',
      type: 'email',
      employee: 'فاطمة علي',
      notes: 'إرسال تقرير أثر التبرعات'
    }
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/donors')} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للمتبرعين
          </Button>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            تعديل البيانات
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
                    ❤️
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{donor.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-white text-blue-600">
                        {donor.type === 'individual' ? 'فرد' : 'مؤسسة'}
                      </Badge>
                      <Badge className="bg-yellow-400 text-yellow-900">
                        {donor.segment === 'vip' ? 'VIP' : donor.segment === 'regular' ? 'منتظم' : 'جديد'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{donor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{donor.phone}</span>
                  </div>
                </div>
              </div>

              <div className="text-left">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <p className="text-sm text-white/80">إجمالي التبرعات</p>
                  <p className="text-4xl font-bold mt-1">{donor.totalDonations.toLocaleString()}</p>
                  <p className="text-sm text-white/80">ر.س</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">عدد التبرعات</p>
                  <p className="text-2xl font-bold">{donor.donationsCount}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">متوسط التبرع</p>
                  <p className="text-2xl font-bold">{donor.avgDonation.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">ر.س</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">أول تبرع</p>
                  <p className="text-lg font-bold">{donor.firstDonation}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">آخر تبرع</p>
                  <p className="text-lg font-bold">{donor.lastDonation}</p>
                </div>
                <History className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="donations" dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="donations">سجل التبرعات</TabsTrigger>
            <TabsTrigger value="interactions">التفاعلات</TabsTrigger>
            <TabsTrigger value="notes">الملاحظات</TabsTrigger>
          </TabsList>

          <TabsContent value="donations" className="space-y-4 mt-6">
            {donations.map((donation) => (
              <Card key={donation.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">{donation.project}</span>
                        <Badge variant={donation.status === 'completed' ? 'success' : 'warning'}>
                          {donation.status === 'completed' ? 'مكتمل' : 'قيد المعالجة'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {donation.date}
                        </span>
                        <span>
                          {donation.method === 'bank_transfer' ? 'تحويل بنكي' :
                           donation.method === 'credit_card' ? 'بطاقة ائتمان' : 'نقدي'}
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-green-600">
                        {donation.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">ر.س</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4 mt-6">
            {interactions.map((interaction) => (
              <Card key={interaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      interaction.type === 'call' ? 'bg-blue-100' :
                      interaction.type === 'email' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {interaction.type === 'call' ? '📞' :
                       interaction.type === 'email' ? '📧' : '💬'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{interaction.employee}</span>
                        <span className="text-sm text-gray-500">{interaction.date}</span>
                      </div>
                      <p className="text-sm text-gray-700">{interaction.notes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button className="w-full">إضافة تفاعل جديد</Button>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">الملاحظات الحالية:</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{donor.notes}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Input placeholder="إضافة ملاحظة جديدة..." />
                  <Button onClick={() => {
                    toast({
                      title: 'تم الحفظ',
                      description: 'تم حفظ الملاحظة بنجاح'
                    });
                  }}>
                    حفظ الملاحظة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
