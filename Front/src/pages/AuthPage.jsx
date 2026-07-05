import { useState } from 'react';
import { login, register } from '../api';
import { Modal } from '../components/common/Modal';
import { CONSENT_POLICY_TEXT } from '../constants/consent';

// Стартовый экран приложения: без токена сюда попадают все — выбор между
// вкладками "Вход" и "Регистрация". После успешного входа/регистрации
// App.jsx получает токен через onAuthSuccess и пускает дальше в приложение.
export function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreedToConsent, setAgreedToConsent] = useState(false);
  const [isPolicyOpen, setPolicyOpen] = useState(false);
  const [error, setError] = useState('');
  const [errorAction, setErrorAction] = useState(null); // на какую вкладку предложить перейти
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode) {
    setMode(nextMode);
    setError('');
    setErrorAction(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setErrorAction(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(username, password, agreedToConsent);
      }
      // И после регистрации, и при обычном входе результат один и тот же —
      // логинимся, чтобы не заставлять вводить всё дважды.
      const data = await login(username, password);
      onAuthSuccess(data.access_token, name);
    } catch (err) {
      const status = err.response?.status;
      if (mode === 'register' && status === 400) {
        setError('Логин уже существует, перейдите на страницу входа.');
        setErrorAction('login');
      } else if (mode === 'login' && status === 404) {
        setError('Логин не найден, перейдите на страницу регистрации.');
        setErrorAction('register');
      } else if (status === 401) {
        setError('Неверный пароль.');
      } else {
        setError('Не удалось выполнить запрос. Попробуйте ещё раз позже.');
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-lg font-semibold text-slate-800">Мои финансы</h1>
        <p className="mb-6 text-sm text-slate-500">
          {mode === 'login' ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
        </p>

        <div className="mb-5 flex gap-2">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
              mode === 'login' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
              mode === 'register' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Логин</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Ваше имя</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Только для отображения в интерфейсе"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          {mode === 'register' && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <input
                id="consent-checkbox"
                type="checkbox"
                checked={agreedToConsent}
                onChange={(event) => setAgreedToConsent(event.target.checked)}
                required
                className="mt-0.5 shrink-0"
              />
              <label htmlFor="consent-checkbox">
                Я даю согласие на обработку моих персональных данных в соответствии с{' '}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setPolicyOpen(true);
                  }}
                  className="text-slate-900 underline underline-offset-2"
                >
                  Политикой обработки персональных данных
                </button>
                .
              </label>
            </div>
          )}

          {error && (
            <p className="text-sm text-rose-600">
              {error}{' '}
              {errorAction && (
                <button
                  type="button"
                  onClick={() => switchMode(errorAction)}
                  className="underline underline-offset-2"
                >
                  {errorAction === 'login' ? 'Перейти ко входу' : 'Перейти к регистрации'}
                </button>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'register' && !agreedToConsent)}
            className="w-full rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>

      <Modal
        isOpen={isPolicyOpen}
        onClose={() => setPolicyOpen(false)}
        title="Политика обработки персональных данных"
      >
        <p className="whitespace-pre-line text-sm text-slate-600">{CONSENT_POLICY_TEXT}</p>
      </Modal>
    </div>
  );
}
