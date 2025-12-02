import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, AlertCircle, CheckCircle, Clock, Filter, Download, Bug, X, Calendar } from 'lucide-react';
import { errorStorage, ErrorLog } from '@/lib/error-storage';
import Sidebar from '@/components/Sidebar';
import { useNotifications } from '@/components/NotificationSystem';

export default function ErrorManagement() {
  const { addNotification, addErrorNotification } = useNotifications();
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<ErrorLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [urlFilter, setUrlFilter] = useState('');
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
      setFilteredErrors(errorList);
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

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...errors];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(error => 
        error.error_code.toLowerCase().includes(query) ||
        error.error_message.toLowerCase().includes(query) ||
        (error.context && error.context.toLowerCase().includes(query)) ||
        error.id?.toLowerCase().includes(query)
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(error => error.severity === severityFilter);
    }

    // Status filter
    if (statusFilter === 'resolved') {
      filtered = filtered.filter(error => error.resolved);
    } else if (statusFilter === 'unresolved') {
      filtered = filtered.filter(error => !error.resolved);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(error => 
        new Date(error.timestamp) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filtered = filtered.filter(error => 
        new Date(error.timestamp) <= new Date(dateTo + 'T23:59:59')
      );
    }

    // URL filter
    if (urlFilter.trim()) {
      filtered = filtered.filter(error => 
        error.url && error.url.toLowerCase().includes(urlFilter.toLowerCase())
      );
    }

    setFilteredErrors(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, severityFilter, statusFilter, dateFrom, dateTo, urlFilter, errors]);

  const loadStats = async () => {
    try {
      const stats = await errorStorage.getErrorStats();
      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setUrlFilter('');
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

  const testErrorLogging = async () => {
    try {
      // Create a test error
      await addErrorNotification(new Error('هذا خطأ تجريبي لاختبار نظام تسجيل الأخطاء'), 'Test Error');
      addNotification({
        type: 'success',
        title: 'تم الاختبار',
        message: 'تم إنشاء خطأ تجريبي بنجاح'
      });
      // Reload errors to show the new test error
      await loadErrors();
      await loadStats();
    } catch (error) {
      console.error('Error testing error logging:', error);
      addNotification({
        type: 'error',
        title: 'خطأ في الاختبار',
        message: 'فشل في اختبار نظام تسجيل الأخطاء'
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
      
      {/* Main content area with proper spacing */}
      <div className="flex-1 p-6 space-y-6 ml-0">
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

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              البحث والتصفية المتقدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Row 1: Search and Severity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>البحث</Label>
                  <Input
                    placeholder="ابحث برقم مرجعي، رمز خطأ، أو رسالة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>مستوى الخطورة</Label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="الكل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="critical">حرج</SelectItem>
                      <SelectItem value="high">عالي</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="low">منخفض</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Status, Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>الحالة</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="الكل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="resolved">محلول</SelectItem>
                      <SelectItem value="unresolved">غير محلول</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>من تاريخ</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label>إلى تاريخ</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    placeholder="صفحة..."
                    value={urlFilter}
                    onChange={(e) => setUrlFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Actions */}
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  مسح الفلاتر
                </Button>
                <Button variant="outline" onClick={exportErrors} className="gap-2">
                  <Download className="h-4 w-4" />
                  تصدير ({filteredErrors.length})
                </Button>
                <Button variant="secondary" onClick={testErrorLogging} className="gap-2">
                  <Bug className="h-4 w-4" />
                  اختبار النظام
                </Button>
                <div className="flex-1"></div>
                <Badge variant="secondary" className="text-base px-4 py-2">
                  النتائج: {filteredErrors.length} من {errors.length}
                </Badge>
              </div>
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
            ) : filteredErrors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد نتائج تطابق الفلاتر المحددة
                <div className="mt-4">
                  <Button onClick={clearFilters} variant="outline" className="gap-2">
                    <X className="h-4 w-4" />
                    مسح الفلاتر
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredErrors.map((error) => {
                  const getSeverityColor = (severity?: string) => {
                    switch (severity) {
                      case 'critical': return 'bg-red-600 text-white';
                      case 'high': return 'bg-orange-500 text-white';
                      case 'medium': return 'bg-yellow-500 text-white';
                      case 'low': return 'bg-blue-500 text-white';
                      default: return 'bg-gray-500 text-white';
                    }
                  };

                  const getSeverityLabel = (severity?: string) => {
                    switch (severity) {
                      case 'critical': return 'حرج';
                      case 'high': return 'عالي';
                      case 'medium': return 'متوسط';
                      case 'low': return 'منخفض';
                      default: return 'غير محدد';
                    }
                  };

                  return (
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
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-lg">{error.error_code}</h4>
                          <Badge
                            variant={error.resolved ? 'default' : 'destructive'}
                            className={error.resolved ? 'bg-green-100 text-green-800' : ''}
                          >
                            {error.resolved ? 'تم الحل' : 'لم يتم الحل'}
                          </Badge>
                          {error.severity && (
                            <Badge className={getSeverityColor(error.severity)}>
                              {getSeverityLabel(error.severity)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{error.error_message}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>🕐 {formatDate(error.timestamp)}</span>
                          {error.context && <span>📍 {error.context}</span>}
                          {error.url && <span>🔗 {error.url}</span>}
                        </div>
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
                );
                })}
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