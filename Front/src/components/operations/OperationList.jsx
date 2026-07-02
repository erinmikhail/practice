import { OperationRow } from './OperationRow';

export function OperationList({ operations, onDelete, emptyMessage = 'Операций пока нет — добавьте первую выше.' }) {
  if (operations.length === 0) {
    return <p className="text-slate-400 text-sm">{emptyMessage}</p>;
  }

  // Показываем сначала новые операции — сортируем по дате создания в обратном порядке.
  const sorted = [...operations].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <ul className="space-y-2">
      {sorted.map((operation) => (
        <OperationRow key={operation.id} operation={operation} onDelete={onDelete} />
      ))}
    </ul>
  );
}
