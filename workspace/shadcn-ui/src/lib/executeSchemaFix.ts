import { supabase } from './supabaseClient';

/**
 * تنفيذ إصلاح Schema مباشرة على قاعدة البيانات
 * Execute schema fix directly on the database
 */
export async function executeSchemaFixNow() {
  console.log('🔧 بدء تنفيذ إصلاح Schema...');
  
  try {
    // الطريقة 1: محاولة استخدام RPC function إذا كانت موجودة
    console.log('محاولة 1: استخدام RPC...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE app_f226d1f8f5_celebrities 
            ADD COLUMN IF NOT EXISTS account_link TEXT,
            ADD COLUMN IF NOT EXISTS created_by UUID;`
    });
    
    if (!rpcError) {
      console.log('✅ نجح عبر RPC');
      
      // محاولة إعادة تحميل Schema
      await supabase.rpc('exec_sql', {
        sql: `NOTIFY pgrst, 'reload schema';`
      }).catch(e => console.warn('تحذير: لم يتم إرسال NOTIFY', e));
      
      return { success: true, method: 'RPC' };
    }
    
    console.log('محاولة 1 فشلت:', rpcError.message);
    
    // الطريقة 2: محاولة إدراج سجل تجريبي لإجبار إنشاء العمود
    console.log('محاولة 2: اختبار الأعمدة عبر SELECT...');
    const { data: testData, error: testError } = await supabase
      .from('app_f226d1f8f5_celebrities')
      .select('id, account_link, created_by')
      .limit(1);
    
    if (!testError) {
      console.log('✅ الأعمدة موجودة بالفعل!');
      return { success: true, method: 'Already exists' };
    }
    
    if (testError.message.includes('account_link') || testError.message.includes('created_by')) {
      console.log('❌ أعمدة مفقودة في PostgREST cache');
      console.log('الحل: يجب تنفيذ SQL يدوياً في Supabase Dashboard');
      return { 
        success: false, 
        method: 'Manual required',
        message: 'أعمدة مفقودة. يرجى تنفيذ السكريبت في Supabase SQL Editor'
      };
    }
    
    return { 
      success: false, 
      method: 'Unknown error',
      message: testError.message 
    };
    
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return { 
      success: false, 
      method: 'Exception',
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * التحقق من حالة العمود
 */
export async function checkAccountLinkStatus() {
  try {
    const { data, error } = await supabase
      .from('app_f226d1f8f5_celebrities')
      .select('account_link, created_by')
      .limit(1);
    
    if (error) {
      if (error.message.includes('account_link') || error.message.includes('created_by') || error.message.includes('column')) {
        return {
          exists: false,
          needsManualFix: true,
          message: '⚠️ أعمدة مفقودة (account_link و/أو created_by) في Schema Cache'
        };
      }
      return {
        exists: false,
        needsManualFix: true,
        message: `خطأ: ${error.message}`
      };
    }
    
    return {
      exists: true,
      needsManualFix: false,
      message: '✅ جميع الأعمدة المطلوبة موجودة وجاهزة'
    };
    
  } catch (error) {
    return {
      exists: false,
      needsManualFix: true,
      message: `خطأ: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
