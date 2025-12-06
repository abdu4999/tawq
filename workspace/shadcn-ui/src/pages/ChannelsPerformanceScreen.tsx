import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabaseAPI, Campaign } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function ChannelsPerformanceScreen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const campaigns = await supabaseAPI.getCampaigns();
      
      // Aggregate data by platform
      const platformData: Record<string, { spend: number; revenue: number }> = {};
      
      campaigns.forEach((campaign: Campaign) => {
        const platform = campaign.platform || 'other';
        if (!platformData[platform]) {
          platformData[platform] = { spend: 0, revenue: 0 };
        }
        platformData[platform].spend += campaign.spend || 0;
        platformData[platform].revenue += campaign.revenue || 0;
      });

      const chartData = Object.keys(platformData).map(key => ({
        name: key,
        spend: platformData[key].spend,
        revenue: platformData[key].revenue,
        roas: platformData[key].spend > 0 ? parseFloat((platformData[key].revenue / platformData[key].spend).toFixed(2)) : 0
      }));

      setData(chartData);
    } catch (error) {
      console.error('Error loading channel performance:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات أداء القنوات',
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
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold text-slate-900">📊 أداء القنوات التسويقية</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>العائد على الإعلان (ROAS) حسب القناة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="roas" fill="#8884d8" name="ROAS" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المصروف مقابل الإيراد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="spend" fill="#ff8042" name="المصروف" />
                  <Bar dataKey="revenue" fill="#00C49F" name="الإيراد" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}