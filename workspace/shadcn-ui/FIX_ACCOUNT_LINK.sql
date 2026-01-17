-- =====================================================
-- إصلاح Schema الكامل لجدول المشاهير
-- Complete schema fix for celebrities table
-- =====================================================

-- الخطوة 1: إضافة جميع الأعمدة المفقودة
-- Step 1: Add all missing columns
ALTER TABLE app_f226d1f8f5_celebrities
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagement_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS collaboration_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
  ADD COLUMN IF NOT EXISTS snapchat_handle TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_handle TEXT,
  ADD COLUMN IF NOT EXISTS youtube_handle TEXT,
  ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
  ADD COLUMN IF NOT EXISTS account_link TEXT,
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'instagram',
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS bio_en TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS other_accounts JSONB,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- الخطوة 2: إضافة القيود (constraints) إذا لزم الأمر
-- Step 2: Add constraints if needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'app_f226d1f8f5_celebrities_platform_check'
  ) THEN
    ALTER TABLE app_f226d1f8f5_celebrities 
    ADD CONSTRAINT app_f226d1f8f5_celebrities_platform_check 
    CHECK (platform IN ('instagram', 'snapchat', 'tiktok', 'youtube', 'twitter', 'website'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'app_f226d1f8f5_celebrities_status_check'
  ) THEN
    ALTER TABLE app_f226d1f8f5_celebrities 
    ADD CONSTRAINT app_f226d1f8f5_celebrities_status_check 
    CHECK (status IN ('available', 'busy', 'contracted', 'unavailable'));
  END IF;
END $$;

-- الخطوة 3: إعادة تحميل Schema في PostgREST
-- Step 3: Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- الخطوة 4: التحقق من جميع الأعمدة
-- Step 4: Verify all columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'app_f226d1f8f5_celebrities'
ORDER BY ordinal_position;
