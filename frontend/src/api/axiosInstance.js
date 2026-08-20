import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// Relative path so requests go through Vite's dev server proxy
// (see server.proxy in vite.config.js) instead of hitting the backend's
// origin directly — avoids CORS in dev. VITE_API_URL can still override
// this (e.g. pointing at a deployed backend URL in production), in which
// case the proxy is simply bypassed since the browser talks to that
// origin directly instead.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach the JWT to every outgoing request, read fresh from the store
// each time (not captured once at module-load) so a login/logout during
// the session is picked up immediately.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever says the token is invalid/expired, clear local
// auth state so the app falls back to the login screen instead of
// silently failing every subsequent request.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

export default api;
