import { getCategoryLabel } from '../../constants/categories';
import { formatMoney, formatDate } from '../../utils/formatters';

export function OperationRow({ operation, onDelete }) {
  const isIncome = operation.type === 'income';

  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`text-sm font-semibold shrink-0 ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}
        >
          {isIncome ? '+' : '-'}{formatMoney(operation.amount)}
        </span>
        <span className="text-xs rounded-full bg-slate-100 text-slate-600 px-2 py-1 shrink-0">
          {getCategoryLabel(operation.category)}
        </span>
        <span className="text-xs text-slate-400 shrink-0">{formatDate(operation.date)}</span>
        {operation.comment && (
          <span className="text-sm text-slate-500 truncate">{operation.comment}</span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(operation.id)}
        className="text-xs text-rose-500 hover:text-rose-700 shrink-0"
      >
        Удалить
      </button>
    </li>
  );
}
