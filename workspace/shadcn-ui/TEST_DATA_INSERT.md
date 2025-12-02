# إضافة بيانات تجريبية

## خطوات إضافة بيانات تجريبية لاختبار الصفحات:

### 1. افتح Supabase Dashboard
انتقل إلى: https://botdcjmwfrzakgvwhhpx.supabase.co

### 2. أضف موظفين (Employees):
```sql
INSERT INTO app_f226d1f8f5_employees (name, position, email, phone, status)
VALUES 
  ('أحمد محمد', 'مدير المشاريع', 'ahmed@example.com', '0501234567', 'active'),
  ('فاطمة علي', 'منسقة المهام', 'fatima@example.com', '0509876543', 'active'),
  ('عبدالله سعيد', 'مطور', 'abdullah@example.com', '0505555555', 'active');
```

### 3. أضف مهام (Tasks):
```sql
INSERT INTO app_f226d1f8f5_tasks (title, description, status, priority, due_date, execution_date, assignee_id)
VALUES 
  ('تطوير الموقع الإلكتروني', 'إنشاء موقع إلكتروني للمؤسسة', 'in_progress', 'high', '2025-12-15', '2025-12-10', (SELECT id FROM app_f226d1f8f5_employees LIMIT 1)),
  ('إعداد التقرير السنوي', 'إعداد وتجهيز التقرير السنوي للمؤسسة', 'pending', 'medium', '2025-12-20', NULL, (SELECT id FROM app_f226d1f8f5_employees LIMIT 1 OFFSET 1)),
  ('تنظيم حملة تبرعات', 'تنظيم حملة تبرعات للأيتام', 'completed', 'high', '2025-12-01', '2025-11-28', (SELECT id FROM app_f226d1f8f5_employees LIMIT 1 OFFSET 2));
```

### 4. أضف مشاريع (Projects):
```sql
INSERT INTO app_f226d1f8f5_projects (name, description, budget, start_date, end_date, status, progress, manager_id)
VALUES 
  ('مشروع كفالة الأيتام', 'مشروع لكفالة الأيتام والأسر المحتاجة', 50000, '2025-01-01', '2025-12-31', 'active', 65, (SELECT id FROM app_f226d1f8f5_employees LIMIT 1)),
  ('مشروع بناء المسجد', 'بناء مسجد جديد في الحي', 200000, '2025-03-01', '2026-03-01', 'planning', 20, (SELECT id FROM app_f226d1f8f5_employees LIMIT 1)),
  ('مشروع توزيع السلال الغذائية', 'توزيع سلال غذائية على الأسر المحتاجة', 30000, '2025-11-01', '2025-11-30', 'completed', 100, (SELECT id FROM app_f226d1f8f5_employees LIMIT 1 OFFSET 1));
```

## إذا كانت المشكلة استمرت:

تحقق من:
1. اتصال الإنترنت
2. صلاحيات قاعدة البيانات
3. Console في المتصفح (F12) للبحث عن أخطاء
4. Network tab لرؤية استجابة API
