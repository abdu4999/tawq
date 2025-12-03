import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, User, Activity, Filter, Search, Download } from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  description: string;
  category: 'task' | 'project' | 'user' | 'system' | 'financial' | 'notification';
  timestamp: Date;
  metadata?: Record<string, string | number | boolean>;
  ipAddress?: string;
  userAgent?: string;
}

interface ActivityLogProps {
  userId?: string;
  projectId?: string;
  taskId?: string;
  limit?: number;
  showFilters?: boolean;
}

export default function ActivityLog({ 
  userId, 
  projectId, 
  taskId, 
  limit = 50, 
  showFilters = true 
}: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  useEffect(() => {
    loadActivityLog();
  }, [userId, projectId, taskId]);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, selectedCategory, selectedUser, dateRange]);

  const loadActivityLog = () => {
    // بيانات تجريبية لسجل الأنشطة
    const sampleActivities: ActivityLogEntry[] = [
      {
        id: '1',
        userId: '1',
        userName: 'أحمد الشهري',
        userAvatar: '/api/placeholder/32/32',
        action: 'task_completed',
        description: 'أكمل مهمة "إنشاء حملة رمضان الخيرية"',
        category: 'task',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        metadata: { taskId: 'task_1', points: 50 },
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        userId: '2',
        userName: 'فاطمة العتيبي',
        userAvatar: '/api/placeholder/32/32',
        action: 'project_created',
        description: 'أنشأ مشروع جديد "حملة كسوة الشتاء"',
        category: 'project',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        metadata: { projectId: 'project_2', budget: 30000 },
        ipAddress: '192.168.1.101'
      },
      {
        id: '3',
        userId: '3',
        userName: 'محمد الغامدي',
        userAvatar: '/api/placeholder/32/32',
        action: 'user_login',
        description: 'سجل دخول إلى النظام',
        category: 'user',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '4',
        userId: '1',
        userName: 'أحمد الشهري',
        userAvatar: '/api/placeholder/32/32',
        action: 'financial_entry',
        description: 'أضاف قيد مالي بقيمة 5000 ريال',
        category: 'financial',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        metadata: { amount: 5000, type: 'income' },
        ipAddress: '192.168.1.100'
      },
      {
        id: '5',
        userId: 'system',
        userName: 'النظام',
        action: 'system_backup',
        description: 'تم إنشاء نسخة احتياطية من البيانات',
        category: 'system',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        ipAddress: 'localhost'
      },
      {
        id: '6',
        userId: '4',
        userName: 'سارة الأحمد',
        userAvatar: '/api/placeholder/32/32',
        action: 'notification_sent',
        description: 'أرسل إشعار "تذكير بالمهام اليومية" لجميع الموظفين',
        category: 'notification',
        timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
        metadata: { recipientCount: 15 },
        ipAddress: '192.168.1.103'
      },
      {
        id: '7',
        userId: '2',
        userName: 'فاطمة العتيبي',
        userAvatar: '/api/placeholder/32/32',
        action: 'task_assigned',
        description: 'عين مهمة "متابعة المتبرعين الجدد" إلى أحمد الشهري',
        category: 'task',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata: { taskId: 'task_2', assigneeId: '1' },
        ipAddress: '192.168.1.101'
      },
      {
        id: '8',
        userId: '3',
        userName: 'محمد الغامدي',
        userAvatar: '/api/placeholder/32/32',
        action: 'project_updated',
        description: 'حدث معلومات مشروع "حملة رمضان الخيرية"',
        category: 'project',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        metadata: { projectId: 'project_1', changes: 'budget,deadline' },
        ipAddress: '192.168.1.102'
      }
    ];

    // تطبيق الفلاتر حسب المعاملات
    let filtered = sampleActivities;
    
    if (userId) {
      filtered = filtered.filter(activity => activity.userId === userId);
    }
    
    if (projectId) {
      filtered = filtered.filter(activity => 
        activity.metadata?.projectId === projectId || 
        activity.category === 'project'
      );
    }
    
    if (taskId) {
      filtered = filtered.filter(activity => 
        activity.metadata?.taskId === taskId || 
        activity.category === 'task'
      );
    }

    // ترتيب حسب التاريخ (الأحدث أولاً) وتطبيق الحد الأقصى
    filtered = filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    setActivities(filtered);
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // فلترة بالبحث
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(term) ||
        activity.userName.toLowerCase().includes(term) ||
        activity.action.toLowerCase().includes(term)
      );
    }

    // فلترة بالفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    // فلترة بالمستخدم
    if (selectedUser !== 'all') {
      filtered = filtered.filter(activity => activity.userId === selectedUser);
    }

    // فلترة بالتاريخ
    if (dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (dateRange) {
        case 'today':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter(activity => activity.timestamp >= cutoffDate);
    }

    setFilteredActivities(filtered);
  };

  const getActionIcon = (action: string) => {
    // يمكن إضافة أيقونات مختلفة حسب نوع الإجراء
    return <Activity className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'task': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'financial': return 'bg-yellow-100 text-yellow-800';
      case 'notification': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'task': return 'مهمة';
      case 'project': return 'مشروع';
      case 'user': return 'مستخدم';
      case 'system': return 'نظام';
      case 'financial': return 'مالي';
      case 'notification': return 'إشعار';
      default: return category;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  const exportLog = () => {
    const csvContent = [
      ['التاريخ', 'المستخدم', 'الإجراء', 'الوصف', 'الفئة', 'عنوان IP'].join(','),
      ...filteredActivities.map(activity => [
        activity.timestamp.toLocaleString('ar-SA'),
        activity.userName,
        activity.action,
        activity.description,
        getCategoryName(activity.category),
        activity.ipAddress || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const uniqueUsers = Array.from(new Set(activities.map(a => a.userId)))
    .map(id => activities.find(a => a.userId === id))
    .filter(Boolean);

  return (
    <Card className="w-full" dir="rtl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            سجل الأنشطة
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportLog}>
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في الأنشطة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="task">مهام</SelectItem>
                <SelectItem value="project">مشاريع</SelectItem>
                <SelectItem value="user">مستخدمين</SelectItem>
                <SelectItem value="system">نظام</SelectItem>
                <SelectItem value="financial">مالي</SelectItem>
                <SelectItem value="notification">إشعارات</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="المستخدم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستخدمين</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user!.userId} value={user!.userId}>
                    {user!.userName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="الفترة الزمنية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأوقات</SelectItem>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">آخر أسبوع</SelectItem>
                <SelectItem value="month">آخر شهر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Activity List */}
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد أنشطة مطابقة للفلاتر المحددة</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                {/* User Avatar */}
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={activity.userAvatar} />
                  <AvatarFallback>
                    {activity.userId === 'system' ? '🤖' : activity.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{activity.userName}</span>
                    <Badge className={getCategoryColor(activity.category)}>
                      {getCategoryName(activity.category)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                    
                    {activity.ipAddress && (
                      <span>IP: {activity.ipAddress}</span>
                    )}
                    
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <span className="text-blue-600 cursor-pointer hover:underline">
                        عرض التفاصيل
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Icon */}
                <div className="flex-shrink-0">
                  {getActionIcon(activity.action)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredActivities.length === limit && (
          <div className="text-center">
            <Button variant="outline" onClick={() => {/* Load more logic */}}>
              تحميل المزيد
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}