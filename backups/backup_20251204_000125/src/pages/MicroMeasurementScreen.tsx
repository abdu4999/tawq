import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Sidebar from '@/components/Sidebar';
import { 
  Activity, 
  Clock, 
  MousePointer, 
  Eye, 
  EyeOff, 
  Monitor,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import { microMeasurement, MicroEvent, MicroSession, ScreenTimeMetric, BehaviorMetrics } from '@/lib/micro-measurement';
import { formatDateDMY } from '@/lib/date-utils';

export default function MicroMeasurementScreen() {
  const [events, setEvents] = useState<MicroEvent[]>([]);
  const [sessions, setSessions] = useState<MicroSession[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [screenMetrics, setScreenMetrics] = useState<ScreenTimeMetric[]>([]);
  const [behaviorMetrics, setBehaviorMetrics] = useState<BehaviorMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // تحديث كل 5 ثوانٍ
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const storedEvents = microMeasurement.getStoredEvents();
    const storedSessions = microMeasurement.getStoredSessions();
    const screenTime = microMeasurement.calculateScreenTimeMetrics();
    
    setEvents(storedEvents);
    setSessions(storedSessions);
    setScreenMetrics(screenTime);

    // حساب المقاييس للموظف المحدد
    if (selectedEmployee && selectedEmployee !== 'all') {
      const metrics = microMeasurement.calculateBehaviorMetrics(selectedEmployee);
      setBehaviorMetrics(metrics);
    }
  };

  const filteredEvents = events.filter(event => {
    if (selectedEmployee !== 'all' && event.employeeId !== selectedEmployee) return false;
    if (selectedEventType !== 'all' && event.eventType !== selectedEventType) return false;
    
    // فلتر حسب الوقت
    const eventDate = new Date(event.timestamp);
    const now = new Date();
    
    if (timeRange === 'today') {
      return eventDate.toDateString() === now.toDateString();
    } else if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return eventDate >= weekAgo;
    }
    
    return true;
  });

  const uniqueEmployees = Array.from(new Set(events.map(e => e.employeeId)));

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'click': return <MousePointer className="h-4 w-4" />;
      case 'focus': return <Eye className="h-4 w-4" />;
      case 'blur': return <EyeOff className="h-4 w-4" />;
      case 'navigation': return <Monitor className="h-4 w-4" />;
      case 'scroll': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'click': return 'bg-blue-500';
      case 'focus': return 'bg-green-500';
      case 'blur': return 'bg-yellow-500';
      case 'navigation': return 'bg-purple-500';
      case 'scroll': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}س ${minutes % 60}د`;
    if (minutes > 0) return `${minutes}د ${seconds % 60}ث`;
    return `${seconds}ث`;
  };

  const getTotalEventsByType = () => {
    const counts: Record<string, number> = {};
    filteredEvents.forEach(event => {
      counts[event.eventType] = (counts[event.eventType] || 0) + 1;
    });
    return counts;
  };

  const eventCounts = getTotalEventsByType();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 lg:mr-80 p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            ⚡ محرك القياس الدقيق
          </h1>
          <p className="text-gray-600 text-lg">قياس كل حركة وسلوك داخل النظام بدقة</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">الموظف</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الموظفين</SelectItem>
                    {uniqueEmployees.map(empId => {
                      const event = events.find(e => e.employeeId === empId);
                      return (
                        <SelectItem key={empId} value={empId}>
                          {event?.employeeName || empId}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">نوع الحدث</label>
                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="click">نقرات</SelectItem>
                    <SelectItem value="focus">تركيز</SelectItem>
                    <SelectItem value="blur">فقدان تركيز</SelectItem>
                    <SelectItem value="navigation">تنقل</SelectItem>
                    <SelectItem value="scroll">تمرير</SelectItem>
                    <SelectItem value="keypress">كتابة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">الفترة الزمنية</label>
                <Select value={timeRange} onValueChange={(val: any) => setTimeRange(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">اليوم</SelectItem>
                    <SelectItem value="week">آخر أسبوع</SelectItem>
                    <SelectItem value="month">آخر شهر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">إجمالي الأحداث</p>
                  <p className="text-2xl font-bold">{filteredEvents.length.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">النقرات</p>
                  <p className="text-2xl font-bold">{(eventCounts.click || 0).toLocaleString()}</p>
                </div>
                <MousePointer className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">الجلسات النشطة</p>
                  <p className="text-2xl font-bold">{sessions.filter(s => !s.endTime).length}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100">الشاشات</p>
                  <p className="text-2xl font-bold">{screenMetrics.length}</p>
                </div>
                <Monitor className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Behavior Metrics */}
        {behaviorMetrics && (
          <Card>
            <CardHeader>
              <CardTitle>مقاييس السلوك - {events.find(e => e.employeeId === selectedEmployee)?.employeeName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">معدل التركيز</span>
                    <Badge variant={behaviorMetrics.focusScore > 70 ? "default" : "destructive"}>
                      {behaviorMetrics.focusScore}%
                    </Badge>
                  </div>
                  <Progress value={behaviorMetrics.focusScore} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">معدل التشتت</span>
                    <Badge variant={behaviorMetrics.distractionScore < 30 ? "default" : "destructive"}>
                      {behaviorMetrics.distractionScore}%
                    </Badge>
                  </div>
                  <Progress value={behaviorMetrics.distractionScore} className="h-2 [&>div]:bg-red-500" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">النقرات/دقيقة</span>
                    <Badge>{behaviorMetrics.clicksPerMinute.toFixed(1)}</Badge>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <strong>متوسط الوقت/شاشة:</strong> {behaviorMetrics.averageTimePerScreen.toFixed(0)}ث
                </div>

                <div className="text-sm text-gray-600">
                  <strong>سرعة التنقل:</strong> {behaviorMetrics.navigationSpeed.toFixed(2)} شاشة/دقيقة
                </div>

                <div className="text-sm text-gray-600">
                  <strong>الشاشة الأكثر زيارة:</strong> {behaviorMetrics.mostVisitedScreen}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Screen Time Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات وقت الشاشات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {screenMetrics.map(metric => (
                <div key={metric.screenName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{metric.screenName}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>⏱️ {formatDuration(metric.totalTime)}</span>
                      <span>👁️ {formatDuration(metric.focusTime)}</span>
                      <span>🔄 {metric.visits} زيارة</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-gray-500">آخر زيارة</div>
                    <div className="text-xs">{formatDateDMY(metric.lastVisit)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Events Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center justify-between">
                <span>سجل الأحداث المباشر</span>
                <Badge variant="outline">{filteredEvents.length} حدث</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredEvents.slice().reverse().slice(0, 100).map((event, index) => (
                <div 
                  key={event.id} 
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-2 rounded-full ${getEventColor(event.eventType)} text-white`}>
                    {getEventIcon(event.eventType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{event.employeeName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString('ar-SA')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <Badge variant="outline" className="mr-2">{event.eventType}</Badge>
                      {event.screenName}
                      {event.elementText && ` • ${event.elementText.slice(0, 30)}...`}
                      {event.duration && ` • ${formatDuration(event.duration)}`}
                    </div>
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد أحداث مسجلة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
