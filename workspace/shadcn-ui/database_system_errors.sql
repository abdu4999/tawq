-- =====================================================
-- جدول إدارة الأخطاء (System Errors)
-- يحفظ جميع أخطاء النظام مع معلومات تفصيلية
-- Note: Some deployments might use 'app_d5213450a8_error_logs' instead of 'system_errors'.
-- Ensure your application configuration matches the actual table name in your database.
-- =====================================================

CREATE TABLE IF NOT EXISTS system_errors (
  -- المفتاح الأساسي
  id SERIAL PRIMARY KEY,
  
  -- الرقم المرجعي الموحد (ERR-YYYYMMDD-XXXXXX)
  error_code VARCHAR(30) UNIQUE NOT NULL,
  
  -- معلومات الخطأ
  error_message TEXT NOT NULL,           -- رسالة مختصرة
  error_details TEXT,                    -- stack trace والتفاصيل الكاملة
  context VARCHAR(255),                  -- السياق (اسم الصفحة والعملية)
  
  -- مستوى الخطورة
  severity VARCHAR(20) CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  
  -- معلومات إضافية
  url VARCHAR(500),                      -- الصفحة/Endpoint الذي حصل فيه الخطأ
  payload TEXT,                          -- البيانات المُرسلة (JSON)
  
  -- معلومات المستخدم
  user_id UUID,                          -- المستخدم الذي صادف الخطأ
  
  -- حالة الحل
  resolved BOOLEAN DEFAULT FALSE,        -- هل تم حل الخطأ؟
  resolved_by UUID,                      -- من قام بحل الخطأ
  resolved_at TIMESTAMP,                 -- وقت الحل
  resolution_notes TEXT,                 -- ملاحظات الحل
  
  -- التواريخ
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- الفهارس (Indexes) لتسريع البحث
-- =====================================================

-- فهرس على الرقم المرجعي (للبحث السريع)
CREATE INDEX IF NOT EXISTS idx_system_errors_error_code 
ON system_errors(error_code);

-- فهرس على مستوى الخطورة
CREATE INDEX IF NOT EXISTS idx_system_errors_severity 
ON system_errors(severity);

-- فهرس على حالة الحل
CREATE INDEX IF NOT EXISTS idx_system_errors_resolved 
ON system_errors(resolved);

-- فهرس على التاريخ (للفلترة بالتاريخ)
CREATE INDEX IF NOT EXISTS idx_system_errors_created_at 
ON system_errors(created_at DESC);

-- فهرس على URL (للفلترة بالصفحة)
CREATE INDEX IF NOT EXISTS idx_system_errors_url 
ON system_errors(url);

-- فهرس على المستخدم
CREATE INDEX IF NOT EXISTS idx_system_errors_user_id 
ON system_errors(user_id);

-- فهرس مركب للبحث الشائع (غير محلول + حسب التاريخ)
CREATE INDEX IF NOT EXISTS idx_system_errors_unresolved_date 
ON system_errors(resolved, created_at DESC) 
WHERE resolved = FALSE;

-- =====================================================
-- Trigger لتحديث updated_at تلقائياً
-- =====================================================

CREATE OR REPLACE FUNCTION update_system_errors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_errors_updated_at
BEFORE UPDATE ON system_errors
FOR EACH ROW
EXECUTE FUNCTION update_system_errors_updated_at();

-- =====================================================
-- Views مساعدة
-- =====================================================

-- View للأخطاء غير المحلولة
CREATE OR REPLACE VIEW unresolved_errors AS
SELECT 
  id,
  error_code,
  error_message,
  severity,
  context,
  url,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_open
FROM system_errors
WHERE resolved = FALSE
ORDER BY 
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  created_at DESC;

-- View لإحصائيات الأخطاء
CREATE OR REPLACE VIEW error_statistics AS
SELECT 
  COUNT(*) as total_errors,
  COUNT(*) FILTER (WHERE resolved = TRUE) as resolved_count,
  COUNT(*) FILTER (WHERE resolved = FALSE) as unresolved_count,
  COUNT(*) FILTER (WHERE severity = 'critical') as critical_count,
  COUNT(*) FILTER (WHERE severity = 'high') as high_count,
  COUNT(*) FILTER (WHERE severity = 'medium') as medium_count,
  COUNT(*) FILTER (WHERE severity = 'low') as low_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30d_count
FROM system_errors;

-- View للأخطاء الشائعة
CREATE OR REPLACE VIEW common_errors AS
SELECT 
  error_message,
  COUNT(*) as occurrence_count,
  MAX(created_at) as last_occurrence,
  COUNT(*) FILTER (WHERE resolved = FALSE) as unresolved_count,
  ARRAY_AGG(DISTINCT severity) as severities,
  ARRAY_AGG(DISTINCT context) as contexts
FROM system_errors
GROUP BY error_message
HAVING COUNT(*) > 1
ORDER BY occurrence_count DESC
LIMIT 50;

-- =====================================================
-- بيانات تجريبية (اختياري - للاختبار فقط)
-- =====================================================

-- إدراج خطأ تجريبي
INSERT INTO system_errors (
  error_code,
  error_message,
  error_details,
  context,
  severity,
  url,
  payload,
  resolved
) VALUES (
  'ERR-20251202-TEST01',
  'خطأ تجريبي لاختبار النظام',
  'Error: Test error\n  at testFunction (test.ts:10:15)\n  at main (app.ts:50:20)',
  'Test - System Check',
  'low',
  '/test-page',
  '{"test": true, "timestamp": "2025-12-02T12:00:00Z"}',
  FALSE
);

-- =====================================================
-- استعلامات مساعدة (Queries)
-- =====================================================

-- 1. البحث عن خطأ برقمه المرجعي
-- SELECT * FROM system_errors WHERE error_code = 'ERR-20251202-ABC123';

-- 2. عرض جميع الأخطاء غير المحلولة
-- SELECT * FROM unresolved_errors;

-- 3. إحصائيات الأخطاء
-- SELECT * FROM error_statistics;

-- 4. الأخطاء الأكثر تكراراً
-- SELECT * FROM common_errors;

-- 5. الأخطاء في آخر 24 ساعة
-- SELECT * FROM system_errors 
-- WHERE created_at >= NOW() - INTERVAL '24 hours'
-- ORDER BY created_at DESC;

-- 6. الأخطاء الحرجة غير المحلولة
-- SELECT * FROM system_errors 
-- WHERE severity = 'critical' AND resolved = FALSE
-- ORDER BY created_at DESC;

-- 7. وضع علامة على خطأ كمحلول
-- UPDATE system_errors 
-- SET 
--   resolved = TRUE,
--   resolved_by = 'user-uuid-here',
--   resolved_at = NOW(),
--   resolution_notes = 'تم حل المشكلة بتحديث الكود'
-- WHERE error_code = 'ERR-20251202-ABC123';

-- 8. حذف الأخطاء المحلولة الأقدم من 90 يوم
-- DELETE FROM system_errors 
-- WHERE resolved = TRUE 
-- AND resolved_at < NOW() - INTERVAL '90 days';

-- 9. تقرير أخطاء حسب الصفحة
-- SELECT 
--   url,
--   COUNT(*) as error_count,
--   COUNT(*) FILTER (WHERE resolved = FALSE) as unresolved,
--   MAX(created_at) as last_error
-- FROM system_errors
-- GROUP BY url
-- ORDER BY error_count DESC;

-- 10. تقرير أخطاء حسب المستخدم
-- SELECT 
--   user_id,
--   COUNT(*) as error_count,
--   ARRAY_AGG(DISTINCT severity) as severities,
--   MAX(created_at) as last_error
-- FROM system_errors
-- WHERE user_id IS NOT NULL
-- GROUP BY user_id
-- ORDER BY error_count DESC;

-- =====================================================
-- صلاحيات (Permissions) - تعديل حسب احتياجك
-- =====================================================

-- منح صلاحيات القراءة والكتابة للمطورين
-- GRANT SELECT, INSERT, UPDATE ON system_errors TO developers_role;

-- منح صلاحيات القراءة فقط للمشاهدين
-- GRANT SELECT ON system_errors TO viewers_role;
-- GRANT SELECT ON unresolved_errors TO viewers_role;
-- GRANT SELECT ON error_statistics TO viewers_role;
-- GRANT SELECT ON common_errors TO viewers_role;

-- =====================================================
-- نهاية السكريبت
-- =====================================================

-- ملاحظات:
-- 1. تأكد من وجود جدول users إذا كنت تريد ربط user_id
-- 2. عدّل أسماء الصلاحيات (roles) حسب نظامك
-- 3. يمكنك إضافة partitioning إذا كانت البيانات كبيرة جداً
-- 4. يُنصح بعمل backup دوري لهذا الجدول
