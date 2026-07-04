from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.endpoints import operations, ai
from backend.database import models
from backend.database.session import engine

# Создание недостающих таблиц (Временное)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL фронта
    allow_credentials=True,
    allow_methods=["*"],  # Разрешены все методы (GET, POST, DELETE и т.д.)
    allow_headers=["*"],  # Разрешены все заголовки
)

# Routers
app.include_router(operations.router)
app.include_router(ai.router)


# Проверка состояния API
@app.get("/api/health", tags=["debug"])
async def health_check():
    return {"working": "true"}
