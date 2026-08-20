import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // next-themes resolves the saved/system theme from localStorage after
  // the first render (there's no SSR here, so this is a purely cosmetic
  // "avoid a one-frame flash of the wrong icon" concern, not a
  // hydration-mismatch one) — resolvedTheme is undefined until then.
  // Deriving readiness from that directly, during render, avoids the
  // effect+setState mount-detection pattern flagged by
  // react-hooks/set-state-in-effect.
  const ready = resolvedTheme !== undefined;
  const isDark = ready && resolvedTheme === 'dark';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          {ready ? (
            isDark ? <Sun /> : <Moon />
          ) : (
            <Moon className="opacity-0" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</TooltipContent>
    </Tooltip>
  );
}
