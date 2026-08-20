import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from '@/hooks/useAuth';

// Wraps routes that require a logged-in user. A token merely being present
// in localStorage isn't proof of a valid session — it could be expired,
// forged, or belong to a since-deleted user — so this actually validates
// it against the backend (GET /auth/me) rather than trusting its presence.
export default function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const { isLoading, isError } = useCurrentUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Validating the token against the server — render nothing yet rather
  // than flashing the protected page before we know it's actually allowed.
  if (isLoading) {
    return null;
  }

  // Invalid/expired token: the axios response interceptor already clears
  // the store on a 401, but redirect immediately rather than waiting for
  // that state change to propagate through a re-render.
  if (isError) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
