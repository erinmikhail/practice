import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

// Общий каркас для всех страниц: слева сайдбар, справа — содержимое
// текущей страницы. <Outlet /> — это место, куда react-router подставит
// HomePage / OperationsPage / ImportPage в зависимости от адреса.
export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
