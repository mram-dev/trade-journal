import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { isLoggedIn } from './lib/api';
import { Dashboard } from './pages/Dashboard';
import { Trades } from './pages/Trades';
import { AddTrade } from './pages/AddTrade';
import { Strategies } from './pages/Strategies';
import { Journal } from './pages/Journal';
import { Accounts } from './pages/Accounts';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { ConfirmHost } from './components/ConfirmHost';
import { ToastHost } from './components/ToastHost';
import { translations, type TranslationKey } from './lib/i18n';

type Lang = 'fa' | 'en';
type Theme = 'light' | 'dark';

const LangContext = createContext<{
  lang: Lang;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
}>({ lang: 'fa', t: (k) => k, toggleLang: () => {} });

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: 'light', toggleTheme: () => {} });

export const useLang = () => useContext(LangContext);
export const useTheme = () => useContext(ThemeContext);

export default function App() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'fa');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [authed, setAuthed] = useState(() => isLoggedIn());
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const v = localStorage.getItem('sb_collapsed');
    return v === null ? true : v === '1';
  });

  const toggleSidebar = () => setSidebarCollapsed(v => {
    const nv = !v;
    localStorage.setItem('sb_collapsed', nv ? '1' : '0');
    return nv;
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ponytail: keyboard shortcuts — Esc closes any open dropdown/filter on Trades page;
  // "n" jumps to New Trade (when not typing); "/" focuses the trades search if on /trades.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;
      const onLoginPage = window.location.pathname === '/login' || !isLoggedIn();
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('tj-esc'));
        return;
      }
      if (isTyping || onLoginPage) return;
      if (e.key === 'n' || e.key === 'N') {
        window.location.href = '/add';
        return;
      }
      if (e.key === '/') {
        const searchInput = document.querySelector<HTMLInputElement>('[data-tj-search]');
        if (searchInput) { e.preventDefault(); searchInput.focus(); }
        return;
      }
      if (e.key === 'g') {
        // toggle lang
        setLang(l => { const nv = l === 'fa' ? 'en' : 'fa'; localStorage.setItem('lang', nv); return nv; });
        return;
      }
      if (e.key === 't') {
        setTheme(th => { const nv = th === 'light' ? 'dark' : 'light'; localStorage.setItem('theme', nv); return nv; });
        return;
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const t = (key: TranslationKey) => translations[lang]?.[key] || translations.fa[key] || key;
  const toggleLang = () => setLang(l => l === 'fa' ? 'en' : 'fa');
  const toggleTheme = () => setTheme(th => th === 'light' ? 'dark' : 'light');

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <BrowserRouter>
          {!authed ? (
            <Routes>
              <Route path="/login" element={<Login onLogin={() => setAuthed(true)} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          ) : (
            <div className="flex min-h-screen bg-background">
              <Sidebar
                collapsed={sidebarCollapsed}
              />
              <div className={`flex-1 flex flex-col main-shell ${sidebarCollapsed ? 'main-shell-collapsed' : ''}`}>
                <TopBar
                  selectedAccount={selectedAccount}
                  onAccountChange={setSelectedAccount}
                  onToggleSidebar={toggleSidebar}
                  sidebarOpen={!sidebarCollapsed}
                />
                <main className="flex-1 p-3 md:p-5 pb-20 md:pb-5">
                  <Routes>
                    <Route path="/" element={<Dashboard accountId={selectedAccount} />} />
                    <Route path="/trades" element={<Trades accountId={selectedAccount} />} />
                    <Route path="/add" element={<AddTrade accountId={selectedAccount} />} />
                    <Route path="/strategies" element={<Strategies />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/login" element={<Navigate to="/" />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
              </div>
              <BottomNav />
            </div>
          )}
          <ConfirmHost />
          <ToastHost />
        </BrowserRouter>
      </ThemeContext.Provider>
    </LangContext.Provider>
  );
}
