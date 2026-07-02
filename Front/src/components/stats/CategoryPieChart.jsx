import { formatMoney } from '../../utils/formatters';

// Круговую диаграмму рисуем без сторонних библиотек — через CSS-градиент
// conic-gradient. Библиотека recharts в текущей версии рисовала диаграмму
// некорректно (сегменты выходили крошечными вместо целого круга), а свой
// вариант на чистом CSS и проще, и надёжнее для прототипа.
//
// Идея: conic-gradient принимает список "цвет от X% до Y%" по кругу.
// Мы идём по категориям и для каждой считаем, с какого по какой процент
// круга она красит — так получается пирог из цветных секторов.
function buildConicGradient(breakdown) {
  let cursor = 0; // сколько процентов круга уже "закрашено"
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
      <div className="flex items-center justify-center h-72 rounded-2xl border border-dashed border-slate-300 text-slate-400">
        Пока нет расходов для диаграммы
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-8 flex-wrap">
      {/* Сама диаграмма: цветной круг с белой дыркой посередине (донат) */}
      <div
        className="w-48 h-48 rounded-full shrink-0 relative"
        style={{ background: buildConicGradient(breakdown) }}
      >
        <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-white" />
      </div>

      {/* Легенда: список категорий с цветом, суммой и процентом */}
      <ul className="space-y-2 min-w-48">
        {breakdown.map((entry) => (
          <li key={entry.category} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600">{entry.label}</span>
            <span className="ml-auto font-medium text-slate-800">
              {formatMoney(entry.total)}
            </span>
            <span className="text-slate-400 w-12 text-right">
              {entry.percent.toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
