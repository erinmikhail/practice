from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import calendar
from datetime import date as dt_date, timedelta

from . import models
from backend.api import schemas

# ВЫЧИСЛЕНИЯ И ЛОГИКА РЕГУЛЯРНЫХ ПЛАТЕЖЕЙ


def add_months(current_date: dt_date, months: int) -> dt_date:
    """Умный сдвиг месяцев, чтобы 31 января корректно переходило в 28 февраля"""
    month = current_date.month - 1 + months
    year = current_date.year + month // 12
    month = month % 12 + 1
    day = min(current_date.day, calendar.monthrange(year, month)[1])
    return current_date.replace(year=year, month=month, day=day)


def process_due_recurring_operations(db: Session, user_id: int):
    """Проверяет все подписки и автоматически начисляет операции, если подошла дата"""
    today = dt_date.today()

    due_operations = db.query(models.RecurringOperation).filter(
        models.RecurringOperation.user_id == user_id,
        models.RecurringOperation.next_date <= today
    ).all()

    for rop in due_operations:
        while rop.next_date <= today:
            # Создаем реальную запись в таблице обычных операций
            new_op = models.Operation(
                user_id=user_id,
                amount=rop.amount,
                type=rop.type,
                category=rop.category,
                date=rop.next_date,
                comment=f"{rop.comment} (Автоплатеж)" if rop.comment else "Автоплатеж"
            )
            db.add(new_op)

            # Вычисляем следующую дату списания
            if rop.frequency == 'daily':
                rop.next_date += timedelta(days=1)
            elif rop.frequency == 'weekly':
                rop.next_date += timedelta(weeks=1)
            elif rop.frequency == 'monthly':
                rop.next_date = add_months(rop.next_date, 1)
            elif rop.frequency == 'annually':
                rop.next_date = add_months(rop.next_date, 12)
            else:
                rop.next_date += timedelta(days=30)

    db.commit()


def get_analytics(db: Session, user_id: int):
    """Группирует операции пользователя по месяцам для графиков"""
    operations = get_user_operations(db, user_id, skip=0, limit=10000)

    analytics_map = {}
    for op in operations:
        month_str = op.date.strftime("%Y-%m")
        if month_str not in analytics_map:
            analytics_map[month_str] = {
                "month": month_str, "income": 0.0, "expense": 0.0}

        if op.type == "income":
            analytics_map[month_str]["income"] += op.amount
        else:
            analytics_map[month_str]["expense"] += op.amount

    return sorted(list(analytics_map.values()), key=lambda x: x["month"])


# CRUD ОПЕРАЦИЙ

def get_user_operations(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Operation).filter(models.Operation.user_id == user_id).order_by(models.Operation.date.desc()).offset(skip).limit(limit).all()


def create_operation(db: Session, operation: schemas.OperationCreate, user_id: int):
    db_operation = models.Operation(
        user_id=user_id, amount=operation.amount, type=operation.type,
        category=operation.category, date=operation.date, comment=operation.comment
    )
    db.add(db_operation)
    db.commit()
    db.refresh(db_operation)
    return db_operation


def create_operations_batch(db: Session, operations: List[schemas.OperationCreate], user_id: int):
    db_operations = [
        models.Operation(
            user_id=user_id, amount=op.amount, type=op.type,
            category=op.category, date=op.date, comment=op.comment
        ) for op in operations
    ]
    db.bulk_save_objects(db_operations)
    db.commit()
    return len(db_operations)


def delete_operation(db: Session, operation_id: int, user_id: int):
    db_operation = db.query(models.Operation).filter(
        models.Operation.id == operation_id, models.Operation.user_id == user_id).first()
    if db_operation:
        db.delete(db_operation)
        db.commit()
        return True
    return False


def get_finance_summary(db: Session, user_id: int):
    income = db.query(func.sum(models.Operation.amount)).filter(
        models.Operation.user_id == user_id, models.Operation.type == "income").scalar() or 0.0
    expense = db.query(func.sum(models.Operation.amount)).filter(
        models.Operation.user_id == user_id, models.Operation.type == "expense").scalar() or 0.0
    return {"total_income": income, "total_expense": expense, "balance": income - expense}

# CRUD РЕГУЛЯРНЫХ ОПЕРАЦИЙ


def get_recurring_operations(db: Session, user_id: int):
    return db.query(models.RecurringOperation).filter(models.RecurringOperation.user_id == user_id).all()


def create_recurring_operation(db: Session, operation: schemas.RecurringOperationCreate, user_id: int):
    db_operation = models.RecurringOperation(
        user_id=user_id, amount=operation.amount, type=operation.type,
        category=operation.category, frequency=operation.frequency,
        next_date=operation.next_date, comment=operation.comment
    )
    db.add(db_operation)
    db.commit()
    db.refresh(db_operation)
    return db_operation


def delete_recurring_operation(db: Session, operation_id: int, user_id: int):
    db_operation = db.query(models.RecurringOperation).filter(
        models.RecurringOperation.id == operation_id, models.RecurringOperation.user_id == user_id).first()
    if db_operation:
        db.delete(db_operation)
        db.commit()
        return True
    return False

# CRUD ПОЛЬЗОВАТЕЛЕЙ


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def create_user(db: Session, user: schemas.UserCreate, password_hash: str):
    db_user = models.User(
        username=user.username,
        password_hash=password_hash,
        consent_given=user.consent_given
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
