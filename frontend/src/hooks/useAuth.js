import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/api/axiosInstance';
import { useAuthStore } from '@/store/authStore';

const authKeys = {
  me: ['auth', 'me'],
};

// Validates the stored JWT against the backend (GET /auth/me, which the
// `protect` middleware fully verifies — signature, expiry, and that the
// user still exists) rather than trusting "a token is present in
// localStorage" as proof of a valid session. A token can be stale (past
// its JWT_EXPIRES_IN), forged, or for a since-deleted user, and none of
// those are detectable client-side without asking the server.
//
// Only runs the request when a token exists at all — logged-out users
// never hit the network for this.
export function useCurrentUser() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.get('/auth/me').then((res) => res.data.user),
    enabled: Boolean(token),
    // A 401 here means the token is invalid/expired — the axios response
    // interceptor already clears the store on 401, so retrying is pointless
    // (it'll just 401 again) and would only delay the redirect to /login.
    retry: false,
  });
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/auth/login', data).then((res) => res.data),
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      // Seed the /auth/me cache with the user we just got back, instead of
      // letting ProtectedRoute/GuestRoute's useCurrentUser immediately
      // re-fetch it — we already know the token is valid, we just issued it.
      queryClient.setQueryData(authKeys.me, user);
      toast.success('Welcome back!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    },
  });
}

export function useSignup() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/auth/signup', data).then((res) => res.data),
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      queryClient.setQueryData(authKeys.me, user);
      toast.success("Account created — you're all set!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    },
  });
}

export { authKeys };
