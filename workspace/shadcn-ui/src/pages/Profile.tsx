import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications } from '@/components/NotificationSystem';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  Camera,
  Shield,
  Award,
  Activity,
  Clock,
  Star,
  Trophy,
  Target,
  TrendingUp
} from 'lucide-react';
import {
  getUserProfile,
  updateUserProfile,
  getUserActivities,
  uploadProfilePicture,
  getOrCreateUserProfile,
  type UserProfile,
  type UserActivity
} from '@/lib/supabaseProfile';

export default function Profile() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    loadProfile();
    loadActivities();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await getOrCreateUserProfile();
      setProfileData(profile);
      
      addNotification({
        type: 'success',
        title: '👤 تم تحميل الملف الشخصي',
        message: 'تم تحميل بيانات الملف الشخصي بنجاح',
        duration: 3000
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في تحميل الملف الشخصي',
        message: 'حدث خطأ أثناء تحميل بيانات الملف الشخصي'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const activitiesData = await getUserActivities();
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const handleSave = async () => {
    if (!profileData) return;

    try {
      setSaving(true);
      await updateUserProfile({
        name: profileData.name,
        phone: profileData.phone,
        position: profileData.position,
        department: profileData.department,
        location: profileData.location,
        bio: profileData.bio
      });
      
      setIsEditing(false);
      addNotification({
        type: 'success',
        title: '✅ تم حفظ التغييرات',
        message: 'تم تحديث بيانات الملف الشخصي بنجاح',
        duration: 4000
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في الحفظ',
        message: 'حدث خطأ أثناء حفظ التغييرات'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profileData) return;

    try {
      const avatarUrl = await uploadProfilePicture(file);
      await updateUserProfile({ avatar_url: avatarUrl });
      
      setProfileData({ ...profileData, avatar_url: avatarUrl });
      
      addNotification({
        type: 'success',
        title: '📷 تم تحديث الصورة',
        message: 'تم تحديث صورة الملف الشخصي بنجاح'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في رفع الصورة',
        message: 'حدث خطأ أثناء رفع صورة الملف الشخصي'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) {
      return `منذ ${hours} ساعة`;
    } else {
      return `منذ ${days} يوم`;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'خبير': return 'bg-purple-100 text-purple-800';
      case 'متقدم': return 'bg-blue-100 text-blue-800';
      case 'متوسط': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task': return Target;
      case 'project': return Star;
      case 'achievement': return Trophy;
      case 'contribution': return Award;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الملف الشخصي...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
        <Sidebar />
        <div className="flex-1 lg:mr-80 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">لا يمكن تحميل بيانات الملف الشخصي</p>
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
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            الملف الشخصي
          </h1>
          <p className="text-xl text-gray-600">إدارة بيانات الحساب والإعدادات الشخصية</p>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileData.avatar_url || undefined} alt={profileData.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-3xl">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload">
                    <Button
                      size="sm"
                      className="rounded-full h-10 w-10 p-0 cursor-pointer"
                      asChild
                    >
                      <div>
                        <Camera className="h-4 w-4" />
                      </div>
                    </Button>
                  </label>
                </div>
              </div>
              
              <div className="flex-1 text-center lg:text-right">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{profileData.name}</h2>
                <p className="text-xl text-gray-600 mb-4">{profileData.position}</p>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                  <Badge className={getLevelColor(profileData.level)} variant="secondary">
                    <Star className="h-4 w-4 ml-1" />
                    {profileData.level}
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Trophy className="h-4 w-4 ml-1" />
                    المرتبة #{profileData.rank}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    <Shield className="h-4 w-4 ml-1" />
                    {profileData.total_points.toLocaleString()} نقطة
                  </Badge>
                </div>
                
                <p className="text-gray-600 max-w-2xl">{profileData.bio}</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري الحفظ...
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      حفظ التغييرات
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 ml-2" />
                      تعديل الملف الشخصي
                    </>
                  )}
                </Button>
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    إلغاء
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{profileData.completed_tasks}</div>
              <p className="text-blue-100">مهام مكتملة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-3xl font-bold mb-1">{profileData.active_projects}</div>
              <p className="text-green-100">مشاريع نشطة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <div className="text-3xl font-bold mb-1">{profileData.achievements}</div>
              <p className="text-purple-100">إنجازات</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-orange-200" />
              <div className="text-3xl font-bold mb-1">{profileData.avg_rating}</div>
              <p className="text-orange-100">متوسط التقييم</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                البيانات الشخصية
              </CardTitle>
              <CardDescription>
                معلومات الحساب والبيانات الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">الاسم الكامل</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-700 mt-1">{profileData.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={profileData.phone || ''}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{profileData.phone || 'غير محدد'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="position">المنصب</Label>
                  {isEditing ? (
                    <Input
                      id="position"
                      value={profileData.position || ''}
                      onChange={(e) => setProfileData({...profileData, position: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-700 mt-1">{profileData.position}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="department">القسم</Label>
                  {isEditing ? (
                    <Input
                      id="department"
                      value={profileData.department || ''}
                      onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-700 mt-1">{profileData.department}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">الموقع</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={profileData.location || ''}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{profileData.location || 'غير محدد'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">النبذة الشخصية</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={profileData.bio || ''}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-700 mt-1">{profileData.bio || 'لا توجد نبذة شخصية'}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    انضم في {formatDate(profileData.join_date)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                النشاط الأخير
              </CardTitle>
              <CardDescription>
                آخر الأنشطة والإنجازات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="p-2 rounded-full bg-white">
                          <IconComponent className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{formatTimestamp(activity.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">لا توجد أنشطة حديثة</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}