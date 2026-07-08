import { useState, useMemo } from 'react';
import { calculateStats } from '../utils/stats';
import { StatsCard } from '../components/stats/StatsCard';
import { CategoryPieChart } from '../components/stats/CategoryPieChart';
import { IncomeExpensePieChart } from '../components/stats/IncomeExpensePieChart';

export function HomePage({ operations, loading, loadError }) {
  const [periodType, setPeriodType] = useState('month');
  const [cursorDate, setCursorDate] = useState(new Date());

  function handlePrev() {
    const d = new Date(cursorDate);
    if (periodType === 'day') d.setDate(d.getDate() - 1);
    if (periodType === 'month') d.setMonth(d.getMonth() - 1, 1);
    if (periodType === 'year') d.setFullYear(d.getFullYear() - 1, 0, 1);
    setCursorDate(d);
  }

  function handleNext() {
    const d = new Date(cursorDate);
    if (periodType === 'day') d.setDate(d.getDate() + 1);
    if (periodType === 'month') d.setMonth(d.getMonth() + 1, 1);
    if (periodType === 'year') d.setFullYear(d.getFullYear() + 1, 0, 1);
    setCursorDate(d);
  }

  const periodLabel = useMemo(() => {
    if (periodType === 'all') return 'За всё время';
    if (periodType === 'year') return cursorDate.getFullYear().toString();

    if (periodType === 'month') {
      const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
      return `${months[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`;
    }

    if (periodType === 'day') {
      return cursorDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }, [periodType, cursorDate]);

  const filteredOperations = useMemo(() => {
    return operations.filter(op => {
      const opDate = new Date(op.date);
      if (periodType === 'day') return opDate.toDateString() === cursorDate.toDateString();
      if (periodType === 'month') return opDate.getMonth() === cursorDate.getMonth() && opDate.getFullYear() === cursorDate.getFullYear();
      if (periodType === 'year') return opDate.getFullYear() === cursorDate.getFullYear();
      return true;
    });
  }, [operations, periodType, cursorDate]);

  if (loading) return <p className="text-slate-500">Загрузка...</p>;
  if (loadError) return <p className="text-rose-600">Не удалось загрузить данные.</p>;

  const stats = calculateStats(filteredOperations);

  return (
    <div className="max-w-5xl space-y-8">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Обзор финансов</h2>

        <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-sm overflow-hidden">
          <select
            value={periodType}
            onChange={(e) => {
              setPeriodType(e.target.value);
              setCursorDate(new Date());
            }}
            className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer border-none pl-3 pr-2 py-1.5 hover:bg-slate-50"
          >
            <option value="day">День</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
            <option value="all">Всё время</option>
          </select>

          <div className="flex items-center border-l border-slate-200 pl-1 pr-1 bg-slate-50/50">
            <button
              onClick={handlePrev}
              disabled={periodType === 'all'}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
            </button>

            <span className="text-sm font-semibold text-slate-800 min-w-[130px] text-center">
              {periodLabel}
            </span>

            <button
              onClick={handleNext}
              disabled={periodType === 'all'}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Доходы" amount={stats.totalIncome} variant="income" />
        <StatsCard title="Расходы" amount={stats.totalExpenses} variant="expense" />
        <StatsCard title="Баланс" amount={stats.balance} variant="balance" />
      </div>

      {/* Здесь применено выравнивание (items-stretch) и flex-1 для равной высоты */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-medium text-slate-700 mb-3">Доходы и Расходы</h3>
          <div className="flex-1">
            <IncomeExpensePieChart income={stats.totalIncome} expense={stats.totalExpenses} />
          </div>
        </div>

        <div className="flex flex-col h-full">
          <h3 className="text-lg font-medium text-slate-700 mb-3">Структура расходов</h3>
          <div className="flex-1">
            <CategoryPieChart breakdown={stats.categoryBreakdown} />
          </div>
        </div>
      </div>

    </div>
  );
}