# تكامل قاعدة البيانات - Database Integration

## ملخص التحديثات

تم تحديث جميع الصفحات لتتصل بقاعدة بيانات Supabase بدلاً من استخدام البيانات التجريبية.

## الصفحات المحدثة

### 1. **Donors.tsx** - إدارة المتبرعين
- ✅ يستخدم `supabaseAPI.getDonors()` لجلب قائمة المتبرعين
- ✅ يعرض بيانات تجريبية احتياطية في حال عدم وجود بيانات
- ✅ يعرض حالة التحميل أثناء جلب البيانات

### 2. **DonorProfile.tsx** - ملف المتبرع
- ✅ يستخدم `supabaseAPI.getDonorById(id)` لجلب بيانات متبرع محدد
- ✅ يستخدم `supabaseAPI.getDonationsByDonor(id)` لجلب سجل التبرعات
- ✅ يعرض رسالة خطأ إذا لم يتم العثور على المتبرع
- ✅ يدعم البحث بالمعرّف (ID) من الرابط

### 3. **TaskDetail.tsx** - تفاصيل المهمة
- ✅ يستخدم `supabaseAPI.getTasks()` ثم يبحث عن المهمة بالـ ID
- ✅ يعرض بيانات تجريبية في حال عدم العثور على المهمة
- ✅ يدعم التعليقات والمرفقات (جاهز للتطوير المستقبلي)

### 4. **EmployeeDashboard.tsx** - لوحة الموظف الشخصية
- ✅ يستخدم `supabaseAPI.getTasks()` و `getProjects()` و `getAdminUsers()`
- ✅ يحسب الإحصائيات من المهام الفعلية للموظف
- ✅ يعرض عدد المهام المكتملة والنقاط
- ✅ يدعم العرض اليومي والأسبوعي والشهري

### 5. **InfluencerProfile.tsx** - ملف المشهور
- ✅ يستخدم `supabaseAPI.getCelebrities()` للبحث عن المشهور
- ✅ يعرض معلومات المفاوضات والاتفاقيات
- ✅ يدعم تحديث حالة المفاوضة

### 6. **InfluencerRevenue.tsx** - إيرادات المشاهير
- ✅ يستخدم `getCelebrities()` و `getProjects()` و `getAdminUsers()`
- ✅ يربط البيانات لإنشاء جدول الإيرادات
- ✅ يحسب ROI لكل مشهور
- ✅ يدعم التصفية حسب الموظف والمشروع

### 7. **PoliciesLog.tsx** - السياسات وسجل العمليات
- ✅ يستخدم `supabaseAPI.getPolicies()` لجلب السياسات
- ✅ يستخدم `supabaseAPI.getAuditLogs()` لجلب سجل العمليات
- ✅ يستخدم `supabaseAPI.updatePolicy()` لحفظ التعديلات
- ✅ يدعم جدولة المراجعة الدورية

## الدوال المضافة في supabaseClient.ts

### Donors API
```typescript
getDonors()                    // جلب جميع المتبرعين
getDonorById(id)               // جلب متبرع محدد
createDonor(donorData)         // إضافة متبرع جديد
```

### Donations API
```typescript
getDonationsByDonor(donorId)   // جلب تبرعات متبرع محدد
```

### Targets API
```typescript
getEmployeeTargets()           // جلب أهداف الموظفين
updateEmployeeTarget(id, updates) // تحديث هدف موظف
getProjectTargets()            // جلب أهداف المشاريع
updateProjectTarget(id, updates)  // تحديث هدف مشروع
```

### Audit Logs API
```typescript
getAuditLogs(limit)            // جلب سجل العمليات
createAuditLog(logData)        // إضافة سجل عملية جديد
```

### Policies API
```typescript
getPolicies()                  // جلب جميع السياسات
updatePolicy(id, content)      // تحديث سياسة محددة
```

## الجداول المطلوبة في Supabase

يجب إنشاء الجداول التالية في قاعدة بيانات Supabase:

### 1. app_f226d1f8f5_donors
```sql
- id (uuid, primary key)
- name (text)
- email (text)
- phone (text)
- category (text) -- 'vip' | 'regular' | 'new' | 'inactive'
- total_donations (numeric)
- donation_count (integer)
- last_donation (timestamp)
- preferred_causes (text[])
- assigned_to (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 2. app_f226d1f8f5_donations
```sql
- id (uuid, primary key)
- donor_id (uuid, foreign key)
- amount (numeric)
- date (timestamp)
- cause (text)
- method (text) -- 'bank_transfer' | 'credit_card' | 'cash'
- created_at (timestamp)
```

### 3. app_f226d1f8f5_employee_targets
```sql
- id (uuid, primary key)
- employee_id (uuid, foreign key)
- period (text) -- 'daily' | 'weekly' | 'monthly'
- tasks_target (integer)
- revenue_target (numeric)
- created_at (timestamp)
- updated_at (timestamp)
```

### 4. app_f226d1f8f5_project_targets
```sql
- id (uuid, primary key)
- project_id (uuid, foreign key)
- target_amount (numeric)
- roi_formula (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 5. app_f226d1f8f5_audit_logs
```sql
- id (uuid, primary key)
- user_id (uuid)
- user_name (text)
- action (text)
- details (text)
- timestamp (timestamp)
- ip_address (text)
```

### 6. app_f226d1f8f5_policies
```sql
- id (uuid, primary key)
- type (text) -- 'usage' | 'privacy' | 'security'
- content (text)
- created_at (timestamp)
- updated_at (timestamp)
```

## الخطوات التالية

1. **إنشاء الجداول**: قم بإنشاء الجداول المذكورة أعلاه في Supabase
2. **إدخال البيانات الأولية**: أضف بعض البيانات التجريبية للاختبار
3. **اختبار الاتصال**: تأكد من أن جميع الصفحات تعمل بشكل صحيح
4. **تفعيل الصلاحيات**: تأكد من أن Row Level Security (RLS) معطل للاختبار أو مضبوط بشكل صحيح

## ملاحظات

- جميع الصفحات تدعم عرض بيانات تجريبية احتياطية في حال عدم وجود بيانات في قاعدة البيانات
- تم إضافة حالات التحميل (loading states) لجميع الصفحات
- تم إضافة معالجة الأخطاء (error handling) للعمليات غير المتزامنة
- يمكن بسهولة استبدال البيانات التجريبية ببيانات حقيقية بمجرد إنشاء الجداول

## تاريخ التحديث
1 ديسمبر 2025
