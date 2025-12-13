import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function PublicRoute({ children }) {
  const { isAuthenticated } = useUser();

  if (isAuthenticated) {
    // return <Navigate to="/dashboard" replace />;
  }

  return children;
}
