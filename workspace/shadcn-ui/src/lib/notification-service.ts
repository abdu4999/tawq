export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  priority: 'high' | 'medium' | 'low';
  userId: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionText?: string;
  sound?: boolean;
  persistent?: boolean;
}

export class NotificationService {
  private static notifications: Notification[] = [];
  private static listeners: ((notifications: Notification[]) => void)[] = [];

  // إضافة إشعار جديد
  static addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    
    // تشغيل الصوت إذا كان مطلوباً
    if (notification.sound && notification.priority === 'high') {
      this.playNotificationSound();
    }

    // إشعار المستمعين
    this.notifyListeners();

    // إشعار المتصفح إذا كان مدعوماً
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.png',
        tag: newNotification.id
      });
    }
  }

  // الحصول على الإشعارات لمستخدم معين
  static getNotifications(userId: string): Notification[] {
    return this.notifications.filter(n => n.userId === userId || n.userId === 'all');
  }

  // الحصول على الإشعارات غير المقروءة
  static getUnreadNotifications(userId: string): Notification[] {
    return this.getNotifications(userId).filter(n => !n.read);
  }

  // تمييز إشعار كمقروء
  static markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // تمييز جميع الإشعارات كمقروءة
  static markAllAsRead(userId: string): void {
    this.notifications.forEach(n => {
      if (n.userId === userId || n.userId === 'all') {
        n.read = true;
      }
    });
    this.notifyListeners();
  }

  // حذف إشعار
  static deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifyListeners();
  }

  // مسح الإشعارات القديمة (أكثر من 30 يوم)
  static clearOldNotifications(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter(n => 
      n.createdAt > thirtyDaysAgo || n.persistent
    );
    this.notifyListeners();
  }

  // إضافة مستمع للتغييرات
  static addListener(callback: (notifications: Notification[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  private static playNotificationSound(): void {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // تجاهل الأخطاء إذا لم يكن الصوت متاحاً
      });
    } catch (error) {
      console.warn('لا يمكن تشغيل صوت الإشعار:', error);
    }
  }

  // طلب إذن الإشعارات من المتصفح
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // إنشاء إشعارات تلقائية للأحداث المهمة
  static createTaskNotification(taskTitle: string, employeeName: string, type: 'assigned' | 'completed' | 'overdue'): void {
    let notification: Omit<Notification, 'id' | 'createdAt' | 'read'>;

    switch (type) {
      case 'assigned':
        notification = {
          title: 'مهمة جديدة',
          message: `تم تعيين مهمة "${taskTitle}" إلى ${employeeName}`,
          type: 'info',
          priority: 'medium',
          userId: 'all',
          sound: true
        };
        break;
      
      case 'completed':
        notification = {
          title: 'مهمة مكتملة',
          message: `أكمل ${employeeName} مهمة "${taskTitle}" بنجاح`,
          type: 'success',
          priority: 'low',
          userId: 'all',
          sound: false
        };
        break;
      
      case 'overdue':
        notification = {
          title: 'مهمة متأخرة',
          message: `مهمة "${taskTitle}" متأخرة عن الموعد المحدد`,
          type: 'warning',
          priority: 'high',
          userId: 'all',
          sound: true,
          persistent: true
        };
        break;
    }

    this.addNotification(notification);
  }

  // إنشاء إشعارات الإنجازات
  static createAchievementNotification(employeeName: string, achievement: string, points: number): void {
    this.addNotification({
      title: '🎉 إنجاز جديد!',
      message: `${employeeName} حقق إنجاز "${achievement}" وحصل على ${points} نقطة`,
      type: 'success',
      priority: 'medium',
      userId: 'all',
      sound: true,
      actionUrl: '/leaderboard',
      actionText: 'عرض لوحة المتصدرين'
    });
  }

  // إنشاء إشعارات التحديات الأسبوعية
  static createWeeklyChallengeNotification(challengeTitle: string): void {
    this.addNotification({
      title: '🏆 تحدي أسبوعي جديد',
      message: `تحدي جديد متاح: "${challengeTitle}"`,
      type: 'info',
      priority: 'medium',
      userId: 'all',
      sound: false,
      actionUrl: '/rewards',
      actionText: 'عرض التحديات'
    });
  }

  // إنشاء إشعارات الأهداف المالية
  static createFinancialGoalNotification(goalType: 'achieved' | 'warning', amount: number): void {
    const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = goalType === 'achieved' 
      ? {
          title: '💰 هدف مالي محقق',
          message: `تم تحقيق هدف مالي بقيمة ${amount.toLocaleString()} ريال`,
          type: 'success',
          priority: 'high',
          userId: 'all',
          sound: true
        }
      : {
          title: '⚠️ تحذير مالي',
          message: `الهدف المالي ${amount.toLocaleString()} ريال في خطر عدم التحقق`,
          type: 'warning',
          priority: 'high',
          userId: 'all',
          sound: true,
          persistent: true
        };

    this.addNotification(notification);
  }

  // تهيئة الإشعارات التلقائية
  static initializeAutoNotifications(): void {
    // مسح الإشعارات القديمة كل يوم
    setInterval(() => {
      this.clearOldNotifications();
    }, 24 * 60 * 60 * 1000);

    // إشعارات يومية للتذكير
    setInterval(() => {
      this.addNotification({
        title: '📅 تذكير يومي',
        message: 'لا تنس مراجعة مهامك اليومية وتحديث تقدمك',
        type: 'info',
        priority: 'low',
        userId: 'all',
        sound: false
      });
    }, 24 * 60 * 60 * 1000);

    // طلب إذن الإشعارات
    this.requestPermission();
  }
}

// تهيئة الخدمة
NotificationService.initializeAutoNotifications();