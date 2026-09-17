import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';

export default function PrivateRoute() {
  const { accessToken, user, setUser } = useAuthStore();
  const location = useLocation();

  // Silent hydrate user if token exists but user is missing
  useEffect(() => {
    if (accessToken && !user) {
      authApi
        .me()
        .then((u) => setUser(u))
        .catch(() => {});
    }
  }, [accessToken, user, setUser]);

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}