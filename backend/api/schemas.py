from pydantic import BaseModel, Field, field_validator
from datetime import date as dt_date
from typing import Optional

ALLOWED_CATEGORIES = [
    "groceries", "transport", "cafe", "entertainment",
    "health", "transfers", "salary", "other"
]


class OperationBase(BaseModel):
    amount: float = Field(..., gt=0, description="Сумма операции")
    type: str = Field(..., description="Тип: income или expense")
    category: str = Field(..., description="Категория на латинице")
    date: dt_date = Field(..., description="Дата в формате YYYY-MM-DD")
    comment: Optional[str] = None

    @field_validator('type')
    def validate_type(cls, v):
        if v not in ['income', 'expense']:
            raise ValueError("Type must be 'income' or 'expense'")
        return v

    @field_validator('category')
    def validate_category(cls, v):
        if v not in ALLOWED_CATEGORIES:
            raise ValueError(
                f"Unknown category. Allowed: {', '.join(ALLOWED_CATEGORIES)}")
        return v


class OperationCreate(OperationBase):
    pass


class OperationResponse(OperationBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, description="Логин пользователя")
    password: str = Field(..., min_length=4,
                          description="Пароль (будет захеширован)")


class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
