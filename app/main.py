from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import init_db
from .routers import analytics, auth, projects, tasks, users

init_db()

app = FastAPI(title="Tawq Impact Platform")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Tawq Impact Platform API"}
