from pydantic import BaseModel, Field, field_validator
from datetime import date as dt_date
from typing import Optional

ALLOWED_CATEGORIES = [
    "groceries", "transport", "cafe", "entertainment", 
    "health", "transfers", "salary", "other"
]

# СХЕМЫ ОПЕРАЦИЙ
class OperationBase(BaseModel):
    amount: float = Field(..., gt=0, description="Сумма операции")
    type: str = Field(..., description="Тип: income или expense")
    category: str = Field(..., description="Категория на латинице")
    date: dt_date = Field(..., description="Дата")
    comment: Optional[str] = None

    @field_validator('type')
    def validate_type(cls, v):
        if v not in ['income', 'expense']:
            raise ValueError("Type must be 'income' or 'expense'")
        return v

    @field_validator('category')
    def validate_category(cls, v):
        if v not in ALLOWED_CATEGORIES:
            raise ValueError(f"Unknown category. Allowed: {', '.join(ALLOWED_CATEGORIES)}")
        return v

class OperationCreate(OperationBase): pass

class OperationResponse(OperationBase):
    id: int
    user_id: int
    class Config: from_attributes = True


# СХЕМЫ РЕГУЛЯРНЫХ ОПЕРАЦИЙ
class RecurringOperationBase(BaseModel):
    amount: float = Field(..., gt=0)
    type: str
    category: str
    frequency: str = Field(..., description="Частота: monthly, weekly, yearly")
    next_date: dt_date
    comment: Optional[str] = None

class RecurringOperationCreate(RecurringOperationBase): pass

class RecurringOperationResponse(RecurringOperationBase):
    id: int
    user_id: int
    class Config: from_attributes = True


# СХЕМЫ АВТОРИЗАЦИИ
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)
    consent_given: bool = Field(..., description="Обязательное согласие на обработку данных")

    @field_validator('consent_given')
    def check_consent(cls, v):
        if not v:
            raise ValueError("User must give consent to process data")
        return v

class UserResponse(BaseModel):
    id: int
    username: str
    class Config: from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str