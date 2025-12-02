# 📅 نظام التاريخ الموحد - Gregorian Calendar System

## 🎯 المبدأ الأساسي

**جميع التواريخ في النظام بالميلادي فقط - لا هجري نهائياً**

---

## ✅ القواعد الثابتة

### 1. التقويم المستخدم
- ✅ **التقويم الميلادي (Gregorian)** فقط
- ❌ لا يوجد تقويم هجري
- ❌ لا يوجد تحويل تلقائي

### 2. الصيغة القياسية
- ✅ **ISO 8601** للتخزين: `2025-12-02T15:45:00.000Z`
- ✅ تنسيق موحد في قاعدة البيانات
- ✅ توافق مع جميع الأنظمة الدولية

### 3. العرض
- ✅ تنسيق عربي للعرض: `2 ديسمبر 2025`
- ✅ أرقام إنجليزية (latn) وليست عربية
- ✅ أسماء أشهر ميلادية بالعربي

---

## 📦 ملف date-utils.ts

### الوظائف الرئيسية

#### تنسيق التاريخ
```typescript
import { formatDate } from '@/lib/date-utils';

// عرض كامل: الأحد، 2 ديسمبر 2025، 3:45 م
formatDate(date, 'full');

// مختصر: 2/12/2025
formatDate(date, 'short');

// تاريخ فقط: 2 ديسمبر 2025
formatDate(date, 'date-only');

// وقت فقط: 3:45 م
formatDate(date, 'time-only');

// تاريخ ووقت: 2/12/2025 3:45 م
formatDate(date, 'datetime');
```

#### الوقت النسبي
```typescript
import { formatRelativeTime } from '@/lib/date-utils';

// "منذ 5 دقائق"
// "منذ ساعتين"
// "منذ 3 أيام"
formatRelativeTime(date);
```

#### عمليات التاريخ
```typescript
import { 
  addDays, 
  addMonths, 
  diffInDays,
  startOfMonth,
  endOfMonth 
} from '@/lib/date-utils';

// إضافة 7 أيام
const nextWeek = addDays(new Date(), 7);

// إضافة 3 أشهر
const quarter = addMonths(new Date(), 3);

// الفرق بالأيام
const diff = diffInDays(date1, date2);

// بداية الشهر
const monthStart = startOfMonth(new Date());

// نهاية الشهر
const monthEnd = endOfMonth(new Date());
```

---

## 🔧 الاستخدام في المكونات

### مثال: صفحة إدارة الأخطاء

```typescript
import { formatDate, formatRelativeTime } from '@/lib/date-utils';

// في JSX
<span title={formatDate(error.timestamp, 'full')}>
  🕐 {formatRelativeTime(error.timestamp)}
</span>

// في التصدير
formatDate(error.timestamp, 'datetime')
```

### مثال: نموذج إدخال تاريخ

```typescript
import { getCurrentISODate, formatDate } from '@/lib/date-utils';

// القيمة الافتراضية
const [date, setDate] = useState(getCurrentISODate());

// العرض
<Input 
  type="date" 
  value={formatDate(date, 'short')}
  onChange={(e) => setDate(e.target.value)}
/>
```

---

## 🗄️ قاعدة البيانات

### Schema للتواريخ

```sql
-- جميع الحقول بصيغة TIMESTAMP WITH TIME ZONE
CREATE TABLE errors (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### الاستعلامات

```sql
-- فلترة بالتاريخ
SELECT * FROM errors 
WHERE timestamp >= '2025-12-01T00:00:00Z'
  AND timestamp < '2025-12-02T00:00:00Z';

-- ترتيب حسب التاريخ
SELECT * FROM errors 
ORDER BY timestamp DESC;

-- التجميع حسب اليوم
SELECT DATE(timestamp) as day, COUNT(*) 
FROM errors 
GROUP BY DATE(timestamp);
```

---

## 📊 أمثلة عملية

### 1. عرض قائمة الأخطاء

```tsx
{errors.map(error => (
  <div key={error.id}>
    <h3>{error.error_message}</h3>
    <time 
      dateTime={error.timestamp}
      title={formatDate(error.timestamp, 'full')}
    >
      {formatRelativeTime(error.timestamp)}
    </time>
  </div>
))}
```

### 2. فلترة بالتاريخ

```tsx
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');

