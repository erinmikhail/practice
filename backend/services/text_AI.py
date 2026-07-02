import os
import re
import json
from datetime import datetime
from dotenv import load_dotenv
from gigachat import GigaChat
import dateparser

load_dotenv()

# === ДОПУСТИМЫЕ КАТЕГОРИИ ===
ALLOWED_CATEGORIES = [
    "groceries", "transport", "cafe", "entertainment",
    "health", "transfers", "salary", "other"
]

# === СИСТЕМНЫЙ ПРОМПТ ===
SYSTEM_PROMPT = f"""
Ты — строгий парсер финансовых операций. Возвращай ТОЛЬКО JSON-массив.

ПРАВИЛА:
1. Категория ТОЛЬКО из списка: {', '.join(ALLOWED_CATEGORIES)}. Если неопределена — "other".
2. Дата в формате ГГГГ-ММ-ДД. Если не указана — сегодня.
3. Сумма числом, без валюты и знака.
4. Тип: "income" (доход) или "expense" (расход).
5. В строке ДОЛЖНО БЫТЬ название магазина или описание.
6. Строки без названия (только числа + валюта) — ИГНОРИРУЙ.

ПРИМЕР: [{{"amount": 250, "date": "2026-07-02", "type": "expense", "category": "cafe", "comment": "кофе"}}]
"""


def normalize_date(date_str):
    if not date_str or date_str == "null":
        return None
    if re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
        return date_str
    dt = dateparser.parse(date_str, languages=['ru'])
    if dt:
        return dt.date().strftime('%Y-%m-%d')
    for fmt in ['%d.%m.%Y', '%d/%m/%Y']:
        try:
            return datetime.strptime(date_str, fmt).date().strftime('%Y-%m-%d')
        except:
            continue
    return None


def clean_json_response(raw):
    raw = raw.replace('“', '"').replace('”', '"')
    raw = raw.replace('‘', "'").replace('’', "'")
    raw = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', raw)
    match = re.search(r'\[.*\]', raw, re.DOTALL)
    if match:
        return match.group()
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        return match.group()
    raise RuntimeError("В ответе GigaChat не найден JSON-массив")


def is_valid_operation(op):
    comment = op.get('comment', '').strip()
    if not comment and op.get('category') == 'other':
        return False
    if op.get('amount', 0) == 0:
        return False
    return True


def clean_amount(amount):
    if amount is None:
        return 0.0
    if isinstance(amount, str):
        amount = amount.replace(',', '.')
    return float(amount)


def process_text(user_input):
    """
    Принимает текст от пользователя.
    Возвращает массив операций.
    В случае ошибки GigaChat — выбрасывает исключение.
    """
    if not user_input or not user_input.strip():
        return []

    today = datetime.now().date().strftime('%Y-%m-%d')
    prompt = f"""
{SYSTEM_PROMPT}

Текущая дата: {today}.

Текст пользователя:
{user_input}
"""
    try:
        with GigaChat(
            credentials=os.getenv("GIGACHAT_AUTH_KEY"),
            verify_ssl_certs=False,
            auth_data={"grant_type": "api_key", "scope": "GIGACHAT_API_PERS"}
        ) as giga:
            raw = giga.chat(prompt).choices[0].message.content.strip()

            clean_raw = clean_json_response(raw)
            operations = json.loads(clean_raw)
            if not isinstance(operations, list):
                operations = [operations]

            for op in operations:
                op['date'] = normalize_date(op.get('date')) or today
                if op.get('category') not in ALLOWED_CATEGORIES:
                    op['category'] = 'other'
                op['amount'] = clean_amount(op.get('amount', 0))

            return [op for op in operations if is_valid_operation(op)]

    except json.JSONDecodeError as e:
        print(f"Ошибка парсинга JSON: {e}")
        raise RuntimeError(f"GigaChat вернул невалидный JSON: {e}")
    except RuntimeError as e:
        print(f"Ошибка: {e}")
        raise
    except Exception as e:
        print(f"Ошибка GigaChat: {e}")
        raise RuntimeError(f"Ошибка при обращении к GigaChat: {e}")
