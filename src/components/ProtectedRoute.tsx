import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { isAdmin, loading } = useAuth();
  
  if (loading) return <div className="p-8 text-center text-text-muted">Loading...</div>;
  
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
