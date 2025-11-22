# Tawq Backend API

## نظام إدارة الأداء في التسويق الخيري

Backend API باستخدام FastAPI + SQLite

---

## 🚀 التشغيل السريع

### Windows
```bash
# شغّل الملف
start.bat
```

### Linux/Mac
```bash
# إنشاء البيئة الافتراضية
python3 -m venv venv
source venv/bin/activate

# تثبيت المكتبات
pip install -r requirements.txt

# إنشاء قاعدة البيانات
python database.py

# تشغيل الخادم
python api.py
```

---

## 📖 الوثائق

بعد تشغيل الخادم:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **API Base URL**: http://localhost:8000/api

---

## 🗂️ الهيكل

```
backend/
├── api.py              # FastAPI Application
├── database.py         # SQLAlchemy Models
├── requirements.txt    # Python Dependencies
├── start.bat          # Windows Startup Script
├── tawq.db           # SQLite Database (يتم إنشاؤه تلقائياً)
└── README.md         # هذا الملف
```

---

## 📊 Endpoints المتاحة

### المهام (Tasks)
- `POST /api/tasks` - إنشاء مهمة
- `GET /api/tasks` - قائمة المهام
- `GET /api/tasks/{id}` - تفاصيل مهمة
- `PUT /api/tasks/{id}` - تحديث مهمة
- `DELETE /api/tasks/{id}` - حذف مهمة

### المشاريع (Projects)
- `POST /api/projects` - إنشاء مشروع
- `GET /api/projects` - قائمة المشاريع
- `GET /api/projects/{id}` - تفاصيل مشروع
- `PUT /api/projects/{id}` - تحديث مشروع
- `DELETE /api/projects/{id}` - حذف مشروع

### المتبرعون (Donors)
- `POST /api/donors` - إضافة متبرع
- `GET /api/donors` - قائمة المتبرعين
- `GET /api/donors/{id}` - تفاصيل متبرع
- `PUT /api/donors/{id}` - تحديث متبرع
- `DELETE /api/donors/{id}` - حذف متبرع

### المشاهير (Influencers)
- `POST /api/influencers` - إضافة مشهور
- `GET /api/influencers` - قائمة المشاهير
- `GET /api/influencers/{id}` - تفاصيل مشهور
- `PUT /api/influencers/{id}` - تحديث مشهور
- `DELETE /api/influencers/{id}` - حذف مشهور

### الإحصائيات
- `GET /api/stats/dashboard` - إحصائيات لوحة التحكم

---

## 🔧 المتطلبات

- Python 3.8+
- pip

---

## 📝 ملاحظات

- قاعدة البيانات: SQLite (tawq.db)
- المنفذ الافتراضي: 8000
- CORS: مفعّل للتطوير (عدّله للإنتاج)

---

## 🛡️ الأمان

في الإنتاج، تأكد من:
- [ ] تحديد نطاقات CORS المسموحة
- [ ] إضافة نظام المصادقة (JWT)
- [ ] تشفير كلمات المرور
- [ ] استخدام HTTPS
- [ ] تحديد متغيرات البيئة (.env)

---

## 📞 الدعم

للمساعدة أو الاستفسارات، راجع الوثائق في `/api/docs`
