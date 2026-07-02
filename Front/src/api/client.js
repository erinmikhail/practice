import axios from 'axios';

// Готовим axios-клиент на будущее, когда появится настоящий бэкенд.
// Сейчас он нигде не вызывается (см. api/operations.js), но пусть будет
// с самого начала — так подключение реального API не потребует новых файлов.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
});
