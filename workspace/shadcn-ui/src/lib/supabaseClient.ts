import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://botdcjmwfrzakgvwhhpx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdGRjam13ZnJ6YWtndndoaHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTU5OTUsImV4cCI6MjA3Njk5MTk5NX0.EtbGwLO0-YwXyqYZCfJNz3jw5lbLGZO6RbgfYGn0Zvo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Table names
export const TABLES = {
  TASKS: 'app_f226d1f8f5_tasks',
  PROJECTS: 'app_f226d1f8f5_projects',
  EMPLOYEES: 'app_f226d1f8f5_employees',
  CELEBRITIES: 'app_f226d1f8f5_celebrities',
  TRANSACTIONS: 'app_f226d1f8f5_transactions',
  ROLES: 'app_f226d1f8f5_roles',
  ADMIN_USERS: 'app_f226d1f8f5_admin_users',
  TRAINING_MATERIALS: 'app_f226d1f8f5_training_materials',
  DONORS: 'app_f226d1f8f5_donors',
  CAMPAIGNS: 'app_f226d1f8f5_campaigns',
  TEAMS: 'app_f226d1f8f5_teams',
  SETTINGS: 'app_f226d1f8f5_settings'
};

// Types for roles and admin users
export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  color: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role_id: string | null;
  status: 'active' | 'inactive' | 'suspended';
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// Types for transactions
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  project?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'individual' | 'organization';
  segment: 'vip' | 'regular' | 'new';
  total_donations: number;
  donations_count: number;
  last_donation_date?: string;
  status: 'active' | 'inactive';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: 'snapchat' | 'tiktok' | 'instagram' | 'google' | 'whatsapp' | 'other';
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  new_donors: number;
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  end_date?: string;
  created_at?: string;
}

// Types for celebrities
export interface Celebrity {
  id: string;
  name: string;
  type: string;
  platform: string;
  followers: number;
  engagement_rate: number;
  contact: string;
  status: 'active' | 'inactive';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Basic API functions
export const supabaseAPI = {
  async getTasks() {
    try {
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  async getEmployees() {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMPLOYEES)
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  },

  async getTeams() {
    try {
      const { data, error } = await supabase
        .from(TABLES.TEAMS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  },

  async getTrainingMaterials() {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRAINING_MATERIALS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching training materials:', error);
      return [];
    }
  },

  async getDonors() {
    try {
      const { data, error } = await supabase
        .from(TABLES.DONORS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching donors:', error);
      return [];
    }
  },

  async createDonor(donorData: Omit<Donor, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from(TABLES.DONORS)
        .insert([{ 
          ...donorData, 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating donor:', error);
      throw error;
    }
  },

  async updateDonor(id: string, updates: Partial<Donor>) {
    try {
      const { data, error } = await supabase
        .from(TABLES.DONORS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating donor:', error);
      throw error;
    }
  },

  async deleteDonor(id: string) {
    try {
      const { error } = await supabase
        .from(TABLES.DONORS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting donor:', error);
      throw error;
    }
  },

  async getCampaigns() {
    try {
      const { data, error } = await supabase
        .from(TABLES.CAMPAIGNS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  },

  async getProjects() {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  async getCelebrities() {
    try {
      const { data, error } = await supabase
        .from(TABLES.CELEBRITIES)
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching celebrities:', error);
      return [];
    }
  },

  async getTransactions() {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },

  async getAdminUsers() {
    try {
      const { data, error } = await supabase
        .from(TABLES.ADMIN_USERS)
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  },

  async getRoles() {
    try {
      const { data, error } = await supabase
        .from(TABLES.ROLES)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  },

  async createRole(roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ROLES)
        .insert([{ 
          ...roleData, 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  async createAdminUser(userData: Omit<AdminUser, 'id' | 'created_at' | 'updated_at' | 'last_login'>) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ADMIN_USERS)
        .insert([{ 
          ...userData, 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  },

  async createTask(task) {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .insert([{ ...task, updated_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTask(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTask(id) {
    const { error } = await supabase
      .from(TABLES.TASKS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Project methods
  async createProject(projectData) {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .insert([{ ...projectData, updated_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProject(id) {
    const { error } = await supabase
      .from(TABLES.PROJECTS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Transaction methods
  async createTransaction(transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .insert([{ 
          ...transactionData, 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  async deleteTransaction(id: string) {
    try {
      const { error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  // Celebrity methods
  async createCelebrity(celebrityData: Omit<Celebrity, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CELEBRITIES)
        .insert([{ 
          ...celebrityData, 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating celebrity:', error);
      throw error;
    }
  },

  async updateCelebrity(id: string, updates: Partial<Celebrity>) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CELEBRITIES)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating celebrity:', error);
      throw error;
    }
  },

  async deleteCelebrity(id: string) {
    try {
      const { error } = await supabase
        .from(TABLES.CELEBRITIES)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting celebrity:', error);
      throw error;
    }
  },

  // Employee methods
  async createEmployee(employeeData) {
    const { data, error } = await supabase
      .from(TABLES.EMPLOYEES)
      .insert([{ ...employeeData, updated_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateEmployee(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.EMPLOYEES)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteEmployee(id) {
    const { error } = await supabase
      .from(TABLES.EMPLOYEES)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Authentication helper functions
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};