from fastapi import APIRouter, Query, Path, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Annotated

from backend.database.session import get_db
from backend.database import crud
from backend.api import schemas

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("/", response_model=List[schemas.OperationResponse])
async def get_transactions(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(gt=0)] = 100,
    db: Session = Depends(get_db)
):
    """
    Получить список всех транзакций пользователя.

    - **skip**: Количество пропускаемых записей
    - **limit**: Максимальное количество возвращаемых записей
    """
    # Используем user_id=1 как заглушку для текущего пользователя
    transactions = crud.get_user_operations(
        db, user_id=1, skip=skip, limit=limit)
    return transactions


@router.post(
    "/",
    response_model=schemas.OperationResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_transaction(
    operation: schemas.OperationCreate,
    db: Session = Depends(get_db)
):
    """
    Создать новую транзакцию.

    - **amount**: Сумма операции (положительное число)
    - **type**: Тип операции ("income", "expense")
    - **category**: Категория ("groceries", "transport", "cafe", "entertainment", "health", "transfers", "salary", "other")
    - **date**: Дата в формате YYYY-MM-DD
    - **comment**: Комментарий (опционально)
    """
    # Заглушка user_id=1
    new_transaction = crud.create_operation(db, operation, user_id=1)
    return new_transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: Annotated[int, Path(gt=0)],
    db: Session = Depends(get_db)
):
    """
    Удалить транзакцию по ID.

    - **transaction_id**: ID транзакции для удаления
    """
    # Заглушка user_id=1
    deleted = crud.delete_operation(db, transaction_id, user_id=1)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with id {transaction_id} not found"
        )

    return None
