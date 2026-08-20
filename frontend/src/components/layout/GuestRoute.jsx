import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from '@/hooks/useAuth';

// Wraps routes meant only for logged-out visitors (login, signup). If the
// stored token turns out to be valid, there's no reason to show a login
// form to someone who's already authenticated — send them straight to the
// dashboard instead. Mirrors ProtectedRoute's validation (not just
// "a token is present") so a stale/expired token doesn't block access to
// the login page it would otherwise be needed to replace.
export default function GuestRoute() {
  const token = useAuthStore((state) => state.token);
  const { isLoading, isError } = useCurrentUser();

  // No token at all — definitely a guest, nothing to validate.
  if (!token) {
    return <Outlet />;
  }

  // Validating the token — render nothing yet rather than flashing the
  // login form before we know whether this visitor is actually logged in.
  if (isLoading) {
    return null;
  }

  // Token turned out to be invalid/expired — treat as a guest.
  if (isError) {
    return <Outlet />;
  }

  // Valid session — no reason to show login/signup.
  return <Navigate to="/" replace />;
}
