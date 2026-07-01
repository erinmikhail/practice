import * as localStorageAdapter from './localStorageAdapter';
import * as aiMockParser from './aiMockParser';

// Это ЕДИНСТВЕННЫЙ файл, который знает, откуда на самом деле берутся данные.
// Все остальные компоненты вызывают только функции отсюда и не трогают
// localStorage напрямую — благодаря этому, когда бэкенд будет готов,
// достаточно будет переписать только эти четыре функции (заменить
// localStorageAdapter на вызовы apiClient из ./client.js), а весь
// остальной код приложения останется без изменений.

// Все функции здесь — async, даже несмотря на то, что localStorage работает
// синхронно. Это специально: реальный запрос к бэкенду тоже будет async,
// и компоненты уже сейчас пишутся так, будто ждут ответ сервера.

export async function getOperations() {
  return localStorageAdapter.readAll();
}

export async function createOperation(operation) {
  return localStorageAdapter.create(operation);
}

export async function deleteOperation(id) {
  return localStorageAdapter.remove(id);
}

// payload — один из вариантов:
//   { kind: 'text', text: string }
//   { kind: 'image', file: File }
export async function importFromAI(payload) {
  if (payload.kind === 'text') return aiMockParser.parseText(payload.text);
  if (payload.kind === 'image') return aiMockParser.parseImage(payload.file);
  throw new Error(`Неизвестный тип импорта: ${payload.kind}`);
}
