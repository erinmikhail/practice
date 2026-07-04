import { useState } from 'react';
import { CATEGORIES, DEFAULT_CATEGORY, getCategoryLabel } from '../constants/categories';
import { formatMoney, formatDate } from '../utils/formatters';
import { generateId } from '../utils/id';

const FREQUENCIES = [
  { value: 'monthly', label: 'Ежемесячно' },
  { value: 'weekly', label: 'Еженедельно' },
  { value: 'yearly', label: 'Ежегодно' },
];

const EMPTY_FORM = {
  amount: '',
  type: 'expense',
  category: DEFAULT_CATEGORY,
  frequency: 'monthly',
  nextDate: new Date().toISOString().slice(0, 10),
  comment: '',
};

// Вкладка "Подписки и регулярные платежи" — задача из нового задания.
// Бэкенд для recurring_operations ещё не готов (Артём, Task4.txt), поэтому
// это пока витрина: список живёт только в состоянии этого компонента и
// пропадает при обновлении страницы, ничего никуда не отправляется.
export function RecurringPage() {
  const [items, setItems] = useState([]);
  const [values, setValues] = useState(EMPTY_FORM);

  function updateField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!values.amount) return;

    setItems((prev) => [...prev, { ...values, id: generateId(), amount: Number(values.amount) }]);
    setValues((prev) => ({ ...prev, amount: '', comment: '' }));
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Подписки и регулярные платежи</h2>
        <p className="mt-1 text-sm text-slate-400">
          Пока список хранится только в этой вкладке и пропадает при обновлении страницы —
          сохранение на сервере появится, когда будет готов бэкенд для регулярных операций.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-medium text-slate-700">Добавить регулярный платёж</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Сумма</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={values.amount}
              onChange={(e) => updateField('amount', e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
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
            <label className="block text-sm text-slate-600 mb-1">Периодичность</label>
            <select
              value={values.frequency}
              onChange={(e) => updateField('frequency', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {FREQUENCIES.map((frequency) => (
                <option key={frequency.value} value={frequency.value}>
                  {frequency.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Следующая дата</label>
            <input
              type="date"
              value={values.nextDate}
              onChange={(e) => updateField('nextDate', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Комментарий</label>
          <input
            type="text"
            value={values.comment}
            onChange={(e) => updateField('comment', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Например, Netflix или аренда квартиры"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
        >
          Добавить
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-slate-400 text-sm">Регулярных платежей пока нет — добавьте первый выше.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              {/* flex-wrap — на телефоне бейджи и дата переносятся на свою
                  строку вместо того, чтобы наезжать на кнопку "Удалить". */}
              <div className="flex flex-wrap min-w-0 items-center gap-2 sm:gap-3">
                <span
                  className={`shrink-0 text-sm font-semibold ${
                    item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'}{formatMoney(item.amount)}
                </span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {getCategoryLabel(item.category)}
                </span>
                <span className="shrink-0 rounded-full bg-sky-50 px-2 py-1 text-xs text-sky-600">
                  {FREQUENCIES.find((f) => f.value === item.frequency)?.label}
                </span>
                <span className="shrink-0 text-xs text-slate-400">{formatDate(item.nextDate)}</span>
                {item.comment && (
                  <span className="basis-full text-sm text-slate-500 sm:basis-auto sm:truncate">
                    {item.comment}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="shrink-0 text-xs text-rose-500 hover:text-rose-700"
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
