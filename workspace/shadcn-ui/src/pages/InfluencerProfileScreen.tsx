import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Star, Users, TrendingUp, Instagram, Phone, Mail, Edit } from 'lucide-react';
import { supabaseAPI, Celebrity } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

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

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/influencers')} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للمشاهير
          </Button>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            تعديل البيانات
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
                    ⭐
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{influencer.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-white text-orange-600">
                        <Instagram className="h-3 w-3 ml-1" />
                        {influencer.platform}
                      </Badge>
                      <Badge className="bg-blue-400 text-white">
                        {influencer.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{influencer.contact?.split('|')[0]?.trim() || 'غير متوفر'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{influencer.contact?.split('|')[1]?.trim() || 'غير متوفر'}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-left">
                <div className="text-sm opacity-90">المتابعين</div>
                <div className="text-3xl font-bold">{(influencer.followers || 0).toLocaleString()}</div>
                <div className="text-sm opacity-90 mt-2">معدل التفاعل</div>
                <div className="text-xl font-bold">{influencer.engagement_rate || 0}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

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
