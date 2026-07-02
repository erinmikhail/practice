from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from . import models
from backend import schemas


def get_user_operations(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Operation)\
             .filter(models.Operation.user_id == user_id)\
             .order_by(models.Operation.date.desc())\
             .offset(skip).limit(limit).all()


def create_operation(db: Session, operation: schemas.OperationCreate, user_id: int):
    db_operation = models.Operation(
        user_id=user_id,
        amount=operation.amount,
        type=operation.type,
        category=operation.category,
        date=operation.date,
        comment=operation.comment
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
        models.Operation.id == operation_id,
        models.Operation.user_id == user_id
    ).first()

    if db_operation:
        db.delete(db_operation)
        db.commit()
        return True
    return False


def get_finance_summary(db: Session, user_id: int):
    income = db.query(func.sum(models.Operation.amount))\
        .filter(models.Operation.user_id == user_id, models.Operation.type == "income").scalar() or 0.0

    expense = db.query(func.sum(models.Operation.amount))\
        .filter(models.Operation.user_id == user_id, models.Operation.type == "expense").scalar() or 0.0

    return {"total_income": income, "total_expense": expense, "balance": income - expense}
