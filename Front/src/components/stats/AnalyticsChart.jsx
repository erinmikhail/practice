import { formatMoney } from '../../utils/formatters';

// Превращаем "2026-06" в красивое "Июнь 2026"
const MONTH_NAMES = {
    "01": "Янв", "02": "Фев", "03": "Мар", "04": "Апр", "05": "Май", "06": "Июн",
    "07": "Июл", "08": "Авг", "09": "Сен", "10": "Окт", "11": "Ноя", "12": "Дек"
};

export function AnalyticsChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-72 rounded-2xl border border-dashed border-slate-300 text-slate-400">
                Пока нет данных для графиков
            </div>
        );
    }

    // Находим максимальное значение (доход или расход), чтобы правильно рассчитать высоту 100% для столбиков
    const maxAmount = Math.max(...data.flatMap(d => [d.income, d.expense]));

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
            <div className="min-w-[400px] flex items-end justify-between gap-4 h-56 mt-4">
                {data.map((item) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">

                        <div className="w-full flex items-end justify-center gap-1 h-44 relative">
                            {/* Столбец дохода */}
                            <div
                                className="w-1/3 max-w-[32px] bg-emerald-400 rounded-t-sm transition-all hover:bg-emerald-500 relative"
                                style={{ height: `${maxAmount > 0 ? (item.income / maxAmount) * 100 : 0}%` }}
                            >
                                {/* Всплывающая подсказка при наведении (Tooltip) */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white z-10">
                                    +{formatMoney(item.income)}
                                </div>
                            </div>

                            {/* Столбец расхода */}
                            <div
                                className="w-1/3 max-w-[32px] bg-rose-400 rounded-t-sm transition-all hover:bg-rose-500 relative"
                                style={{ height: `${maxAmount > 0 ? (item.expense / maxAmount) * 100 : 0}%` }}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white z-10">
                                    -{formatMoney(item.expense)}
                                </div>
                            </div>
                        </div>

                        <span className="text-xs text-slate-500 font-medium">
                            {MONTH_NAMES[item.month.split('-')[1]]} {item.month.split('-')[0]}
                        </span>
                    </div>
                ))}
            </div>

            {/* Легенда (Цвета) */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
                    <span className="text-slate-600">Доходы</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-rose-400 rounded-full"></span>
                    <span className="text-slate-600">Расходы</span>
                </div>
            </div>
        </div>
    );
}