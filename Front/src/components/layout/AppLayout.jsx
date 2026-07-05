import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

// Общий каркас для всех страниц: слева сайдбар, справа — содержимое
// текущей страницы. <Outlet /> — это место, куда react-router подставит
// HomePage / OperationsPage / ImportPage в зависимости от адреса.
export function AppLayout({ onLogout }) {
  // На мобильных сайдбар спрятан за бургер-меню — это состояние хранит,
  // открыт он сейчас или нет. На десктопе (md и выше) сайдбар всегда
  // виден и это состояние не используется.
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Верхняя панель с кнопкой-гамбургером видна только на мобильных
            (md:hidden) — на десктопе сайдбар и так всегда открыт слева. */}
        <header className="flex items-center gap-3 bg-slate-900 p-4 text-white md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Открыть меню"
            className="rounded-lg p-2 hover:bg-slate-800"
          >
            {/* Иконка гамбургера — три полоски обычным SVG, без сторонних библиотек */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="font-semibold">Мои финансы</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
