import { Wordmark } from '@/components/brand/wordmark';
import { Button } from '@/components/ui/button';
import { OfflineBadge, useOnlineStatus } from '@/components/ui/offline-badge';
import { Page } from '@/components/ui/page';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { IconLogout, IconRefresh } from '@tabler/icons-react';
import type { QueryClient } from '@tanstack/react-query';
import { Link, Outlet, createRootRouteWithContext, useRouterState } from '@tanstack/react-router';
import { useFloodOutboxSummary, useFloodOutboxSyncProcessor } from '../data/use-flood-reports';

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
  { to: '/request-rescue' as const, label: 'Request Rescue' },
  { to: '/hotlines' as const, label: 'Hotlines' },
  { to: '/bantay-baha' as const, label: 'Flood' },
  { to: '/records' as const, label: 'Records' },
  { to: '/admin' as const, label: 'Admin' },
];

function RootLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const syncFloodOutbox = useFloodOutboxSyncProcessor();
  const outboxSummaryQuery = useFloodOutboxSummary();
  const online = useOnlineStatus();
  const outboxSummary = outboxSummaryQuery.data;
  const hasOutboxWork = Boolean(outboxSummary?.total);
  const pathname = useRouterState({ select: state => state.location.pathname });
  const isResidentRoute = pathname.startsWith('/resident') || pathname.startsWith('/sign-in');
  const visibleNav = isResidentRoute
    ? navItems.filter(item => ['/', '/request-rescue'].includes(item.to))
    : navItems;

  return (
    <div className="min-h-dvh bg-bg text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6">
          <Link to="/" aria-label="Bagyo Rescue" className="flex items-center">
            <Wordmark />
          </Link>
          <nav aria-label="Primary" className="flex max-w-full items-center gap-1 overflow-x-auto">
            {visibleNav.map(item => (
              <NavLink key={item.to} to={item.to} label={item.label} />
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <OfflineBadge />
            {isAuthenticated ? (
              <span className="flex items-center gap-2">
                <span className="hidden max-w-28 truncate text-label-md text-muted-foreground sm:inline">
                  {user?.username}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  type="button"
                  aria-label="Sign out"
                  onClick={() => void logout()}
                >
                  <IconLogout className="size-4" aria-hidden="true" />
                </Button>
              </span>
            ) : null}
          </div>
        </div>
      </header>
      {!online || hasOutboxWork ? (
        <section
          className="offline-banner"
          aria-label="Flood report sync status"
          aria-live="polite"
        >
          <p>{getSyncBannerCopy(online, outboxSummary)}</p>
          <Button
            type="button"
            variant={outboxSummary?.failed ? 'primary' : 'secondary'}
            size="md"
            isLoading={syncFloodOutbox.isPending}
            loadingLabel="Syncing"
            className="min-h-11 shrink-0 rounded-lg px-5 font-bold text-primary-foreground"
            disabled={!online || syncFloodOutbox.isPending}
            onClick={() => syncFloodOutbox.mutate()}
          >
            <IconRefresh className="size-4" aria-hidden="true" />
            Retry sync
          </Button>
        </section>
      ) : null}
      <Outlet />
    </div>
  );
}

function NavLink({
  to,
  label,
}: {
  to:
    | '/'
    | '/report-flood'
    | '/request-rescue'
    | '/hotlines'
    | '/bantay-baha'
    | '/records'
    | '/admin';
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

function getSyncBannerCopy(
  online: boolean,
  outboxSummary:
    | {
        failed: number;
        lastError: string | null;
        pending: number;
        syncing: number;
        total: number;
      }
    | undefined
) {
  if (!online) {
    return 'Offline mode: reports will sync when internet returns.';
  }

  if (!outboxSummary?.total) {
    return 'Flood report sync is ready.';
  }

  if (outboxSummary.failed > 0) {
    if (outboxSummary.lastError) {
      return `${outboxSummary.failed} flood report${outboxSummary.failed === 1 ? '' : 's'} saved locally. ${outboxSummary.lastError}`;
    }

    return `${outboxSummary.failed} flood report${outboxSummary.failed === 1 ? '' : 's'} saved locally. Tap Retry sync.`;
  }

  if (outboxSummary.syncing > 0) {
    return 'Flood reports are syncing.';
  }

  return `${outboxSummary.pending} flood report${outboxSummary.pending === 1 ? '' : 's'} saved locally. Sync them when online.`;
}
