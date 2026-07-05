// Небольшая обёртка над crypto.randomUUID(), чтобы генерацию id
// можно было легко заменить в одном месте, если понадобится другой способ.
// crypto.randomUUID существует только в "безопасном контексте" браузера —
// на https:// или на localhost. При открытии сайта по обычному http на
// IP-адресе (например, с телефона в локальной сети) его нет вообще, поэтому
// нужен резервный вариант — он не обязан быть криптостойким, id тут нужен
// только для React-ключей и временных черновиков, не для безопасности.
export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
