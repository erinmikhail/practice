import { useContext } from 'react';
import { OperationsContext } from '../context/OperationsContext';

// Небольшой хук, чтобы в компонентах не писать useContext(OperationsContext)
// каждый раз и получить понятную ошибку, если забыли обернуть приложение в провайдер.
export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations должен использоваться внутри <OperationsProvider>');
  }
  return context;
}
