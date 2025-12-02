import { supabase } from './supabaseClient';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  position?: string;
  department?: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  total_points: number;
  level: string;
  rank: number;
  achievements: number;
  working_days: number;
  avg_rating: number;
  active_projects: number;
  completed_tasks: number;
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  type: string;
  created_at: string;
}

// Mock data for demo purposes
const mockProfile: UserProfile = {
  id: 'mock-profile-id',
  user_id: 'demo-user-123',
  name: 'أحمد محمد السعيد',
  phone: '+966501234567',
  position: 'مدير المشاريع',
  department: 'إدارة المشاريع',
  bio: 'مدير مشاريع خبير في إدارة المشاريع الخيرية والتنموية، لديه خبرة 8 سنوات في العمل الخيري',
  location: 'الرياض، المملكة العربية السعودية',
  avatar_url: null,
  total_points: 2850,
  level: 'خبير',
  rank: 3,
  achievements: 12,
  working_days: 180,
  avg_rating: 4.8,
  active_projects: 5,
  completed_tasks: 28,
  join_date: '2024-01-15',
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-11-30T00:00:00Z'
};

const mockActivities: UserActivity[] = [
  {
    id: 'activity-1',
    user_id: 'demo-user-123',
    action: 'أكمل مهمة تطوير موقع الجمعية',
    type: 'task',
    created_at: '2024-11-30T10:00:00Z'
  },
  {
    id: 'activity-2',
    user_id: 'demo-user-123',
    action: 'انضم إلى مشروع كفالة الأيتام',
    type: 'project',
    created_at: '2024-11-29T15:30:00Z'
  },
  {
    id: 'activity-3',
    user_id: 'demo-user-123',
    action: 'حصل على إنجاز أفضل مدير مشاريع',
    type: 'achievement',
    created_at: '2024-11-28T12:00:00Z'
  },
  {
    id: 'activity-4',
    user_id: 'demo-user-123',
    action: 'ساهم في حملة التبرعات الشتوية',
    type: 'contribution',
    created_at: '2024-11-27T09:45:00Z'
  },
  {
    id: 'activity-5',
    user_id: 'demo-user-123',
    action: 'حدث بيانات الملف الشخصي',
    type: 'profile',
    created_at: '2024-11-26T14:20:00Z'
  }
];

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    // For demo purposes, return mock data
    return mockProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const getOrCreateUserProfile = async (): Promise<UserProfile> => {
  try {
    // For demo purposes, return mock data
    return mockProfile;
  } catch (error) {
    console.error('Error getting or creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    // For demo purposes, simulate update
    const updatedProfile = { ...mockProfile, ...updates, updated_at: new Date().toISOString() };
    return updatedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getUserActivities = async (): Promise<UserActivity[]> => {
  try {
    // For demo purposes, return mock activities
    return mockActivities;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return [];
  }
};

export const uploadProfilePicture = async (file: File): Promise<string> => {
  try {
    // For demo purposes, simulate upload
    const mockUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mockProfile.name)}`;
    return mockUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};