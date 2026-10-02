import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import type { User } from '@/types';
import Avatar from './Avatar';
import Button from './Button';
import {
  BookOpenCheck,
  Menu,
  X,
  Bell,
  ChevronDown,
  User as UserIcon,
  LogOut,
} from 'lucide-react';

export interface TopNavProps {
  user: User;
  activePath: string;
  onNavigate: (to: string) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  className?: string;
}

const navLinks = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/quizzes', label: 'Quizzes' },
  { to: '/student/results', label: 'Results' },
  { to: '/student/profile', label: 'Profile' },
];

const TopNav: React.FC<TopNavProps> = ({
  user,
  activePath,
  onNavigate,
  onLogout,
  mobileOpen,
  setMobileOpen,
  className,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (to: string) => {
    onNavigate(to);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout();
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 h-16 bg-white border-b border-slate-200 z-30',
          className
        )}
      >
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('/student/dashboard')}
              className="flex items-center gap-2 focus:outline-none"
              aria-label="QuizCloud home"
            >
              <div className="flex-shrink-0 p-1.5 rounded-lg bg-secondary-50">
                <BookOpenCheck className="h-5 w-5 text-secondary-600" />
              </div>
              <span className="text-xl font-bold text-dark-900">
                QuizCloud
              </span>
            </button>
          </div>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(({ to, label }) => {
              const isActive =
                activePath === to || activePath.startsWith(to + '/');
              return (
                <button
                  key={to}
                  type="button"
                  onClick={() => handleNavClick(to)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/30 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error-500" />
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                aria-label="User menu"
              >
                <Avatar
                  name={user.name}
                  src={user.avatar}
                  size="sm"
                />
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-slate-500 transition-transform',
                    dropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-40 py-1"
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleNavClick('/student/profile');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 text-dark-800 focus:outline-none focus:bg-slate-50"
                    role="menuitem"
                  >
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    View Profile
                  </button>
                  <div className="my-1 h-px bg-slate-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 text-error-600 focus:outline-none focus:bg-slate-50"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4 text-error-400" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-xl lg:hidden flex flex-col"
            role="dialog"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 p-1.5 rounded-lg bg-secondary-50">
                  <BookOpenCheck className="h-5 w-5 text-secondary-600" />
                </div>
                <span className="text-lg font-bold text-dark-900">QuizCloud</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 p-5 space-y-1">
              {navLinks.map(({ to, label }) => {
                const isActive =
                  activePath === to || activePath.startsWith(to + '/');
                return (
                  <button
                    key={to}
                    type="button"
                    onClick={() => handleNavClick(to)}
                    className={cn(
                      'w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>

            <div className="p-5 border-t border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Avatar
                  name={user.name}
                  src={user.avatar}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline-primary"
                fullWidth
                leftIcon={<LogOut className="h-4 w-4" />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default TopNav;
