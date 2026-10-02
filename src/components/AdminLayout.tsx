import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Avatar from "./Avatar";
import SearchInput from "./SearchInput";
import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/services/api";
import type { User } from "@/types";
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  User as UserIcon,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, setUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user: User = authUser || {
    id: "u2",
    name: "Admin User",
    email: "admin@university.edu",
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (to: string) => {
    navigate(to);
    setMobileSidebarOpen(false);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <div className={cn("min-h-screen bg-slate-50")}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        activePath={location.pathname}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
        className={cn(
          "hidden lg:flex",
          collapsed ? "lg:translate-x-0 lg:w-20" : "lg:translate-x-0",
        )}
      />

      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50">
            <Sidebar
              activePath={location.pathname}
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
            />
          </div>
        </>
      )}

      <div
        className={cn(
          "lg:transition-all lg:duration-300",
          collapsed ? "lg:ml-20" : "lg:ml-64",
        )}
      >
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                aria-label={
                  mobileSidebarOpen ? "Close sidebar" : "Open sidebar"
                }
              >
                {mobileSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <PanelLeft className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </button>

              <div className="max-w-md w-full flex-shrink-0 hidden sm:block">
                <SearchInput placeholder="Search quizzes, users..." />
              </div>
            </div>

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
                  <Avatar name={user.name} src={user.avatar} size="sm" />
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-500 transition-transform hidden sm:block",
                      dropdownOpen && "rotate-180",
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
                        handleNavigate("/admin/profile");
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
