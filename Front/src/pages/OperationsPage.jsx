import { useState } from 'react';
import { useOperations } from '../hooks/useOperations';
import { OperationForm } from '../components/operations/OperationForm';
import { OperationList } from '../components/operations/OperationList';

// Три вкладки-фильтра: показывать все операции, только доходы или только расходы.
// 'all' — служебное значение (не настоящий type операции), остальные два совпадают
// с operation.type, поэтому фильтрация ниже — простое сравнение.
const FILTERS = [
  { key: 'all', label: 'Все операции' },
  { key: 'income', label: 'Доходы' },
  { key: 'expense', label: 'Расходы' },
];

export function OperationsPage() {
  const { operations, loading, addOperation, removeOperation } = useOperations();
  const [activeFilter, setActiveFilter] = useState('all');

  if (loading) {
    return <p className="text-slate-500">Загрузка...</p>;
  }

  const visibleOperations =
    activeFilter === 'all'
      ? operations
      : operations.filter((operation) => operation.type === activeFilter);

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">Операции</h2>

      <OperationForm onSubmit={addOperation} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-slate-700">Список операций</h3>

          <div className="flex gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  activeFilter === filter.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <OperationList
          operations={visibleOperations}
          onDelete={removeOperation}
          emptyMessage={
            activeFilter === 'all'
              ? 'Операций пока нет — добавьте первую выше.'
              : activeFilter === 'income'
                ? 'Доходов пока нет.'
                : 'Расходов пока нет.'
          }
        />
      </div>
    </div>
  );
}
