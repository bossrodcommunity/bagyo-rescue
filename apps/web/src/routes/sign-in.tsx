import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';
import { AuthPanel } from '@/components/auth/auth-panel';
import { Page } from '@/components/ui/page';
import { useAuth } from '@/lib/auth';

const signInSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/sign-in')({
  validateSearch: signInSearchSchema,
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { isAuthenticated } = useAuth();
  const redirectTo = search.redirect?.startsWith('/') ? search.redirect : '/admin';

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: redirectTo });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  return (
    <Page width="narrow" className="flex flex-col gap-6">
      <AuthPanel onAuthenticated={() => navigate({ to: redirectTo })} />
    </Page>
  );
}
