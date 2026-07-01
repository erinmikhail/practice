import { useOperations } from '../hooks/useOperations';
import { useOperationStats } from '../hooks/useOperationStats';
import { StatsCard } from '../components/stats/StatsCard';
import { CategoryPieChart } from '../components/stats/CategoryPieChart';

export function HomePage() {
  const { operations, loading } = useOperations();
  // Считаем доходы/расходы/баланс/разбивку по категориям прямо из
  // текущего списка операций — эти цифры не могут "отстать" от списка.
  const stats = useOperationStats(operations);

  if (loading) {
    return <p className="text-slate-500">Загрузка...</p>;
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">Главная</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatsCard title="Доходы" amount={stats.totalIncome} variant="income" />
        <StatsCard title="Расходы" amount={stats.totalExpenses} variant="expense" />
        <StatsCard title="Баланс" amount={stats.balance} variant="balance" />
      </div>

      <h3 className="text-lg font-medium text-slate-700 mb-3">
        Расходы по категориям
      </h3>
      <CategoryPieChart breakdown={stats.categoryBreakdown} />
    </div>
  );
}
