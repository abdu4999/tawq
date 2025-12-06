import os

file_path = r"c:\Users\abd\Downloads\joker\tawq-fresh\workspace\shadcn-ui\src\pages\BestPracticesScreen.tsx"

content = """import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, Share2, Bookmark } from 'lucide-react';
import { supabaseAPI } from '@/lib/supabaseClient';

export default function BestPracticesScreen() {
  const [practices, setPractices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await supabaseAPI.getBestPractices();
      setPractices(data || []);
    } catch (error) {
      console.error('Error loading best practices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPractices = practices.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'تسويق': return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
      case 'إدارة مشاريع': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'مبيعات': return 'bg-green-100 text-green-700 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل أفضل الممارسات...</p>
        </div>
      </div>
    );
  }

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPractices.length > 0 ? (
          filteredPractices.map((practice) => (
            <Card key={practice.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge className={getCategoryColor(practice.category)}>{practice.category}</Badge>
                  <Star className={`w-5 h-5 ${practice.is_featured ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                </div>
                <CardTitle className="mt-2 text-lg">{practice.title}</CardTitle>
                <CardDescription>{practice.subtitle || practice.impact}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm line-clamp-3">
                  {practice.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> {practice.likes || 0}</span>
                    <span className="flex items-center gap-1"><Share2 className="w-4 h-4" /> {practice.shares || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs">
                      {practice.author ? practice.author.charAt(0) : '?'}
                    </div>
                    <span>{practice.author || 'مجهول'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-gray-500">
            لا توجد ممارسات مطابقة للبحث
          </div>
        )}
      </div>
    </div>
  );
}
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("File written successfully")
