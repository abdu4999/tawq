-- =====================================================
-- تحديث جدول المشاهير (Celebrities Schema Update)
-- =====================================================

-- إضافة الأعمدة الجديدة لدعم ميزة الاستيراد واللغات المتعددة
ALTER TABLE app_f226d1f8f5_celebrities 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS bio_en TEXT,
ADD COLUMN IF NOT EXISTS account_link TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
ADD COLUMN IF NOT EXISTS platform TEXT CHECK (platform IN ('instagram', 'snapchat', 'tiktok', 'youtube', 'twitter', 'website')) DEFAULT 'instagram',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS other_accounts JSONB;

-- ملاحظة: تأكد من أن الجدول موجود أصلاً. إذا لم يكن موجوداً، استخدم السكريبت أدناه لإنشائه.

/*
CREATE TABLE IF NOT EXISTS app_f226d1f8f5_celebrities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT,
    category TEXT,
    followers_count INTEGER DEFAULT 0,
    engagement_rate NUMERIC DEFAULT 0,
    collaboration_rate NUMERIC DEFAULT 0,
    contact_email TEXT,
    contact_phone TEXT,
    instagram_handle TEXT,
    snapchat_handle TEXT,
    tiktok_handle TEXT,
    youtube_handle TEXT,
    account_link TEXT,
    bio TEXT,
    bio_en TEXT,
    status TEXT CHECK (status IN ('available', 'busy', 'contracted', 'unavailable')) DEFAULT 'available',
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
*/
