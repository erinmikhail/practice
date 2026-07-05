"""
Базовая безопасность: регистрация, логин и обработка ошибок авторизации.

Коды ошибок:
  400 — логин уже занят
  404 — пользователя не существует
  401 — пользователь есть, пароль неверный
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.database import crud
from backend.api import schemas
from backend.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=schemas.Token,
    status_code=status.HTTP_201_CREATED,
)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # consent_given уже провалидирован в schemas.UserCreate
    existing = crud.get_user_by_username(db, user.username)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(user.password)
    new_user = crud.create_user(db, user=user, password_hash=hashed)

    access_token = create_access_token(new_user.id)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post(
    "/login",
    response_model=schemas.Token
)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, credentials.username)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    access_token = create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}
