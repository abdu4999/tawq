-- Ensure the celebrities table has complete schema and refresh PostgREST cache
-- إضافة جميع الأعمدة المفقودة من جدول المشاهير

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
  ADD COLUMN IF NOT EXISTS platform TEXT CHECK (platform IN ('instagram', 'snapchat', 'tiktok', 'youtube', 'twitter', 'website')) DEFAULT 'instagram',
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS bio_en TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS other_accounts JSONB,
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('available', 'busy', 'contracted', 'unavailable')) DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Refresh PostgREST schema cache so Supabase REST API recognizes all columns instantly
NOTIFY pgrst, 'reload schema';

-- Verify the schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'app_f226d1f8f5_celebrities'
ORDER BY ordinal_position;
