import { formatMoney } from '../../utils/formatters';

// Цветовые варианты карточки: доход — зелёный, расход — красный,
// баланс — нейтральный синий. Задаём классы заранее, чтобы Tailwind
// точно включил их в сборку (динамически собранные строки классов
// Tailwind может не подхватить при сборке).
const VARIANT_CLASSES = {
  income: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expense: 'bg-rose-50 text-rose-700 border-rose-200',
  balance: 'bg-sky-50 text-sky-700 border-sky-200',
};

export function StatsCard({ title, amount, variant = 'balance' }) {
  return (
    <div
      className={`aspect-square flex flex-col justify-center items-center rounded-2xl border p-6 shadow-sm ${VARIANT_CLASSES[variant]}`}
    >
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="mt-2 text-2xl font-bold text-center break-words">
        {formatMoney(amount)}
      </p>
    </div>
  );
}
