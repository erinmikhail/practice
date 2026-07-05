import { useState } from 'react';
import { NavLink } from 'react-router-dom';

// Пункты меню в одном месте — если понадобится добавить страницу,
// достаточно дописать сюда одну строку.
const NAV_ITEMS = [
  { to: '/', label: 'Главная' },
  { to: '/operations', label: 'Операции' },
  { to: '/import', label: 'Импорт (AI)' },
  { to: '/recurring', label: 'Подписки' },
];

// isOpen/onClose управляют сайдбаром только на мобильных экранах (< md) —
// там он спрятан за бургер-меню в AppLayout. На десктопе (md и выше)
// он всегда виден, эти пропсы там ни на что не влияют. onLogout приходит
// из App.jsx — именно там живёт authToken, который решает, пускать ли
// пользователя дальше стартового экрана входа.
export function Sidebar({ isOpen, onClose, onLogout }) {
  // "Ваше имя" по ТЗ хранится только в localStorage — читаем один раз
  // при монтировании, на сервер это значение никогда не уходит. После
  // logout App.jsx уводит на /login и Sidebar размонтируется, так что
  // это значение не нужно сбрасывать вручную.
  const [userName] = useState(() => localStorage.getItem('userName') || '');

  return (
    <>
      {/* Тёмная подложка позади открытого мобильного меню — клик по ней
          закрывает меню, как в обычных бургер-меню. На десктопе не нужна. */}
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
              // На мобильном после перехода на страницу меню нужно закрыть,
              // иначе оно перекроет весь экран поверх контента.
              onClick={onClose}
              // NavLink сам понимает, какая ссылка сейчас активна,
              // и передаёт это через isActive — используем это для подсветки.
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Угол интерфейса с именем пользователя — требование из ТЗ.
            mt-auto прижимает этот блок к низу сайдбара. */}
        <div className="mt-auto border-t border-slate-700 pt-3 text-sm">
          {userName ? (
            <div className="flex items-center justify-between gap-2 px-2">
              <span className="truncate text-slate-300">{userName}</span>
              <button
                type="button"
                onClick={onLogout}
                className="shrink-0 text-xs text-slate-400 hover:text-white"
              >
                Выйти
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Войти
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}
