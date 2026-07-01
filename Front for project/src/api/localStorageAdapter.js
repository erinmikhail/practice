import { generateId } from '../utils/id';

// Ключ, под которым храним операции в localStorage.
// В конце стоит ":v1" — если позже поменяем структуру данных,
// сможем завести ":v2" и не путать старые данные с новыми.
const STORAGE_KEY = 'finance-tracker:operations:v1';

// Читаем весь список операций из localStorage.
export function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Данные повреждены (например, кто-то руками поправил localStorage).
    // Не логируем сырые данные — вдруг там суммы/комментарии пользователя,
    // это чувствительная информация. Просто сообщаем факт и начинаем с пустого списка.
    console.warn('Не удалось прочитать сохранённые операции, начинаем с чистого списка');
    return [];
  }
}

function writeAll(operations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(operations));
}

// Добавляет новую операцию и возвращает её же с id и датой создания —
// так функция ведёт себя похоже на то, что вернул бы настоящий POST-запрос.
export function create(operation) {
  const operations = readAll();
  const newOperation = {
    ...operation,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  writeAll([...operations, newOperation]);
  return newOperation;
}

export function remove(id) {
  const operations = readAll();
  writeAll(operations.filter((operation) => operation.id !== id));
}
