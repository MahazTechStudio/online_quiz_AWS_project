import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import TopNav from "./TopNav";
import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/services/api";
import type { User } from "@/types";

const StudentLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, setUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user: User = authUser || {
    id: "u1",
    name: "Student User",
    email: "student@university.edu",
    role: "student",
    studentId: "U2024001",
    createdAt: "2026-01-15T00:00:00.000Z",
  };

  const handleNavigate = (to: string) => {
    navigate(to);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    setUser(null);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className={cn("min-h-screen bg-slate-50")}>
      <TopNav
        user={user}
        activePath={location.pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
