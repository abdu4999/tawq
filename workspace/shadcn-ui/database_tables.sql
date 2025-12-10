-- ===================================
-- إنشاء جداول قاعدة البيانات
-- Database Tables Creation Script
-- ===================================

-- 1. جدول المتبرعين (Donors)
CREATE TABLE IF NOT EXISTS app_f226d1f8f5_donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    category TEXT CHECK (category IN ('vip', 'regular', 'new', 'inactive')) DEFAULT 'new',
    total_donations NUMERIC DEFAULT 0,
    donation_count INTEGER DEFAULT 0,
    last_donation TIMESTAMP,
    preferred_causes TEXT[],
    assigned_to TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. جدول التبرعات (Donations)
CREATE TABLE IF NOT EXISTS app_f226d1f8f5_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES app_f226d1f8f5_donors(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    date TIMESTAMP DEFAULT NOW(),
    cause TEXT,
    method TEXT CHECK (method IN ('bank_transfer', 'credit_card', 'cash')) DEFAULT 'bank_transfer',
    project_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. جدول أهداف الموظفين (Employee Targets)
CREATE TABLE IF NOT EXISTS app_f226d1f8f5_employee_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    period TEXT CHECK (period IN ('daily', 'weekly', 'monthly')) DEFAULT 'monthly',
    tasks_target INTEGER DEFAULT 0,
    revenue_target NUMERIC DEFAULT 0,
    year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
    month INTEGER DEFAULT EXTRACT(MONTH FROM NOW()),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(employee_id, period, year, month)
);

-- 4. جدول أهداف المشاريع (Project Targets)
CREATE TABLE IF NOT EXISTS app_f226d1f8f5_project_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    target_amount NUMERIC DEFAULT 0,
    roi_formula TEXT DEFAULT '(actual_revenue / agreement_amount) * 100',
    year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, year)
);

-- 5. جدول سجل العمليات (Audit Logs)
CREATE TABLE IF NOT EXISTS app_f226d1f8f5_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_name TEXT,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    ip_address TEXT,
    resource_type TEXT, -- 'donor', 'project', 'task', 'user', etc.
    resource_id TEXT
);

-- 6. جدول السياسات (Policies)
CREATE TABLE IF NOT EXISTS app_f226d1f8f5_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT UNIQUE CHECK (type IN ('usage', 'privacy', 'security')) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. جدول المشاهير (Celebrities)
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

-- ===================================
-- الفهارس (Indexes)
-- ===================================

-- فهارس جدول المتبرعين
CREATE INDEX IF NOT EXISTS idx_donors_category ON app_f226d1f8f5_donors(category);
CREATE INDEX IF NOT EXISTS idx_donors_email ON app_f226d1f8f5_donors(email);
CREATE INDEX IF NOT EXISTS idx_donors_assigned_to ON app_f226d1f8f5_donors(assigned_to);

-- فهارس جدول التبرعات
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON app_f226d1f8f5_donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_date ON app_f226d1f8f5_donations(date DESC);
CREATE INDEX IF NOT EXISTS idx_donations_project_id ON app_f226d1f8f5_donations(project_id);

