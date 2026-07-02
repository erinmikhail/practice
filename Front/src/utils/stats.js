import { CATEGORIES } from '../constants/categories';

// Считаем доходы/расходы/баланс и разбивку расходов по категориям
// прямо из списка операций — просто обычная функция, без хуков и
// кэширования. Операций у нас немного, так что пересчитывать всё
// заново на каждый рендер — это нормально, а объяснить проще некуда.
export function calculateStats(operations) {
  let totalIncome = 0;
  let totalExpenses = 0;
  const expenseByCategory = {};

  for (const operation of operations) {
    if (operation.type === 'income') {
      totalIncome += operation.amount;
    } else {
      totalExpenses += operation.amount;
      expenseByCategory[operation.category] =
        (expenseByCategory[operation.category] || 0) + operation.amount;
    }
  }

  const categoryBreakdown = CATEGORIES
    .map((category) => ({
      category: category.value,
      label: category.label,
      color: category.color,
      total: expenseByCategory[category.value] || 0,
    }))
    .filter((entry) => entry.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((entry) => ({
      ...entry,
      percent: totalExpenses > 0 ? (entry.total / totalExpenses) * 100 : 0,
    }));

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    categoryBreakdown,
  };
}
