import os
import re
import json
import pytesseract
from PIL import Image
from datetime import datetime, timedelta
from dotenv import load_dotenv
from gigachat import GigaChat
import dateparser

load_dotenv()
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

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

def extract_transactions_with_gigachat(raw_text):
    current_date = datetime.now().date()
    today_str = current_date.strftime('%Y-%m-%d')
    yesterday_str = (current_date - timedelta(days=1)).strftime('%Y-%m-%d')
    categories_str = ", ".join(CATEGORIES_KEYS)

    prompt = f"""
Текущая дата: {today_str}. Если в тексте сказано «сегодня» — дата {today_str}, если «вчера» — {yesterday_str}.

Ты — финансовый ассистент. Извлеки все транзакции из текста ниже.
Для каждой транзакции определи:
- сумму (число, без валюты)
- дату (в формате ГГГГ-ММ-ДД, если год не указан — используй текущий год)
- тип (income или expense)
- категорию из списка: {categories_str}
- комментарий (краткое описание)

Верни ответ строго в формате JSON-массива, где каждый элемент — объект с полями: amount, date, type, category, comment.
Категорию возвращай ТОЛЬКО из списка: {categories_str}.
Не добавляй пояснений, только JSON.

Текст:
{raw_text}
"""
    try:
        with GigaChat(
            credentials=os.getenv("GIGACHAT_AUTH_KEY"),
            verify_ssl_certs=False,
            auth_data={"grant_type": "api_key", "scope": "GIGACHAT_API_PERS"}
        ) as giga:
            response = giga.chat(prompt)
            raw = response.choices[0].message.content.strip()
            json_match = re.search(r'\[.*\]', raw, re.DOTALL)
            if json_match:
                transactions = json.loads(json_match.group())
                for t in transactions:
                    if 'date' in t:
                        t['date'] = normalize_date(t['date'])
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

def process_image(image_path):
    image = Image.open(image_path)
    raw_text = pytesseract.image_to_string(image, lang='rus+eng')
    print("=== OCR TEXT ===")
    print(raw_text)
    print("================")
    transactions = extract_transactions_with_gigachat(raw_text)
    print(f"Найдено {len(transactions)} транзакций")
    return transactions

if __name__ == '__main__':
    path = r'c:\Users\murze\Downloads\Telegram Desktop\photo_2026-06-29_19-23-08.jpg'
    result = process_image(path)
    print("\n=== ИТОГОВЫЕ ТРАНЗАКЦИИ ===")
    for i, t in enumerate(result, 1):
        print(f"{i}. {t}")
    print("============================")