import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Sidebar from '@/components/Sidebar';
import { useNotifications } from '@/components/NotificationSystem';
import { Users, Search, Plus, Heart, TrendingUp, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseAPI } from '@/lib/supabaseClient';

interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: 'vip' | 'regular' | 'new' | 'inactive';
  totalDonations: number;
  donationCount: number;
  lastDonation: Date;
  preferredCauses: string[];
  assignedTo: string;
}

export default function Donors() {
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDonor, setNewDonor] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'new' as const
  });

  useEffect(() => {
    loadDonors();
  }, []);

  const loadDonors = async () => {
    try {
      setLoading(true);

      // جلب البيانات من Supabase
      const data = await supabaseAPI.getDonors();
      
      if (data && data.length > 0) {
        setDonors(data);
        setLoading(false);
        return;
      }

      // بيانات تجريبية للمتبرعين (في حال لم توجد بيانات)
      const sampleDonors: Donor[] = [
        {
          id: '1',
          name: 'عبدالله محمد الأحمد',
          email: 'abdullah@email.com',
          phone: '+966501234567',
          category: 'vip',
          totalDonations: 250000,
          donationCount: 12,
          lastDonation: new Date('2024-11-25'),
          preferredCauses: ['تعليم', 'صحة'],
          assignedTo: 'أحمد محمد'
        },
        {
          id: '2',
          name: 'سارة أحمد الخالد',
          email: 'sara@email.com',
          phone: '+966502345678',
          category: 'vip',
          totalDonations: 180000,
          donationCount: 8,
          lastDonation: new Date('2024-11-28'),
          preferredCauses: ['كفالة أيتام', 'إغاثة'],
          assignedTo: 'فاطمة أحمد'
        },
        {
          id: '3',
          name: 'خالد سعد العتيبي',
          email: 'khaled@email.com',
          phone: '+966503456789',
          category: 'regular',
          totalDonations: 85000,
          donationCount: 15,
          lastDonation: new Date('2024-11-20'),
          preferredCauses: ['تعليم', 'بناء مساجد'],
          assignedTo: 'أحمد محمد'
        },
        {
          id: '4',
          name: 'نورة علي السالم',
          email: 'noura@email.com',
          phone: '+966504567890',
          category: 'regular',
          totalDonations: 65000,
          donationCount: 10,
          lastDonation: new Date('2024-11-22'),
          preferredCauses: ['صحة', 'كفالة أيتام'],
          assignedTo: 'فاطمة أحمد'
        },
        {
          id: '5',
          name: 'محمد عبدالرحمن القحطاني',
          email: 'mohammed@email.com',
          phone: '+966505678901',
          category: 'new',
          totalDonations: 15000,
          donationCount: 2,
          lastDonation: new Date('2024-11-29'),
          preferredCauses: ['تعليم'],
          assignedTo: 'أحمد محمد'
        },
        {
          id: '6',
          name: 'فاطمة حسن الدوسري',
          email: 'fatima@email.com',
          phone: '+966506789012',
          category: 'new',
          totalDonations: 8000,
          donationCount: 1,
          lastDonation: new Date('2024-11-30'),
          preferredCauses: ['كفالة أيتام'],
          assignedTo: 'فاطمة أحمد'
        },
        {
          id: '7',
          name: 'عمر يوسف المطيري',
          email: 'omar@email.com',
          phone: '+966507890123',
          category: 'inactive',
          totalDonations: 120000,
          donationCount: 18,
          lastDonation: new Date('2024-08-15'),
          preferredCauses: ['تعليم', 'صحة', 'بناء مساجد'],
          assignedTo: 'أحمد محمد'
        },
        {
          id: '8',
          name: 'ريم فهد العمري',
          email: 'reem@email.com',
          phone: '+966508901234',
          category: 'inactive',
          totalDonations: 95000,
          donationCount: 12,
          lastDonation: new Date('2024-07-20'),
          preferredCauses: ['صحة', 'إغاثة'],
          assignedTo: 'فاطمة أحمد'
        }
      ];

      setDonors(sampleDonors);

      addNotification({
        type: 'success',
        title: '✅ تم التحميل',
        message: 'تم تحميل بيانات المتبرعين بنجاح'
      });
    } catch (error) {
      console.error('Error loading donors:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ',
        message: 'حدث خطأ أثناء تحميل البيانات'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDonor = () => {
    if (!newDonor.name || !newDonor.email || !newDonor.phone) {
      addNotification({
        type: 'warning',
        title: '⚠️ بيانات ناقصة',
        message: 'يرجى إدخال جميع البيانات المطلوبة'
      });
      return;
    }

    const donor: Donor = {
      id: Date.now().toString(),
      ...newDonor,
      totalDonations: 0,
      donationCount: 0,
      lastDonation: new Date(),
      preferredCauses: [],
      assignedTo: 'أحمد محمد'
    };

    setDonors([donor, ...donors]);
    setShowAddDialog(false);
    setNewDonor({ name: '', email: '', phone: '', category: 'new' });

    addNotification({
      type: 'success',
      title: '✅ تم الإضافة',
      message: 'تم إضافة المتبرع بنجاح'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vip': return 'bg-purple-500';
      case 'regular': return 'bg-blue-500';
      case 'new': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'vip': return '⭐ VIP';
      case 'regular': return '👤 عادي';
      case 'new': return '🆕 جديد';
      case 'inactive': return '⏸️ غير نشط';
      default: return category;
    }
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.includes(searchQuery) || 
                         donor.email.includes(searchQuery) || 
                         donor.phone.includes(searchQuery);
    const matchesCategory = filterCategory === 'all' || donor.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: donors.length,
    vip: donors.filter(d => d.category === 'vip').length,
    regular: donors.filter(d => d.category === 'regular').length,
    new: donors.filter(d => d.category === 'new').length,
    inactive: donors.filter(d => d.category === 'inactive').length,
    totalDonations: donors.reduce((sum, d) => sum + d.totalDonations, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات المتبرعين...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 lg:mr-80 p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              إدارة المتبرعين
            </h1>
            <p className="text-gray-600 mt-2">قاعدة بيانات المتبرعين والداعمين</p>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                <Plus className="h-4 w-4 ml-2" />
                إضافة متبرع جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة متبرع جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>الاسم الكامل</Label>
                  <Input 
                    value={newDonor.name}
                    onChange={(e) => setNewDonor({...newDonor, name: e.target.value})}
                    placeholder="مثال: أحمد محمد السعيد"
                  />
                </div>
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input 
                    type="email"
                    value={newDonor.email}
                    onChange={(e) => setNewDonor({...newDonor, email: e.target.value})}
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <Label>رقم الجوال</Label>
                  <Input 
                    value={newDonor.phone}
                    onChange={(e) => setNewDonor({...newDonor, phone: e.target.value})}
                    placeholder="+966501234567"
                  />
                </div>
                <div>
                  <Label>الفئة</Label>
                  <Select value={newDonor.category} onValueChange={(value: any) => setNewDonor({...newDonor, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">🆕 متبرع جديد</SelectItem>
                      <SelectItem value="regular">👤 متبرع عادي</SelectItem>
                      <SelectItem value="vip">⭐ متبرع VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddDonor} className="w-full">
                  إضافة المتبرع
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{stats.total}</div>
              <p className="text-blue-100">إجمالي المتبرعين</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <div className="text-3xl font-bold mb-1">{stats.vip}</div>
              <p className="text-purple-100">VIP</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-400 to-blue-500 text-white border-0">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{stats.regular}</div>
              <p className="text-blue-100">عاديون</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-3xl font-bold mb-1">{stats.new}</div>
              <p className="text-green-100">جدد</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-gray-200" />
              <div className="text-3xl font-bold mb-1">{stats.inactive}</div>
              <p className="text-gray-100">غير نشطين</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-emerald-200" />
              <div className="text-2xl font-bold mb-1">{(stats.totalDonations / 1000).toFixed(0)}K</div>
              <p className="text-emerald-100">إجمالي التبرعات</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="البحث عن متبرع..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  <SelectItem value="vip">⭐ VIP</SelectItem>
                  <SelectItem value="regular">👤 عادي</SelectItem>
                  <SelectItem value="new">🆕 جديد</SelectItem>
                  <SelectItem value="inactive">⏸️ غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Donors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map((donor) => (
            <Card 
              key={donor.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/donor/${donor.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{donor.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{donor.assignedTo}</p>
                  </div>
                  <Badge className={`${getCategoryColor(donor.category)} text-white`}>
                    {getCategoryLabel(donor.category)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{donor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{donor.phone}</span>
                </div>
                
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">إجمالي التبرعات:</span>
                    <span className="font-bold text-green-600">
                      {donor.totalDonations.toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">عدد التبرعات:</span>
                    <span className="font-bold text-blue-600">{donor.donationCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">آخر تبرع:</span>
                    <span className="text-gray-600">
                      {donor.lastDonation.toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>

                {donor.preferredCauses.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">الاهتمامات:</p>
                    <div className="flex flex-wrap gap-1">
                      {donor.preferredCauses.map((cause, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cause}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDonors.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">لا توجد نتائج مطابقة</p>
              <p className="text-gray-500 text-sm mt-2">جرب تغيير معايير البحث أو الفلتر</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
