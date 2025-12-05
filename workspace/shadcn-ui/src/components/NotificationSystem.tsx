import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { errorStorage, ErrorLog } from '@/lib/error-storage';

interface Notification {
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
  const location = useLocation();

  // Clear toasts on route change
  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast based on notification type
    switch (notification.type) {
      case 'success':
        toast.success(notification.message, {
          description: notification.title,
          duration: 4000,
        });
        break;
      case 'error':
        toast.error(notification.message, {
          description: notification.title,
          duration: 6000,
        });
        break;
      case 'warning':
        toast.warning(notification.message, {
          description: notification.title,
          duration: 5000,
        });
        break;
      case 'info':
        toast.info(notification.message, {
          description: notification.title,
          duration: 4000,
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
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        addErrorNotification,
        markAsRead,
        clearAll,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};