import os
import re
import json
import pytesseract
from PIL import Image, ImageOps, ImageEnhance, ImageStat
from datetime import datetime, timedelta
from dotenv import load_dotenv
from gigachat import GigaChat
import dateparser

load_dotenv()


pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'

# === ДОПУСТИМЫЕ КАТЕГОРИИ ===
ALLOWED_CATEGORIES = [
    "groceries", "transport", "cafe", "entertainment",
    "health", "transfers", "salary", "other"
]

# === СИСТЕМНЫЙ ПРОМПТ ===
SYSTEM_PROMPT = f"""
Ты — строгий парсер финансовых операций.

Твоя задача — извлекать из текста только реальные финансовые операции и возвращать их в виде JSON-массива.

ЖЁСТКИЕ ПРАВИЛА:
1. НЕ используй Markdown, НЕ ставь обратные кавычки, НЕ пиши "json".
2. НЕ добавляй пояснения, приветствия, "Вот ваш JSON" или любой другой текст.
3. Возвращай ТОЛЬКО чистый JSON-массив.
4. Категорию выбирай ТОЛЬКО из этого списка: {', '.join(ALLOWED_CATEGORIES)}.
5. Если категорию невозможно определить — ставь "other".
6. Если дата не указана — используй сегодняшнюю дату (в формате ГГГГ-ММ-ДД).
7. Сумму указывай числом (float), без валюты и знака.
8. Тип операции: "income" (доход) или "expense" (расход).
9. Если в тексте несколько операций — верни массив объектов. Если одна — массив с одним объектом.

10. КРИТЕРИИ ОПЕРАЦИИ:
    - В строке ДОЛЖНО БЫТЬ название магазина, получателя, отправителя или описание перевода.
    - Если строка содержит валидное название (например, "Магнит", "Elbrus", "Да!", "SPAR", "Плата за Программу страх", "Самокаты - Яндекс Go") и сумму — это операция.
    - Строки, состоящие ТОЛЬКО из цифр и букв валюты (например, "49 920,15 Р" или "123 Р"), без названия — ИГНОРИРУЙ.

11. ОСОБЫЕ СЛУЧАИ (обязательно распознавай):
    - Переводы между своими счетами: строка содержит "перевод", "между счетами", "переводы", "накопительный" → category = "transfers", type = "expense"
    - Пополнения: строка содержит "пополнение", "зачисление", "поступление" тогда type = "income"
    - Зарплата: строка содержит "зарплата", "аванс", "премия" тогда category = "salary", type = "income"

ПРИМЕРЫ ПРАВИЛЬНЫХ ОТВЕТОВ:
[{{"amount": 250.0, "date": "2026-07-02", "type": "expense", "category": "cafe", "comment": "кофе"}}]
[{{"amount": 300.0, "date": "2026-07-02", "type": "expense", "category": "transfers", "comment": "Между своими счетами"}}]
[{{"amount": 52995.0, "date": "2026-07-02", "type": "income", "category": "salary", "comment": "зарплата"}}]

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


def clean_json_response(raw_response):
    raw_response = raw_response.replace('“', '"').replace('”', '"')
    raw_response = raw_response.replace('‘', "'").replace('’', "'")
    raw_response = re.sub(
        r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', raw_response)
    raw_response = raw_response.strip()
    match = re.search(r'\[.*\]', raw_response, re.DOTALL)
    if match:
        return match.group()
    match = re.search(r'\{.*\}', raw_response, re.DOTALL)
    if match:
        return match.group()
    return "[]"


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

    full_prompt = f"""
{SYSTEM_PROMPT}

Текущая дата: {today_str}. Если в тексте сказано «сегодня» — дата {today_str}, если «вчера» — {yesterday_str}.

Текст для парсинга:
{raw_text}
"""

    try:
        with GigaChat(
            credentials=os.getenv("GIGACHAT_AUTH_KEY"),
            verify_ssl_certs=False,
            auth_data={"grant_type": "api_key", "scope": "GIGACHAT_API_PERS"}
        ) as giga:
            response = giga.chat(full_prompt)
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

            operations = [op for op in operations if is_valid_operation(op)]
            return operations

    except json.JSONDecodeError as e:
        print(f"Ошибка парсинга JSON: {e}")
        raise RuntimeError(f"GigaChat вернул невалидный JSON: {e}")
    except Exception as e:
        print(f"Ошибка GigaChat: {e}")
        raise RuntimeError(f"Ошибка при обращении к GigaChat: {e}")


def process_image(image_path):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Файл не найден: {image_path}")

    image = Image.open(image_path)

    # 1. Переводим в оттенки серого
    gray_image = image.convert('L')

    stat = ImageStat.Stat(gray_image)
    avg_brightness = stat.mean[0]

    if avg_brightness < 127:
        prepared_image = ImageOps.invert(gray_image)

    else:
        prepared_image = gray_image

    # 3. Повышаем контрастность текста
    enhancer = ImageEnhance.Contrast(prepared_image)
    contrast_image = enhancer.enhance(2.0)

    # 4. Увеличиваем разрешение в 2 раза
    width, height = contrast_image.size
    final_image = contrast_image.resize(
        (width * 2, height * 2), Image.Resampling.LANCZOS)

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
        print(f"Ошибка: {e}")
        raise
