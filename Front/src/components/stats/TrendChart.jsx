import { formatMoney } from '../../utils/formatters';

export function TrendChart({ operations, period }) {
    if (!operations || operations.length === 0) {
        return (
            <div className="flex items-center justify-center h-56 rounded-2xl border border-dashed border-slate-300 text-slate-400 bg-white">
                Нет операций за выбранный период
            </div>
        );
    }

    // Группируем данные в зависимости от выбранного периода
    const groups = {};

    operations.forEach(op => {
        const date = new Date(op.date);
        let key = '';
        let label = '';

        if (period === 'year' || period === 'all') {
            // Группируем по месяцам (для года и "за всё время")
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
            label = `${months[date.getMonth()]} ${date.getFullYear()}`;
        } else {
            // Группируем по дням (для месяца и суток)
            key = op.date;
            const monthsShort = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
            label = `${date.getDate()} ${monthsShort[date.getMonth()]}`;
        }

        if (!groups[key]) {
            groups[key] = { key, label, income: 0, expense: 0, rawDate: date };
        }

        if (op.type === 'income') {
            groups[key].income += op.amount;
        } else {
            groups[key].expense += op.amount;
        }
    });

    // Сортируем колонки хронологически
    const sortedData = Object.values(groups).sort((a, b) => a.rawDate - b.rawDate);

    // Находим максимум, чтобы столбики правильно масштабировались по высоте
    const maxAmount = Math.max(...sortedData.flatMap(d => [d.income, d.expense]));

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
            <div className="min-w-[400px] flex items-end justify-between gap-3 h-56 mt-2">
                {sortedData.map((item) => (
                    <div key={item.key} className="flex-1 flex flex-col items-center gap-2 group">

                        {/* Контейнер для двух столбиков (доход и расход) */}
                        <div className="w-full flex items-end justify-center gap-1 h-44 relative bg-slate-50/50 rounded-lg hover:bg-slate-100 transition-colors p-1">

                            {/* Зеленый столбец (Доходы) */}
                            <div
                                className="w-1/2 max-w-[24px] bg-emerald-400 rounded-t-md transition-all relative"
                                style={{ height: `${maxAmount ? (item.income / maxAmount) * 100 : 0}%` }}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white z-10">
                                    +{formatMoney(item.income)}
                                </div>
                            </div>

                            {/* Красный столбец (Расходы) */}
                            <div
                                className="w-1/2 max-w-[24px] bg-rose-400 rounded-t-md transition-all relative"
                                style={{ height: `${maxAmount ? (item.expense / maxAmount) * 100 : 0}%` }}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white z-10">
                                    -{formatMoney(item.expense)}
                                </div>
                            </div>

                        </div>

                        {/* Подпись под столбиком */}
                        <span className="text-[11px] text-slate-500 font-medium text-center leading-tight">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Легенда */}
            <div className="flex justify-center gap-6 mt-4 text-sm">
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-400 rounded-full"></span>Доходы</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-rose-400 rounded-full"></span>Расходы</span>
            </div>
        </div>
    );
}