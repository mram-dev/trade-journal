import { NavLink } from 'react-router-dom';
import { useLang } from '../App';
import { LayoutDashboard, ListOrdered, PlusCircle, Target, Wallet } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'dashboard' as const },
  { path: '/trades', icon: ListOrdered, labelKey: 'trades' as const },
  { path: '/add', icon: PlusCircle, labelKey: 'addTrade' as const, accent: true },
  { path: '/strategies', icon: Target, labelKey: 'strategies' as const },
  { path: '/accounts', icon: Wallet, labelKey: 'accounts' as const },
];

export function BottomNav() {
  const { t } = useLang();

  return (
    <nav className="bottom-nav md:hidden">
      {navItems.map(({ path, icon: Icon, labelKey, accent }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] py-1 transition-colors ${
              accent
                ? isActive
                  ? 'text-primary'
                  : 'text-primary'
                : isActive
                  ? 'text-primary'
                  : 'text-text-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex items-center justify-center rounded-2xl transition-all ${
                  accent
                    ? 'w-11 h-11 -mt-4 bg-gradient-to-br from-primary to-primary-hover text-white shadow-lg shadow-primary/40'
                    : isActive
                      ? 'w-9 h-7 bg-primary/10'
                      : 'w-9 h-7'
                }`}
              >
                <Icon size={accent ? 22 : 18} strokeWidth={2.25} />
              </span>
              <span className={`text-[10px] font-bold ${accent ? 'mt-0.5' : ''}`}>{t(labelKey)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
