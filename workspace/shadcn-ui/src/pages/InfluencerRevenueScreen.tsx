import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';
import { supabaseAPI, Campaign } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function InfluencerRevenueScreen() {
  const [period, setPeriod] = useState('monthly');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidOut: 0,
    pending: 0,
    monthlyAvg: 0
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      const campaigns = await supabaseAPI.getCampaigns();
      
      let totalRevenue = 0;
      let paidOut = 0;
      let pending = 0;
      
      // Group by month for the chart/table
      const monthlyData: Record<string, { revenue: number, commission: number, paid: boolean }> = {};

      campaigns.forEach((campaign: Campaign) => {
        const revenue = campaign.revenue || 0;
        const commission = revenue * 0.10; // Assuming 10% commission
        
        totalRevenue += revenue;
        
        if (campaign.status === 'completed') {
          paidOut += commission;
        } else {
          pending += commission;
        }

        // Date processing
        const date = new Date(campaign.created_at || new Date());
        const monthKey = date.toLocaleString('ar-SA', { month: 'long' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, commission: 0, paid: campaign.status === 'completed' };
        }
        monthlyData[monthKey].revenue += revenue;
        monthlyData[monthKey].commission += commission;
      });

      const monthsCount = Object.keys(monthlyData).length || 1;

      setStats({
        totalRevenue,
        paidOut,
        pending,
        monthlyAvg: totalRevenue / monthsCount
      });

      setRevenueData(Object.keys(monthlyData).map(key => ({
        month: key,
        ...monthlyData[key]
      })));

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
                  <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-100">ر.س</p>
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
                  <p className="text-2xl font-bold">{stats.paidOut.toLocaleString()}</p>
                  <p className="text-xs text-blue-100">ر.س</p>
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
                  <p className="text-2xl font-bold">{stats.pending.toLocaleString()}</p>
                  <p className="text-xs text-yellow-100">ر.س</p>
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
                  <p className="text-2xl font-bold">{stats.monthlyAvg.toLocaleString()}</p>
                  <p className="text-xs text-purple-100">ر.س</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="quarterly">ربع سنوي</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                تصدير التقرير
              </Button>
            </div>
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
                    <th className="pb-3">الشهر</th>
                    <th className="pb-3">الإيراد</th>
                    <th className="pb-3">العمولة (10%)</th>
                    <th className="pb-3">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((row, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3">{row.month}</td>
                      <td className="py-3 font-bold">{row.revenue.toLocaleString()} ر.س</td>
                      <td className="py-3 text-green-600">{row.commission.toLocaleString()} ر.س</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          row.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {row.paid ? 'تم الدفع' : 'قيد الانتظار'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
