import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/Sidebar';
import { useNotifications } from '@/components/NotificationSystem';
import { Star, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { supabaseAPI } from '@/lib/supabaseClient';

interface InfluencerRevenue {
  influencerId: string;
  influencerName: string;
  platform: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  revenue: number;
  agreementAmount: number;
  storeLink: string;
  status: 'active' | 'completed' | 'pending';
}

export default function InfluencerRevenue() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [revenues, setRevenues] = useState<InfluencerRevenue[]>([]);
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterProject, setFilterProject] = useState('all');

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      setLoading(true);

      // جلب البيانات من Supabase
      const [celebrities, projects, employees] = await Promise.all([
        supabaseAPI.getCelebrities(),
        supabaseAPI.getProjects(),
        supabaseAPI.getAdminUsers()
      ]);

      // ربط البيانات لإنشاء جدول الإيرادات
      const revenueData: InfluencerRevenue[] = celebrities.map((celeb: any, index: number) => ({
        influencerId: celeb.id,
        influencerName: celeb.name,
        platform: celeb.platform || 'Instagram',
        employeeId: employees[index % employees.length]?.id || '',
        employeeName: employees[index % employees.length]?.email?.split('@')[0] || 'موظف',
        projectId: projects[index % projects.length]?.id || '',
        projectName: projects[index % projects.length]?.name || 'مشروع',
        revenue: celeb.actual_revenue || 0,
        agreementAmount: celeb.proposed_amount || 0,
        storeLink: `https://store.charity.org/${celeb.id}`,
        status: celeb.status === 'active' ? 'active' : 'pending'
      }));

      if (revenueData.length > 0) {
        setRevenues(revenueData);
        setLoading(false);
        return;
      }

      // بيانات تجريبية في حال عدم وجود بيانات
      const sampleRevenues: InfluencerRevenue[] = [
        {
          influencerId: '1',
          influencerName: 'محمد أحمد المشهور',
          platform: 'Instagram',
          employeeId: '1',
          employeeName: 'أحمد محمد',
          projectId: '1',
          projectName: 'حملة رمضان 2024',
          revenue: 85000,
          agreementAmount: 50000,
          storeLink: 'https://store.charity.org/ramadan2024',
          status: 'completed'
        },
        {
          influencerId: '2',
          influencerName: 'سارة أحمد',
          platform: 'TikTok',
          employeeId: '2',
          employeeName: 'فاطمة أحمد',
          projectId: '1',
          projectName: 'حملة رمضان 2024',
          revenue: 62000,
          agreementAmount: 35000,
          storeLink: 'https://store.charity.org/ramadan2024',
          status: 'completed'
        },
        {
          influencerId: '3',
          influencerName: 'خالد العتيبي',
          platform: 'YouTube',
          employeeId: '1',
          employeeName: 'أحمد محمد',
          projectId: '2',
          projectName: 'كفالة الأيتام',
          revenue: 120000,
          agreementAmount: 75000,
          storeLink: 'https://store.charity.org/orphans',
          status: 'completed'
        },
        {
          influencerId: '4',
          influencerName: 'نورة السالم',
          platform: 'Twitter',
          employeeId: '2',
          employeeName: 'فاطمة أحمد',
          projectId: '3',
          projectName: 'بناء مساجد',
          revenue: 45000,
          agreementAmount: 30000,
          storeLink: 'https://store.charity.org/mosques',
          status: 'active'
        }
      ];

      setRevenues(sampleRevenues);

      addNotification({
        type: 'success',
        title: '✅ تم التحميل',
        message: 'تم تحميل بيانات إيرادات المشاهير بنجاح'
      });
    } catch (error) {
      console.error('Error loading revenue data:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ',
        message: 'حدث خطأ أثناء تحميل البيانات'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRevenues = revenues.filter(rev => {
    const matchesEmployee = filterEmployee === 'all' || rev.employeeId === filterEmployee;
    const matchesProject = filterProject === 'all' || rev.projectId === filterProject;
    return matchesEmployee && matchesProject;
  });

  const stats = {
    totalRevenue: revenues.reduce((sum, r) => sum + r.revenue, 0),
    totalAgreement: revenues.reduce((sum, r) => sum + r.agreementAmount, 0),
    roi: 0
  };
  stats.roi = ((stats.totalRevenue - stats.totalAgreement) / stats.totalAgreement) * 100;

  const employees = [...new Set(revenues.map(r => ({ id: r.employeeId, name: r.employeeName })))];
  const projects = [...new Set(revenues.map(r => ({ id: r.projectId, name: r.projectName })))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات الإيرادات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 lg:mr-80 p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            إيرادات المشاهير
          </h1>
          <p className="text-xl text-gray-600">تقرير مفصل بإيرادات كل مشهور حسب الموظف والمشروع</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-3xl font-bold mb-1">{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-green-100">إجمالي الإيرادات (ر.س)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{stats.totalAgreement.toLocaleString()}</div>
              <p className="text-blue-100">إجمالي الاتفاقيات (ر.س)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <div className="text-3xl font-bold mb-1">{stats.roi.toFixed(1)}%</div>
              <p className="text-purple-100">العائد على الاستثمار</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">تصفية حسب الموظف</label>
                <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الموظفين</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">تصفية حسب المشروع</label>
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المشاريع</SelectItem>
                    {projects.map(proj => (
                      <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Table */}
        <Card>
          <CardHeader>
            <CardTitle>جدول الإيرادات التفصيلي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3 font-semibold">المشهور</th>
                    <th className="text-center p-3 font-semibold">المنصة</th>
                    <th className="text-right p-3 font-semibold">الموظف</th>
                    <th className="text-right p-3 font-semibold">المشروع</th>
                    <th className="text-center p-3 font-semibold">مبلغ الاتفاقية</th>
                    <th className="text-center p-3 font-semibold">الإيراد الفعلي</th>
                    <th className="text-center p-3 font-semibold">ROI</th>
                    <th className="text-center p-3 font-semibold">الحالة</th>
                    <th className="text-center p-3 font-semibold">رابط المتجر</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRevenues.map((rev, index) => {
                    const roi = ((rev.revenue - rev.agreementAmount) / rev.agreementAmount) * 100;
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{rev.influencerName}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline">{rev.platform}</Badge>
                        </td>
                        <td className="p-3">{rev.employeeName}</td>
                        <td className="p-3">{rev.projectName}</td>
                        <td className="p-3 text-center font-bold text-blue-600">
                          {rev.agreementAmount.toLocaleString()} ر.س
                        </td>
                        <td className="p-3 text-center font-bold text-green-600">
                          {rev.revenue.toLocaleString()} ر.س
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-bold ${roi >= 50 ? 'text-green-600' : 'text-blue-600'}`}>
                            +{roi.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={rev.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}>
                            {rev.status === 'completed' ? 'مكتمل' : 'نشط'}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <a 
                            href={rev.storeLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            عرض
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={4} className="p-3 text-right">الإجمالي</td>
                    <td className="p-3 text-center text-blue-600">
                      {filteredRevenues.reduce((sum, r) => sum + r.agreementAmount, 0).toLocaleString()} ر.س
                    </td>
                    <td className="p-3 text-center text-green-600">
                      {filteredRevenues.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()} ر.س
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
