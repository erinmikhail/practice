import time
import os
import re
import json
import pytesseract
from PIL import Image, ImageOps, ImageEnhance, ImageStat
from datetime import datetime, timedelta
from dotenv import load_dotenv
from gigachat import GigaChat
from gigachat.models import Chat, Messages, MessagesRole
import dateparser

load_dotenv()


ALLOWED_CATEGORIES = [
    "groceries", "transport", "cafe", "entertainment",
    "health", "transfers", "salary", "other"
]

SYSTEM_PROMPT = """
Ты — строгий парсер финансовых операций.

Твоя задача — извлекать из текста только реальные финансовые операции и возвращать их в виде JSON-массива.

ПРАВИЛА ОТВЕТА (НАРУШЕНИЕ ЛЮБОГО ПРАВИЛА = ОТВЕТ ОТВЕРГНУТ):

1. ОТВЕТ — ТОЛЬКО JSON-массив. НИКАКОГО текста до, после или внутри ответа.
2. НЕ используй Markdown, НЕ ставь обратные кавычки, НЕ пиши "json".
3. НЕ добавляй пояснения, приветствия, "Вот ваш JSON" или любой другой текст.
4. Категорию выбирай ТОЛЬКО из списка: groceries, transport, cafe, entertainment, health, transfers, salary, other.
5. Если категорию невозможно определить — ставь "other".
6. Дата — ТОЛЬКО в формате ГГГГ-ММ-ДД. Если не указана — используй сегодняшнюю.
7. Сумма — ЧИСЛО (float), БЕЗ валюты и знака. Разделитель — точка.
8. Тип — ТОЛЬКО "income" (доход) или "expense" (расход).
9. Если несколько операций — МАССИВ объектов. Если одна — МАССИВ С ОДНИМ объектом.
10. В строке ДОЛЖНО БЫТЬ название магазина, получателя, отправителя или описание перевода.
11. Строки без названия (только числа + валюта) — ИГНОРИРУЙ.

ОСОБЫЕ СЛУЧАИ (обязательно распознавай):
- Переводы между своими счетами → category = "transfers", type = "expense"
- Пополнения → type = "income"
- Зарплата → category = "salary", type = "income"

ПРИМЕРЫ ПРАВИЛЬНЫХ ОТВЕТОВ:
[{"amount": 250.0, "date": "2026-07-02", "type": "expense", "category": "cafe", "comment": "кофе"}]
[{"amount": 300.0, "date": "2026-07-02", "type": "expense", "category": "transfers", "comment": "Между своими счетами"}]
[{"amount": 52995.0, "date": "2026-07-02", "type": "income", "category": "salary", "comment": "зарплата"}]

ЕСЛИ НАРУШИШЬ ПРАВИЛА — ТВОЙ ОТВЕТ БУДЕТ ОТВЕРГНУТ.
"""


def normalize_date(date_str):
    if not date_str or date_str == "null":
        return None
    if re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
        return date_str
    dt = dateparser.parse(date_str, languages=['ru'])
    if dt:
        return dt.date().strftime('%Y-%m-%d')
    for fmt in ['%d.%m.%Y', '%d/%m/%Y', '%d-%m-%Y']:
        try:
            return datetime.strptime(date_str, fmt).date().strftime('%Y-%m-%d')
        except:
            continue
    return None


def clean_ocr_text(text):
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    text = re.sub(r' +', ' ', text)
    return text


def clean_json_response(raw):
    raw = raw.replace('“', '"').replace('”', '"')
    raw = raw.replace('‘', "'").replace('’', "'")
    raw = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', raw)
    raw = re.sub(r'```[a-zA-Z]*\s*', '', raw)
    for start, end in (('[', ']'), ('{', '}')):
        start_idx = raw.find(start)
        if start_idx != -1:
            count = 0
            for i, ch in enumerate(raw[start_idx:], start_idx):
                if ch == start:
                    count += 1
                elif ch == end:
                    count -= 1
                    if count == 0:
                        return raw[start_idx:i+1]
    raise RuntimeError("В ответе GigaChat не найден JSON-массив или объект")


def is_valid_operation(t):
    comment = t.get('comment', '').strip()
    category = t.get('category', '')
    if not comment and category == 'other':
        return False
    if t.get('amount', 0) == 0:
        return False
    return True


def extract_operations_with_gigachat(raw_text):
    current_date = datetime.now().date()
    today_str = current_date.strftime('%Y-%m-%d')
    yesterday_str = (current_date - timedelta(days=1)).strftime('%Y-%m-%d')

    user_prompt = f"""
Текущая дата: {today_str}. Если в тексте сказано «сегодня» — дата {today_str}, если «вчера» — {yesterday_str}.

Текст для парсинга:
{raw_text}
"""

    MAX_RETRIES = 3
    DELAY = 1.5
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with GigaChat(
                credentials=os.getenv("GIGACHAT_AUTH_KEY"),
                verify_ssl_certs=False,
                auth_data={"grant_type": "api_key",
                           "scope": "GIGACHAT_API_PERS"}
            ) as giga:
                messages = [
                    Messages(role=MessagesRole.SYSTEM, content=SYSTEM_PROMPT),
                    Messages(role=MessagesRole.USER, content=user_prompt)
                ]
                chat = Chat(messages=messages)
                response = giga.chat(chat)
                raw = response.choices[0].message.content.strip()

                clean_raw = clean_json_response(raw)
                operations = json.loads(clean_raw)
                if not isinstance(operations, list):
                    operations = [operations]

                for op in operations:
                    if 'date' in op:
                        op['date'] = normalize_date(op['date'])
                    if op.get('category') not in ALLOWED_CATEGORIES:
                        op['category'] = 'other'
                    if 'amount' in op and op['amount'] is not None:
                        try:
                            op['amount'] = float(
                                str(op['amount']).replace(',', '.'))
                        except:
                            op['amount'] = 0.0

                result = [op for op in operations if is_valid_operation(op)]
                return result

        except (json.JSONDecodeError, RuntimeError, Exception) as e:
            last_error = e
            if attempt < MAX_RETRIES:
                time.sleep(DELAY)
            else:
                raise RuntimeError(
                    f"GigaChat не ответил корректно после {MAX_RETRIES} попыток: {last_error}"
                )


def process_image(image_path):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Файл не найден: {image_path}")

    image = Image.open(image_path)

    gray_image = image.convert('L')

    stat = ImageStat.Stat(gray_image)
    avg_brightness = stat.mean[0]

    if avg_brightness < 127:
        prepared_image = ImageOps.invert(gray_image)
    else:
        prepared_image = gray_image

    enhancer = ImageEnhance.Contrast(prepared_image)
    contrast_image = enhancer.enhance(2.0)

    width, height = contrast_image.size
    final_image = contrast_image.resize(
        (width * 2, height * 2), Image.Resampling.LANCZOS
    )

    raw_text = pytesseract.image_to_string(
        final_image,
        lang='rus+eng',
        config='--psm 4'
    )
    raw_text = clean_ocr_text(raw_text)

    try:
        operations = extract_operations_with_gigachat(raw_text)
        return operations
    except RuntimeError as e:
        raise
