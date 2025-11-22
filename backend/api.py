"""
Backend API لنظام Tawq
RESTful API باستخدام FastAPI
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime, date
import uvicorn

from database import (
    get_db, init_db, 
    User, Project, Task, Donor, Donation, Influencer, PointsLog,
    UserRole, TaskPriority, TaskStatus, DonorCategory, InfluencerStatus
)

# إنشاء التطبيق
app = FastAPI(
    title="Tawq API",
    description="نظام إدارة الأداء في التسويق الخيري",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# إعدادات CORS للسماح بالاتصال من Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # في الإنتاج: حدد النطاقات المسموحة
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================
# Pydantic Models (Schemas)
# =====================

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: str
    role: UserRole = UserRole.employee

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: int
    assigned_to: int
    priority: TaskPriority = TaskPriority.medium
    status: TaskStatus = TaskStatus.pending
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    revenue: Optional[float] = None
    due_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: int
    created_by: int
    points: int
    revenue: float
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Project Schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    target_revenue: float = 0.0

class ProjectCreate(ProjectBase):
    owner_id: int

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_revenue: Optional[float] = None
    expenses: Optional[float] = None
    is_active: Optional[bool] = None

class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    actual_revenue: float
    expenses: float
    roi: float
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Donor Schemas
class DonorBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    category: DonorCategory = DonorCategory.bronze

class DonorCreate(DonorBase):
    pass

class DonorUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    category: Optional[DonorCategory] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class DonorResponse(DonorBase):
    id: int
    total_donations: float
    last_donation_date: Optional[datetime]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Influencer Schemas
class InfluencerBase(BaseModel):
    name: str
    platform: str
    username: Optional[str] = None
    followers_count: int = 0
    category: Optional[str] = None

class InfluencerCreate(InfluencerBase):
    pass

class InfluencerUpdate(BaseModel):
    name: Optional[str] = None
    platform: Optional[str] = None
    followers_count: Optional[int] = None
    status: Optional[InfluencerStatus] = None
    agreed_amount: Optional[float] = None
    notes: Optional[str] = None

class InfluencerResponse(InfluencerBase):
    id: int
    status: InfluencerStatus
    agreed_amount: float
    actual_revenue: float
    created_at: datetime
    
    class Config:
        from_attributes = True


# =====================
# API Endpoints
# =====================

@app.on_event("startup")
async def startup_event():
    """تشغيل عند بدء التطبيق"""
    init_db()
    print("✅ API Server Started!")


@app.get("/")
async def root():
    """الصفحة الرئيسية"""
    return {
        "message": "Tawq API - نظام إدارة الأداء في التسويق الخيري",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


@app.get("/health")
async def health_check():
    """فحص صحة الخادم"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}


# ==================== TASKS ====================

