// Периодичность регулярных операций — строго то, что принимает бэкенд
// (RecurringOperationBase в schemas.py), иначе сервер отклонит запрос.
export const FREQUENCIES = [
  { value: 'daily', label: 'Ежедневно' },
  { value: 'weekly', label: 'Еженедельно' },
  { value: 'monthly', label: 'Ежемесячно' },
  { value: 'annually', label: 'Ежегодно' },
];

export function getFrequencyLabel(value) {
  const found = FREQUENCIES.find((frequency) => frequency.value === value);
  return found ? found.label : value;
}
