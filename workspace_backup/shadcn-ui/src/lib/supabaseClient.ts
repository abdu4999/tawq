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
  DONORS: 'app_f226d1f8f5_donors',
  DONATIONS: 'app_f226d1f8f5_donations',
  EMPLOYEE_TARGETS: 'app_f226d1f8f5_employee_targets',
  PROJECT_TARGETS: 'app_f226d1f8f5_project_targets',
  AUDIT_LOGS: 'app_f226d1f8f5_audit_logs',
  POLICIES: 'app_f226d1f8f5_policies'
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

  // Donors API
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

  async getDonorById(id: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.DONORS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching donor:', error);
      return null;
    }
  },

  async createDonor(donorData: any) {
    const { data, error } = await supabase
      .from(TABLES.DONORS)
      .insert(donorData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Donations API
  async getDonationsByDonor(donorId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.DONATIONS)
        .select('*')
        .eq('donor_id', donorId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching donations:', error);
      return [];
    }
  },

  // Employee Targets API
  async getEmployeeTargets() {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMPLOYEE_TARGETS)
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching employee targets:', error);
      return [];
    }
  },

  async updateEmployeeTarget(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.EMPLOYEE_TARGETS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Project Targets API
  async getProjectTargets() {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROJECT_TARGETS)
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching project targets:', error);
      return [];
    }
  },

  async updateProjectTarget(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.PROJECT_TARGETS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Audit Logs API
  async getAuditLogs(limit = 50) {
    try {
      const { data, error } = await supabase
        .from(TABLES.AUDIT_LOGS)
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  },

  async createAuditLog(logData: any) {
    const { data, error } = await supabase
      .from(TABLES.AUDIT_LOGS)
      .insert(logData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Policies API
  async getPolicies() {
    try {
      const { data, error } = await supabase
        .from(TABLES.POLICIES)
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching policies:', error);
      return [];
    }
  },

  async updatePolicy(id: string, content: string) {
    const { data, error } = await supabase
      .from(TABLES.POLICIES)
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
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