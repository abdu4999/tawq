import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { useStore } from '@/lib/store';

const Leaderboard = () => {
  const { employees } = useStore();

  // Sort employees by performance score and handle undefined values
  const sortedEmployees = [...employees]
    .filter(emp => emp && typeof emp.performance_score === 'number')
    .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
    .slice(0, 10);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{index + 1}</span>;
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">الأول</Badge>;
      case 1:
        return <Badge className="bg-gray-400 hover:bg-gray-500">الثاني</Badge>;
      case 2:
        return <Badge className="bg-amber-600 hover:bg-amber-700">الثالث</Badge>;
      default:
        return <Badge variant="outline">#{index + 1}</Badge>;
    }
  };

  if (sortedEmployees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" dir="rtl">
            <TrendingUp className="h-5 w-5" />
            لوحة المتصدرين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500" dir="rtl">
            لا توجد بيانات موظفين متاحة
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" dir="rtl">
          <TrendingUp className="h-5 w-5" />
          لوحة المتصدرين
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" dir="rtl">
          {sortedEmployees.map((employee, index) => (
            <div
              key={employee.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                index < 3 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {getRankIcon(index)}
                <div>
                  <h4 className="font-semibold text-gray-900">{employee.name || 'غير محدد'}</h4>
                  <p className="text-sm text-gray-600">{employee.department || 'غير محدد'}</p>
                  <p className="text-xs text-gray-500">{employee.position || 'غير محدد'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <p className="font-bold text-lg text-gray-900">
                    {(employee.performance_score || 0).toLocaleString('ar-EG')}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {(employee.points || 0).toLocaleString('ar-EG')} نقطة
                  </p>
                </div>
                {getRankBadge(index)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Performance Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {sortedEmployees.length}
              </p>
              <p className="text-sm text-gray-600">موظف متميز</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {sortedEmployees.length > 0 
                  ? Math.round(sortedEmployees.reduce((sum, emp) => sum + (emp.performance_score || 0), 0) / sortedEmployees.length)
                  : 0
                }%
              </p>
              <p className="text-sm text-gray-600">متوسط الأداء</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {sortedEmployees.length > 0 
                  ? (sortedEmployees.reduce((sum, emp) => sum + (emp.points || 0), 0)).toLocaleString('ar-EG')
                  : 0
                }
              </p>
              <p className="text-sm text-gray-600">إجمالي النقاط</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;