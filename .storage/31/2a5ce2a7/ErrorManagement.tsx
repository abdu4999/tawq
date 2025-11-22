import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, AlertCircle, CheckCircle, Clock, Filter, Download } from 'lucide-react';
import { errorStorage, ErrorLog } from '@/lib/error-storage';
import Sidebar from '@/components/Sidebar';
import { useNotifications } from '@/components/NotificationSystem';

export default function ErrorManagement() {
  const { addNotification } = useNotifications();
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    unresolved: 0
  });

  useEffect(() => {
    loadErrors();
    loadStats();
  }, []);

  const loadErrors = async () => {
    try {
      setLoading(true);
      const errorList = await errorStorage.getAllErrors(100);
      setErrors(errorList);
    } catch (error) {
      console.error('Error loading errors:', error);
      addNotification({
        type: 'error',
        title: 'خطأ في التحميل',
        message: 'فشل في تحميل سجلات الأخطاء'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await errorStorage.getErrorStats();
      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchQuery.trim()) {
        const results = await errorStorage.searchErrors(searchQuery);
        setErrors(results);
      } else {
        await loadErrors();
      }
    } catch (error) {
      console.error('Error searching:', error);
      addNotification({
        type: 'error',
        title: 'خطأ في البحث',
        message: 'فشل في البحث في سجلات الأخطاء'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (errorId: string) => {
    try {
      const success = await errorStorage.markAsResolved(errorId, 'admin', 'تم الحل يدوياً');
      if (success) {
        addNotification({
          type: 'success',
          title: 'تم الحل',
          message: 'تم وضع علامة على الخطأ كتم حله بنجاح'
        });
        await loadErrors();
        await loadStats();
        if (selectedError?.id === errorId) {
          setSelectedError(null);
        }
      }
    } catch (error) {
      console.error('Error resolving:', error);
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'فشل في وضع علامة على الخطأ كتم حله'
      });
    }
  };

  const exportErrors = () => {
    const csvContent = [
      ['الرقم المرجعي', 'رمز الخطأ', 'الرسالة', 'التفاصيل', 'الحالة', 'وقت الحدوث', 'وقت الحل', 'ملاحظات الحل'],
      ...errors.map(error => [
        error.id,
        error.error_code,
        error.error_message,
        error.error_details,
        error.resolved ? 'تم الحل' : 'لم يتم الحل',
        new Date(error.timestamp).toLocaleString('ar-SA'),
        error.resolved_at ? new Date(error.resolved_at).toLocaleString('ar-SA') : '',
        error.resolution_notes || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `سجلات_الأخطاء_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 mr-80 p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            إدارة الأخطاء
          </h1>
          <p className="text-xl text-gray-600">تتبع وإدارة أخطاء النظام</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">إجمالي الأخطاء</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <AlertCircle className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">الأخطاء المحلولة</p>
                  <p className="text-3xl font-bold">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient极速赛车开奖结果历史记录
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">الأخطاء غير المحلولة</p>
                  <p className="text-3xl font-bold">{stats.unresolved}</p>
                </div>
                <Clock className="h-12 w-12 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="ابحث برقم مرجعي، رمز خطأ، أو رسالة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" />
                بحث
              </Button>
              <Button variant="outline" onClick={exportErrors} className="gap-2">
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Errors List */}
        <Card>
          <CardHeader>
            <CardTitle>سجلات الأخطاء</CardTitle>
            <CardDescription>قائمة بجميع أخطاء النظام المسجلة</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل الأخطاء...</p>
              </div>
            ) : errors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد أخطاء مسجلة
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {errors.map((error) => (
                  <div
                    key={error.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ${
                      error.resolved
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                    onClick={() => setSelectedError(error)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{error.error_code}</h4>
                          <Badge
                            variant={error.resolved ? 'default' : 'destructive'}
                            className={error.resolved ? 'bg-green-100 text-green-800' : ''}
                          >
                            {error.resolved ? 'تم الحل' : 'لم يتم الحل'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{error.error_message}</p>
                        <p className="text-xs text-gray-500">الوقت: {formatDate(error.timestamp)}</p>
                        {error.context && (
                          <p className="text-xs text-gray-500">السياق: {error.context}</p>
                        )}
                      </div>
                      {!error.resolved && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(error.id!);
                          }}
                        >
                          وضع علامة كمحلول
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Details */}
        {selectedError && (
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الخطأ</CardTitle>
              <CardDescription>معلومات مفصلة عن الخطأ المحدد</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">الرقم المرجعي</label>
                    <p className="text-lg font-mono">{selectedError.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">رمز الخطأ</label>
                    <p className="text-lg font-mono">{selectedError.error_code}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">رسالة الخطأ</label>
                  <p className="text-gray-900">{selectedError.error_message}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">تفاصيل الخطأ</label>
                  <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                    {selectedError.error_details}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">وقت الحدوث</label>
                    <p>{formatDate(selectedError.timestamp)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">الحالة</label>
                    <Badge
                      variant={selectedError.resolved ? 'default' : 'destructive'}
                      className={selectedError.resolved ? 'bg-green-100 text-green-800' : ''}
                    >
                      {selectedError.resolved ? 'تم الحل' : 'لم يتم الحل'}
                    </Badge>
                  </div>
                </div>

                {selectedError.context && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">السياق</label>
                    <p>{selectedError.context}</p>
                  </div>
                )}

                {selectedError.resolved && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">معلومات الحل</label>
                    <p>تم الحل بواسطة: {selectedError.resolved_by}</p>
                    <p>وقت الحل: {formatDate(selectedError.resolved_at!)}</p>
                    {selectedError.resolution_notes && (
                      <p>ملاحظات الحل: {selectedError.resolution_notes}</p>
                    )}
                  </div>
                )}

                {!selectedError.resolved && (
                  <Button onClick={() => handleResolve(selectedError.id!)}>
                    وضع علامة على الخطأ كمحلول
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}