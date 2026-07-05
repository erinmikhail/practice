from fastapi import APIRouter, Query, Path, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Annotated

from backend.database.session import get_db
from backend.database import crud
from backend.api import schemas
from backend.core.security import get_current_user

router = APIRouter(prefix="/api/operations", tags=["operations"])


@router.get("/", response_model=List[schemas.OperationResponse])
async def get_operations(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(gt=0)] = 100,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    """
    Получить список всех операций пользователя.

    - **skip**: Количество пропускаемых записей
    - **limit**: Максимальное количество возвращаемых записей
    """
    operations = crud.get_user_operations(
        db, user_id=user_id, skip=skip, limit=limit)
    return operations


@router.post(
    "/",
    response_model=schemas.OperationResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_operation(
    operation: schemas.OperationCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    """
    Создать новую операцию.

    - **amount**: Сумма операции (положительное число)
    - **type**: Тип операции ("income", "expense")
    - **category**: Категория ("groceries", "transport", "cafe", "entertainment", "health", "transfers", "salary", "other")
    - **date**: Дата в формате YYYY-MM-DD
    - **comment**: Комментарий (опционально)
    """
    new_operation = crud.create_operation(db, operation, user_id=user_id)
    return new_operation


@router.delete("/{operation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_operation(
    operation_id: Annotated[int, Path(gt=0)],
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    """
    Удалить операцию по ID.

    - **operation_id**: ID операции для удаления
    """
    deleted_operation = crud.delete_operation(
        db, operation_id, user_id=user_id)

    if not deleted_operation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"operation with id {operation_id} not found"
        )

    return None
