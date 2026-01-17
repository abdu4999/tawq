import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDateDMY } from '@/lib/date-utils';
import { 
  Book, 
  Video, 
  FileText, 
  Trophy, 
  Star,
  Play,
  Download,
  CheckCircle2
} from 'lucide-react';

const trainingMaterials = [
  {
    id: 1,
    title: 'أساسيات التسويق الخيري',
    type: 'video',
    duration: '45 دقيقة',
    status: 'completed',
    category: 'تسويق'
  },
  {
    id: 2,
    title: 'مهارات الإقناع والتأثير',
    type: 'document',
    status: 'in-progress',
    category: 'مهارات'
  },
  {
    id: 3,
    title: 'إدارة العلاقات مع المتبرعين',
    type: 'video',
    duration: '30 دقيقة',
    status: 'new',
    category: 'علاقات'
  },
  {
    id: 4,
    title: 'قصص نجاح ملهمة',
    type: 'article',
    status: 'new',
    category: 'قصص'
  },
  {
    id: 5,
    title: 'استراتيجيات جمع التبرعات',
    type: 'video',
    duration: '60 دقيقة',
    status: 'new',
    category: 'استراتيجيات'
  },
];

const successStories = [
  {
    id: 1,
    title: 'كيف حققت هدفي الشهري في أسبوعين',
    author: 'أحمد محمد',
    revenue: 150000,
    date: '2025-11-15'
  },
  {
    id: 2,
    title: 'تقنية جديدة لزيادة معدل التحويل بنسبة 40%',
    author: 'فاطمة علي',
    revenue: 120000,
    date: '2025-11-10'
  },
  {
    id: 3,
    title: 'من الصفر إلى المليون في 6 أشهر',
    author: 'محمد سالم',
    revenue: 1000000,
    date: '2025-11-01'
  },
];

export default function TrainingLibraryScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  const handleStartTraining = (material: any) => {
    toast({
      title: 'جاري بدء التدريب',
      description: `جاري فتح: ${material.title}`,
    });
  };

  const handleDownload = (material: any) => {
    toast({
      title: 'جاري التحميل',
      description: `جاري تحميل: ${material.title}`,
    });
  };

  const handleViewStory = (story: any) => {
    toast({
      title: story.title,
      description: story.description || `قصة نجاح ${story.author}`,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5 text-red-500" />;
      case 'document': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'article': return <Book className="h-5 w-5 text-green-500" />;
      default: return <Book className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="success">مكتمل</Badge>;
      case 'in-progress': return <Badge variant="warning">قيد التقدم</Badge>;
      case 'new': return <Badge variant="info">جديد</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Book className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              مكتبة التدريب
            </h1>
          </div>
          <p className="text-gray-600">محتوى تدريبي عالي الجودة لتطوير مهاراتك</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">إجمالي المواد</p>
                  <p className="text-3xl font-bold">{trainingMaterials.length}</p>
                </div>
                <Book className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100">المكتملة</p>
                  <p className="text-3xl font-bold">
                    {trainingMaterials.filter(m => m.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">النقاط المكتسبة</p>
                  <p className="text-3xl font-bold">850</p>
                </div>
                <Star className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100">الشهادات</p>
                  <p className="text-3xl font-bold">3</p>
                </div>
                <Trophy className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training Materials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>المواد التدريبية</span>
              <Input
                placeholder="ابحث عن مادة تدريبية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainingMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getTypeIcon(material.type)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900">{material.title}</h3>
                          {getStatusBadge(material.status)}
                        </div>
                        <p className="text-sm text-gray-600">{material.category}</p>
                        {material.duration && (
                          <p className="text-xs text-gray-500">⏱️ {material.duration}</p>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" className="gap-1" onClick={() => handleStartTraining(material)}>
                            <Play className="h-3 w-3" />
                            بدء
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => handleDownload(material)}>
                            <Download className="h-3 w-3" />
                            تحميل
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Success Stories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              قصص النجاح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {successStories.map((story) => (
                <Card key={story.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg text-gray-900">{story.title}</h4>
                        <p className="text-sm text-gray-600">بواسطة: {story.author}</p>
                        <p className="text-sm text-gray-500">{formatDateDMY(story.date)}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-gray-600">الإيراد المحقق</p>
                        <p className="text-2xl font-bold text-green-600">
                          {story.revenue.toLocaleString()} ر.س
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => handleViewStory(story)}>
                      عرض القصة الكاملة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
