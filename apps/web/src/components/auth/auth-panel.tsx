import { useState, type FormEvent, type ReactNode } from 'react';
import { IconLock, IconUserPlus } from '@tabler/icons-react';
import { Alert, AlertBody } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'register';

export type AuthPanelProps = {
  onAuthenticated?: () => void | Promise<void>;
};

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const { isLoading, login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      if (mode === 'login') {
        await login({
          identifier: String(form.get('identifier') ?? '').trim(),
          password: String(form.get('password') ?? ''),
        });
      } else {
        await register({
          email: String(form.get('email') ?? '').trim(),
          username: String(form.get('username') ?? '').trim(),
          name: String(form.get('name') ?? '').trim() || null,
          password: String(form.get('password') ?? ''),
        });
      }

      await onAuthenticated?.();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'login' ? 'Sign in' : 'Create account'}</CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Use your email or username and password.'
            : 'Set up coordinator access with an email, username, and password.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 rounded-md border border-border bg-surface-muted p-1">
          <ModeButton mode="login" activeMode={mode} onClick={() => setMode('login')}>
            <IconLock className="size-4" aria-hidden="true" />
            Sign in
          </ModeButton>
          <ModeButton mode="register" activeMode={mode} onClick={() => setMode('register')}>
            <IconUserPlus className="size-4" aria-hidden="true" />
            Register
          </ModeButton>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {mode === 'login' ? (
            <Label htmlFor="identifier">
              Email or username
              <Input
                id="identifier"
                name="identifier"
                autoComplete="username"
                required
                disabled={isLoading || isSubmitting}
              />
            </Label>
          ) : (
            <>
              <Label htmlFor="email">
                Email
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading || isSubmitting}
                />
              </Label>
              <Label htmlFor="username">
                Username
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  minLength={3}
                  pattern="[A-Za-z0-9_]+"
                  required
                  disabled={isLoading || isSubmitting}
                />
              </Label>
              <Label htmlFor="name">
                Name
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  disabled={isLoading || isSubmitting}
                />
              </Label>
            </>
          )}

          <Label htmlFor="password">
            Password
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={mode === 'register' ? 8 : undefined}
              required
              disabled={isLoading || isSubmitting}
            />
          </Label>

          {formError ? (
            <Alert tone="danger">
              <AlertBody>{formError}</AlertBody>
            </Alert>
          ) : null}

          <Button
            type="submit"
            className="self-start"
            isLoading={isSubmitting}
            loadingLabel={mode === 'login' ? 'Signing in...' : 'Creating account...'}
          >
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ModeButton({
  mode,
  activeMode,
  onClick,
  children,
}: {
  mode: AuthMode;
  activeMode: AuthMode;
  onClick: () => void;
  children: ReactNode;
}) {
  const isActive = mode === activeMode;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-sm px-3 text-label-md transition-colors',
        isActive ? 'bg-surface text-foreground shadow-raised' : 'text-muted-foreground'
      )}
    >
      {children}
    </button>
  );
}
