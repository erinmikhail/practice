import { useState } from 'react';

const TABS = [
  { key: 'text', label: 'Текст' },
  { key: 'image', label: 'Скриншот' },
];

export function AiImportPanel({ onImportText, onImportImage, loading }) {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  // Проверяем, заблокирована ли кнопка
  const isButtonDisabled =
    loading ||
    (activeTab === 'image' && !file) ||
    (activeTab === 'text' && !text.trim());

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

      {/* Переключатель вкладок */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              // При переключении сбрасываем данные, чтобы кнопка корректно меняла цвет
              if (tab.key === 'text') setFile(null);
              if (tab.key === 'image') setText('');
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeTab === tab.key
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Поле ввода текста */}
      {activeTab === 'text' && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={'Вставьте текст банковской выписки, например:\nКупил кофе 250\nЗарплата 50000'}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      )}

      {/* Поле выбора файла */}
      {activeTab === 'image' && (
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-slate-600">
            Выберите скриншот чека или выписки:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-slate-100 file:text-slate-700
              hover:file:bg-slate-200 file:cursor-pointer cursor-pointer
              border border-slate-300 rounded-lg p-2 bg-slate-50"
          />
        </div>
      )}

      {/* Умная кнопка разбора */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isButtonDisabled}
        className={`w-full sm:w-auto rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ${isButtonDisabled
          ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
          : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:scale-[0.98]'
          }`}
      >
        {loading ? 'Распознаём...' : 'Разобрать'}
      </button>

      <p className="text-xs text-slate-400">
        Разбор занимает несколько секунд — данные уходят на сервер и обрабатываются AI-агентом.
      </p>
    </div>
  );
}