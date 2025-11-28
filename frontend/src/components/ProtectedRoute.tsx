import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InvalidAccess from "../pages/InvalidAccess";

interface Props {
  children: React.ReactNode;
  requireAccounts?: boolean;
}

export default function ProtectedRoute({ children, requireAccounts = false }: Props) {
  const { isAuthenticated, loading, user } = useAuth() as any;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if finance email is required
  if (requireAccounts && user?.email) {
    const email = user.email.toLowerCase();
    if (!email.startsWith("finance")) {
      return <InvalidAccess />;
    }
  }

  return <>{children}</>;
}

