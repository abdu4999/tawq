import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { errorStorage, ErrorLog } from '@/lib/error-storage';
import { NotificationStorage, StoredNotification } from '@/lib/notification-storage';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  addErrorNotification: (error: Error, context?: string) => Promise<string>;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  deleteNotification: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from storage on component mount
  useEffect(() => {
    const storedNotifications = NotificationStorage.getNotifications();
    setNotifications(storedNotifications);
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notificationId = NotificationStorage.saveNotification(notification);
    
    const newNotification: Notification = {
      ...notification,
      id: notificationId,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast based on notification type with enhanced styling
    switch (notification.type) {
      case 'success':
        toast.success(notification.message, {
          description: notification.title,
          duration: 4000,
          className: 'border-green-200 bg-green-50 text-green-900',
        });
        break;
      case 'error':
        toast.error(notification.message, {
          description: notification.title,
          duration: 6000,
          className: 'border-red-200 bg-red-50 text-red-900',
        });
        break;
      case 'warning':
        toast.warning(notification.message, {
          description: notification.title,
          duration: 5000,
          className: 'border-yellow-200 bg-yellow-50 text-yellow-900',
        });
        break;
      case 'info':
        toast.info(notification.message, {
          description: notification.title,
          duration: 4000,
          className: 'border-blue-200 bg-blue-50 text-blue-900',
        });
        break;
    }
  };

  const addErrorNotification = async (error: Error, context?: string): Promise<string> => {
    try {
      // Generate a reference number for the user
      const referenceNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Log the full error details to storage
      const errorLog: Omit<ErrorLog, 'id' | 'timestamp'> = {
        error_code: `ERR_${referenceNumber}`,
        error_message: error.message,
        error_details: error.stack || error.toString(),
        context: context || 'System Error',
        user_id: undefined, // Will be set when user authentication is implemented
      };

      const errorId = await errorStorage.logError(errorLog);
      
      // Show user-friendly notification with only the reference number
      addNotification({
        type: 'error',
        title: 'خطأ في النظام',
        message: `حدث خطأ في النظام. الرجاء تدوين الرقم المرجعي للإبلاغ: ${referenceNumber}`,
      });

      console.log('Error logged with reference:', referenceNumber, 'Full error:', error);
      
      return errorId;
    } catch (logError) {
      console.error('Failed to log error:', logError);
      // Fallback notification if logging fails
      addNotification({
        type: 'error',
        title: 'خطأ في النظام',
        message: 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.',
      });
      return 'unknown';
    }
  };

  const markAsRead = (id: string) => {
    NotificationStorage.markAsRead(id);
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    NotificationStorage.deleteNotification(id);
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    NotificationStorage.clearAll();
    setNotifications([]);
  };

  const unreadCount = NotificationStorage.getUnreadCount();

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        addErrorNotification,
        markAsRead,
        clearAll,
        deleteNotification,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};