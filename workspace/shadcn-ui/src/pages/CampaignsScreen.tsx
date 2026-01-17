import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, DollarSign, BarChart2, Users, TrendingUp } from 'lucide-react';
import { supabaseAPI } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function CampaignsScreen() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await supabaseAPI.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الحملات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalSpend: campaigns.reduce((sum, c) => sum + (c.spend || 0), 0),
    totalRevenue: campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0),
    newDonors: campaigns.reduce((sum, c) => sum + (c.new_donors || 0), 0),
  };
  const roas = stats.totalSpend > 0 ? (stats.totalRevenue / stats.totalSpend).toFixed(2) : '0.00';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الحملات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">📢 إدارة الحملات التسويقية</h1>
          <p className="text-slate-600">تتبع أداء الحملات، المصروفات، والعائد على الإعلان (ROAS)</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Megaphone className="ml-2 h-4 w-4" />
          حملة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-500">إجمالي المصروف</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats.totalSpend.toLocaleString()} ر.س</h3>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-500">إجمالي العائد</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats.totalRevenue.toLocaleString()} ر.س</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-500">ROAS</p>
                <h3 className="text-2xl font-bold text-slate-900">{roas}x</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-500">المتبرعون الجدد</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats.newDonors.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الحملات النشطة</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              لا توجد حملات نشطة حالياً
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-bold">{campaign.name}</h4>
                    <p className="text-sm text-gray-500">{campaign.platform}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-green-600">{campaign.revenue?.toLocaleString()} ر.س</p>
                    <p className="text-xs text-gray-400">العائد</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}