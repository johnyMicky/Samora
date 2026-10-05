import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 bg-linear-to-br from-[#F5C400] to-[#B89100] rounded-2xl flex items-center justify-center shadow-xl shadow-[#F5C400]/20 mb-6 animate-pulse">
          <Shield className="text-[#0B0B0C] w-8 h-8" />
        </div>
        <div className="w-8 h-8 border-2 border-[#29292C] border-t-[#F5C400] rounded-full animate-spin mb-4" />
        <p className="text-sm text-[#A9A9AD] font-medium tracking-wide">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin access protection: normal clients can NEVER access /admin
  // If the client manually enters /admin in the URL, deny access and redirect them to /dashboard
  if (requiredRole === 'admin' && user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Client access protection: administrators are routed to /admin
  if (requiredRole === 'client' && (user.role === 'admin' || user.role === 'super_admin')) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
