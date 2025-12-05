import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';
import { Users, Search, DollarSign, TrendingUp, Heart, Plus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleApiError, showSuccessNotification } from '@/lib/error-handler';

export default function DonorsScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donors, setDonors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'individual',
    segment: 'new',
    amount: ''
  });

  useEffect(() => {
    loadDonors();
  }, []);

  const loadDonors = () => {
    setDonors([
      {
        id: 1,
        name: 'أحمد محمد السعيد',
        email: 'ahmed@example.com',
        phone: '0501234567',
        type: 'individual',
        segment: 'vip',
        totalDonations: 150000,
        donationsCount: 12,
        lastDonation: '2025-11-25',
        status: 'active'
      },
      {
        id: 2,
        name: 'شركة التقنية المتقدمة',
        email: 'info@tech.com',
        phone: '0557654321',
        type: 'organization',
        segment: 'regular',
        totalDonations: 85000,
        donationsCount: 6,
        lastDonation: '2025-11-20',
        status: 'active'
      },
      {
        id: 3,
        name: 'فاطمة علي',
        email: 'fatima@example.com',
        phone: '0551112233',
        type: 'individual',
        segment: 'new',
        totalDonations: 5000,
        donationsCount: 1,
        lastDonation: '2025-11-30',
        status: 'active'
      }
    ]);
  };

  const handleCreateDonor = async () => {
    try {
      // Validation
      if (!formData.name) {
        toast({
          title: 'خطأ',
          description: 'الرجاء ملء جميع الحقول المطلوبة',
          variant: 'destructive'
        });
        return;
      }

      setIsSaving(true);
      
      // Your save logic here...
      // await supabaseAPI.createDonor(formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: 'individual',
        segment: 'new',
        amount: ''
      });
      setIsDialogOpen(false);
      
      // Success notification
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        'تمت إضافة المتبرع بنجاح'
      );
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في حفظ المتبرع',
        context: 'DonorsScreen - Create',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء حفظ المتبرع',
        payload: formData,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || donor.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: donors.length,
    totalAmount: donors.reduce((sum, d) => sum + d.totalDonations, 0),
    vip: donors.filter(d => d.segment === 'vip').length,
    avgDonation: donors.reduce((sum, d) => sum + d.totalDonations, 0) / donors.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 mr-80 p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-12 w-12 text-red-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              المتبرعون
            </h1>
          </div>
          <p className="text-gray-600">إدارة ومتابعة المتبرعين وتبرعاتهم</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">إجمالي المتبرعين</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100">إجمالي التبرعات</p>
                  <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-green-100">ر.س</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">متبرعون VIP</p>
                  <p className="text-3xl font-bold">{stats.vip}</p>
                </div>
                <Heart className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100">متوسط التبرع</p>
                  <p className="text-2xl font-bold">{Math.round(stats.avgDonation).toLocaleString()}</p>
                  <p className="text-xs text-orange-100">ر.س</p>
                </div>
                <TrendingUp className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث بالاسم أو البريد..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="نوع المتبرع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الجميع</SelectItem>
                  <SelectItem value="individual">أفراد</SelectItem>
                  <SelectItem value="organization">مؤسسات</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                متبرع جديد
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Donors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDonors.map((donor) => (
            <Card key={donor.id} className="hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{donor.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={donor.type === 'individual' ? 'default' : 'secondary'}>
                        {donor.type === 'individual' ? 'فرد' : 'مؤسسة'}
                      </Badge>
                      <Badge variant={
                        donor.segment === 'vip' ? 'destructive' :
                        donor.segment === 'regular' ? 'info' : 'warning'
                      }>
                        {donor.segment === 'vip' ? 'VIP' : 
                         donor.segment === 'regular' ? 'منتظم' : 'جديد'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📧</span>
                    <span className="truncate">{donor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📱</span>
                    <span>{donor.phone}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">إجمالي التبرعات</span>
                    <span className="text-2xl font-bold text-green-600">
                      {donor.totalDonations.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 text-left">
                    {donor.donationsCount} تبرع
                  </div>
                </div>

                <div className="text-xs text-gray-500 pt-2 border-t">
                  آخر تبرع: {donor.lastDonation}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => navigate(`/donors/${donor.id}`)}
                >
                  <Eye className="h-4 w-4" />
                  عرض الملف الكامل
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Donor Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة متبرع جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>الاسم *</Label>
                <Input
                  placeholder="اسم المتبرع أو المؤسسة"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>رقم الجوال</Label>
                  <Input
                    placeholder="05xxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>النوع</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">فرد</SelectItem>
                      <SelectItem value="organization">مؤسسة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>التصنيف</Label>
                  <Select value={formData.segment} onValueChange={(value) => setFormData({ ...formData, segment: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">جديد</SelectItem>
                      <SelectItem value="regular">منتظم</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>مبلغ التبرع الأول (اختياري)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                إلغاء
              </Button>
              <LoadingButton 
                onClick={handleCreateDonor} 
                loading={isSaving}
                loadingText="جاري الحفظ..."
                disabled={!formData.name}
              >
                إضافة المتبرع
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
