import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import GuestRoute from '@/components/layout/GuestRoute';

// Each page is its own chunk, fetched only when its route is visited —
// AnalyticsPage in particular pulls in Recharts (the single heaviest
// dependency in the app), which previously meant every visitor downloaded
// charting code just to log in or view their task list. Splitting per
// route means the initial bundle only contains what a given visit actually
// needs.
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function RouteFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* GuestRoute sends an already-authenticated visitor straight to the
            dashboard instead of showing them a login/signup form. */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Unknown paths get an actual 404 page instead of a silent redirect
            — a typo'd link or stale bookmark should tell the user what
            happened, not bounce them to the dashboard with no explanation. */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
