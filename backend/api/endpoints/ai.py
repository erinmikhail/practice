"""
Эндпоинты для импорта операций через AI-агента.

"""

import tempfile
import os
import logging

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.session import get_db
from services.text_AI import process_user_text
from services.OCR_AI import process_image

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/import", tags=["AI import"])


class TextImportRequest(BaseModel):
    text: str


@router.post("/text")
def import_from_text(payload: TextImportRequest, db: Session = Depends(get_db)):
    """
    Принимает произвольный текст (например, текст push-уведомления банка),
    прогоняет его через скрипт Даниила и возвращает массив черновиков операций
    для предпросмотра на фронте. Ничего не пишет в базу — сохранение
    происходит отдельным шагом после подтверждения пользователем.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text field is empty")

    try:
        drafts = process_user_text(payload.text)
    except Exception:
        logger.exception("process_user_text failed")
        raise HTTPException(
            status_code=502, detail="Сервис временно недоступен")

    return drafts


@router.post("/image")
def import_from_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Принимает картинку (скриншот из банковского приложения) через multipart/form-data,
    сохраняет во временный файл, передаёт в OCR/GigaChat пайплайн Даниила
    и возвращает массив черновиков операций. Временный файл гарантированно
    удаляется в блоке finally независимо от результата.
    """
    allowed_types = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    suffix = os.path.splitext(file.filename or "")[1] or ".png"
    tmp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(file.file.read())
            tmp_path = tmp.name

        drafts = process_image(tmp_path)
    except HTTPException:
        raise
    except Exception:
        logger.exception("process_image failed")
        raise HTTPException(
            status_code=502, detail="Сервис временно недоступен")
    finally:
        # удаляем временный файл в любом случае: и при успехе, и при ошибке
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
        file.file.close()

    return drafts
