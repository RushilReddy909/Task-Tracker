import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

// Rendered for any URL that doesn't match a real route — a typo'd link, a
// stale bookmark, whatever. Previously unknown paths silently redirected
// straight to "/" (or "/login") with no explanation; this gives the user
// an actual page instead of an unexplained bounce.
export default function NotFoundPage() {
  const token = useAuthStore((state) => state.token);
  const homeHref = token ? '/' : '/login';

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileQuestion className="size-7" />
      </div>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
      </div>
      <Button asChild>
        <Link to={homeHref}>{token ? 'Back to tasks' : 'Back to login'}</Link>
      </Button>
    </div>
  );
}
