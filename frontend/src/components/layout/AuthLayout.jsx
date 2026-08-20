import { CheckSquare } from 'lucide-react';

// Shared centered-card shell for the login and signup pages. Full-height,
// full-width flex centering means it works from small phones up to wide
// desktop screens without any custom breakpoints — the card itself caps
// its width so it never stretches awkwardly on large screens.
export default function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CheckSquare className="size-5" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {children}

        {footer && (
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        )}
      </div>
    </div>
  );
}
