// Небольшая обёртка над crypto.randomUUID(), чтобы генерацию id
// можно было легко заменить в одном месте, если понадобится другой способ.
export function generateId() {
  return crypto.randomUUID();
}
