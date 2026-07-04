import { useState } from 'react';
import { importFromText, importFromImage } from '../api';
import { generateId } from '../utils/id';
import { AiImportPanel } from '../components/ai-import/AiImportPanel';
import { ImportPreviewList } from '../components/ai-import/ImportPreviewList';

export function ImportPage({ onConfirm }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Черновики, которые вернул сервер, ещё не сохранены в базе — у них нет id.
  // Даём каждому временный id только для того, чтобы React мог отрисовать
  // список и чтобы кнопки "Добавить"/"Отклонить" знали, какую строку убрать.
  function showDrafts(items) {
    setDrafts(items.map((item) => ({ ...item, id: generateId() })));
    setMessage(items.length === 0 ? 'Не удалось найти операции — попробуйте другой текст или скриншот.' : '');
  }

  async function handleImportText(text) {
    setLoading(true);
    setMessage('');
    try {
      showDrafts(await importFromText(text));
    } catch {
      setMessage('Не удалось связаться с сервером. Попробуйте ещё раз.');
    }
    setLoading(false);
  }

  async function handleImportImage(file) {
    setLoading(true);
    setMessage('');
    try {
      showDrafts(await importFromImage(file));
    } catch {
      setMessage('Не удалось связаться с сервером. Попробуйте ещё раз.');
    }
    setLoading(false);
  }

  // Временный id черновика не должен уйти на сервер как настоящий id операции —
  // убираем его перед сохранением.
  async function handleConfirm(draft) {
    const { id, ...operation } = draft;
    await onConfirm(operation);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleConfirmAll() {
    for (const draft of drafts) {
      await handleConfirm(draft);
    }
  }

  function handleDiscard(draft) {
    setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
  }

  // Пользователь исправил сумму/категорию черновика вручную — просто
  // обновляем этот черновик в списке, в базу пока ничего не уходит.
  function handleUpdateDraft(id, changes) {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...changes } : d)));
  }

  function handleDiscardAll() {
    setDrafts([]);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">Импорт через AI</h2>

      <AiImportPanel onImportText={handleImportText} onImportImage={handleImportImage} loading={loading} />

      {message && <p className="text-sm text-slate-500">{message}</p>}

      <ImportPreviewList
        items={drafts}
        onConfirm={handleConfirm}
        onConfirmAll={handleConfirmAll}
        onDiscard={handleDiscard}
        onDiscardAll={handleDiscardAll}
        onUpdate={handleUpdateDraft}
      />
    </div>
  );
}
