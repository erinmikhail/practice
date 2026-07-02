import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OperationsProvider } from './context/OperationsContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { OperationsPage } from './pages/OperationsPage';
import { ImportPage } from './pages/ImportPage';

// OperationsProvider оборачивает весь роутинг, чтобы список операций
// был доступен на любой странице приложения через хук useOperations().
function App() {
  return (
    <OperationsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/operations" element={<OperationsPage />} />
            <Route path="/import" element={<ImportPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </OperationsProvider>
  );
}

export default App;
