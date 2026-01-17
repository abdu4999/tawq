import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Star, Users, TrendingUp, Instagram, Phone, Mail, Edit, Twitter, MapPin, Link as LinkIcon, Youtube } from 'lucide-react';
import { supabaseAPI, Celebrity, CelebrityPlatform } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

const PLATFORM_LABELS: Record<CelebrityPlatform, string> = {
  instagram: 'إنستغرام',
  snapchat: 'سناب شات',
  tiktok: 'تيك توك',
  youtube: 'يوتيوب',
  twitter: 'منصة X (تويتر)',
  website: 'موقع إلكتروني'
};

const STATUS_LABELS: Record<Celebrity['status'], string> = {
  available: 'متاح',
  busy: 'مشغول',
  contracted: 'متعاقد',
  unavailable: 'غير متاح'
};

const formatNumber = (value?: number | null) => {
  const numeric = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  return numeric.toLocaleString('ar-SA');
};

const getPlatformLabel = (platform?: string | null) => {
  if (!platform) return '—';
  const key = platform as CelebrityPlatform;
  return PLATFORM_LABELS[key] || platform;
};

export default function InfluencerProfileScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [influencer, setInfluencer] = useState<Celebrity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInfluencer();
    }
  }, [id]);

  const loadInfluencer = async () => {
    try {
      setLoading(true);
      const celebrities = await supabaseAPI.getCelebrities();
      const found = celebrities.find(c => c.id === id);
      
      if (found) {
        setInfluencer(found);
      } else {
        toast({
          title: 'خطأ',
          description: 'لم يتم العثور على المؤثر',
          variant: 'destructive'
        });
        navigate('/celebrities');
      }
    } catch (error) {
      console.error('Error loading influencer:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات المؤثر',
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

  if (!influencer) return null;

  const followersCount = influencer.followers_count ?? influencer.followers ?? 0;
  const engagementRate = influencer.engagement_rate ?? 0;
  const collaborationRate = influencer.collaboration_rate ?? 0;
  const platformLabel = getPlatformLabel(influencer.platform);
  const otherAccounts = influencer.other_accounts || [];

  const handleRows = [
    { label: 'Snapchat', value: influencer.snapchat_handle, prefix: '👻' },
    { label: 'TikTok', value: influencer.tiktok_handle, prefix: '🎵' },
    { label: 'Instagram', value: influencer.instagram_handle, prefix: <Instagram className="h-4 w-4 text-pink-600" /> },
    { label: 'YouTube', value: influencer.youtube_handle, prefix: <Youtube className="h-4 w-4 text-red-600" /> },
    { label: 'X (تويتر)', value: influencer.twitter_handle, prefix: <Twitter className="h-4 w-4 text-sky-500" /> }
  ].filter(row => row.value);

  const handleEditClick = () => {
    navigate('/celebrities', { state: { editCelebrityId: influencer.id } });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/celebrities')} className="gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للمشاهير
        </Button>
        <Button className="gap-2" onClick={handleEditClick}>
          <Edit className="h-4 w-4" />
          تعديل البيانات
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl text-yellow-500">
                  ⭐
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{influencer.name}</h1>
                  {influencer.bio && (
                    <p className="text-sm text-white/80 mt-1 line-clamp-2">{influencer.bio}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white text-orange-600">{STATUS_LABELS[influencer.status]}</Badge>
                {influencer.category && (
                  <Badge className="bg-white/20 border border-white/40">{influencer.category}</Badge>
                )}
                <Badge className="bg-white/20 border border-white/40">{platformLabel}</Badge>
                {influencer.location && (
                  <Badge className="bg-white/10 border border-white/30 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {influencer.location}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{influencer.contact_email || 'غير متوفر'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{influencer.contact_phone || 'غير متوفر'}</span>
                </div>
              </div>
            </div>

            <div className="text-left">
              <div className="text-sm opacity-90">المتابعين</div>
              <div className="text-3xl font-bold">{formatNumber(followersCount)}</div>
              <div className="text-sm opacity-90 mt-2">معدل التفاعل</div>
              <div className="text-xl font-bold">{engagementRate}%</div>
              <div className="text-sm opacity-90 mt-2">سعر التعاون</div>
              <div className="text-xl font-bold">{collaborationRate.toLocaleString('ar-SA')} ريال</div>
            </div>
          </div>

          {influencer.account_link && (
            <Button
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-white/90 w-fit"
              asChild
            >
              <a href={influencer.account_link} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                زيارة الحساب الرئيسي
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>مؤشرات أساسية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <Users className="h-6 w-6 mx-auto text-blue-600" />
                <div className="text-xs text-slate-500">عدد المتابعين</div>
                <div className="text-lg font-semibold">{formatNumber(followersCount)}</div>
              </div>
              <div className="space-y-2">
                <TrendingUp className="h-6 w-6 mx-auto text-purple-600" />
                <div className="text-xs text-slate-500">معدل التفاعل</div>
                <div className="text-lg font-semibold">{engagementRate}%</div>
              </div>
              <div className="space-y-2">
                <Star className="h-6 w-6 mx-auto text-amber-500" />
                <div className="text-xs text-slate-500">سعر التعاون</div>
                <div className="text-lg font-semibold">{collaborationRate.toLocaleString('ar-SA')} ريال</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التواصل والموقع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              <span>{influencer.contact_email || 'لا يوجد بريد مسجل'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-500" />
              <span>{influencer.contact_phone || 'لا يوجد رقم مسجل'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span>{influencer.location || 'غير محدد'}</span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-slate-500" />
              {influencer.account_link ? (
                <a href={influencer.account_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  فتح الحساب الرسمي
                </a>
              ) : (
                <span>لا يوجد رابط رئيسي</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الحسابات الموثقة</CardTitle>
          </CardHeader>
          <CardContent>
            {handleRows.length > 0 ? (
              <div className="space-y-3">
                {handleRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between border rounded-md px-3 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-base">{row.prefix}</span>
                      <span className="text-slate-600">{row.label}</span>
                    </div>
                    <span className="font-mono text-slate-800">{row.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">لا توجد معرفات مرتبطة</p>
            )}
          </CardContent>
        </Card>
      </div>

      {otherAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>روابط إضافية للحسابات الأخرى</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {otherAccounts.map((account, index) => (
              <div key={`${account.platform}-${index}`} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border rounded-md px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Badge variant="outline">{getPlatformLabel(account.platform as CelebrityPlatform)}</Badge>
                  {account.handle && <span className="font-mono">{account.handle}</span>}
                </div>
                {account.link ? (
                  <a href={account.link} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline">
                    فتح الرابط
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">لا يوجد رابط</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {influencer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>ملاحظات إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-slate-700 whitespace-pre-line">{influencer.notes}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="campaigns">الحملات السابقة</TabsTrigger>
            <TabsTrigger value="analytics">تحليل الأداء</TabsTrigger>
            <TabsTrigger value="financials">البيانات المالية</TabsTrigger>
          </TabsList>
          
          <TabsContent value="campaigns" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>سجل الحملات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  لا توجد حملات مرتبطة بهذا المؤثر حالياً
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
