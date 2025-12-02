// Simple Supabase connection test
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://botdcjmwfrzakgvwhhpx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdGRjam13ZnJ6YW极tndndoaHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTU5OTUsImV4cCI6MjA3Njk5MTk5NX0.EtbGwLO0-YwXy极qYZCfJNz3jw5lbLGZO6RbgfYGn0Zvo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('app_f226d1f8f5_tasks')
      .select('count')
      .single();
    
    if (error) {
      console.error('Connection error:', error);
      return false;
    }
    
    console.log('Connection successful! Task count:', data.count);
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

export default testConnection;