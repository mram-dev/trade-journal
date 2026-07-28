import { useState } from 'react';
import { api } from '../lib/api';
import { useLang, useTheme } from '../App';
import { Sun, Moon, Globe } from 'lucide-react';

export function Login({ onLogin }: { onLogin: () => void }) {
  const { t, toggleLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(password);
      if (res.ok) onLogin();
      else setError(t('loginFailed'));
    } catch {
      setError(t('loginFailed'));
    }
    setLoading(false);
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        {/* Top-right toggles */}
        <div className="flex items-center justify-end gap-1 mb-5">
          <button type="button" onClick={toggleTheme} className="btn-ghost p-2 rounded-xl" aria-label="theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button type="button" onClick={toggleLang} className="btn-ghost p-2 rounded-xl" aria-label="lang">
            <Globe size={16} />
          </button>
        </div>

        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-info text-white font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30">
            TJ
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">{t('login')}</h1>
          <p className="text-xs text-text-muted mt-1.5 font-medium">Trade Journal v2.0</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{t('password')}</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="text-danger text-sm text-center font-semibold bg-danger/10 rounded-xl py-2">{error}</div>
          )}
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? '…' : t('login')}
          </button>
        </form>
      </div>
    </div>
  );
}
