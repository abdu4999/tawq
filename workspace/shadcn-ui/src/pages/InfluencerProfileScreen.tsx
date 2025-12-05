import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Star, Users, TrendingUp, Instagram, Phone, Mail, Edit } from 'lucide-react';

export default function InfluencerProfileScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [influencer] = useState({
    id: id,
    name: 'عبدالله النجم',
    platform: 'instagram',
    followers: 2500000,
    category: 'lifestyle',
    commissionRate: 15,
    totalRevenue: 450000,
    campaignsCount: 8,
    avgEngagement: 4.2,
    email: 'abdullah@example.com',
    phone: '0501234567',
    status: 'active'
  });

  const [campaigns] = useState([
    {
      id: 1,
      name: 'حملة رمضان',
      date: '2025-11-15',
      revenue: 85000,
      engagement: 5.2,
      status: 'completed'
    },
    {
      id: 2,
      name: 'حملة العودة للمدارس',
      date: '2025-10-01',
      revenue: 65000,
      engagement: 4.8,
      status: 'completed'
    },
    {
      id: 3,
      name: 'حملة الشتاء',
      date: '2025-12-01',
      revenue: 0,
      engagement: 0,
      status: 'active'
    }
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/influencers')} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للمشاهير
          </Button>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            تعديل البيانات
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
                    ⭐
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{influencer.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-white text-orange-600">
                        <Instagram className="h-3 w-3 ml-1" />
                        {influencer.platform}
                      </Badge>
                      <Badge className="bg-blue-400 text-white">
                        عمولة {influencer.commissionRate}%
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{influencer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{influencer.phone}</span>
                  </div>
                </div>
              </div>

              <div className="text-left">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <p className="text-sm text-white/80">إجمالي الإيراد</p>
                  <p className="text-4xl font-bold mt-1">{influencer.totalRevenue.toLocaleString()}</p>
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
                  <p className="text-sm text-gray-600">المتابعين</p>
                  <p className="text-2xl font-bold">{(influencer.followers / 1000000).toFixed(1)}M</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">التفاعل</p>
                  <p className="text-2xl font-bold">{influencer.avgEngagement}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الحملات</p>
                  <p className="text-2xl font-bold">{influencer.campaignsCount}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الحالة</p>
                  <Badge className="mt-1" variant="success">نشط</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="campaigns" dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaigns">الحملات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4 mt-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">{campaign.name}</span>
                        <Badge variant={campaign.status === 'completed' ? 'success' : 'info'}>
                          {campaign.status === 'completed' ? 'مكتملة' : 'نشطة'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📅 {campaign.date}</span>
                        {campaign.engagement > 0 && (
                          <span>📊 تفاعل {campaign.engagement}%</span>
                        )}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-green-600">
                        {campaign.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">ر.س</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الأداء</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">معدل التحويل</p>
                    <p className="text-2xl font-bold text-blue-600">3.2%</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">متوسط العائد لكل حملة</p>
                    <p className="text-2xl font-bold text-green-600">56,250 ر.س</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>سجل المدفوعات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">حملة رمضان</p>
                      <p className="text-sm text-gray-500">2025-11-20</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">12,750 ر.س</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">حملة العودة للمدارس</p>
                      <p className="text-sm text-gray-500">2025-10-05</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">9,750 ر.س</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
