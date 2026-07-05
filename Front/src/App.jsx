import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getOperations, createOperation, deleteOperation } from './api';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { OperationsPage } from './pages/OperationsPage';
import { ImportPage } from './pages/ImportPage';
import { AuthPage } from './pages/AuthPage';
import { RecurringPage } from './pages/RecurringPage';

// Список операций живёт здесь, в самом верху приложения, и передаётся
// вниз обычными пропсами через каждый Route. Так и Главной, и Операциям
// видны одни и те же (актуальные) данные без Context и лишних хуков.
function App() {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // Токен читаем из localStorage один раз при загрузке — если он есть,
  // считаем пользователя вошедшим. Без него доступа к операциям быть не должно.
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));

  useEffect(() => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    getOperations()
      .then(setOperations)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [authToken]);

  async function addOperation(values) {
    const saved = await createOperation(values);
    setOperations((prev) => [...prev, saved]);
  }

  async function removeOperation(id) {
    await deleteOperation(id);
    setOperations((prev) => prev.filter((operation) => operation.id !== id));
  }

  function handleAuthSuccess(token, name) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userName', name);
    setAuthToken(token);
  }

  function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    setAuthToken(null);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={authToken ? <Navigate to="/" replace /> : <AuthPage onAuthSuccess={handleAuthSuccess} />}
        />

        <Route element={<AppLayout onLogout={handleLogout} />}>
          <Route
            path="/"
            element={
              authToken ? (
                <HomePage operations={operations} loading={loading} loadError={loadError} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/operations"
            element={
              authToken ? (
                <OperationsPage
                  operations={operations}
                  loading={loading}
                  loadError={loadError}
                  onAdd={addOperation}
                  onDelete={removeOperation}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/import"
            element={authToken ? <ImportPage onConfirm={addOperation} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/recurring"
            element={authToken ? <RecurringPage /> : <Navigate to="/login" replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
