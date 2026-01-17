import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, Share2, Bookmark } from 'lucide-react';
import { bestPracticesLibrary } from '@/lib/best-practices';

export default function BestPracticesScreen() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🌟 مكتبة أفضل الممارسات</h1>
          <p className="text-slate-600">تجارب ناجحة، نماذج عمل، ودروس مستفادة من الفريق</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="بحث في الممارسات..." 
            className="px-4 py-2 border rounded-lg w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Practice Card 1 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">تسويق</Badge>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <CardTitle className="mt-2 text-lg">صيغة رسالة واتساب لجمع التبرعات في يوم الجمعة</CardTitle>
            <CardDescription>حققت نسبة استجابة 15% (أعلى من المعدل بـ 3 أضعاف)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-sm line-clamp-3">
              استخدام أسلوب القصة القصيرة المؤثرة بدلاً من الطلب المباشر، مع التركيز على فضل الصدقة في يوم الجمعة...
            </p>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> 42</span>
                <span className="flex items-center gap-1"><Share2 className="w-4 h-4" /> 12</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-slate-200 rounded-full" />
                <span>أحمد م.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Practice Card 2 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">إدارة مشاريع</Badge>
              <Star className="w-5 h-5 text-slate-300" />
            </div>
            <CardTitle className="mt-2 text-lg">قائمة التحقق قبل إطلاق الحملات (Checklist)</CardTitle>
            <CardDescription>قللت الأخطاء التشغيلية بنسبة 90%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-sm line-clamp-3">
              قائمة مكونة من 15 نقطة يجب التأكد منها قبل الضغط على زر النشر، تشمل الروابط، البكسل، والميزانية...
            </p>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> 28</span>
                <span className="flex items-center gap-1"><Share2 className="w-4 h-4" /> 5</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-slate-200 rounded-full" />
                <span>سارة ع.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Practice Card 3 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200">مبيعات</Badge>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <CardTitle className="mt-2 text-lg">سيناريو الرد على اعتراض "السعر مرتفع"</CardTitle>
            <CardDescription>للمنتجات الوقفية ذات القيمة العالية</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-sm line-clamp-3">
              التركيز على القيمة المستدامة والأجر المستمر بدلاً من التكلفة اللحظية، مع تقديم خيارات تقسيط...
            </p>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> 56</span>
                <span className="flex items-center gap-1"><Share2 className="w-4 h-4" /> 20</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-slate-200 rounded-full" />
                <span>خالد ي.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}