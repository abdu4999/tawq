import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, DollarSign, Calendar, TrendingUp, History, Phone, Mail, Heart, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabaseAPI, type Donor, type Donation } from '@/lib/supabaseClient';
import { formatDateDMY } from '@/lib/date-utils';

export default function DonorProfileScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [donor, setDonor] = useState<any>(null);
  const [donations, setDonations] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [donorsData, transactionsData] = await Promise.all([
        supabaseAPI.getDonors(),
        supabaseAPI.getTransactions()
      ]);

      const foundDonor = donorsData.find((d: any) => d.id === id);
      if (foundDonor) {
        setDonor(foundDonor);
        const [donor, setDonor] = useState<Donor | null>(null);
        const [donations, setDonations] = useState<Donation[]>([]);
        // Filter transactions that might be related to this donor (mock logic for now as we lack foreign key)
        const [creatingDonation, setCreatingDonation] = useState(false);
        const [donationForm, setDonationForm] = useState({
          amount: '',
          cause: '',
          method: 'bank_transfer',
          date: new Date().toISOString().split('T')[0]
        });
        // In a real app, we would filter by donor_id
        const donorTransactions = transactionsData.filter((t: Transaction) => 
          t.type === 'income' && t.description.includes(foundDonor.name)
        );
        setDonations(donorTransactions);
      } else {
        toast({
          title: 'خطأ',
          description: 'لم يتم العثور على المتبرع',
          variant: 'destructive'
            const [donorData, donationData] = await Promise.all([
              supabaseAPI.getDonorById(id),
              supabaseAPI.getDonationsByDonor(id)
            ]);

            if (!donorData) {
              toast({
                title: 'خطأ',
                description: 'لم يتم العثور على المتبرع',
                variant: 'destructive'
              });
              navigate('/donors');
              return;
            }

            setDonor(donorData as Donor);
            setDonations(donationData as Donation[]);

    const total = donations.reduce((sum, t) => sum + t.amount, 0);
    const count = donations.length;
    const avg = total / count;
    
    const sorted = [...donations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = sorted[0]?.date || '-';
    const last = sorted[sorted.length - 1]?.date || '-';

    return { total, count, avg, first, last };
  }, [donations]);

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

  if (!donor) return null;

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
                        {stats.total > 100000 ? 'VIP' : stats.total > 10000 ? 'منتظم' : 'جديد'}
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
                  <p className="text-4xl font-bold mt-1">{stats.total.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">{stats.count}</p>
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
                  <p className="text-2xl font-bold">{Math.round(stats.avg).toLocaleString()}</p>
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
                  <p className="text-lg font-bold">{stats.first}</p>
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
                  <p className="text-lg font-bold">{stats.last}</p>
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
            {donations.length > 0 ? (
              donations.map((donation) => (
                <Card key={donation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-lg">{donation.category}</span>
                          <Badge variant="success">
                            مكتمل
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {donation.date}
                          </span>
                          <span>
                            {donation.description}
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
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا توجد تبرعات مسجلة
              </div>
            )}
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4 mt-6">
            <div className="text-center py-8 text-gray-500">
              لا توجد تفاعلات مسجلة
            </div>
            <Button className="w-full">إضافة تفاعل جديد</Button>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">الملاحظات الحالية:</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{donor.notes || 'لا توجد ملاحظات'}</p>
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
