import { getCategoryLabel } from '../../constants/categories';
import { formatMoney, formatDate } from '../../utils/formatters';

// Показываем то, что "распознал" AI-агент, но ещё НЕ добавляем в реальный
// список операций — пользователь должен явно подтвердить каждую строку
// (или все сразу), потому что автоматический разбор может ошибиться.
export function ImportPreviewList({ items, onConfirm, onConfirmAll, onDiscard, onDiscardAll }) {
  if (items.length === 0) return null;

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
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 border border-amber-100"
          >
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
            <div className="flex gap-2 shrink-0">
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
