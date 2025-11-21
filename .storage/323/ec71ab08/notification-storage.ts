import { Notification } from '@/components/NotificationSystem';

const NOTIFICATION_STORAGE_KEY = 'charity_notifications';

export interface StoredNotification extends Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export class NotificationStorage {
  static getNotifications(): StoredNotification[] {
    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (!stored) return [];
      
      const notifications = JSON.parse(stored);
      return notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
      return [];
    }
  }

  static saveNotification(notification: Omit<StoredNotification, 'id' | 'timestamp' | 'read'>): string {
    try {
      const notifications = this.getNotifications();
      const newNotification: StoredNotification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      };

      // Keep only last 100 notifications to prevent storage overflow
      const updatedNotifications = [newNotification, ...notifications].slice(0, 100);
      
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updatedNotifications));
      return newNotification.id;
    } catch (error) {
      console.error('Error saving notification to storage:', error);
      return 'unknown';
    }
  }

  static markAsRead(id: string): void {
    try {
      const notifications = this.getNotifications();
      const updatedNotifications = notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  static getUnreadCount(): number {
    const notifications = this.getNotifications();
    return notifications.filter(n => !n.read).length;
  }

  static deleteNotification(id: string): void {
    try {
      const notifications = this.getNotifications();
      const updatedNotifications = notifications.filter(n => n.id !== id);
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }
}