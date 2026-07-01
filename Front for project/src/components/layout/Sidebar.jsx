import { NavLink } from 'react-router-dom';

// Пункты меню в одном месте — если понадобится добавить страницу,
// достаточно дописать сюда одну строку.
const NAV_ITEMS = [
  { to: '/', label: 'Главная' },
  { to: '/operations', label: 'Операции' },
  { to: '/import', label: 'Импорт (AI)' },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-slate-900 text-slate-200 min-h-screen p-4">
      <h1 className="text-lg font-semibold text-white mb-6 px-2">Мои финансы</h1>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
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
    </aside>
  );
}
