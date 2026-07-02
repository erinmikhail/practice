// Форматируем число как деньги в рублях, например: 1234.5 -> "1 234,50 ₽"
export function formatMoney(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(amount);
}

// Дату из формата "yyyy-mm-dd" превращаем в привычный "дд.мм.гггг"
export function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('ru-RU');
}
