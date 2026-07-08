import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Главная' },
  { to: '/operations', label: 'Операции' },
  { to: '/import', label: 'Импорт (AI)' },
  { to: '/recurring', label: 'Подписки' },
];

export function Sidebar({ isOpen, onClose, onLogout }) {
  const [userName] = useState(() => localStorage.getItem('userName') || '');

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-56 shrink-0 flex-col bg-slate-900 text-slate-200 p-4
          transition-transform duration-200 ease-in-out
          md:static md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <h1 className="text-lg font-semibold text-white mb-6 px-2">Мои финансы</h1>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ИСПРАВЛЕНО: Кнопка "Выйти" теперь отображается всегда */}
        <div className="mt-auto border-t border-slate-700 pt-3 text-sm">
          <div className="flex items-center justify-between gap-2 px-2">
            <span className="truncate text-slate-300">
              {userName ? userName : 'Пользователь'}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="shrink-0 text-xs text-slate-400 hover:text-white"
            >
              Выйти
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}