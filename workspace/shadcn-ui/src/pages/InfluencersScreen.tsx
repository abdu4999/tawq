import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';
import { Star, Search, Users, TrendingUp, DollarSign, Plus, Eye, Instagram, Youtube, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleApiError, showSuccessNotification } from '@/lib/error-handler';

export default function InfluencersScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'instagram',
    followers: '',
    category: 'general',
    commissionRate: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    loadInfluencers();
  }, []);

  const loadInfluencers = () => {
    setInfluencers([
      {
        id: 1,
        name: 'عبدالله النجم',
        platform: 'instagram',
        followers: 2500000,
        category: 'lifestyle',
        commissionRate: 15,
        totalRevenue: 450000,
        campaignsCount: 8,
        avgEngagement: 4.2,
        status: 'active'
      },
      {
        id: 2,
        name: 'سارة الإبداع',
        platform: 'youtube',
        followers: 1800000,
        category: 'education',
        commissionRate: 12,
        totalRevenue: 320000,
        campaignsCount: 6,
        avgEngagement: 5.8,
        status: 'active'
      },
      {
        id: 3,
        name: 'محمد التقني',
        platform: 'twitter',
        followers: 950000,
        category: 'tech',
        commissionRate: 10,
        totalRevenue: 180000,
        campaignsCount: 4,
        avgEngagement: 3.5,
        status: 'active'
      }
    ]);
  };

  const handleCreateInfluencer = async () => {
    try {
      // Validation
      if (!formData.name || !formData.followers) {
        toast({
          title: 'خطأ',
          description: 'الرجاء ملء جميع الحقول المطلوبة',
          variant: 'destructive'
        });
        return;
      }

      setIsSaving(true);
      
      // Your save logic here...
      // await supabaseAPI.createInfluencer(formData);
      
      // Reset form
      setFormData({
        name: '',
        platform: 'instagram',
        followers: '',
        category: 'general',
        commissionRate: '',
        email: '',
        phone: ''
      });
      setIsDialogOpen(false);
      
      // Success notification
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        'تمت إضافة المشهور بنجاح'
      );
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في حفظ المشهور',
        context: 'InfluencersScreen - Create',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء حفظ المشهور',
        payload: formData,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredInfluencers = influencers.filter(influencer => {
    const matchesSearch = influencer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || influencer.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: influencers.length,
    totalRevenue: influencers.reduce((sum, i) => sum + i.totalRevenue, 0),
    totalFollowers: influencers.reduce((sum, i) => sum + i.followers, 0),
    avgEngagement: influencers.reduce((sum, i) => sum + i.avgEngagement, 0) / influencers.length
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-5 w-5" />;
      case 'youtube': return <Youtube className="h-5 w-5" />;
      case 'twitter': return <Twitter className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="h-12 w-12 text-yellow-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              المشاهير
            </h1>
          </div>
          <p className="text-gray-600">إدارة المشاهير والحملات التسويقية</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">إجمالي المشاهير</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Star className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

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

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">إجمالي المتابعين</p>
                  <p className="text-2xl font-bold">{(stats.totalFollowers / 1000000).toFixed(1)}M</p>
                </div>
                <Users className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100">متوسط التفاعل</p>
                  <p className="text-3xl font-bold">{stats.avgEngagement.toFixed(1)}%</p>
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
                    placeholder="البحث بالاسم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الجميع</SelectItem>
                  <SelectItem value="lifestyle">أسلوب حياة</SelectItem>
                  <SelectItem value="education">تعليم</SelectItem>
                  <SelectItem value="tech">تقنية</SelectItem>
                  <SelectItem value="sports">رياضة</SelectItem>
                  <SelectItem value="general">عام</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                مشهور جديد
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Influencers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInfluencers.map((influencer) => (
            <Card key={influencer.id} className="hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getPlatformIcon(influencer.platform)}
                      <CardTitle className="text-lg">{influencer.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {influencer.category === 'lifestyle' ? 'أسلوب حياة' :
                         influencer.category === 'education' ? 'تعليم' :
                         influencer.category === 'tech' ? 'تقنية' :
                         influencer.category === 'sports' ? 'رياضة' : 'عام'}
                      </Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        عمولة {influencer.commissionRate}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">المتابعين</p>
                    <p className="text-lg font-bold text-blue-600">
                      {(influencer.followers / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">التفاعل</p>
                    <p className="text-lg font-bold text-green-600">
                      {influencer.avgEngagement}%
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">إجمالي الإيراد</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {influencer.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 text-left">
                    {influencer.campaignsCount} حملة
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => navigate(`/influencers/${influencer.id}`)}
                >
                  <Eye className="h-4 w-4" />
                  عرض الملف الكامل
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Influencer Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة مشهور جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الاسم *</label>
                <Input
                  placeholder="اسم المشهور"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">المنصة</label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="snapchat">Snapchat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">عدد المتابعين *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.followers}
                    onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">التصنيف</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lifestyle">أسلوب حياة</SelectItem>
                      <SelectItem value="education">تعليم</SelectItem>
                      <SelectItem value="tech">تقنية</SelectItem>
                      <SelectItem value="sports">رياضة</SelectItem>
                      <SelectItem value="general">عام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">نسبة العمولة (%)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الجوال</label>
                  <Input
                    placeholder="05xxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                إلغاء
              </Button>
              <LoadingButton 
                onClick={handleCreateInfluencer} 
                loading={isSaving}
                loadingText="جاري الحفظ..."
                disabled={!formData.name || !formData.followers}
              >
                إضافة المشهور
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
