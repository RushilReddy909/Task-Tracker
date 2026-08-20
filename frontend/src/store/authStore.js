import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Holds the logged-in user and JWT. Persisted to localStorage so a page
// refresh doesn't log the user out. Everything else (tasks, analytics)
// is server state and lives in TanStack Query instead — this store is
// only for the small amount of client-only auth state.
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      // Called after a successful login/signup response from the API.
      setAuth: (user, token) => set({ user, token }),

      // Clears auth state on logout or a 401 from the API.
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: 'task-tracker-auth', // localStorage key
    }
  )
);
