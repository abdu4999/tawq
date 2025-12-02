import { supabase } from './supabaseClient';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'task' | 'project' | 'donation' | 'reminder' | 'system' | 'approval';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  sender: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: Notification['type'];
  priority?: Notification['priority'];
  sender: string;
}

export interface UpdateNotificationData {
  read?: boolean;
  title?: string;
  message?: string;
  type?: Notification['type'];
  priority?: Notification['priority'];
}

// Get all notifications for current user
export const getNotifications = async (): Promise<Notification[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('app_f226d1f8f5_notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Create a new notification
export const createNotification = async (notificationData: CreateNotificationData): Promise<Notification> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('app_f226d1f8f5_notifications')
    .insert({
      user_id: user.id,
      ...notificationData,
      priority: notificationData.priority || 'medium'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update a notification
export const updateNotification = async (id: string, updates: UpdateNotificationData): Promise<Notification> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('app_f226d1f8f5_notifications')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a notification
export const deleteNotification = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('app_f226d1f8f5_notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('app_f226d1f8f5_notifications')
    .update({ 
      read: true,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) throw error;
};

// Get notification statistics
export const getNotificationStats = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('app_f226d1f8f5_notifications')
    .select('read, priority')
    .eq('user_id', user.id);

  if (error) throw error;

  const total = data?.length || 0;
  const unread = data?.filter(n => !n.read).length || 0;
  const read = total - unread;
  const highPriority = data?.filter(n => n.priority === 'high').length || 0;

  return { total, unread, read, highPriority };
};

// Filter notifications
export const filterNotifications = async (
  type?: string,
  status?: string,
  search?: string
): Promise<Notification[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('app_f226d1f8f5_notifications')
    .select('*')
    .eq('user_id', user.id);

  if (type && type !== 'all') {
    query = query.eq('type', type);
  }

  if (status && status !== 'all') {
    const isRead = status === 'read';
    query = query.eq('read', isRead);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%,sender.ilike.%${search}%`);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};