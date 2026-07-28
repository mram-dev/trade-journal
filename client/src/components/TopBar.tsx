import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLang, useTheme } from '../App';
import { api, logout } from '../lib/api';
import { ChevronDown, Sun, Moon, Globe, PanelLeftOpen, PanelLeftClose, Settings as SettingsIcon, LogOut } from 'lucide-react';

interface TopBarProps {
  selectedAccount: number | null;
  onAccountChange: (id: number | null) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const pageTitles: Record<string, Record<string, string>> = {
  fa: { '/': 'داشبورد', '/trades': 'تریدها', '/add': 'ثبت ترید', '/strategies': 'استراتژیها', '/journal': 'ژورنال روزانه', '/accounts': 'حسابها', '/settings': 'تنظیمات' },
  en: { '/': 'Dashboard', '/trades': 'Trades', '/add': 'Add Trade', '/strategies': 'Strategies', '/journal': 'Daily Journal', '/accounts': 'Accounts', '/settings': 'Settings' },
};

export function TopBar({ selectedAccount, onAccountChange, onToggleSidebar, sidebarOpen }: TopBarProps) {
  const { lang, t, toggleLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [profile, setProfile] = useState({ name: '', avatar: '' });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const refreshAccounts = () => {
    api.getAccounts().then(r => setAccounts(r.accounts || [])).catch(() => {});
  };

  // Initial load + realtime: listen for 'tj-data-changed' from trade mutations,
  // focus refetch, and 10s poll for MT5 sync
  useEffect(() => {
    refreshAccounts();
    const onChange = () => refreshAccounts();
    window.addEventListener('tj-data-changed', onChange);
    window.addEventListener('focus', onChange);
    const poll = setInterval(refreshAccounts, 10000);
    // ponytail: same lookup as Sidebar so the header mirrors the sidebar instantly
    const reloadProfile = () => api.getSettings().then(s => setProfile({ name: s.profile_name || '', avatar: s.profile_avatar || '' })).catch(() => {});
    reloadProfile();
    window.addEventListener('tj-profile-changed', reloadProfile);
    return () => {
      window.removeEventListener('tj-data-changed', onChange);
      window.removeEventListener('focus', onChange);
      window.removeEventListener('tj-profile-changed', reloadProfile);
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const title = pageTitles[lang]?.[location.pathname] || pageTitles.fa[location.pathname] || '';

  const fmtBalance = (acc: any) => {
    const n = Number(acc.balance) || 0;
    const cur = acc.currency || '$';
    return `${acc.name} (${n.toFixed(0)} ${cur})`;
  };

  return (
    <header className="topbar flex items-center justify-between px-3 md:px-5 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden md:inline-flex sidebar-toggle"
          aria-label="toggle sidebar"
        >
          {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>
        <h2 className="font-extrabold text-text text-sm md:text-base truncate tracking-tight">{title}</h2>
      </div>
      <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
        <div className="relative">
          <select
            value={selectedAccount || ''}
            onChange={(e) => onAccountChange(e.target.value ? Number(e.target.value) : null)}
            className="input text-[11px] md:text-sm py-1.5 pe-7 w-auto max-w-[9rem] md:max-w-[14rem] md:min-w-[10rem] appearance-none"
          >
            <option value="">{t('all')}</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{fmtBalance(acc)}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute end-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
        <div className="relative md:hidden" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            className="w-7 h-7 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-info flex items-center justify-center text-white text-[11px] font-black shrink-0"
            aria-label="profile"
            aria-expanded={menuOpen}
          >
            {profile.avatar
              ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              : (profile.name || 'TJ').trim().slice(0, 2).toUpperCase()}
          </button>
          {menuOpen && (
            <div className="absolute end-0 top-full mt-1.5 z-50 w-40 rounded-xl border border-border bg-surface shadow-lg py-1 overflow-hidden">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-text hover:bg-surface-secondary"
              >
                <SettingsIcon size={14} /> {t('settings')}
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); logout(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-danger hover:bg-danger/10"
              >
                <LogOut size={14} /> {t('logout')}
              </button>
            </div>
          )}
        </div>
        <button type="button" onClick={toggleTheme} className="btn-ghost p-2 rounded-xl" aria-label="theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button type="button" onClick={toggleLang} className="btn-ghost p-2 rounded-xl" aria-label="lang">
          <Globe size={16} />
        </button>
      </div>
    </header>
  );
}
