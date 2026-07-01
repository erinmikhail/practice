import { createContext, useCallback, useEffect, useState } from 'react';
import { getOperations, createOperation, deleteOperation } from '../api/operations';

// Контекст хранит список операций в одном месте, чтобы Главная страница
// и страница Операций всегда видели одни и те же (актуальные) данные,
// не передавая их вручную через десять уровней пропсов.
export const OperationsContext = createContext(null);

export function OperationsProvider({ children }) {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  // При первом рендере загружаем операции. Сейчас getOperations() читает
  // localStorage, но выглядит как обычный await-запрос — так и должно быть.
  useEffect(() => {
    getOperations().then((data) => {
      setOperations(data);
      setLoading(false);
    });
  }, []);

  const addOperation = useCallback(async (values) => {
    const saved = await createOperation(values);
    setOperations((prev) => [...prev, saved]);
  }, []);

  const removeOperation = useCallback(async (id) => {
    await deleteOperation(id);
    setOperations((prev) => prev.filter((operation) => operation.id !== id));
  }, []);

  const value = { operations, loading, addOperation, removeOperation };

  return (
    <OperationsContext.Provider value={value}>
      {children}
    </OperationsContext.Provider>
  );
}
