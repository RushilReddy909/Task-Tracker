import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Wraps routes that require a logged-in user. If there's no token,
// redirect to /login instead of rendering the protected page.
export default function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
