# 🚀 دليل ربط البرنامج بقاعدة البيانات

## ✅ تم الربط بنجاح!

البرنامج الآن مربوط بقاعدة بيانات SQLite مع Backend API كامل.

---

## 📋 الخطوات للتشغيل

### 1️⃣ تشغيل Backend (الخادم)

```bash
cd C:\Users\abd\Downloads\joker\joker3\backend
start.bat
```

**أو يدوياً:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python database.py    # إنشاء قاعدة البيانات
python api.py         # تشغيل الخادم
```

✅ **الخادم سيعمل على:** http://localhost:8000

---

### 2️⃣ تشغيل Frontend (الواجهة)

```bash
cd C:\Users\abd\Downloads\joker\joker3\build\v10
python -m http.server 8080
```

**ثم افتح المتصفح:**
- http://localhost:8080

---

## 🔧 كيفية الاستخدام

### في Console المتصفح (F12):

```javascript
// 1. فحص الاتصال بقاعدة البيانات
checkDatabaseConnection()

// 2. إنشاء مهمة (سيتم حفظها في قاعدة البيانات)
apiCreateTask({
  title: "مهمة تجريبية",
  description: "وصف المهمة",
  assignedTo: "1",
  priority: "high",
  status: "pending",
  projectId: "1",
  dueDate: "2024-12-31"
})

// 3. جلب جميع المهام من قاعدة البيانات
apiGetTasks()

// 4. تحديث مهمة
apiUpdateTask(1, { status: "completed", revenue: 5000 })

// 5. حذف مهمة
apiDeleteTask(1)

// 6. مزامنة البيانات من localStorage إلى قاعدة البيانات
syncLocalStorageToDatabase()
```

---

## 📊 الوضع الحالي

### ✅ ما تم إنجازه:

1. **قاعدة بيانات SQLite** (`backend/tawq.db`)
   - ✅ جدول المستخدمين (Users)
   - ✅ جدول المشاريع (Projects)
   - ✅ جدول المهام (Tasks)
   - ✅ جدول المتبرعين (Donors)
   - ✅ جدول التبرعات (Donations)
   - ✅ جدول المشاهير (Influencers)
   - ✅ جدول النقاط (PointsLog)

2. **Backend API** (`backend/api.py`)
   - ✅ FastAPI Server
   - ✅ RESTful Endpoints لكل جدول
   - ✅ CRUD كامل (Create, Read, Update, Delete)
   - ✅ CORS مفعّل
   - ✅ Swagger Documentation: http://localhost:8000/api/docs

3. **Frontend Integration** (`build/v10/index.html`)
   - ✅ نظام API متكامل
   - ✅ Fallback إلى localStorage
   - ✅ دوال للتواصل مع Backend
   - ✅ فحص الاتصال التلقائي

---

## 🎯 API Endpoints المتاحة

### المهام (Tasks)
```
POST   /api/tasks          # إنشاء مهمة
GET    /api/tasks          # قائمة المهام
GET    /api/tasks/{id}     # تفاصيل مهمة
PUT    /api/tasks/{id}     # تحديث مهمة
DELETE /api/tasks/{id}     # حذف مهمة
```

### المشاريع (Projects)
```
POST   /api/projects       # إنشاء مشروع
GET    /api/projects       # قائمة المشاريع
GET    /api/projects/{id}  # تفاصيل مشروع
PUT    /api/projects/{id}  # تحديث مشروع
DELETE /api/projects/{id}  # حذف مشروع
```

### المتبرعون (Donors)
```
POST   /api/donors         # إضافة متبرع
GET    /api/donors         # قائمة المتبرعين
GET    /api/donors/{id}    # تفاصيل متبرع
PUT    /api/donors/{id}    # تحديث متبرع
DELETE /api/donors/{id}    # حذف متبرع
```

### المشاهير (Influencers)
```
POST   /api/influencers         # إضافة مشهور
GET    /api/influencers         # قائمة المشاهير
GET    /api/influencers/{id}    # تفاصيل مشهور
PUT    /api/influencers/{id}    # تحديث مشهور
DELETE /api/influencers/{id}    # حذف مشهور
```

### الإحصائيات
```
GET    /api/stats/dashboard     # إحصائيات لوحة التحكم
```

---

## ⚙️ إعدادات

في ملف `build/v10/index.html`:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
const USE_API = true;  // true = قاعدة بيانات | false = localStorage
```

---

## 🔍 اختبار الربط

### 1. تأكد أن الخادم يعمل:
```bash
# في Terminal جديد
curl http://localhost:8000/health
```

**النتيجة المتوقعة:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-23T10:00:00"
}
```

### 2. اختبار API من Terminal:
```bash
# إنشاء مهمة
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"مهمة تجريبية\",\"project_id\":1,\"assigned_to\":1}"

# جلب المهام
curl http://localhost:8000/api/tasks
```

---

## 📖 الوثائق

بعد تشغيل الخادم، زُر:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

---

## 🐛 حل المشاكل

### المشكلة: "API Server is not running"
**الحل:**
```bash
cd backend
start.bat
```

### المشكلة: "ModuleNotFoundError: No module named 'fastapi'"
**الحل:**
```bash
cd backend
pip install -r requirements.txt
```

### المشكلة: "CORS Error"
**الحل:** تأكد أن CORS مفعّل في `api.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🎉 مميزات النظام

✅ **قاعدة بيانات حقيقية** (SQLite)
✅ **Backend API** (FastAPI)
✅ **CRUD كامل** لجميع الكيانات
✅ **Fallback إلى localStorage** عند فشل API
✅ **مزامنة تلقائية** بين localStorage وقاعدة البيانات
✅ **فحص الاتصال التلقائي**
✅ **وثائق تفاعلية** (Swagger)
✅ **جاهز للتوسع** (إضافة مصادقة، صلاحيات، إلخ)

---

## 🚀 الخطوات القادمة (اختياري)

1. ✅ إضافة نظام المصادقة (JWT)
2. ✅ إضافة نظام الصلاحيات (RBAC)
3. ✅ تحويل SQLite إلى PostgreSQL/MySQL
4. ✅ إضافة Real-time Updates (WebSocket)
5. ✅ إضافة Docker للنشر السريع

---

**✅ البرنامج الآن مربوط بقاعدة بيانات كاملة وجاهز للاستخدام!** 🎉
