import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Users, TrendingUp, Instagram, Phone, Mail, Edit, RefreshCw, BarChart3, Wallet, Coins } from 'lucide-react';
import { supabaseAPI, Celebrity, Campaign } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';

const COMMISSION_RATE = 0.1;

const safeNumber = (value?: number | null) => (typeof value === 'number' && !Number.isNaN(value) ? value : 0);
const formatCurrency = (value: number) => `${Math.round(value || 0).toLocaleString()} ر.س`;

export default function InfluencerProfileScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [influencer, setInfluencer] = useState<Celebrity | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (celebrityId: string) => {
    try {
      setLoading(true);
      const [profile, relatedCampaigns] = await Promise.all([
        supabaseAPI.getCelebrityById(celebrityId),
        supabaseAPI.getCampaignsByCelebrity(celebrityId)
      ]);

      if (!profile) {
        toast({
          title: 'خطأ',
          description: 'لم يتم العثور على المؤثر',
          variant: 'destructive'
        });
        navigate('/influencers');
        return;
      }

      let campaignsList = relatedCampaigns;
      if (!campaignsList.length) {
        const fallback = await supabaseAPI.getCampaigns();
        campaignsList = fallback.filter((campaign) => campaign.celebrity_id === celebrityId || (!campaign.celebrity_id && campaign.platform === profile.platform));
      }

      setInfluencer(profile);
      setCampaigns(campaignsList);
    } catch (error) {
      console.error('Error loading influencer profile:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات المؤثر',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProfile(id);
    }
  }, [id]);

  const refreshData = () => {
    if (id) {
      loadProfile(id);
    }
  };

  const overview = useMemo(() => {
    if (!campaigns.length) {
      return {
        totalRevenue: 0,
        totalSpend: 0,
        roi: 0,
        commissionDue: 0,
        avgConversionRate: 0,
        newDonors: 0,
        activeCampaigns: 0,
        completedCampaigns: 0
      };
    }

    const totals = campaigns.reduce(
      (acc, campaign) => {
        const revenue = safeNumber(campaign.revenue);
        const spend = safeNumber(campaign.spend);
        const conversions = safeNumber(campaign.conversions);
        const impressions = safeNumber(campaign.impressions);
        const donors = safeNumber(campaign.new_donors);

        acc.revenue += revenue;
        acc.spend += spend;
        acc.conversions += conversions;
        acc.impressions += impressions;
        acc.donors += donors;
        if (campaign.status === 'active') acc.active += 1;
        if (campaign.status === 'completed') acc.completed += 1;
        return acc;
      },
      { revenue: 0, spend: 0, conversions: 0, impressions: 0, donors: 0, active: 0, completed: 0 }
    );

    const avgConversionRate = totals.impressions ? (totals.conversions / totals.impressions) * 100 : 0;

    return {
      totalRevenue: totals.revenue,
      totalSpend: totals.spend,
      roi: totals.revenue - totals.spend,
      commissionDue: totals.revenue * COMMISSION_RATE,
      avgConversionRate,
      newDonors: totals.donors,
      activeCampaigns: totals.active,
      completedCampaigns: totals.completed
    };
  }, [campaigns]);

  const timelineData = useMemo(() => {
    if (!campaigns.length) return [] as Array<{ label: string; revenue: number; spend: number; conversions: number }>;

    const buckets = new Map<string, { label: string; revenue: number; spend: number; conversions: number; order: number }>();

    campaigns.forEach((campaign) => {
      const date = new Date(campaign.end_date || campaign.start_date || campaign.created_at || Date.now());
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' });

      if (!buckets.has(key)) {
        buckets.set(key, { label, revenue: 0, spend: 0, conversions: 0, order: new Date(date.getFullYear(), date.getMonth(), 1).getTime() });
      }

      const entry = buckets.get(key)!;
      entry.revenue += safeNumber(campaign.revenue);
      entry.spend += safeNumber(campaign.spend);
      entry.conversions += safeNumber(campaign.conversions);
    });

    return Array.from(buckets.values())
      .sort((a, b) => a.order - b.order)
      .map(({ order, ...rest }) => rest);
  }, [campaigns]);

  const insights = useMemo(() => {
    if (!campaigns.length) return [] as string[];

    const list: string[] = [];
    const bestCampaign = [...campaigns].sort((a, b) => safeNumber(b.revenue) - safeNumber(a.revenue))[0];
    if (bestCampaign) {
      list.push(`أعلى حملة من حيث العائد هي ${bestCampaign.name} (${formatCurrency(safeNumber(bestCampaign.revenue))})`);
    }

    if (overview.avgConversionRate) {
      list.push(`متوسط معدل التحويل خلال الحملات ${overview.avgConversionRate.toFixed(2)}٪`);
    }

    if (overview.activeCampaigns) {
      list.push(`${overview.activeCampaigns} حملات نشطة حالياً تحتاج متابعة`);
    }

    if (overview.newDonors) {
      list.push(`ساهمت الحملات في جلب ${overview.newDonors} متبرعاً جديداً`);
    }

    if (timelineData.length) {
      const latest = timelineData[timelineData.length - 1];
      list.push(`آخر فترة حققت ${formatCurrency(latest.revenue)} مع إنفاق ${formatCurrency(latest.spend)}`);
    }

    return Array.from(new Set(list));
  }, [campaigns, overview, timelineData]);

  const payoutRows = useMemo(() => {
    return campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      revenue: safeNumber(campaign.revenue),
      spend: safeNumber(campaign.spend),
      commission: safeNumber(campaign.revenue) * COMMISSION_RATE,
      status: campaign.status
    }));
  }, [campaigns]);

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

  if (!influencer) return null;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate('/influencers')} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للمشاهير
          </Button>
          <Button variant="outline" className="gap-2" onClick={refreshData}>
            <RefreshCw className="h-4 w-4" />
            تحديث البيانات
          </Button>
        </div>
        <Button className="gap-2">
          <Edit className="h-4 w-4" />
          تعديل البيانات
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-6">
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
                    <Badge className="bg-blue-400 text-white">{influencer.type}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{influencer.contact?.split('|')[0]?.trim() || 'غير متوفر'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{influencer.contact?.split('|')[1]?.trim() || 'غير متوفر'}</span>
                </div>
              </div>
            </div>

            <div className="text-left">
              <div className="text-sm opacity-90">المتابعين</div>
              <div className="text-3xl font-bold">{(influencer.followers || 0).toLocaleString()}</div>
              <div className="text-sm opacity-90 mt-2">معدل التفاعل</div>
              <div className="text-xl font-bold">{influencer.engagement_rate || 0}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-white/80">عدد الحملات</p>
              <p className="text-2xl font-bold">{campaigns.length}</p>
            </div>
            <div>
              <p className="text-sm text-white/80">إجمالي الإيراد من الحملات</p>
              <p className="text-2xl font-bold">{formatCurrency(overview.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-white/80">إجمالي الإنفاق</p>
              <p className="text-2xl font-bold">{formatCurrency(overview.totalSpend)}</p>
            </div>
            <div>
              <p className="text-sm text-white/80">العمولة المتوقعة</p>
              <p className="text-2xl font-bold">{formatCurrency(overview.commissionDue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="campaigns">الحملات السابقة</TabsTrigger>
          <TabsTrigger value="analytics">تحليل الأداء</TabsTrigger>
          <TabsTrigger value="financials">البيانات المالية</TabsTrigger>
        </TabsList>
        
        <TabsContent value="campaigns" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>سجل الحملات</CardTitle>
                  <p className="text-sm text-gray-500">متابعة أداء جميع الحملات المرتبطة بالمؤثر</p>
                </div>
                <Button variant="outline" size="sm" onClick={refreshData} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  تحديث
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {campaigns.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2">الحملة</th>
                        <th className="py-2">المنصة</th>
                        <th className="py-2">الفترة</th>
                        <th className="py-2">الإيراد</th>
                        <th className="py-2">الإنفاق</th>
                        <th className="py-2">التحويلات</th>
                        <th className="py-2">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b last:border-0">
                          <td className="py-3 font-semibold">{campaign.name}</td>
                          <td className="py-3 text-gray-600">{campaign.platform}</td>
                          <td className="py-3 text-sm text-gray-500">
                            {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('ar-SA') : '—'}
                            {' - '}
                            {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString('ar-SA') : 'مستمر'}
                          </td>
                          <td className="py-3 font-bold">{formatCurrency(safeNumber(campaign.revenue))}</td>
                          <td className="py-3">{formatCurrency(safeNumber(campaign.spend))}</td>
                          <td className="py-3">{safeNumber(campaign.conversions).toLocaleString()}</td>
                          <td className="py-3">
                            <Badge variant={campaign.status === 'active' ? 'default' : campaign.status === 'completed' ? 'secondary' : 'outline'}>
                              {campaign.status === 'active' ? 'نشط' : campaign.status === 'completed' ? 'مكتمل' : 'متوقف'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  لا توجد حملات مرتبطة بهذا المؤثر حالياً
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                اتجاه الإيرادات مقابل الإنفاق
              </CardTitle>
              <p className="text-sm text-gray-500">مقارنة شهرية لأداء الحملات</p>
            </CardHeader>
            <CardContent>
              {timelineData.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={timelineData} margin={{ left: -10, right: 10 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#rev)" name="الإيرادات" />
                    <Area type="monotone" dataKey="spend" stroke="#6366f1" fillOpacity={1} fill="url(#spend)" name="الإنفاق" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 bg-gradient-to-br from-emerald-50 to-sky-50 rounded-lg">
                  لا توجد بيانات كافية لعرض الرسم البياني
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">متوسط معدل التحويل</p>
                    <p className="text-3xl font-bold">{overview.avgConversionRate.toFixed(2)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">نسبة التحويل الإجمالية من آخر الحملات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">المتبرعون الجدد</p>
                    <p className="text-3xl font-bold">{overview.newDonors.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">إجمالي المتبرعين الجدد خلال الحملات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">الحملات النشطة</p>
                    <p className="text-3xl font-bold">{overview.activeCampaigns}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">حملات تحتاج متابعة لحظية</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>مؤشرات وتحليلات</CardTitle>
            </CardHeader>
            <CardContent>
              {insights.length ? (
                <ul className="space-y-3">
                  {insights.map((insight) => (
                    <li key={insight} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                      • {insight}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">لا توجد مؤشرات إضافية حالياً</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold">{formatCurrency(overview.totalRevenue)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">إجمالي الإنفاق</p>
                    <p className="text-2xl font-bold">{formatCurrency(overview.totalSpend)}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-white" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">صافي العائد</p>
                    <p className="text-2xl font-bold">{formatCurrency(overview.roi)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">العمولة المستحقة (10٪)</p>
                    <p className="text-2xl font-bold">{formatCurrency(overview.commissionDue)}</p>
                  </div>
                  <Coins className="h-8 w-8 text-white" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تتبع المدفوعات</CardTitle>
              <p className="text-sm text-gray-500">حساب العمولة المتوقعة لكل حملة</p>
            </CardHeader>
            <CardContent>
              {payoutRows.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2">الحملة</th>
                        <th className="py-2">الإيراد</th>
                        <th className="py-2">الإنفاق</th>
                        <th className="py-2">العمولة (10٪)</th>
                        <th className="py-2">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payoutRows.map((row) => (
                        <tr key={row.id} className="border-b last:border-0">
                          <td className="py-3 font-semibold">{row.name}</td>
                          <td className="py-3 font-bold">{formatCurrency(row.revenue)}</td>
                          <td className="py-3">{formatCurrency(row.spend)}</td>
                          <td className="py-3 text-emerald-600">{formatCurrency(row.commission)}</td>
                          <td className="py-3">
                            <Badge variant={row.status === 'completed' ? 'success' : row.status === 'active' ? 'default' : 'outline'}>
                              {row.status === 'completed' ? 'جاهز للدفع' : row.status === 'active' ? 'قيد التنفيذ' : 'معلق'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6">لا توجد بيانات مالية للحملات حالياً</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
