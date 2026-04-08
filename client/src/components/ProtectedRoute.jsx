
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user, isReady, loadUserFromToken } = useAuthStore();

  useEffect(() => {
    loadUserFromToken();
    // eslint-disable-next-line
  }, []);

  if (!isReady) {
    return <div className="p-6 text-center text-gray-400">Loading session...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
