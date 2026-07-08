import { formatMoney } from '../../utils/formatters';

function buildConicGradient(breakdown) {
  let cursor = 0;
  const stops = breakdown.map((entry) => {
    const from = cursor;
    const to = cursor + entry.percent;
    cursor = to;
    return `${entry.color} ${from}% ${to}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}

export function CategoryPieChart({ breakdown }) {
  if (breakdown.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[250px] rounded-2xl border border-dashed border-slate-300 text-slate-400 bg-white">
        Пока нет расходов для диаграммы
      </div>
    );
  }

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-center gap-8 flex-wrap lg:flex-nowrap">

      <div
        className="w-48 h-48 rounded-full shrink-0 relative"
        style={{ background: buildConicGradient(breakdown) }}
      >
        <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-white" />
      </div>

      <ul className="space-y-3 min-w-[180px] w-full max-w-[220px]">
        {breakdown.map((entry) => (
          <li key={entry.category} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600 truncate" title={entry.label}>{entry.label}</span>
            <span className="ml-auto font-medium text-slate-800">
              {formatMoney(entry.total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}