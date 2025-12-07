import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, Calendar, Download, BarChart3 } from 'lucide-react';
import { supabaseAPI, type Campaign } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';

type PeriodOption = 'monthly' | 'quarterly' | 'yearly';

const COMMISSION_RATE = 0.1;

const PERIOD_CONFIG: Record<PeriodOption, { label: string; lookbackDays: number }> = {
  monthly: { label: 'آخر 30 يوم', lookbackDays: 30 },
  quarterly: { label: 'آخر 90 يوم', lookbackDays: 90 },
  yearly: { label: 'آخر 365 يوم', lookbackDays: 365 }
};

const formatCurrency = (value: number) => `${Math.round(value || 0).toLocaleString()} ر.س`;

const getCampaignDate = (campaign: Campaign) => {
  return new Date(campaign.end_date || campaign.start_date || campaign.created_at || new Date());
};

const getBucketInfo = (date: Date, period: PeriodOption) => {
  const year = date.getFullYear();
  if (period === 'yearly') {
    return {
      key: `year-${year}`,
      label: `${year}`,
      order: new Date(year, 0, 1).getTime()
    };
  }

  if (period === 'quarterly') {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return {
      key: `quarter-${quarter}-${year}`,
      label: `الربع ${quarter} ${year}`,
      order: new Date(year, (quarter - 1) * 3, 1).getTime()
    };
  }

  return {
    key: `${year}-${date.getMonth()}`,
    label: date.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }),
    order: new Date(year, date.getMonth(), 1).getTime()
  };
};

