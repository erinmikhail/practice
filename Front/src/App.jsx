import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getOperations, createOperation, deleteOperation } from './api';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { OperationsPage } from './pages/OperationsPage';
import { ImportPage } from './pages/ImportPage';

// Список операций живёт здесь, в самом верху приложения, и передаётся
// вниз обычными пропсами через каждый Route. Так и Главной, и Операциям
// видны одни и те же (актуальные) данные без Context и лишних хуков.
function App() {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    getOperations()
      .then(setOperations)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  async function addOperation(values) {
    const saved = await createOperation(values);
    setOperations((prev) => [...prev, saved]);
  }

  async function removeOperation(id) {
    await deleteOperation(id);
    setOperations((prev) => prev.filter((operation) => operation.id !== id));
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={<HomePage operations={operations} loading={loading} loadError={loadError} />}
          />
          <Route
            path="/operations"
            element={
              <OperationsPage
                operations={operations}
                loading={loading}
                loadError={loadError}
                onAdd={addOperation}
                onDelete={removeOperation}
              />
            }
          />
          <Route path="/import" element={<ImportPage onConfirm={addOperation} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
