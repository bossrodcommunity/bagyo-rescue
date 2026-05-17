import { Link, useRouterState } from '@tanstack/react-router';
import { IconLock } from '@tabler/icons-react';
import { type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Page } from '@/components/ui/page';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = useRouterState({ select: state => state.location.pathname });

  if (isLoading) {
    return (
      <Page width="narrow">
        <Card>
          <CardHeader>
            <CardTitle>Checking session</CardTitle>
            <CardDescription>Loading account access.</CardDescription>
          </CardHeader>
        </Card>
      </Page>
    );
  }

  if (!isAuthenticated) {
    return (
      <Page width="narrow">
        <Card>
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Use an account to continue to this workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="self-start">
              <Link to="/sign-in" search={{ redirect: pathname }}>
                <IconLock className="size-4" aria-hidden="true" />
                Sign in
              </Link>
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return children;
}
