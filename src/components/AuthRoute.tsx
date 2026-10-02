import React from "react";
import { Navigate } from "react-router-dom";
import LoadingOverlay from "./LoadingOverlay";
import type { Role } from "@/types";
import { useAuth } from "@/context/AuthContext";

export interface AuthRouteProps {
  requiredRole?: Role;
  children: React.ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ requiredRole, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingOverlay text="Authenticating..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const redirectTo =
      user.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;
