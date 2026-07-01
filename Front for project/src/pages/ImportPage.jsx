import { useState } from 'react';
import { useOperations } from '../hooks/useOperations';
import { importFromAI } from '../api/operations';
import { AiImportPanel } from '../components/ai-import/AiImportPanel';
import { ImportPreviewList } from '../components/ai-import/ImportPreviewList';

export function ImportPage() {
  const { addOperation } = useOperations();
  const [previewItems, setPreviewItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState('');

  async function handleImport(payload) {
    setLoading(true);
    setEmptyMessage('');
    const items = await importFromAI(payload);
    setPreviewItems(items);
    if (items.length === 0) {
      setEmptyMessage('Не удалось найти операции — попробуйте другой текст, файл или скриншот.');
    }
    setLoading(false);
  }

  // Превью хранит служебные поля id/pending, которых не должно быть
  // у настоящей сохранённой операции — убираем их перед добавлением.
  function toRealOperation(item) {
    const { id, pending, ...operation } = item;
    return operation;
  }

  async function handleConfirm(item) {
    await addOperation(toRealOperation(item));
    setPreviewItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  async function handleConfirmAll() {
    for (const item of previewItems) {
      await addOperation(toRealOperation(item));
    }
    setPreviewItems([]);
  }

  function handleDiscard(item) {
    setPreviewItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  function handleDiscardAll() {
    setPreviewItems([]);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">Импорт через AI</h2>

      <AiImportPanel onImport={handleImport} loading={loading} />

      {emptyMessage && <p className="text-sm text-slate-500">{emptyMessage}</p>}

      <ImportPreviewList
        items={previewItems}
        onConfirm={handleConfirm}
        onConfirmAll={handleConfirmAll}
        onDiscard={handleDiscard}
        onDiscardAll={handleDiscardAll}
      />
    </div>
  );
}