-- فهارس جدول أهداف الموظفين
CREATE INDEX IF NOT EXISTS idx_employee_targets_employee_id ON app_f226d1f8f5_employee_targets(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_targets_period ON app_f226d1f8f5_employee_targets(period);

-- فهارس جدول أهداف المشاريع
CREATE INDEX IF NOT EXISTS idx_project_targets_project_id ON app_f226d1f8f5_project_targets(project_id);

-- فهارس جدول سجل العمليات
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON app_f226d1f8f5_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON app_f226d1f8f5_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON app_f226d1f8f5_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON app_f226d1f8f5_audit_logs(resource_type, resource_id);

-- فهارس جدول المشاهير
CREATE INDEX IF NOT EXISTS idx_celebrities_category ON app_f226d1f8f5_celebrities(category);
CREATE INDEX IF NOT EXISTS idx_celebrities_status ON app_f226d1f8f5_celebrities(status);

-- ===================================
-- إدخال بيانات تجريبية (Sample Data)
-- ===================================

-- إدخال السياسات الافتراضية
INSERT INTO app_f226d1f8f5_policies (type, content) VALUES
('usage', 'يُسمح باستخدام هذا النظام فقط للموظفين المصرح لهم من إدارة الجمعية. يُمنع منعاً باتاً استخدام النظام لأغراض شخصية أو غير متعلقة بعمل الجمعية.'),
('privacy', 'تلتزم الجمعية بحماية خصوصية بيانات المتبرعين والموظفين. لا يتم مشاركة أي معلومات شخصية مع أطراف ثالثة دون موافقة صريحة.'),
('security', 'يجب على جميع المستخدمين استخدام كلمات مرور قوية وتغييرها بشكل دوري. يُمنع مشاركة بيانات الدخول مع أي شخص آخر.')
ON CONFLICT (type) DO NOTHING;

-- إدخال متبرعين تجريبيين
INSERT INTO app_f226d1f8f5_donors (name, email, phone, category, total_donations, donation_count, last_donation, preferred_causes, assigned_to) VALUES
('عبدالله محمد الأحمد', 'abdullah@email.com', '+966501234567', 'vip', 250000, 12, NOW() - INTERVAL '5 days', ARRAY['تعليم', 'صحة'], 'أحمد محمد'),
('سارة أحمد الخالد', 'sara@email.com', '+966502345678', 'vip', 180000, 8, NOW() - INTERVAL '2 days', ARRAY['كفالة أيتام', 'إغاثة'], 'فاطمة أحمد'),
('خالد سعد العتيبي', 'khaled@email.com', '+966503456789', 'regular', 85000, 15, NOW() - INTERVAL '10 days', ARRAY['بناء مساجد'], 'أحمد محمد'),
('نورة محمد السالم', 'noura@email.com', '+966504567890', 'regular', 65000, 6, NOW() - INTERVAL '15 days', ARRAY['تعليم', 'صحة'], 'فاطمة أحمد'),
('فهد عبدالعزيز', 'fahad@email.com', '+966505678901', 'new', 15000, 2, NOW() - INTERVAL '3 days', ARRAY['إغاثة'], 'أحمد محمد'),
('ريم أحمد', 'reem@email.com', '+966506789012', 'new', 10000, 1, NOW() - INTERVAL '1 day', ARRAY['كفالة أيتام'], 'فاطمة أحمد'),
('عمر خالد', 'omar@email.com', '+966507890123', 'inactive', 120000, 20, NOW() - INTERVAL '90 days', ARRAY['تعليم', 'بناء مساجد'], 'محمد السالم'),
('لمى سعيد', 'lama@email.com', '+966508901234', 'inactive', 95000, 12, NOW() - INTERVAL '120 days', ARRAY['صحة'], 'محمد السالم');

-- إدخال تبرعات تجريبية
INSERT INTO app_f226d1f8f5_donations (donor_id, amount, date, cause, method)
SELECT 
    id,
    (RANDOM() * 50000 + 5000)::NUMERIC,
    NOW() - (RANDOM() * INTERVAL '180 days'),
    (ARRAY['تعليم', 'صحة', 'كفالة أيتام', 'إغاثة', 'بناء مساجد'])[FLOOR(RANDOM() * 5 + 1)],
    (ARRAY['bank_transfer', 'credit_card', 'cash'])[FLOOR(RANDOM() * 3 + 1)]
FROM app_f226d1f8f5_donors
LIMIT 50;

-- إدخال سجل عمليات تجريبي
INSERT INTO app_f226d1f8f5_audit_logs (user_name, action, details, resource_type)
VALUES
('أحمد محمد', 'تسجيل دخول', 'تم تسجيل الدخول بنجاح', 'auth'),
('أحمد محمد', 'إضافة متبرع', 'تم إضافة متبرع جديد: عبدالله محمد', 'donor'),
('فاطمة أحمد', 'تعديل مشروع', 'تم تعديل مشروع "حملة رمضان 2024"', 'project'),
('محمد السالم', 'حذف مهمة', 'تم حذف مهمة "متابعة المتبرعين"', 'task'),
('أحمد محمد', 'تسجيل خروج', 'تم تسجيل الخروج', 'auth');

-- ===================================
-- الدوال المساعدة (Helper Functions)
-- ===================================

-- دالة لتحديث timestamp عند التعديل
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء Triggers لتحديث updated_at تلقائياً
CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON app_f226d1f8f5_donors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_targets_updated_at BEFORE UPDATE ON app_f226d1f8f5_employee_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_targets_updated_at BEFORE UPDATE ON app_f226d1f8f5_project_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON app_f226d1f8f5_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- تعطيل Row Level Security للاختبار
-- (قم بتفعيلها لاحقاً في الإنتاج)
-- ===================================

ALTER TABLE app_f226d1f8f5_donors DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_f226d1f8f5_donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_f226d1f8f5_employee_targets DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_f226d1f8f5_project_targets DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_f226d1f8f5_audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_f226d1f8f5_policies DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_f226d1f8f5_celebrities DISABLE ROW LEVEL SECURITY;

-- ===================================
-- انتهى السكريبت
-- ===================================
