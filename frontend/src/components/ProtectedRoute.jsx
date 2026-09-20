import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

function Loading() {
  return (
    <div className="min-h-screen grid place-items-center bg-void">
      <Loader2 className="animate-spin text-cyan" size={32} />
    </div>
  );
}

export function ProtectedRoute({ children, role }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready || user === null) return <Loading />;
  if (!user) {
    const to = role === "admin" ? "/admin/login" : "/login";
    return <Navigate to={to} state={{ from: location }} replace />;
  }
  if (role === "admin" && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (role === "client" && user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return children;
}
