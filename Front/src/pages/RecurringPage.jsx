import { useEffect, useState } from 'react';
import { CATEGORIES, DEFAULT_CATEGORY, getCategoryLabel } from '../constants/categories';
import { FREQUENCIES, getFrequencyLabel } from '../constants/frequencies';
import { formatMoney, formatDate } from '../utils/formatters';
import {
  getRecurringOperations,
  createRecurringOperation,
  deleteRecurringOperation,
} from '../api';

const EMPTY_FORM = {
  amount: '',
  type: 'expense',
  category: DEFAULT_CATEGORY,
  frequency: 'monthly',
  nextDate: new Date().toISOString().slice(0, 10),
  comment: '',
};

// Вкладка "Подписки и регулярные платежи" — теперь подключена к реальному
// бэкенду (GET/POST/DELETE /api/operations/recurring, Артём).
export function RecurringPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [values, setValues] = useState(EMPTY_FORM);

  useEffect(() => {
    getRecurringOperations()
      .then(setItems)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  function updateField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!values.amount) return;

    const saved = await createRecurringOperation({
      amount: Number(values.amount),
      type: values.type,
      category: values.category,
      frequency: values.frequency,
      next_date: values.nextDate,
      comment: values.comment,
    });
    setItems((prev) => [...prev, saved]);
    setValues((prev) => ({ ...prev, amount: '', comment: '' }));
  }

  async function handleDelete(id) {
    await deleteRecurringOperation(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">Подписки и регулярные платежи</h2>

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

      {loading && <p className="text-slate-500 text-sm">Загрузка...</p>}
      {loadError && <p className="text-rose-600 text-sm">Не удалось загрузить данные с сервера.</p>}

      {!loading && !loadError && (
        items.length === 0 ? (
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
                    {getFrequencyLabel(item.frequency)}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">{formatDate(item.next_date)}</span>
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
        )
      )}
    </div>
  );
}
