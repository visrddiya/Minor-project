import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: (Role | 'ADMIN' | 'STAFF' | 'KIOSK' | 'CUSTOMER')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, activeRole } = useQueue();
  const location = useLocation();

  if (!currentUser) {
    // Redirect unauthenticated user to login page with return location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check user role against allowed roles
  const userRole = currentUser.role || activeRole;
  const isAllowed = allowedRoles.some((role) => {
    if (role === 'ADMIN') {
      return ['ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'].includes(userRole);
    }
    if (role === 'STAFF') {
      return ['STAFF', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN', 'BRANCH_ADMIN'].includes(userRole);
    }
    return userRole === role;
  });

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
