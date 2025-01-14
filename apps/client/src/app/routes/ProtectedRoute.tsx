import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '@/app/providers/auth/AuthContext';

function ProtectedRoute() {
  const { isLoggedIn } = useContext(AuthContext);
  const accessToken = localStorage.getItem('accessToken');

  return isLoggedIn || accessToken ? <Outlet /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;
