import time
import os
import re
import json
from datetime import datetime
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

Твоя задача — извлекать из пользовательского текста все финансовые операции и возвращать их в виде JSON-массива.

ПРАВИЛА ОТВЕТА (НАРУШЕНИЕ ЛЮБОГО ПРАВИЛА = ОТВЕТ ОТВЕРГНУТ):

1. ОТВЕТ — ТОЛЬКО JSON-массив. НИКАКОГО текста до, после или внутри ответа.
2. НЕ используй Markdown, НЕ ставь обратные кавычки, НЕ пиши "json".
3. НЕ добавляй пояснения, приветствия, "Вот ваш JSON" или любой другой текст.
4. Категорию выбирай ТОЛЬКО из списка: groceries, transport, cafe, entertainment, health, transfers, salary, other.
5. Если категорию невозможно определить — ставь "other".
6. Дата — ТОЛЬКО в формате ГГГГ-ММ-ДД. Если не указана — используй сегодняшнюю.
7. Сумма — ЧИСЛО (float).
8. Тип — ТОЛЬКО "income" (доход) или "expense" (расход).
9. Если несколько операций — МАССИВ объектов. Если одна — МАССИВ С ОДНИМ объектом.
10. В строке ДОЛЖНО БЫТЬ название магазина, получателя или описание перевода.
11. Строки без названия (только числа + валюта) — ИГНОРИРУЙ.

12. РАСПОЗНАВАНИЕ РЕГУЛЯРНЫХ ПЛАТЕЖЕЙ (ПОДПИСОК):
    - Если текст содержит маркеры: "каждый месяц", "ежемесячно", "подписка" — это регулярный платёж.
    - В таком случае добавь в JSON два дополнительных поля:
        * "is_recurring": true
        * "frequency": "monthly"
    - Если маркеры отсутствуют, верни:
        * "is_recurring": false
        * "frequency": null

ОСОБЫЕ СЛУЧАИ:
- Переводы между своими счетами → category = "transfers", type = "expense"
- Пополнения → type = "income"
- Зарплата → category = "salary", type = "income"

ПРИМЕРЫ ПРАВИЛЬНЫХ ОТВЕТОВ:

1. Обычная операция (не регулярная):
[{"amount": 250.0, "date": "2026-07-02", "type": "expense", "category": "cafe", "comment": "кофе", "is_recurring": false, "frequency": null}]

2. Регулярная подписка (ежемесячная):
[{"amount": 499.0, "date": "2026-07-02", "type": "expense", "category": "entertainment", "comment": "Netflix подписка", "is_recurring": true, "frequency": "monthly"}]

3. Зарплата каждый месяц:
[{"amount": 60000.0, "date": "2026-07-02", "type": "income", "category": "salary", "comment": "зарплата", "is_recurring": true, "frequency": "monthly"}]

ЕСЛИ НАРУШИШЬ ХОТЯ БЫ ОДНО ПРАВИЛО — ТВОЙ ОТВЕТ БУДЕТ ОТВЕРГНУТ И ЗАМЕНЁН НА ПУСТОЙ МАССИВ.
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
    raise RuntimeError(
        "В ответе ИИ-помощника не найден JSON-массив или объект")


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
    if not user_input or not user_input.strip():
        return []

    today = datetime.now().date().strftime('%Y-%m-%d')
    user_prompt = f"Текущая дата: {today}.\n\nТекст пользователя:\n{user_input}"

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
                    op['date'] = normalize_date(op.get('date')) or today
                    if op.get('category') not in ALLOWED_CATEGORIES:
                        op['category'] = 'other'
                    op['amount'] = clean_amount(op.get('amount', 0))
                    op.setdefault('is_recurring', False)
                    op.setdefault('frequency', None)

                result = [op for op in operations if is_valid_operation(op)]
                return result

        except (json.JSONDecodeError, RuntimeError, Exception) as e:
            last_error = e
            if attempt < MAX_RETRIES:
                time.sleep(DELAY)
            else:
                raise RuntimeError(
                    f"ИИ-помощник не ответил корректно после {MAX_RETRIES} попыток: {last_error}"
                )
