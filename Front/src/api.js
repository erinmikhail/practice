import axios from 'axios';

// Один файл — все запросы к серверу. Бэкенд написан на FastAPI,
// адрес берём из .env (см. .env.example), чтобы не хардкодить его в коде.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL });

// Подставляем токен из localStorage в каждый запрос, если он есть — так
// бэкенд сможет понять, какой это пользователь, когда JWT-проверка
// (get_current_user) будет готова. Пока бэк её игнорирует, но заголовок
// уже отправляется в правильном формате.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// Вход в систему. Сам эндпоинт /api/auth/login делает другая часть команды
// (JWT ещё не готов на бэке) — здесь уже вызываем его в ожидаемом формате
// { access_token }, чтобы не переделывать фронт, когда он появится.
export async function login(username, password) {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
}

// Регистрация. consentGiven уходит на сервер как consent_given — по
// Task3.txt бэк (Катя) будет требовать это поле строго true.
export async function register(username, password, consentGiven) {
  const response = await api.post('/auth/register', {
    username,
    password,
    consent_given: consentGiven,
  });
  return response.data;
}
