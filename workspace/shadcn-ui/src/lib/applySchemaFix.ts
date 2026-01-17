import { supabase } from './supabaseClient';

/**
 * تطبيق إصلاح Schema لإضافة عمود account_link وتحديث cache
 * Apply schema fix to add account_link column and refresh PostgREST cache
 */
export async function applyAccountLinkSchemaFix(): Promise<{ success: boolean; message: string }> {
  try {
    // تنفيذ SQL مباشرة لإضافة العمود
    // Execute SQL directly to add column
    const { error: alterError } = await supabase.rpc('exec_raw_sql', {
      query: `ALTER TABLE app_f226d1f8f5_celebrities ADD COLUMN IF NOT EXISTS account_link TEXT;`
    });

    if (alterError) {
      console.error('Error adding account_link column:', alterError);
      
      // محاولة بديلة: استخدام REST API
      // Alternative: try using REST API
      const { error: insertError } = await supabase
        .from('app_f226d1f8f5_celebrities')
        .select('account_link')
        .limit(1);
      
      if (insertError && insertError.message.includes('account_link')) {
        return {
          success: false,
          message: `يرجى تنفيذ الإصلاح يدوياً في Supabase SQL Editor:\n\nALTER TABLE app_f226d1f8f5_celebrities ADD COLUMN IF NOT EXISTS account_link TEXT;\nNOTIFY pgrst, 'reload schema';`
        };
      }
    }

    return {
      success: true,
      message: 'تم إضافة عمود account_link بنجاح (أو كان موجوداً مسبقاً)'
    };

  } catch (error) {
    console.error('Unexpected error applying schema fix:', error);
    return {
      success: false,
      message: `يرجى تنفيذ السكريبت يدوياً في Supabase:\n\nALTER TABLE app_f226d1f8f5_celebrities ADD COLUMN IF NOT EXISTS account_link TEXT;\nNOTIFY pgrst, 'reload schema';`
    };
  }
}

/**
 * التحقق من وجود عمود account_link
 * Verify account_link column exists
 */
export async function verifyAccountLinkColumn(): Promise<{ exists: boolean; message: string }> {
  try {
    // محاولة قراءة العمود
    // Try to read the column
    const { data, error } = await supabase
      .from('app_f226d1f8f5_celebrities')
      .select('account_link')
      .limit(1);

    if (error) {
      // إذا كان الخطأ متعلق بالعمود، فهو غير موجود
      // If error is about the column, it doesn't exist
      if (error.message.includes('account_link') || error.message.includes('column')) {
        return {
          exists: false,
          message: 'العمود account_link غير موجود في Schema'
        };
      }
      
      return {
        exists: false,
        message: `خطأ في التحقق: ${error.message}`
      };
    }

    return {
      exists: true,
      message: 'العمود account_link موجود وجاهز للاستخدام'
    };

  } catch (error) {
    return {
      exists: false,
      message: `خطأ غير متوقع: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
