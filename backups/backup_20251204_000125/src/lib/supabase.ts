import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://botdcjmwfrzakgvwhhpx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdGRjam13ZnJ6YWtndndoaHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTU5OTUsImV4cCI6MjA3Njk5MTk5NX0.EtbGwLO0-YwXyqYZCfJNz3jw5lbLGZO6RbgfYGn0Zvo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  name: string
  role: string
  department?: string
  position?: string
  avatar_url?: string
  phone?: string
  hire_date?: string
  salary?: number
  performance_score: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  assignee_id?: string
  status: string
  priority: string
  due_date?: string
  completion_date?: string
  points: number
  category?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: string
  manager_id?: string
  start_date?: string
  end_date?: string
  budget?: number
  spent_amount: number
  progress: number
  created_at: string
  updated_at: string
}

export interface Celebrity {
  id: string
  name: string
  category?: string
  followers_count: number
  engagement_rate: number
  cost_per_post: number
  contact_info?: string
  status: string
  created_at: string
}

export interface FinancialTransaction {
  id: string
  type: string
  amount: number
  description?: string
  category?: string
  project_id?: string
  user_id?: string
  transaction_date: string
  created_at: string
}

export interface Team {
  id: string
  name: string
  description?: string
  leader_id?: string
  department?: string
  created_at: string
}

export interface TrainingCourse {
  id: string
  title: string
  description?: string
  instructor?: string
  duration_hours?: number
  max_participants?: number
  start_date?: string
  end_date?: string
  status: string
  created_at: string
}

export interface Reward {
  id: string
  title: string
  description?: string
  points_required: number
  category?: string
  available_quantity?: number
  claimed_quantity: number
  status: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message?: string
  type: string
  read_status: boolean
  created_at: string
}