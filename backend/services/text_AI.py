import os
import re
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from gigachat import GigaChat
import dateparser

load_dotenv()

# === КАТЕГОРИИ (латиница для фронта) ===
CATEGORIES = {
    "groceries": ["продукты", "супермаркеты", "магазин"],
    "transport": ["транспорт", "такси", "метро", "автобус", "uber", "яндекс го"],
    "cafe": ["кафе", "ресторан", "кофейня", "столовая", "elbrus"],
    "entertainment": ["развлечения", "кино", "театр", "концерт", "игры"],
    "health": ["здоровье", "аптека", "страх", "доктор", "спорт"],
    "transfers": ["переводы", "перевод", "комиссия"],
    "salary": ["зарплата", "аванс", "премия", "доход"],
    "other": ["другое", "прочее", "разное"]
}

CATEGORIES_KEYS = list(CATEGORIES.keys())
CATEGORIES_RU = [ru for sublist in CATEGORIES.values() for ru in sublist]

def normalize_date(date_str):
    if not date_str or date_str == "null":
        return None
    dt = dateparser.parse(date_str, languages=['ru'])
    if dt:
        return dt.date().strftime('%Y-%m-%d')
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date().strftime('%Y-%m-%d')
    except:
        return None

def process_user_text(user_input):
    current_date = datetime.now().date()
    today_str = current_date.strftime('%Y-%m-%d')
    yesterday_str = (current_date - timedelta(days=1)).strftime('%Y-%m-%d')
    categories_str = ", ".join(CATEGORIES_KEYS)

    # Определяем, одна строка или несколько
    lines = [line.strip() for line in user_input.splitlines() if line.strip()]
    is_bulk = len(lines) > 1

    if is_bulk:
        instruction = f"""
Текущая дата: {today_str}. Если в тексте сказано «сегодня» — дата {today_str}, если «вчера» — {yesterday_str}.

Ты — финансовый ассистент. Извлеки информацию о ВСЕХ финансовых операциях из текста пользователя.
Каждая строка — отдельная операция.
Для каждой операции определи:
- сумму (число, без валюты)
- дату (в формате ГГГГ-ММ-ДД, если не указана — используй сегодняшнюю: {today_str})
- тип (income или expense)
- категорию из списка: {categories_str}
- комментарий (краткое описание)

Верни ответ строго в формате JSON-массива, где каждый элемент — объект с полями: amount, date, type, category, comment.
Категорию возвращай ТОЛЬКО из списка: {categories_str}.
Не добавляй пояснений, только JSON.

Текст пользователя (каждая строка — отдельная операция):
{user_input}
"""
    else:
        instruction = f"""
Текущая дата: {today_str}. Если в тексте сказано «сегодня» — дата {today_str}, если «вчера» — {yesterday_str}.

Ты — финансовый ассистент. Извлеки информацию об ОДНОЙ финансовой операции из текста пользователя.
Определи:
- сумму (число, без валюты)
- дату (в формате ГГГГ-ММ-ДД, если не указана — используй сегодняшнюю: {today_str})
- тип (income или expense)
- категорию из списка: {categories_str}
- комментарий (краткое описание)

Верни ответ строго в формате JSON-массива (даже если операция одна), где каждый элемент — объект с полями: amount, date, type, category, comment.
Категорию возвращай ТОЛЬКО из списка: {categories_str}.
Не добавляй пояснений, только JSON.

Текст пользователя:
{user_input}
"""

    try:
        with GigaChat(
            credentials=os.getenv("GIGACHAT_AUTH_KEY"),
            verify_ssl_certs=False,
            auth_data={"grant_type": "api_key", "scope": "GIGACHAT_API_PERS"}
        ) as giga:
            response = giga.chat(instruction)
            raw = response.choices[0].message.content.strip()
            json_match = re.search(r'\[.*\]', raw, re.DOTALL)
            if json_match:
                transactions = json.loads(json_match.group())
                for t in transactions:
                    if 'date' in t:
                        t['date'] = normalize_date(t['date'])
                    if not t.get('date'):
                        t['date'] = today_str
                    if t.get('category') not in CATEGORIES_KEYS:
                        t['category'] = 'other'
                    if 'amount' in t and t['amount'] is not None:
                        t['amount'] = float(t['amount'])
                return transactions
            else:
                return []
    except Exception as e:
        print(f"Ошибка GigaChat: {e}")
        return []

if __name__ == '__main__':
    # Тестирование: одна строка
    print("=== ОДНА СТРОКА ===")
    result = process_user_text("купил кофе 250р")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    
    # Тестирование: несколько строк
    print("\n=== НЕСКОЛЬКО СТРОК ===")
    text = """купил кофе 250р
зарплата 50000р сегодня
оплатил такси 800р вчера
перевод маме 3000р 28 июня"""
    result = process_user_text(text)
    print(json.dumps(result, ensure_ascii=False, indent=2))