import { useMemo } from 'react';
import { CATEGORIES } from '../constants/categories';

// Считаем доходы/расходы/баланс и разбивку расходов по категориям
// каждый раз заново из списка операций (а не храним отдельным стейтом).
// Так эти цифры никогда не могут "разъехаться" со списком операций —
// они всегда прямое следствие текущих данных.
export function useOperationStats(operations) {
  return useMemo(() => {
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
  }, [operations]);
}
