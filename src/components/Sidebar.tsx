import React from 'react';
import { cn } from '@/utils/cn';
import type { User } from '@/types';
import Avatar from './Avatar';
import Button from './Button';
import {
  Cloud,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

export interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  activePath: string;
  onNavigate: (to: string) => void;
  user: User;
  onLogout?: () => void;
  className?: string;
}

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/admin/quizzes', label: 'Quizzes', Icon: ClipboardList },
  { to: '/admin/results', label: 'Results', Icon: BarChart3 },
  { to: '/admin/profile', label: 'Settings', Icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggle: _onToggle,
  activePath,
  onNavigate,
  user,
  onLogout,
  className,
}) => {
  const handleNavClick = (to: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    onNavigate(to);
  };

  const handleKeyDown = (
    to: string,
    e: React.KeyboardEvent
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavClick(to, e);
    }
  };

  return (
    <aside
      className={cn(
        'fixed h-full bg-white border-r border-slate-200 flex flex-col z-40 transition-all duration-300',
        collapsed ? 'w-20' : 'w-64',
        'lg:flex',
        className
      )}
      aria-label="Sidebar navigation"
    >
      <div
        className={cn(
          'flex items-center gap-2 px-5 h-16 border-b border-slate-200',
          collapsed && 'justify-center px-0'
        )}
      >
        <div className="flex-shrink-0 p-1.5 rounded-lg bg-secondary-50">
          <Cloud className="h-5 w-5 text-secondary-600" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-dark-900 whitespace-nowrap">
            QuizCloud
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1" role="list">
          {navItems.map(({ to, label, Icon }) => {
            const isActive = activePath === to || activePath.startsWith(to + '/');
            return (
              <li key={to}>
                <button
                  type="button"
                  onClick={(e) => handleNavClick(to, e)}
                  onKeyDown={(e) => handleKeyDown(to, e)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? label : undefined}
                >
                  <Icon className={cn('h-5 w-5 flex-shrink-0')} />
                  {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={cn(
          'border-t border-slate-200 p-3',
          collapsed && 'px-2'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg',
            collapsed && 'flex-col gap-2'
          )}
        >
          <Avatar
            name={user.name}
            src={user.avatar}
            size={collapsed ? 'sm' : 'sm'}
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          )}
          {onLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              aria-label="Logout"
              className={collapsed ? 'p-1' : ''}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
