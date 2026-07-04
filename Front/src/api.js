import axios from 'axios';

// Один файл — все запросы к серверу. Бэкенд написан на FastAPI,
// адрес берём из .env (см. .env.example), чтобы не хардкодить его в коде.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL });

// Получить список всех операций.
export async function getOperations() {
  const response = await api.get('/operations/');
  return response.data;
}

// Сохранить одну операцию. Сервер сам присваивает ей id и возвращает
// уже сохранённую операцию — используем именно то, что он вернул.
export async function createOperation(operation) {
  const response = await api.post('/operations/', operation);
  return response.data;
}

// Удалить операцию по id.
export async function deleteOperation(id) {
  await api.delete(`/operations/${id}`);
}

// Разобрать вставленный текст через AI-агента на сервере.
// Возвращает массив "черновиков" операций — их ещё нужно подтвердить.
export async function importFromText(text) {
  const response = await api.post('/import/text', { text });
  return response.data;
}

// Разобрать скриншот через AI-агента на сервере (OCR + распознавание).
export async function importFromImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/import/image', formData);
  return response.data;
}
