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
import { supabaseAPI, Celebrity } from '@/lib/supabaseClient';

export default function InfluencersScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [influencers, setInfluencers] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
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

  const loadInfluencers = async () => {
    try {
      setLoading(true);
      const data = await supabaseAPI.getCelebrities();
      setInfluencers(data);
    } catch (error) {
      console.error('Error loading influencers:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات المؤثرين',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
      
      // Map form data to Celebrity interface
      const newInfluencer = {
        name: formData.name,
        platform: formData.platform,
        followers: parseInt(formData.followers),
        type: formData.category,
        contact: `${formData.email} | ${formData.phone}`,
        status: 'active',
        engagement_rate: 0 // Default
      };

      await supabaseAPI.createCelebrity(newInfluencer);
      
      showSuccessNotification('تم إضافة المؤثر بنجاح');
      setIsDialogOpen(false);
      loadInfluencers();
      
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
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredInfluencers = influencers.filter(inf => 
    inf.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || inf.type === filterCategory)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المؤثرين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🌟 إدارة المؤثرين</h1>
          <p className="text-slate-600">إدارة علاقات المؤثرين وتتبع أدائهم</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="ml-2 h-4 w-4" />
          إضافة مؤثر جديد
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="بحث عن مؤثر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="lifestyle">لايف ستايل</SelectItem>
            <SelectItem value="tech">تقنية</SelectItem>
            <SelectItem value="education">تعليم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInfluencers.map((influencer) => (
          <Card key={influencer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold">{influencer.name}</CardTitle>
              {influencer.platform === 'instagram' && <Instagram className="h-5 w-5 text-pink-600" />}
              {influencer.platform === 'youtube' && <Youtube className="h-5 w-5 text-red-600" />}
              {influencer.platform === 'twitter' && <Twitter className="h-5 w-5 text-blue-400" />}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">المتابعين</span>
                  <span className="font-bold">{(influencer.followers || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">معدل التفاعل</span>
                  <span className="font-bold text-green-600">{influencer.engagement_rate || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">الحالة</span>
                  <Badge variant={influencer.status === 'active' ? 'default' : 'secondary'}>
                    {influencer.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
                <div className="pt-4 border-t flex justify-between">
                  <Button variant="ghost" size="sm" className="w-full">
                    <Eye className="ml-2 h-4 w-4" />
                    عرض الملف
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مؤثر جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>الاسم</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="اسم المؤثر"
              />
            </div>
            <div className="space-y-2">
              <label>المنصة</label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">انستغرام</SelectItem>
                  <SelectItem value="youtube">يوتيوب</SelectItem>
                  <SelectItem value="twitter">تويتر</SelectItem>
                  <SelectItem value="snapchat">سناب شات</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>عدد المتابعين</label>
              <Input
                type="number"
                value={formData.followers}
                onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                placeholder="مثال: 100000"
              />
            </div>
            <div className="space-y-2">
              <label>التصنيف</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">عام</SelectItem>
                  <SelectItem value="lifestyle">لايف ستايل</SelectItem>
                  <SelectItem value="tech">تقنية</SelectItem>
                  <SelectItem value="education">تعليم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
            <LoadingButton loading={isSaving} onClick={handleCreateInfluencer}>حفظ</LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
