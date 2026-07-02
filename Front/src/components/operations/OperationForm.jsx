import { useState } from 'react';
import { CATEGORIES, DEFAULT_CATEGORY } from '../../constants/categories';
import { validateOperation } from '../../utils/validation';

const EMPTY_FORM = {
  amount: '',
  type: 'expense',
  category: DEFAULT_CATEGORY,
  date: new Date().toISOString().slice(0, 10),
  comment: '',
};

// onSubmit — функция из родителя, которая реально сохраняет операцию
// (отправляет её на сервер). Форма сама ничего не знает о том, как и
// куда сохраняются данные.
export function OperationForm({ onSubmit }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  function updateField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const { valid, errors: validationErrors } = validateOperation(values);
    setErrors(validationErrors);
    if (!valid) return;

    await onSubmit({
      ...values,
      amount: Number(values.amount), // в форме amount — строка, а хранить нужно числом
    });

    // После успешного добавления очищаем форму, но оставляем выбранные
    // тип/категорию/дату — обычно пользователь вводит несколько похожих операций подряд.
    setValues((prev) => ({ ...prev, amount: '', comment: '' }));
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <h3 className="text-lg font-medium text-slate-700">Добавить операцию</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Сумма</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={values.amount}
            onChange={(e) => updateField('amount', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Тип</label>
          <select
            value={values.type}
            onChange={(e) => updateField('type', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="expense">Расход</option>
            <option value="income">Доход</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Категория</label>
          <select
            value={values.category}
            onChange={(e) => updateField('category', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Дата</label>
          <input
            type="date"
            value={values.date}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.date && <p className="text-xs text-rose-600 mt-1">{errors.date}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-1">Комментарий</label>
        <input
          type="text"
          value={values.comment}
          onChange={(e) => updateField('comment', e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Необязательно"
        />
        {errors.comment && <p className="text-xs text-rose-600 mt-1">{errors.comment}</p>}
      </div>

      <button
        type="submit"
        className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
      >
        Добавить
      </button>
    </form>
  );
}
