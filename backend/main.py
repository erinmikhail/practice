from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.endpoints import ai  # ← Только ваш роутер
from database import models
from database.session import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router)  # ← Только ваш роутер


@app.get("/api/health", tags=["debug"])
async def health_check():
    return {"working": "true"}
