import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { useNotifications } from '@/components/NotificationSystem';
import { handleApiError, showSuccessNotification } from '@/lib/error-handler';
import { supabaseAPI, Celebrity } from '@/lib/supabaseClient';
import { formatDateDMY } from '@/lib/date-utils';
import {
  Star,
  Plus,
  Edit,
  Trash2,
  Users,
  Mail,
  Phone,
  Instagram,
  Twitter,
  DollarSign,
  Search,
  Eye,
  TrendingUp
} from 'lucide-react';

export default function CelebrityManagement() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newCelebrity, setNewCelebrity] = useState({
    name: '',
    category: 'influencer' as const,
    bio: '',
    followers_count: 0,
    contact_email: '',
    contact_phone: '',
    instagram_handle: '',
    twitter_handle: '',
    collaboration_rate: 0,
    status: 'available' as const
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const celebritiesData = await supabaseAPI.getCelebrities();
      setCelebrities(celebritiesData);
    } catch (error) {
      console.error('Error loading data:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في تحميل البيانات',
        message: 'حدث خطأ أثناء تحميل البيانات من قاعدة البيانات'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCelebrities = celebrities.filter(celebrity => {
    const matchesSearch = celebrity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         celebrity.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || celebrity.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || celebrity.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateCelebrity = async () => {
    try {
      // Validation
      if (!newCelebrity.name.trim()) {
        addNotification({
          type: 'warning',
          title: '⚠️ خطأ في البيانات',
          message: 'يرجى إدخال اسم المشهور'
        });
        return;
      }

      setIsSaving(true);
      
      const celebrityData = {
        ...newCelebrity,
        contact_email: newCelebrity.contact_email || null,
        contact_phone: newCelebrity.contact_phone || null,
        instagram_handle: newCelebrity.instagram_handle || null,
        twitter_handle: newCelebrity.twitter_handle || null,
        bio: newCelebrity.bio || null
      };
      
      const createdCelebrity = await supabaseAPI.createCelebrity(celebrityData);
      setCelebrities([createdCelebrity, ...celebrities]);
      
      // Reset form
      setNewCelebrity({
        name: '',
        category: 'influencer',
        bio: '',
        followers_count: 0,
        contact_email: '',
        contact_phone: '',
        instagram_handle: '',
        twitter_handle: '',
        collaboration_rate: 0,
        status: 'available'
      });
      setIsCreateDialogOpen(false);

      // Success notification
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        `تم إضافة "${createdCelebrity.name}" بنجاح`
      );
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في إضافة المشهور',
        context: 'CelebrityManagement - Create',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء إضافة المشهور',
        payload: newCelebrity,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCelebrity = async () => {
    if (!selectedCelebrity) return;

    try {
      setIsSaving(true);
      
      const updatedCelebrity = await supabaseAPI.updateCelebrity(selectedCelebrity.id, selectedCelebrity);
      setCelebrities(celebrities.map(celebrity => celebrity.id === selectedCelebrity.id ? updatedCelebrity : celebrity));
      
      setIsEditDialogOpen(false);
      setSelectedCelebrity(null);

      // Success notification
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        `تم تحديث بيانات "${updatedCelebrity.name}" بنجاح`
      );
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في تحديث المشهور',
        context: 'CelebrityManagement - Update',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء تحديث البيانات',
        payload: selectedCelebrity,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCelebrity = async (celebrityId: string, celebrityName: string) => {
    try {
      await supabaseAPI.deleteCelebrity(celebrityId);
      setCelebrities(celebrities.filter(celebrity => celebrity.id !== celebrityId));
      
      addNotification({
        type: 'warning',
        title: '🗑️ تم حذف المشهور',
        message: `تم حذف "${celebrityName}"`,
        duration: 4000,
        action: {
          label: 'تراجع',
          onClick: () => {
            loadData();
            addNotification({
              type: 'info',
              title: '↩️ تم التراجع',
              message: 'تم إلغاء عملية الحذف'
            });
          }
        }
      });
    } catch (error) {
      console.error('Error deleting celebrity:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في الحذف',
        message: 'حدث خطأ أثناء حذف المشهور'
      });
    }
  };

  const getStatusColor = (status: Celebrity['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'contracted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unavailable': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: Celebrity['category']) => {
    switch (category) {
      case 'influencer': return 'bg-purple-100 text-purple-800';
      case 'actor': return 'bg-blue-100 text-blue-800';
      case 'athlete': return 'bg-green-100 text-green-800';
      case 'singer': return 'bg-pink-100 text-pink-800';
      case 'writer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const celebrityStats = {
    total: celebrities.length,
    available: celebrities.filter(c => c.status === 'available').length,
    contracted: celebrities.filter(c => c.status === 'contracted').length,
    totalFollowers: celebrities.reduce((sum, c) => sum + c.followers_count, 0),
    avgRate: celebrities.length > 0 ? Math.round(celebrities.reduce((sum, c) => sum + c.collaboration_rate, 0) / celebrities.length) : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات المشاهير من قاعدة البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            إدارة المشاهير والمؤثرين
          </h1>
          <p className="text-xl text-gray-600">قاعدة بيانات المشاهير والمؤثرين للتعاون</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <div className="text-3xl font-bold mb-1">{celebrityStats.total}</div>
              <p className="text-purple-100">إجمالي المشاهير</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-3xl font-bold mb-1">{celebrityStats.available}</div>
              <p className="text-green-100">متاحون</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{celebrityStats.contracted}</div>
              <p className="text-blue-100">متعاقدون</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Instagram className="h-8 w-8 mx-auto mb-3 text-pink-200" />
              <div className="text-2xl font-bold mb-1">{(celebrityStats.totalFollowers / 1000000).toFixed(1)}M</div>
              <p className="text-pink-100">إجمالي المتابعين</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-3 text-emerald-200" />
              <div className="text-2xl font-bold mb-1">{celebrityStats.avgRate.toLocaleString()}</div>
              <p className="text-emerald-100">متوسط السعر</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث في المشاهير..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    <SelectItem value="influencer">مؤثر</SelectItem>
                    <SelectItem value="actor">ممثل</SelectItem>
                    <SelectItem value="athlete">رياضي</SelectItem>
                    <SelectItem value="singer">مطرب</SelectItem>
                    <SelectItem value="writer">كاتب</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="available">متاح</SelectItem>
                    <SelectItem value="busy">مشغول</SelectItem>
                    <SelectItem value="contracted">متعاقد</SelectItem>
                    <SelectItem value="unavailable">غير متاح</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة مشهور جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>إضافة مشهور جديد</DialogTitle>
                    <DialogDescription>
                      أدخل بيانات المشهور الجديد
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">الاسم</Label>
                      <Input
                        id="name"
                        value={newCelebrity.name}
                        onChange={(e) => setNewCelebrity({...newCelebrity, name: e.target.value})}
                        placeholder="أدخل اسم المشهور"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">الفئة</Label>
                        <Select value={newCelebrity.category} onValueChange={(value: Celebrity['category']) => setNewCelebrity({...newCelebrity, category: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="influencer">مؤثر</SelectItem>
                            <SelectItem value="actor">ممثل</SelectItem>
                            <SelectItem value="athlete">رياضي</SelectItem>
                            <SelectItem value="singer">مطرب</SelectItem>
                            <SelectItem value="writer">كاتب</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status">الحالة</Label>
                        <Select value={newCelebrity.status} onValueChange={(value: Celebrity['status']) => setNewCelebrity({...newCelebrity, status: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">متاح</SelectItem>
                            <SelectItem value="busy">مشغول</SelectItem>
                            <SelectItem value="contracted">متعاقد</SelectItem>
                            <SelectItem value="unavailable">غير متاح</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">النبذة التعريفية</Label>
                      <Textarea
                        id="bio"
                        value={newCelebrity.bio}
                        onChange={(e) => setNewCelebrity({...newCelebrity, bio: e.target.value})}
                        placeholder="نبذة مختصرة عن المشهور"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="followers_count">عدد المتابعين</Label>
                        <Input
                          id="followers_count"
                          type="number"
                          value={newCelebrity.followers_count}
                          onChange={(e) => setNewCelebrity({...newCelebrity, followers_count: parseInt(e.target.value) || 0})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="collaboration_rate">سعر التعاون</Label>
                        <Input
                          id="collaboration_rate"
                          type="number"
                          value={newCelebrity.collaboration_rate}
                          onChange={(e) => setNewCelebrity({...newCelebrity, collaboration_rate: parseFloat(e.target.value) || 0})}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact_email">البريد الإلكتروني</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={newCelebrity.contact_email}
                          onChange={(e) => setNewCelebrity({...newCelebrity, contact_email: e.target.value})}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_phone">رقم الهاتف</Label>
                        <Input
                          id="contact_phone"
                          value={newCelebrity.contact_phone}
                          onChange={(e) => setNewCelebrity({...newCelebrity, contact_phone: e.target.value})}
                          placeholder="+966501234567"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="instagram_handle">Instagram</Label>
                        <Input
                          id="instagram_handle"
                          value={newCelebrity.instagram_handle}
                          onChange={(e) => setNewCelebrity({...newCelebrity, instagram_handle: e.target.value})}
                          placeholder="@username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter_handle">Twitter</Label>
                        <Input
                          id="twitter_handle"
                          value={newCelebrity.twitter_handle}
                          onChange={(e) => setNewCelebrity({...newCelebrity, twitter_handle: e.target.value})}
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSaving}>
                      إلغاء
                    </Button>
                    <LoadingButton 
                      onClick={handleCreateCelebrity}
                      loading={isSaving}
                      loadingText="جاري الحفظ..."
                      disabled={!newCelebrity.name}
                    >
                      إضافة المشهور
                    </LoadingButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Celebrities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCelebrities.map((celebrity) => (
            <Card key={celebrity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{celebrity.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {celebrity.followers_count.toLocaleString()} متابع
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(celebrity.status)}>
                      {celebrity.status === 'available' ? 'متاح' :
                       celebrity.status === 'busy' ? 'مشغول' :
                       celebrity.status === 'contracted' ? 'متعاقد' : 'غير متاح'}
                    </Badge>
                    <Badge className={getCategoryColor(celebrity.category)}>
                      {celebrity.category === 'influencer' ? 'مؤثر' :
                       celebrity.category === 'actor' ? 'ممثل' :
                       celebrity.category === 'athlete' ? 'رياضي' :
                       celebrity.category === 'singer' ? 'مطرب' : 'كاتب'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {celebrity.bio && (
                  <p className="text-gray-600 text-sm line-clamp-3">{celebrity.bio}</p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{celebrity.collaboration_rate.toLocaleString()} ريال</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{(celebrity.followers_count / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {celebrity.contact_email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{celebrity.contact_email}</span>
                    </div>
                  )}
                  {celebrity.contact_phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{celebrity.contact_phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {celebrity.instagram_handle && (
                    <div className="flex items-center gap-1">
                      <Instagram className="h-4 w-4" />
                      <span>{celebrity.instagram_handle}</span>
                    </div>
                  )}
                  {celebrity.twitter_handle && (
                    <div className="flex items-center gap-1">
                      <Twitter className="h-4 w-4" />
                      <span>{celebrity.twitter_handle}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-xs text-gray-500">
                    أضيف: {formatDateDMY(celebrity.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        addNotification({
                          type: 'info',
                          title: '👁️ عرض الملف الشخصي',
                          message: `عرض ملف ${celebrity.name} الشخصي`
                        });
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCelebrity(celebrity);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCelebrity(celebrity.id, celebrity.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCelebrities.length === 0 && (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <Star className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-600">لا توجد نتائج</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
                      ? 'لا توجد مشاهير تطابق معايير البحث' 
                      : 'لم يتم إضافة أي مشاهير بعد'}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة أول مشهور
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Edit Celebrity Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تعديل بيانات المشهور</DialogTitle>
              <DialogDescription>
                تحديث معلومات المشهور
              </DialogDescription>
            </DialogHeader>
            {selectedCelebrity && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">الاسم</Label>
                  <Input
                    id="edit-name"
                    value={selectedCelebrity.name}
                    onChange={(e) => setSelectedCelebrity({...selectedCelebrity, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-category">الفئة</Label>
                    <Select value={selectedCelebrity.category} onValueChange={(value: Celebrity['category']) => setSelectedCelebrity({...selectedCelebrity, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="influencer">مؤثر</SelectItem>
                        <SelectItem value="actor">ممثل</SelectItem>
                        <SelectItem value="athlete">رياضي</SelectItem>
                        <SelectItem value="singer">مطرب</SelectItem>
                        <SelectItem value="writer">كاتب</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-status">الحالة</Label>
                    <Select value={selectedCelebrity.status} onValueChange={(value: Celebrity['status']) => setSelectedCelebrity({...selectedCelebrity, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">متاح</SelectItem>
                        <SelectItem value="busy">مشغول</SelectItem>
                        <SelectItem value="contracted">متعاقد</SelectItem>
                        <SelectItem value="unavailable">غير متاح</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-bio">النبذة التعريفية</Label>
                  <Textarea
                    id="edit-bio"
                    value={selectedCelebrity.bio || ''}
                    onChange={(e) => setSelectedCelebrity({...selectedCelebrity, bio: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-followers_count">عدد المتابعين</Label>
                    <Input
                      id="edit-followers_count"
                      type="number"
                      value={selectedCelebrity.followers_count}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, followers_count: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-collaboration_rate">سعر التعاون</Label>
                    <Input
                      id="edit-collaboration_rate"
                      type="number"
                      value={selectedCelebrity.collaboration_rate}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, collaboration_rate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-contact_email">البريد الإلكتروني</Label>
                    <Input
                      id="edit-contact_email"
                      type="email"
                      value={selectedCelebrity.contact_email || ''}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, contact_email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-contact_phone">رقم الهاتف</Label>
                    <Input
                      id="edit-contact_phone"
                      value={selectedCelebrity.contact_phone || ''}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, contact_phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-instagram_handle">Instagram</Label>
                    <Input
                      id="edit-instagram_handle"
                      value={selectedCelebrity.instagram_handle || ''}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, instagram_handle: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-twitter_handle">Twitter</Label>
                    <Input
                      id="edit-twitter_handle"
                      value={selectedCelebrity.twitter_handle || ''}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, twitter_handle: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
                إلغاء
              </Button>
              <LoadingButton 
                onClick={handleUpdateCelebrity}
                loading={isSaving}
                loadingText="جاري الحفظ..."
                disabled={!selectedCelebrity?.name}
              >
                حفظ التغييرات
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}