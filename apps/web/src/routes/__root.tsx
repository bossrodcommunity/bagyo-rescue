import { Link, Outlet, createRootRouteWithContext, useRouterState } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { IconLogout } from '@tabler/icons-react';
import { Wordmark } from '@/components/brand/wordmark';
import { OfflineBadge } from '@/components/ui/offline-badge';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/ui/page';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => (
    <Page width="narrow" className="flex flex-col gap-5">
      <h1 className="text-display-lg text-foreground">Hindi mahanap ang pahina</h1>
      <p className="text-body-md text-muted-foreground">We couldn&rsquo;t find that page.</p>
      <Button asChild size="md" className="self-start">
        <Link to="/">Bumalik sa dashboard</Link>
      </Button>
    </Page>
  ),
});

const navItems = [
  { to: '/' as const, label: 'Dashboard' },
  { to: '/report-flood' as const, label: 'Report Flood' },
  { to: '/request-rescue' as const, label: 'Rescue Request' },
  { to: '/hotlines' as const, label: 'Hotlines' },
  { to: '/admin' as const, label: 'Admin' },
];

function RootLayout() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const { user, isAuthenticated, logout } = useAuth();
  const isResidentRoute = pathname.startsWith('/resident');
  const visibleNav = isResidentRoute
    ? navItems.filter(
        item => item.to === '/' || item.to === '/request-rescue' || item.to === '/hotlines'
      )
    : navItems;

  return (
    <div className="min-h-dvh bg-bg text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-3 sm:px-6">
          <Link to="/" aria-label="Bagyo Rescue" className="flex items-center">
            <Wordmark />
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1">
            {visibleNav.map(item => (
              <NavLink key={item.to} to={item.to} label={item.label} />
            ))}
            <span className="ml-3 hidden sm:inline-flex">
              <OfflineBadge />
            </span>
            {isAuthenticated ? (
              <span className="ml-2 hidden items-center gap-2 border-l border-border pl-3 md:inline-flex">
                <span className="max-w-32 truncate text-label-md text-muted-foreground">
                  {user?.username}
                </span>
                <Button size="sm" variant="ghost" type="button" onClick={() => void logout()}>
                  <IconLogout className="size-4" aria-hidden="true" />
                  Sign out
                </Button>
              </span>
            ) : (
              <Button asChild size="sm" variant="secondary" className="ml-2 hidden md:inline-flex">
                <Link to="/sign-in">Sign in</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

function NavLink({
  to,
  label,
}: {
  to: '/' | '/report-flood' | '/request-rescue' | '/hotlines' | '/admin';
  label: string;
}) {
  const baseClasses =
    'inline-flex h-9 items-center px-3 text-label-md text-muted-foreground transition-colors hover:text-foreground';
  const activeClasses =
    'inline-flex h-9 items-center px-3 text-label-md font-semibold text-foreground border-b-2 border-primary -mb-px';

  return (
    <Link
      to={to}
      className={cn(baseClasses)}
      activeProps={{ className: activeClasses }}
      activeOptions={{ exact: to === '/' }}
    >
      {label}
    </Link>
  );
}
