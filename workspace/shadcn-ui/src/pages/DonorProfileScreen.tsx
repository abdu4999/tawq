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
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, DollarSign, Calendar, TrendingUp, History, Phone, Mail, Heart, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDateDMY } from '@/lib/date-utils';
import { supabaseAPI, type Donor, type Donation } from '@/lib/supabaseClient';

export default function DonorProfileScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [donor, setDonor] = useState<Donor | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingDonation, setCreatingDonation] = useState(false);
  const [donationForm, setDonationForm] = useState({
    amount: '',
    cause: '',
    method: 'bank_transfer',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [donorData, donationData] = await Promise.all([
        supabaseAPI.getDonorById(id as string),
        supabaseAPI.getDonationsByDonor(id as string)
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
    } catch (error) {
      console.error('Error loading donor profile:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات المتبرع',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!donations.length) {
      return { total: 0, count: 0, avg: 0, first: '-', last: '-' };
    }

    const total = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
    const count = donations.length;
    const avg = total / count;

    const sorted = [...donations].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const first = sorted[0]?.date ? formatDateDMY(sorted[0].date) : '-';
    const last = sorted[sorted.length - 1]?.date ? formatDateDMY(sorted[sorted.length - 1].date) : '-';

    return { total, count, avg, first, last };
  }, [donations]);

  const handleCreateDonation = async () => {
    if (!donor || !donationForm.amount.trim()) {
      toast({
        title: 'بيانات ناقصة',
        description: 'يرجى إدخال قيمة التبرع',
        variant: 'destructive'
      });
      return;
    }

    try {
      setCreatingDonation(true);
      await supabaseAPI.createDonation({
        donor_id: donor.id,
        amount: Number(donationForm.amount),
        cause: donationForm.cause || undefined,
        method: donationForm.method,
        date: donationForm.date
      });

      toast({
        title: 'تم التسجيل',
        description: 'تم إضافة التبرع بنجاح'
      });

      setDonationForm({
        amount: '',
        cause: '',
        method: 'bank_transfer',
        date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      console.error('Error creating donation:', error);
      toast({
        title: 'خطأ',
        description: 'تعذر تسجيل التبرع الجديد',
        variant: 'destructive'
      });
    } finally {
      setCreatingDonation(false);
    }
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
            <div className="flex items_CENTER justify-between">
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
          {donations.length ? (
            donations.map((donation) => (
              <Card key={donation.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">{donation.cause || 'غير محدد'}</span>
                        <Badge variant="success">مكتمل</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateDMY(donation.date)}
                        </span>
                        <span>
                          {donation.method === 'credit_card'
                            ? 'بطاقة ائتمان'
                            : donation.method === 'cash'
                              ? 'نقداً'
                              : 'تحويل بنكي'}
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-green-600">
                        {donation.amount.toLocaleString()} ر.س
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">لا توجد تبرعات مسجلة</div>
          )}
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4 mt-6">
          <div className="text-center py-8 text-gray-500">لا توجد تفاعلات مسجلة</div>
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
                <Button
                  onClick={() =>
                    toast({
                      title: 'تم الحفظ',
                      description: 'تم حفظ الملاحظة بنجاح'
                    })
                  }
                >
                  حفظ الملاحظة
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Donation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تسجيل تبرع سريع</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4" dir="rtl">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">المبلغ (ر.س)</label>
            <Input
              type="number"
              value={donationForm.amount}
              onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">الغرض</label>
            <Input
              value={donationForm.cause}
              onChange={(e) => setDonationForm({ ...donationForm, cause: e.target.value })}
              placeholder="تعليم، صحة..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">طريقة الدفع</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={donationForm.method}
              onChange={(e) => setDonationForm({ ...donationForm, method: e.target.value })}
            >
              <option value="bank_transfer">تحويل بنكي</option>
              <option value="credit_card">بطاقة ائتمان</option>
              <option value="cash">نقداً</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">التاريخ</label>
            <Input
              type="date"
              value={donationForm.date}
              onChange={(e) => setDonationForm({ ...donationForm, date: e.target.value })}
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <Button
              onClick={handleCreateDonation}
              disabled={creatingDonation || !donationForm.amount.trim()}
            >
              {creatingDonation ? 'جاري الحفظ...' : 'تسجيل التبرع'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
