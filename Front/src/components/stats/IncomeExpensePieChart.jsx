import { formatMoney } from '../../utils/formatters';

export function IncomeExpensePieChart({ income, expense }) {
    const total = income + expense;

    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[250px] rounded-2xl border border-dashed border-slate-300 text-slate-400 bg-white">
                Нет данных за выбранный период
            </div>
        );
    }

    const incomePercent = (income / total) * 100;
    const gradient = `conic-gradient(#34d399 0% ${incomePercent}%, #fb7185 ${incomePercent}% 100%)`;

    return (
        <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-center gap-8 flex-wrap lg:flex-nowrap">

            <div
                className="w-48 h-48 rounded-full shrink-0 relative"
                style={{ background: gradient }}
            >
                <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-white" />
            </div>

            <ul className="space-y-4 min-w-[180px] w-full max-w-[220px]">
                <li className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full shrink-0 bg-emerald-400" />
                    <span className="text-slate-600">Доходы</span>
                    <span className="ml-auto font-medium text-slate-800">
                        {formatMoney(income)}
                    </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full shrink-0 bg-rose-400" />
                    <span className="text-slate-600">Расходы</span>
                    <span className="ml-auto font-medium text-slate-800">
                        {formatMoney(expense)}
                    </span>
                </li>
            </ul>
        </div>
    );
}