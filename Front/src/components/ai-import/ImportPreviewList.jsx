import { useState } from 'react';
import { CATEGORIES, getCategoryLabel } from '../../constants/categories';
import { formatMoney, formatDate } from '../../utils/formatters';

// Показываем то, что "распознал" AI-агент, но ещё НЕ добавляем в реальный
// список операций — пользователь должен явно подтвердить каждую строку
// (или все сразу), потому что автоматический разбор может ошибиться.
// onUpdate(id, изменения) сохраняет исправленные пользователем сумму/категорию
// в сам черновик — ещё до реального сохранения в базу.
export function ImportPreviewList({ items, onConfirm, onConfirmAll, onDiscard, onDiscardAll, onUpdate }) {
  // id черновика, который сейчас редактируется — одновременно можно
  // редактировать только одну строку, остальные показываются как обычно.
  const [editingId, setEditingId] = useState(null);
  // Значения полей, которые правит пользователь, пока не нажмёт "Сохранить"
  // (или "Отмена" — тогда эти правки просто отбрасываются).
  const [draftValues, setDraftValues] = useState({ amount: '', category: '' });

  if (items.length === 0) return null;

  function startEditing(item) {
    setEditingId(item.id);
    setDraftValues({ amount: item.amount, category: item.category });
  }

  function saveEditing(item) {
    onUpdate(item.id, {
      amount: Number(draftValues.amount) || 0,
      category: draftValues.category,
    });
    setEditingId(null);
  }

  function cancelEditing() {
    setEditingId(null);
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-amber-800">
          Найдено операций: {items.length} — проверьте перед добавлением
        </h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onConfirmAll}
            className="text-xs rounded-lg bg-emerald-600 text-white px-3 py-1.5 hover:bg-emerald-700"
          >
            Добавить все
          </button>
          <button
            type="button"
            onClick={onDiscardAll}
            className="text-xs rounded-lg bg-slate-200 text-slate-700 px-3 py-1.5 hover:bg-slate-300"
          >
            Отклонить все
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const isEditing = editingId === item.id;

          return (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 border border-amber-100"
            >
              {isEditing ? (
                // Режим редактирования: сумма и категория — обычные поля ввода,
                // остальное (дата, комментарий) не трогаем — ТЗ просит править
                // только сумму/категорию, если AI ошибся.
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <input
                    type="number"
                    value={draftValues.amount}
                    onChange={(e) =>
                      setDraftValues((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                  />
                  <select
                    value={draftValues.category}
                    onChange={(e) =>
                      setDraftValues((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-400">{formatDate(item.date)}</span>
                  <span className="text-slate-500 truncate">{item.comment}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 min-w-0 text-sm">
                  <span className={item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}>
                    {item.type === 'income' ? '+' : '-'}{formatMoney(item.amount)}
                  </span>
                  <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5">
                    {getCategoryLabel(item.category)}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(item.date)}</span>
                  <span className="text-slate-500 truncate">{item.comment}</span>
                </div>
              )}

              <div className="flex gap-2 shrink-0">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => saveEditing(item)}
                      className="text-xs text-emerald-600 hover:text-emerald-800"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Отмена
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startEditing(item)}
                      aria-label="Редактировать"
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {/* Иконка карандаша — обычный SVG, без сторонних библиотек иконок */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onConfirm(item)}
                      className="text-xs text-emerald-600 hover:text-emerald-800"
                    >
                      Добавить
                    </button>
                    <button
                      type="button"
                      onClick={() => onDiscard(item)}
                      className="text-xs text-rose-500 hover:text-rose-700"
                    >
                      Отклонить
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
