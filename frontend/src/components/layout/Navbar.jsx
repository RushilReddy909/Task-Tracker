import { NavLink } from 'react-router-dom';
import { CheckSquare, LogOut, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/layout/ThemeToggle';

const NAV_LINKS = [
  { to: '/', label: 'Tasks' },
  { to: '/analytics', label: 'Analytics' },
];

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <CheckSquare className="size-4" />
            </div>
            <span className="font-heading text-lg font-semibold text-foreground">Task Tracker</span>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Below `sm` the inline nav above is hidden entirely (no room
              for it next to the logo), so this dropdown is the only way to
              reach Tasks/Analytics on mobile — without it those pages were
              unreachable from the navbar on small screens. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Open navigation menu">
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {NAV_LINKS.map((link) => (
                <DropdownMenuItem key={link.to} asChild>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) => cn(isActive && 'bg-accent text-foreground')}
                  >
                    {link.label}
                  </NavLink>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {user?.email && (
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
          )}
          <ThemeToggle />
          {/* Uses the theme's destructive token (not a raw Tailwind red)
              so it stays correctly tuned for both light and dark mode —
              same color family as delete/destructive actions elsewhere. */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
          >
            <LogOut />
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
