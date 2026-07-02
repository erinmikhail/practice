import { useState } from 'react';

const TABS = [
  { key: 'text', label: 'Текст' },
  { key: 'image', label: 'Скриншот' },
];

// Панель отвечает только за ввод данных (текст / картинка) и просит
// родителя (ImportPage) выполнить сам запрос к серверу — так вся логика
// "как разобрать данные" остаётся в одном месте, в src/api.js.
export function AiImportPanel({ onImportText, onImportImage, loading }) {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  function handleSubmit() {
    if (activeTab === 'text') {
      if (!text.trim()) return;
      onImportText(text);
      return;
    }
    if (!file) return;
    onImportImage(file);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <h3 className="text-lg font-medium text-slate-700">Импорт операций через AI</h3>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'text' && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={'Вставьте текст банковской выписки, например:\nКупил кофе 250\nЗарплата 50000'}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      )}

      {activeTab === 'image' && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? 'Распознаём...' : 'Разобрать'}
      </button>

      <p className="text-xs text-slate-400">
        Разбор занимает несколько секунд — данные уходят на сервер и обрабатываются AI-агентом.
      </p>
    </div>
  );
}
