"""
قاعدة بيانات SQLite لنظام Tawq
نظام إدارة الأداء في التسويق الخيري
"""

from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import enum
import os

# مسار قاعدة البيانات
DB_PATH = os.path.join(os.path.dirname(__file__), 'tawq.db')
DATABASE_URL = f"sqlite:///{DB_PATH}"

# إنشاء المحرك
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """الحصول على جلسة قاعدة البيانات"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================
# Enums
# =====================

class UserRole(str, enum.Enum):
    """أدوار المستخدمين"""
    admin = "admin"
    accountant = "accountant"
    supervisor = "supervisor"
    employee = "employee"


class TaskPriority(str, enum.Enum):
    """أولويات المهام"""
    urgent = "urgent"        # عاجل جداً
    high = "high"           # عاجل
    medium = "medium"       # متوسط
    low = "low"            # عادي


class TaskStatus(str, enum.Enum):
    """حالات المهام"""
    pending = "pending"
    in_progress = "in-progress"
    completed = "completed"
    blocked = "blocked"


class DonorCategory(str, enum.Enum):
    """فئات المتبرعين"""
    vip = "vip"           # فوق 1000 ريال
    gold = "gold"         # 500-1000 ريال
    silver = "silver"     # 100-500 ريال
    bronze = "bronze"     # 30-100 ريال


class InfluencerStatus(str, enum.Enum):
    """حالات المشاهير"""
    new = "new"
    contacted = "contacted"
    negotiating = "negotiating"
    contracted = "contracted"
    ended = "ended"


# =====================
# Models - الجداول
# =====================

class User(Base):
    """جدول المستخدمين"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.employee)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    projects_owned = relationship("Project", back_populates="owner")
    tasks_assigned = relationship("Task", back_populates="assignee")
    tasks_created = relationship("Task", foreign_keys="Task.created_by", back_populates="creator")
    points_log = relationship("PointsLog", back_populates="user")
    donations_managed = relationship("Donation", back_populates="manager")


class Project(Base):
    """جدول المشاريع"""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_revenue = Column(Float, default=0.0)
    actual_revenue = Column(Float, default=0.0)
    expenses = Column(Float, default=0.0)
    roi = Column(Float, default=0.0)  # العائد على الاستثمار
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    owner = relationship("User", back_populates="projects_owned")
    tasks = relationship("Task", back_populates="project")


class Task(Base):
    """جدول المهام"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    priority = Column(Enum(TaskPriority), default=TaskPriority.medium)
    status = Column(Enum(TaskStatus), default=TaskStatus.pending)
    points = Column(Integer, default=10)
    revenue = Column(Float, default=0.0)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="tasks_assigned")
    creator = relationship("User", foreign_keys=[created_by], back_populates="tasks_created")


class Donor(Base):
    """جدول المتبرعين"""
    __tablename__ = "donors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True)
    email = Column(String, nullable=True)
    category = Column(Enum(DonorCategory), default=DonorCategory.bronze)
    total_donations = Column(Float, default=0.0)
    last_donation_date = Column(DateTime, nullable=True)
    last_contact_date = Column(DateTime, nullable=True)
    next_followup_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    donations = relationship("Donation", back_populates="donor")


class Donation(Base):
    """جدول التبرعات"""
    __tablename__ = "donations"
    
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id"), nullable=False)
    amount = Column(Float, nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    managed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    payment_method = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # العلاقات
    donor = relationship("Donor", back_populates="donations")
    manager = relationship("User", back_populates="donations_managed")


class Influencer(Base):
    """جدول المشاهير"""
    __tablename__ = "influencers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    platform = Column(String, nullable=False)  # تويتر، انستقرام، تيك توك، سناب شات
    username = Column(String, nullable=True)
    followers_count = Column(Integer, default=0)
    category = Column(String, nullable=True)  # التخصص
    status = Column(Enum(InfluencerStatus), default=InfluencerStatus.new)
    agreed_amount = Column(Float, default=0.0)
    actual_revenue = Column(Float, default=0.0)
    conversion_rate = Column(Float, default=0.0)
    last_contact_date = Column(DateTime, nullable=True)
    contract_start = Column(DateTime, nullable=True)
    contract_end = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PointsLog(Base):
    """سجل النقاط (Gamification)"""
    __tablename__ = "points_log"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    points = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # العلاقات
    user = relationship("User", back_populates="points_log")


# =====================
# إنشاء الجداول
# =====================

def init_db():
    """إنشاء جميع الجداول"""
    Base.metadata.create_all(bind=engine)
    print("✅ تم إنشاء جميع الجداول بنجاح!")


def drop_all():
    """حذف جميع الجداول (للتطوير فقط)"""
    Base.metadata.drop_all(bind=engine)
    print("⚠️ تم حذف جميع الجداول!")


if __name__ == "__main__":
    print("🔧 إنشاء قاعدة البيانات...")
    init_db()
    print(f"📁 مسار القاعدة: {DB_PATH}")
