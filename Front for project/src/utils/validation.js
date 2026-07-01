import { CATEGORIES } from '../constants/categories';

// Проверяем данные формы перед тем, как превратить их в операцию.
// Возвращаем { valid, errors }, где errors — объект вида { поле: "текст ошибки" }.
// Так форма может показать ошибку рядом с конкретным полем.
export function validateOperation(values) {
  const errors = {};

  const amount = Number(values.amount);
  if (!values.amount || Number.isNaN(amount) || amount <= 0) {
    errors.amount = 'Введите сумму больше нуля';
  }

  if (values.type !== 'income' && values.type !== 'expense') {
    errors.type = 'Выберите тип операции';
  }

  const knownCategory = CATEGORIES.some((c) => c.value === values.category);
  if (!knownCategory) {
    errors.category = 'Выберите категорию';
  }

  if (!values.date || Number.isNaN(new Date(values.date).getTime())) {
    errors.date = 'Укажите корректную дату';
  }

  if (values.comment && values.comment.length > 500) {
    errors.comment = 'Комментарий слишком длинный (максимум 500 символов)';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
