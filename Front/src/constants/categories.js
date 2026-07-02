// Список категорий из ТЗ. Это ЕДИНСТВЕННОЕ место, где он описан —
// форма добавления операции, список операций и круговая диаграмма
// берут категории отсюда, чтобы нигде не было рассинхронизации.
export const CATEGORIES = [
  { value: 'groceries', label: 'Продукты', color: '#10b981' },
  { value: 'transport', label: 'Транспорт', color: '#0ea5e9' },
  { value: 'cafe', label: 'Кафе и рестораны', color: '#f59e0b' },
  { value: 'entertainment', label: 'Развлечения', color: '#d946ef' },
  { value: 'health', label: 'Здоровье', color: '#f43f5e' },
  { value: 'transfers', label: 'Переводы', color: '#6366f1' },
  { value: 'salary', label: 'Зарплата', color: '#84cc16' },
  { value: 'other', label: 'Другое', color: '#94a3b8' },
];

export const DEFAULT_CATEGORY = 'other';

// Ищем категорию по её value и возвращаем подпись для человека.
// Если вдруг попадётся неизвестное значение (например, старые данные) —
// просто вернём само value, чтобы приложение не упало.
export function getCategoryLabel(value) {
  const found = CATEGORIES.find((category) => category.value === value);
  return found ? found.label : value;
}

export function getCategoryColor(value) {
  const found = CATEGORIES.find((category) => category.value === value);
  return found ? found.color : '#94a3b8';
}