export default function InfluencerRevenueScreen() {
  const [period, setPeriod] = useState<PeriodOption>('monthly');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      const data = await supabaseAPI.getCampaigns();
      setCampaigns((data || []) as Campaign[]);
    } catch (error) {
      console.error('Error loading revenue data:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات الإيرادات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const cutoffDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - PERIOD_CONFIG[period].lookbackDays);
    return date;
  }, [period]);

  const filteredCampaigns = useMemo(() => {
    if (!campaigns.length) return [] as Campaign[];
    return campaigns.filter((campaign) => getCampaignDate(campaign) >= cutoffDate);
  }, [campaigns, cutoffDate]);

  const timelineData = useMemo(() => {
    if (!filteredCampaigns.length) {
      return [] as Array<{ label: string; revenue: number; commission: number; paidOut: number; pending: number }>;
    }

    const buckets = new Map<string, { label: string; revenue: number; commission: number; paidOut: number; pending: number; order: number }>();

    filteredCampaigns.forEach((campaign) => {
      const revenue = campaign.revenue || 0;
      const commission = revenue * COMMISSION_RATE;
      const { key, label, order } = getBucketInfo(getCampaignDate(campaign), period);

      if (!buckets.has(key)) {
        buckets.set(key, { label, revenue: 0, commission: 0, paidOut: 0, pending: 0, order });
      }

      const entry = buckets.get(key)!;
      entry.revenue += revenue;
      entry.commission += commission;
      if (campaign.status === 'completed') {
        entry.paidOut += commission;
      } else {
        entry.pending += commission;
      }
    });

    return Array.from(buckets.values())
      .sort((a, b) => a.order - b.order)
      .map(({ order, ...rest }) => rest);
  }, [filteredCampaigns, period]);

  const summary = useMemo(() => {
    if (!filteredCampaigns.length) {
      return { totalRevenue: 0, paidOut: 0, pending: 0, monthlyAvg: 0 };
    }

    let totalRevenue = 0;
    let paidOut = 0;
    let pending = 0;

    filteredCampaigns.forEach((campaign) => {
      const revenue = campaign.revenue || 0;
      const commission = revenue * COMMISSION_RATE;
      totalRevenue += revenue;
      if (campaign.status === 'completed') {
        paidOut += commission;
      } else {
        pending += commission;
      }
    });

    const periodsCount = timelineData.length || 1;

    return {
      totalRevenue,
      paidOut,
      pending,
      monthlyAvg: totalRevenue / periodsCount
    };
  }, [filteredCampaigns, timelineData]);

  const platformBreakdown = useMemo(() => {
    if (!filteredCampaigns.length) return [] as Array<{ platform: string; value: number; percentage: number }>;
    const totals = filteredCampaigns.reduce<Record<string, number>>((acc, campaign) => {
      const key = campaign.platform || 'غير محدد';
      acc[key] = (acc[key] || 0) + (campaign.revenue || 0);
      return acc;
    }, {});

    const grandTotal = Object.values(totals).reduce((sum, value) => sum + value, 0) || 1;

    return Object.entries(totals)
      .map(([platform, value]) => ({
        platform,
        value,
        percentage: Math.round((value / grandTotal) * 100)
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredCampaigns]);

  const topCampaigns = useMemo(() => {
    return [...filteredCampaigns]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5);
  }, [filteredCampaigns]);

  const insights = useMemo(() => {
    const messages: string[] = [];

    if (timelineData.length) {
      const bestPeriod = timelineData.reduce((prev, current) => {
        if (!prev || current.revenue > prev.revenue) return current;
        return prev;
      }, timelineData[0]);

      if (bestPeriod) {
        messages.push(`أفضل فترة كانت ${bestPeriod.label} بإيراد ${formatCurrency(bestPeriod.revenue)}`);
      }
    }

    if (platformBreakdown.length) {
      const topPlatform = platformBreakdown[0];
      messages.push(`المنصة الأقوى: ${topPlatform.platform} (${formatCurrency(topPlatform.value)})`);
    }

    if (summary.paidOut > 0) {
      messages.push(`تم دفع ${formatCurrency(summary.paidOut)} عمولات خلال الفترة الحالية`);
    }

    if (filteredCampaigns.length) {
      const avgCommission = summary.paidOut / filteredCampaigns.length;
      messages.push(`متوسط عمولة الحملة الواحدة ${formatCurrency(avgCommission)}`);
    }

    return Array.from(new Set(messages));
  }, [timelineData, platformBreakdown, summary, filteredCampaigns]);

  const handleExport = () => {
    if (!timelineData.length) return;
    const header = 'الفترة,الإيراد,العمولة,المدفوع,قيد الدفع';
    const rows = timelineData.map((row) => [row.label, row.revenue, row.commission, row.paidOut, row.pending].join(','));
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'influencer-revenue.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات المالية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <DollarSign className="h-12 w-12 text-green-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              إيرادات المشاهير
            </h1>
          </div>
          <p className="text-gray-600">متابعة إيرادات وعمولات المشاهير</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100">إجمالي الإيراد</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
                  <p className="text-xs text-green-100">الفترة المحددة</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">المدفوع (العمولات)</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.paidOut)}</p>
                  <p className="text-xs text-blue-100">صافي ما تم تحويله</p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-100">قيد الانتظار</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.pending)}</p>
                  <p className="text-xs text-yellow-100">عمولات لم تُدفع بعد</p>
                </div>
                <Calendar className="h-10 w-10 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">متوسط شهري</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.monthlyAvg)}</p>
                  <p className="text-xs text-purple-100">لكل فترة زمنية</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-600">اختر الفترة الزمنية</p>
                <Select value={period} onValueChange={(value) => setPeriod(value as PeriodOption)}>
                  <SelectTrigger className="w-full md:w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">شهري</SelectItem>
                    <SelectItem value="quarterly">ربع سنوي</SelectItem>
                    <SelectItem value="yearly">سنوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExport}
                disabled={!timelineData.length}
              >
                <Download className="h-4 w-4" />
                تصدير التقرير
              </Button>
            </div>
            <p className="text-xs text-gray-500">{PERIOD_CONFIG[period].label} · {filteredCampaigns.length} حملة</p>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              اتجاه الإيرادات والعمولات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timelineData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={timelineData} margin={{ left: -10, right: 10 }}>
                  <defs>
                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="commission" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#revenue)" name="الإيرادات" />
                  <Area type="monotone" dataKey="commission" stroke="#6366f1" fillOpacity={1} fill="url(#commission)" name="العمولات" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-gray-500 bg-gradient-to-br from-emerald-50 to-sky-50 rounded-lg">
                لا توجد بيانات كافية لعرض الرسم البياني
              </div>
            )}
          </CardContent>
        </Card>

        {/* Breakdown & Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل المنصات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {platformBreakdown.length ? (
                platformBreakdown.map((platform) => (
                  <div key={platform.platform} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{platform.platform}</span>
                      <span>{formatCurrency(platform.value)} ({platform.percentage}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${platform.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-6">لا يوجد توزيع واضح للمنصات في هذه الفترة</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>مؤشرات سريعة</CardTitle>
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
        </div>

        {/* Top Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>أفضل الحملات</CardTitle>
          </CardHeader>
          <CardContent>
            {topCampaigns.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2">الحملة</th>
                      <th className="py-2">المنصة</th>
                      <th className="py-2">الإيراد</th>
                      <th className="py-2">العمولة</th>
                      <th className="py-2">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b last:border-0">
                        <td className="py-3 font-semibold">{campaign.name}</td>
                        <td className="py-3 text-gray-600">{campaign.platform || 'غير محدد'}</td>
                        <td className="py-3 font-bold">{formatCurrency(campaign.revenue || 0)}</td>
                        <td className="py-3 text-emerald-600">{formatCurrency((campaign.revenue || 0) * COMMISSION_RATE)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            campaign.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {campaign.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">لا توجد حملات كافية لعرض الترتيب</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Table */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3">الفترة</th>
                    <th className="pb-3">الإيراد</th>
                    <th className="pb-3">العمولة (10%)</th>
                    <th className="pb-3">المدفوع</th>
                    <th className="pb-3">المتبقي</th>
                  </tr>
                </thead>
                <tbody>
                  {timelineData.length ? (
                    timelineData.map((row) => (
                    <tr key={index} className="border-b last:border-0">
                        <td className="py-3">{row.label}</td>
                        <td className="py-3 font-bold">{formatCurrency(row.revenue)}</td>
                        <td className="py-3 text-emerald-600">{formatCurrency(row.commission)}</td>
                        <td className="py-3 text-green-600">{formatCurrency(row.paidOut)}</td>
                        <td className="py-3 text-yellow-600">{formatCurrency(row.pending)}</td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">لا توجد بيانات للفترة المحددة</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