// التصفية
const filtered = errors.filter(error => {
  const errorDate = new Date(error.timestamp);
  
  if (dateFrom) {
    const from = startOfDay(new Date(dateFrom));
    if (errorDate < from) return false;
  }
  
  if (dateTo) {
    const to = endOfDay(new Date(dateTo));
    if (errorDate > to) return false;
  }
  
  return true;
});
```

### 3. حساب المدة

```tsx
import { diffInDays, formatDate } from '@/lib/date-utils';

const createdDate = new Date(project.created_at);
const now = new Date();
const daysActive = diffInDays(now, createdDate);

<p>
  المشروع نشط منذ {daysActive} يوم
  (بدأ في {formatDate(createdDate, 'date-only')})
</p>
```

---

## 🚫 ممنوعات

### ❌ لا تستخدم:

```typescript
// ❌ تنسيقات هجرية
new Intl.DateTimeFormat('ar-SA', { calendar: 'islamic' });

// ❌ تحويل للهجري
toHijri(date);

// ❌ تاريخ هجري في قاعدة البيانات
hijri_date VARCHAR(20);

// ❌ أرقام عربية (٢٠٢٥)
numberingSystem: 'arab'
```

### ✅ استخدم بدلاً منها:

```typescript
// ✅ تقويم ميلادي دائماً
new Intl.DateTimeFormat('ar-SA', { 
  calendar: 'gregory',
  numberingSystem: 'latn'
});

// ✅ وظائف من date-utils
import { formatDate } from '@/lib/date-utils';

// ✅ تخزين ISO في قاعدة البيانات
timestamp TIMESTAMP WITH TIME ZONE

// ✅ أرقام إنجليزية
numberingSystem: 'latn'
```

---

## 🎨 أفضل الممارسات

### 1. استخدام date-utils دائماً

```typescript
// ✅ صحيح
import { formatDate } from '@/lib/date-utils';
formatDate(date, 'full');

// ❌ خطأ
new Date().toLocaleString('ar-SA');
```

### 2. تخزين ISO في الحالة

```typescript
// ✅ صحيح
const [date, setDate] = useState<string>(getCurrentISODate());

// ❌ خطأ
const [date, setDate] = useState<Date>(new Date());
```

### 3. التحقق من الصحة

```typescript
import { isValidDate } from '@/lib/date-utils';

if (!isValidDate(inputDate)) {
  showError('التاريخ غير صالح');
  return;
}
```

---

## 🔍 أمثلة من الكود

### ErrorManagement.tsx

```typescript
// ✅ استيراد الوظائف
import { formatDate, formatRelativeTime } from '@/lib/date-utils';

// ✅ عرض نسبي مع tooltip للتاريخ الكامل
<span title={formatDate(error.timestamp, 'full')}>
  🕐 {formatRelativeTime(error.timestamp)}
</span>

// ✅ تصدير بتنسيق موحد
formatDate(error.timestamp, 'datetime')

// ✅ اسم ملف مع التاريخ
`سجلات_الأخطاء_${formatDate(new Date(), 'short').replace(/\//g, '-')}.csv`
```

---

## 📈 الفوائد

### 1. التوحيد
- ✅ نظام واحد في كل مكان
- ✅ لا تضارب بين ميلادي/هجري
- ✅ سهولة الصيانة

### 2. الدقة
- ✅ حسابات دقيقة بدون أخطاء تحويل
- ✅ توافق مع المعايير الدولية
- ✅ دعم كامل من المكتبات

### 3. التوافقية
- ✅ يعمل مع جميع الأنظمة
- ✅ سهل التكامل مع APIs خارجية
- ✅ متوافق مع قواعد البيانات الحديثة

### 4. تجربة المستخدم
- ✅ واضح وبسيط
- ✅ لا التباس
- ✅ معيار موحد

---

## 🔄 الترحيل من نظام قديم

إذا كان لديك بيانات بالهجري:

```sql
-- 1. حفظ backup
CREATE TABLE errors_backup AS SELECT * FROM errors;

-- 2. تحويل للميلادي (مرة واحدة)
UPDATE errors 
SET timestamp = convert_hijri_to_gregorian(hijri_date);

-- 3. حذف الحقول الهجرية
ALTER TABLE errors DROP COLUMN hijri_date;
```

---

## 📞 الدعم

- راجع `src/lib/date-utils.ts` لجميع الوظائف
- جميع الدوال موثقة بـ JSDoc
- أمثلة في `ErrorManagement.tsx`

---

**تاريخ التحديث:** 2 ديسمبر 2025  
**الإصدار:** 1.0.0  
**الحالة:** ✅ نشط ومطبق في جميع الصفحات
