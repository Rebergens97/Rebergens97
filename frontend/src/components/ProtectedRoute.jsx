import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Routes that should NOT be blocked by force_password_change
const PASSWORD_CHANGE_WHITELIST = [
  '/admin/login',
  '/admin/change-password'
];

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  
  console.log('[ProtectedRoute] Check:', {
    path: location.pathname,
    isAuthenticated,
    loading,
    userEmail: user?.email,
    forcePasswordChange: user?.force_password_change,
    allowedRoles
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  // Check if current path is whitelisted for password change bypass
  const isWhitelisted = PASSWORD_CHANGE_WHITELIST.some(path => 
    location.pathname === path || location.pathname.startsWith(path)
  );
  
  console.log('[ProtectedRoute] Whitelist check:', { 
    path: location.pathname, 
    isWhitelisted,
    forcePasswordChange: user?.force_password_change 
  });

  // Only redirect to change-password if:
  // 1. User needs to change password
  // 2. Current path is NOT whitelisted
  if (user?.force_password_change && !isWhitelisted) {
    console.log('[ProtectedRoute] Force password change, redirecting to change-password');
    return <Navigate to="/admin/change-password" replace />;
  }

  // Role check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.log('[ProtectedRoute] Role not allowed, redirecting to admin');
    return <Navigate to="/admin" replace />;
  }

  console.log('[ProtectedRoute] Access granted');
  return children;
};
