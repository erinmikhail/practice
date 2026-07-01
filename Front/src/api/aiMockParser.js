import { generateId } from '../utils/id';

// Настоящего AI-агента ещё нет (его делает другой человек в команде на бэкенде),
// поэтому здесь — временная заглушка. Она честно имитирует поведение будущего
// запроса: ждёт немного времени (как будто правда сходила в сеть) и возвращает
// операции в том же формате, что и остальное приложение.
function fakeNetworkDelay() {
  const ms = 800 + Math.random() * 700; // 800–1500 мс
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Ключевые слова для угадывания категории по тексту операции.
// Порядок важен: проверяем сверху вниз, первое совпадение побеждает.
const CATEGORY_KEYWORDS = [
  { category: 'salary', words: ['зарплата', 'аванс', 'премия'] },
  { category: 'transfers', words: ['перевод', 'перевёл', 'перевел'] },
  { category: 'cafe', words: ['кафе', 'ресторан', 'кофе', 'кофейн'] },
  { category: 'transport', words: ['такси', 'автобус', 'метро', 'бензин', 'заправ'] },
  { category: 'groceries', words: ['продукт', 'магазин', 'пятерочка', 'пятёрочка', 'перекресток', 'перекрёсток'] },
  { category: 'health', words: ['аптека', 'врач', 'лекарств', 'клиник'] },
  { category: 'entertainment', words: ['кино', 'игра', 'подписк', 'концерт'] },
];

// Слова, которые говорят "это доход", а не расход.
const INCOME_KEYWORDS = ['зарплата', 'аванс', 'премия', 'получил', 'доход', 'перевод от', 'вернул'];

function guessCategory(lowerLine) {
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.words.some((word) => lowerLine.includes(word))) {
      return entry.category;
    }
  }
  return 'other';
}

function guessType(lowerLine) {
  const isIncome = INCOME_KEYWORDS.some((word) => lowerLine.includes(word));
  return isIncome ? 'income' : 'expense';
}

// Ищем в строке дату вида "12.05" или "12.05.2026".
// Если не нашли — считаем, что операция сегодняшняя.
function guessDate(line) {
  const match = line.match(/(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/);
  if (!match) {
    return new Date().toISOString().slice(0, 10);
  }
  const [, day, month, yearRaw] = match;
  const year = yearRaw ? (yearRaw.length === 2 ? `20${yearRaw}` : yearRaw) : new Date().getFullYear();
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return Number.isNaN(new Date(iso).getTime()) ? new Date().toISOString().slice(0, 10) : iso;
}

// Ищем в строке число — сумму операции. Убираем пробелы между разрядами
// (например "1 234") и меняем запятую на точку для parseFloat.
function extractAmount(line) {
  const match = line.match(/(\d[\d\s]*[.,]?\d*)/);
  if (!match) return null;
  const normalized = match[1].replace(/\s/g, '').replace(',', '.');
  const amount = parseFloat(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

// Разбираем вставленный пользователем текст построчно.
// Это простая эвристика "по ключевым словам", а не настоящий AI —
// он появится позже на бэкенде, здесь только демо-логика для прототипа.
export async function parseText(text) {
  await fakeNetworkDelay();

  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

  const operations = [];
  for (const line of lines) {
    const amount = extractAmount(line);
    if (amount === null) continue; // в строке нет суммы — пропускаем её

    const lowerLine = line.toLowerCase();
    operations.push({
      id: generateId(),
      amount,
      type: guessType(lowerLine),
      category: guessCategory(lowerLine),
      date: guessDate(line),
      comment: line.slice(0, 120),
      pending: true, // помечаем как "превью", пока пользователь не подтвердил
    });
  }

  return operations;
}

// Разобрать содержимое скриншота по-настоящему на фронте нельзя —
// для этого и нужен реальный AI-агент на бэкенде. Пока возвращаем
// заранее заготовленный демонстрационный список, чтобы показать,
// как будет выглядеть результат разбора, когда бэк будет готов.
export async function parseImage(file) {
  await fakeNetworkDelay();

  const fileLabel = file?.name ? `Скриншот "${file.name}"` : 'Загруженный скриншот';
  const today = new Date().toISOString().slice(0, 10);

  return [
    { id: generateId(), amount: 540, type: 'expense', category: 'groceries', date: today, comment: `${fileLabel}: пример операции (демо)`, pending: true },
    { id: generateId(), amount: 1200, type: 'expense', category: 'cafe', date: today, comment: `${fileLabel}: пример операции (демо)`, pending: true },
    { id: generateId(), amount: 65000, type: 'income', category: 'salary', date: today, comment: `${fileLabel}: пример операции (демо)`, pending: true },
  ];
}
