import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLang, useTheme } from '../App';
import { api, logout } from '../lib/api';
import { LayoutDashboard, ListOrdered, PlusCircle, Target, BookOpen, Wallet, Settings, Sun, Moon, Globe, LogOut } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'dashboard' as const },
  { path: '/trades', icon: ListOrdered, labelKey: 'trades' as const },
  { path: '/add', icon: PlusCircle, labelKey: 'addTrade' as const },
  { path: '/strategies', icon: Target, labelKey: 'strategies' as const },
  { path: '/journal', icon: BookOpen, labelKey: 'journal' as const },
  { path: '/accounts', icon: Wallet, labelKey: 'accounts' as const },
  { path: '/settings', icon: Settings, labelKey: 'settings' as const },
];

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { t, lang, toggleLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState({ name: '', avatar: '' });

  useEffect(() => {
    const load = () => {
      api.getSettings().then(s => setProfile({ name: s.profile_name || '', avatar: s.profile_avatar || '' })).catch(() => {});
    };
    load();
    window.addEventListener('tj-profile-changed', load);
    return () => window.removeEventListener('tj-profile-changed', load);
  }, []);

  const initials = (profile.name || 'TJ').trim().slice(0, 2).toUpperCase();

  return (
    <aside
      className={`sidebar hidden md:flex flex-col ${collapsed ? 'sidebar-collapsed' : ''}`}
      data-collapsed={collapsed ? 'true' : 'false'}
      aria-expanded={!collapsed}
    >
      <div className={`p-4 pb-4 flex items-center ${collapsed ? 'justify-center' : 'justify-start gap-3'}`}>
        <div className="w-11 h-11 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-lg shadow-primary/25 text-white text-sm font-black">
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-extrabold text-text text-[15px] tracking-tight truncate">{profile.name || 'Trade Journal'}</h1>
            <p className="text-[11px] text-text-muted font-medium">v2.0 · Pro</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2.5 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, labelKey }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `nav-item ${collapsed ? 'nav-item-collapsed' : ''} ${isActive ? 'active' : ''}`}
            title={t(labelKey)}
          >
            <Icon size={18} strokeWidth={2.25} className="shrink-0" />
            {!collapsed && <span className="truncate">{t(labelKey)}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2.5 space-y-1 border-t border-border">
        <button type="button" onClick={toggleTheme} className={`nav-item w-full ${collapsed ? 'nav-item-collapsed' : ''}`} title={theme === 'dark' ? 'Light' : 'Dark'}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>}
        </button>
        <button type="button" onClick={toggleLang} className={`nav-item w-full ${collapsed ? 'nav-item-collapsed' : ''}`} title={lang === 'fa' ? 'English' : 'فارسی'}>
          <Globe size={18} />
          {!collapsed && <span>{lang === 'fa' ? 'English' : 'فارسی'}</span>}
        </button>
        <button type="button" onClick={logout} className={`nav-item w-full !text-danger hover:!bg-danger/10 ${collapsed ? 'nav-item-collapsed' : ''}`} title={t('logout')}>
          <LogOut size={18} />
          {!collapsed && <span>{t('logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
