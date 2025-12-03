import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Sidebar from '@/components/Sidebar';
import { Bell, Trophy, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsChallengesScreen() {
  const { toast } = useToast();

  const [notifications] = useState([
    {
      id: 1,
      title: 'تم إسناد مهمة جديدة',
      message: 'لديك مهمة جديدة: التواصل مع متبرع محتمل',
      type: 'task',
      time: 'منذ 5 دقائق',
      read: false
    },
    {
      id: 2,
      title: 'تهانينا! 🎉',
      message: 'لقد حققت هدفك الشهري',
      type: 'achievement',
      time: 'منذ ساعة',
      read: false
    },
    {
      id: 3,
      title: 'تذكير',
      message: 'موعد نهاية المهمة #142 غداً',
      type: 'reminder',
      time: 'منذ ساعتين',
      read: true
    },
    {
      id: 4,
      title: 'تحديث في لوحة المتصدرين',
      message: 'أحمد محمد تقدم للمركز الأول',
      type: 'leaderboard',
      time: 'منذ 3 ساعات',
      read: true
    }
  ]);

  const [challenges] = useState([
    {
      id: 1,
      title: 'محترف التبرعات',
      description: 'اجمع 100,000 ر.س هذا الشهر',
      target: 100000,
      current: 45000,
      reward: 500,
      endDate: '2025-12-31',
      status: 'active'
    },
    {
      id: 2,
      title: 'صائد النجوم',
      description: 'أكمل 20 مهمة هذا الأسبوع',
      target: 20,
      current: 14,
      reward: 300,
      endDate: '2025-12-07',
      status: 'active'
    },
    {
      id: 3,
      title: 'السرعة والدقة',
      description: 'أنجز 5 مهام في يوم واحد',
      target: 5,
      current: 5,
      reward: 200,
      endDate: '2025-12-02',
      status: 'completed'
    }
  ]);

  const handleMarkAsRead = (id: number) => {
    toast({
      title: 'تم التحديث',
      description: 'تم وضع علامة مقروء على الإشعار'
    });
  };

  const handleJoinChallenge = (id: number) => {
    toast({
      title: 'تم الانضمام',
      description: 'تم انضمامك للتحدي بنجاح'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex" dir="rtl">
      <Sidebar />
      <div className="flex-1 mr-80 p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bell className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              الإشعارات والتحديات
            </h1>
          </div>
          <p className="text-gray-600">ابق على اطلاع وشارك في التحديات</p>
        </div>

        <Tabs defaultValue="notifications" dir="rtl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              الإشعارات
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge className="mr-2">{notifications.filter(n => !n.read).length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Trophy className="h-4 w-4" />
              التحديات
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إشعاراتك</h2>
              <Button variant="outline" size="sm">تحديد الكل كمقروء</Button>
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`hover:shadow-lg transition-all ${!notification.read ? 'border-r-4 border-r-blue-500 bg-blue-50' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${
                        notification.type === 'task' ? 'bg-blue-100' :
                        notification.type === 'achievement' ? 'bg-green-100' :
                        notification.type === 'reminder' ? 'bg-yellow-100' : 'bg-purple-100'
                      }`}>
                        {notification.type === 'task' ? '📋' :
                         notification.type === 'achievement' ? '🏆' :
                         notification.type === 'reminder' ? '⏰' : '📊'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          {!notification.read && (
                            <Badge variant="info" className="text-xs">جديد</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{notification.time}</span>
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              وضع علامة مقروء
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                التحديات النشطة
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className={`hover:shadow-xl transition-all ${
                  challenge.status === 'completed' ? 'border-2 border-green-300 bg-green-50' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{challenge.title}</CardTitle>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                      {challenge.status === 'completed' && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">التقدم</span>
                        <span className="font-bold">
                          {challenge.current} / {challenge.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            challenge.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min((challenge.current / challenge.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Reward */}
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-900">المكافأة</span>
                      </div>
                      <span className="text-lg font-bold text-yellow-600">
                        {challenge.reward} نقطة
                      </span>
                    </div>

                    {/* End Date */}
                    <div className="text-sm text-gray-600">
                      ينتهي في: {challenge.endDate}
                    </div>

                    {/* Action Button */}
                    {challenge.status === 'completed' ? (
                      <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                        <CheckCircle className="h-4 w-4 ml-2" />
                        مكتمل
                      </Button>
                    ) : (
                      <Button 
                        className="w-full gap-2"
                        onClick={() => handleJoinChallenge(challenge.id)}
                      >
                        <Zap className="h-4 w-4" />
                        تفاصيل التحدي
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
