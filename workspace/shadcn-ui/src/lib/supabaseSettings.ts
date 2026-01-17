import { supabase, TABLES } from './supabaseClient';

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

const defaultSettings: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
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
  high_contrast: false
};

export const getOrCreateUserSettings = async (): Promise<UserSettings | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from(TABLES.SETTINGS)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
      console.error('Error fetching settings:', error);
      return null;
    }

    if (data) {
      return data;
    }

    // Create default settings if not found
    const { data: newSettings, error: createError } = await supabase
      .from(TABLES.SETTINGS)
      .insert([{
        user_id: user.id,
        ...defaultSettings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating settings:', createError);
      return null;
    }

    return newSettings;
  } catch (error) {
    console.error('Error in getOrCreateUserSettings:', error);
    return null;
  }
};

export const updateUserSettings = async (updates: Partial<UserSettings>): Promise<UserSettings | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from(TABLES.SETTINGS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserSettings:', error);
    return null;
  }
};

export const resetUserSettings = async (): Promise<UserSettings | null> => {
  return await updateUserSettings(defaultSettings);
};

export const getUserSettings = getOrCreateUserSettings;

export const exportUserSettings = async (): Promise<string> => {
  const settings = await getUserSettings();
  return JSON.stringify(settings, null, 2);
};

export const importUserSettings = async (jsonSettings: string): Promise<boolean> => {
  try {
    const parsed = JSON.parse(jsonSettings);
    // Validate keys
    const validKeys = Object.keys(defaultSettings);
    const cleanSettings: any = {};
    
    for (const key of validKeys) {
      if (key in parsed) {
        cleanSettings[key] = parsed[key];
      }
    }

    await updateUserSettings(cleanSettings);
    return true;
  } catch (error) {
    console.error('Error importing settings:', error);
    return false;
  }
};