@app.post("/api/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate, current_user_id: int = 1, db: Session = Depends(get_db)):
    """إنشاء مهمة جديدة"""
    db_task = Task(
        **task.dict(),
        created_by=current_user_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@app.get("/api/tasks", response_model=List[TaskResponse])
async def get_tasks(
    skip: int = 0,
    limit: int = 100,
    project_id: Optional[int] = None,
    assigned_to: Optional[int] = None,
    status: Optional[TaskStatus] = None,
    db: Session = Depends(get_db)
):
    """الحصول على قائمة المهام"""
    query = db.query(Task)
    
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if assigned_to:
        query = query.filter(Task.assigned_to == assigned_to)
    if status:
        query = query.filter(Task.status == status)
    
    tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    return tasks


@app.get("/api/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    """الحصول على مهمة واحدة"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="المهمة غير موجودة")
    return task


@app.put("/api/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """تحديث مهمة"""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="المهمة غير موجودة")
    
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db_task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    return db_task


@app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    """حذف مهمة"""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="المهمة غير موجودة")
    
    db.delete(db_task)
    db.commit()
    return None


# ==================== PROJECTS ====================

@app.post("/api/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """إنشاء مشروع جديد"""
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@app.get("/api/projects", response_model=List[ProjectResponse])
async def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """الحصول على قائمة المشاريع"""
    projects = db.query(Project).order_by(Project.created_at.desc()).offset(skip).limit(limit).all()
    return projects


@app.get("/api/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """الحصول على مشروع واحد"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="المشروع غير موجود")
    return project


@app.put("/api/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, project_update: ProjectUpdate, db: Session = Depends(get_db)):
    """تحديث مشروع"""
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="المشروع غير موجود")
    
    update_data = project_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)
    
    # حساب ROI
    if db_project.expenses > 0:
        db_project.roi = ((db_project.actual_revenue - db_project.expenses) / db_project.expenses) * 100
    
    db_project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_project)
    return db_project


@app.delete("/api/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    """حذف مشروع"""
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="المشروع غير موجود")
    
    db.delete(db_project)
    db.commit()
    return None


# ==================== DONORS ====================

@app.post("/api/donors", response_model=DonorResponse, status_code=status.HTTP_201_CREATED)
async def create_donor(donor: DonorCreate, db: Session = Depends(get_db)):
    """إضافة متبرع جديد"""
    db_donor = Donor(**donor.dict())
    db.add(db_donor)
    db.commit()
    db.refresh(db_donor)
    return db_donor


@app.get("/api/donors", response_model=List[DonorResponse])
async def get_donors(
    skip: int = 0,
    limit: int = 100,
    category: Optional[DonorCategory] = None,
    db: Session = Depends(get_db)
):
    """الحصول على قائمة المتبرعين"""
    query = db.query(Donor)
    
    if category:
        query = query.filter(Donor.category == category)
    
    donors = query.order_by(Donor.total_donations.desc()).offset(skip).limit(limit).all()
    return donors


@app.get("/api/donors/{donor_id}", response_model=DonorResponse)
async def get_donor(donor_id: int, db: Session = Depends(get_db)):
    """الحصول على متبرع واحد"""
    donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="المتبرع غير موجود")
    return donor


@app.put("/api/donors/{donor_id}", response_model=DonorResponse)
async def update_donor(donor_id: int, donor_update: DonorUpdate, db: Session = Depends(get_db)):
    """تحديث بيانات متبرع"""
    db_donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if not db_donor:
        raise HTTPException(status_code=404, detail="المتبرع غير موجود")
    
    update_data = donor_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_donor, field, value)
    
    db_donor.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_donor)
    return db_donor


@app.delete("/api/donors/{donor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_donor(donor_id: int, db: Session = Depends(get_db)):
    """حذف متبرع"""
    db_donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if not db_donor:
        raise HTTPException(status_code=404, detail="المتبرع غير موجود")
    
    db.delete(db_donor)
    db.commit()
    return None


# ==================== INFLUENCERS ====================

@app.post("/api/influencers", response_model=InfluencerResponse, status_code=status.HTTP_201_CREATED)
async def create_influencer(influencer: InfluencerCreate, db: Session = Depends(get_db)):
    """إضافة مشهور جديد"""
    db_influencer = Influencer(**influencer.dict())
    db.add(db_influencer)
    db.commit()
    db.refresh(db_influencer)
    return db_influencer


@app.get("/api/influencers", response_model=List[InfluencerResponse])
async def get_influencers(
    skip: int = 0,
    limit: int = 100,
    platform: Optional[str] = None,
    status: Optional[InfluencerStatus] = None,
    db: Session = Depends(get_db)
):
    """الحصول على قائمة المشاهير"""
    query = db.query(Influencer)
    
    if platform:
        query = query.filter(Influencer.platform == platform)
    if status:
        query = query.filter(Influencer.status == status)
    
    influencers = query.order_by(Influencer.followers_count.desc()).offset(skip).limit(limit).all()
    return influencers


@app.get("/api/influencers/{influencer_id}", response_model=InfluencerResponse)
async def get_influencer(influencer_id: int, db: Session = Depends(get_db)):
    """الحصول على مشهور واحد"""
    influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="المشهور غير موجود")
    return influencer


@app.put("/api/influencers/{influencer_id}", response_model=InfluencerResponse)
async def update_influencer(influencer_id: int, influencer_update: InfluencerUpdate, db: Session = Depends(get_db)):
    """تحديث بيانات مشهور"""
    db_influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if not db_influencer:
        raise HTTPException(status_code=404, detail="المشهور غير موجود")
    
    update_data = influencer_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_influencer, field, value)
    
    db_influencer.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_influencer)
    return db_influencer


@app.delete("/api/influencers/{influencer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_influencer(influencer_id: int, db: Session = Depends(get_db)):
    """حذف مشهور"""
    db_influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if not db_influencer:
        raise HTTPException(status_code=404, detail="المشهور غير موجود")
    
    db.delete(db_influencer)
    db.commit()
    return None


# ==================== STATISTICS ====================

@app.get("/api/stats/dashboard")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """إحصائيات لوحة التحكم"""
    total_tasks = db.query(Task).count()
    completed_tasks = db.query(Task).filter(Task.status == TaskStatus.completed).count()
    total_projects = db.query(Project).count()
    active_projects = db.query(Project).filter(Project.is_active == True).count()
    total_donors = db.query(Donor).count()
    total_revenue = db.query(Project).with_entities(Project.actual_revenue).all()
    
    return {
        "tasks": {
            "total": total_tasks,
            "completed": completed_tasks,
            "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        },
        "projects": {
            "total": total_projects,
            "active": active_projects
        },
        "donors": {
            "total": total_donors
        },
        "revenue": {
            "total": sum([r[0] for r in total_revenue if r[0]])
        }
    }


# ==================== تشغيل الخادم ====================

if __name__ == "__main__":
    print("🚀 Starting Tawq API Server...")
    print("📖 Documentation: http://localhost:8000/api/docs")
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
