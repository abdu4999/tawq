import { supabase } from './supabaseClient';

export interface UserSettings {
  id: string;
  user_id: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  date_format: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  sound_enabled: boolean;
  notification_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  profile_visibility: 'public' | 'team' | 'private';
  activity_tracking: boolean;
  data_collection: boolean;
  two_factor_auth: boolean;
  session_timeout: number;
  password_expiry: number;
  login_alerts: boolean;
  sidebar_collapsed: boolean;
  compact_mode: boolean;
  animations_enabled: boolean;
  high_contrast: boolean;
  created_at: string;
  updated_at: string;
}

// Mock data for demo purposes
const mockSettings: UserSettings = {
  id: 'mock-settings-id',
  user_id: 'demo-user-123',
  language: 'ar',
  theme: 'light',
  timezone: 'Asia/Riyadh',
  date_format: 'dd/mm/yyyy',
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  sound_enabled: true,
  notification_frequency: 'immediate',
  profile_visibility: 'team',
  activity_tracking: true,
  data_collection: true,
  two_factor_auth: false,
  session_timeout: 30,
  password_expiry: 90,
  login_alerts: true,
  sidebar_collapsed: false,
  compact_mode: false,
  animations_enabled: true,
  high_contrast: false,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-11-30T00:00:00Z'
};

export const getUserSettings = async (): Promise<UserSettings | null> => {
  try {
    // For demo purposes, return mock data
    return mockSettings;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
};

export const getOrCreateUserSettings = async (): Promise<UserSettings> => {
  try {
    // For demo purposes, return mock data
    return mockSettings;
  } catch (error) {
    console.error('Error getting or creating user settings:', error);
    throw error;
  }
};

export const updateUserSettings = async (updates: Partial<UserSettings>): Promise<UserSettings> => {
  try {
    // For demo purposes, simulate update
    const updatedSettings = { ...mockSettings, ...updates, updated_at: new Date().toISOString() };
    return updatedSettings;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

export const resetUserSettings = async (): Promise<UserSettings> => {
  try {
    // For demo purposes, return default settings
    const defaultSettings: UserSettings = {
      ...mockSettings,
      language: 'ar',
      theme: 'light',
      timezone: 'Asia/Riyadh',
      date_format: 'dd/mm/yyyy',
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      sound_enabled: true,
      notification_frequency: 'immediate',
      profile_visibility: 'team',
      activity_tracking: true,
      data_collection: true,
      two_factor_auth: false,
      session_timeout: 30,
      password_expiry: 90,
      login_alerts: true,
      sidebar_collapsed: false,
      compact_mode: false,
      animations_enabled: true,
      high_contrast: false,
      updated_at: new Date().toISOString()
    };
    return defaultSettings;
  } catch (error) {
    console.error('Error resetting user settings:', error);
    throw error;
  }
};

export const exportUserSettings = async (): Promise<string> => {
  try {
    // For demo purposes, export mock settings
    const exportData = {
      settings: mockSettings,
      exported_at: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting user settings:', error);
    throw error;
  }
};

export const importUserSettings = async (jsonData: string): Promise<UserSettings> => {
  try {
    const importData = JSON.parse(jsonData);
    if (!importData.settings) {
      throw new Error('Invalid settings file format');
    }
    
    // For demo purposes, merge with mock settings
    const importedSettings = { ...mockSettings, ...importData.settings, updated_at: new Date().toISOString() };
    return importedSettings;
  } catch (error) {
    console.error('Error importing user settings:', error);
    throw error;
  }
};