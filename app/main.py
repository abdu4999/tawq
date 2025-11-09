from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .controllers import gather_routers
from .db import init_db

init_db()

app = FastAPI(title="Tawq Impact Platform")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in gather_routers():
    app.include_router(router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Tawq Impact Platform API"}
