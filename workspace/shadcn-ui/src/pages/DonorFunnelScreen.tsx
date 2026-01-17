import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown } from 'lucide-react';
import { supabaseAPI, Campaign } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function DonorFunnelScreen() {
  const [metrics, setMetrics] = useState({
    impressions: 0,
    clicks: 0,
    conversions: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFunnelData();
  }, []);

  const loadFunnelData = async () => {
    try {
      setLoading(true);
      const campaigns = await supabaseAPI.getCampaigns();
      
      const totals = campaigns.reduce((acc, campaign: Campaign) => ({
        impressions: acc.impressions + (campaign.impressions || 0),
        clicks: acc.clicks + (campaign.clicks || 0),
        conversions: acc.conversions + (campaign.conversions || 0)
      }), { impressions: 0, clicks: 0, conversions: 0 });

      setMetrics(totals);
    } catch (error) {
      console.error('Error loading funnel data:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات القمع',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const ctr = metrics.impressions > 0 ? ((metrics.clicks / metrics.impressions) * 100).toFixed(1) : '0.0';
  const conversionRate = metrics.clicks > 0 ? ((metrics.conversions / metrics.clicks) * 100).toFixed(1) : '0.0';

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

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold text-slate-900">🌪️ رحلة المتبرع (Funnel Analytics)</h1>
      
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Stage 1 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-blue-900">مشاهدة الإعلان</h3>
              <p className="text-blue-600">عدد المشاهدات الفريدة</p>
            </div>
            <div className="text-3xl font-bold text-blue-800">{metrics.impressions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <div className="bg-slate-200 px-4 py-1 rounded-full text-sm font-bold text-slate-600 flex items-center gap-1">
            <ArrowDown className="w-4 h-4" /> {ctr}% نسبة النقر (CTR)
          </div>
        </div>

        {/* Stage 2 */}
        <Card className="bg-indigo-50 border-indigo-200 w-[90%] mx-auto">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-indigo-900">زيارة المتجر</h3>
              <p className="text-indigo-600">عدد الزوار (النقرات)</p>
            </div>
            <div className="text-3xl font-bold text-indigo-800">{metrics.clicks.toLocaleString()}</div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <div className="bg-slate-200 px-4 py-1 rounded-full text-sm font-bold text-slate-600 flex items-center gap-1">
            <ArrowDown className="w-4 h-4" /> {conversionRate}% نسبة التبرع
          </div>
        </div>

        {/* Stage 3 */}
        <Card className="bg-green-50 border-green-200 w-[70%] mx-auto shadow-lg ring-2 ring-green-100">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-green-900">تبرع ناجح</h3>
              <p className="text-green-600">عمليات مكتملة</p>
            </div>
            <div className="text-3xl font-bold text-green-800">{metrics.conversions.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}