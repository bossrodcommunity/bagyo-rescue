import { Link, Outlet, createRootRouteWithContext, useRouterState } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useFloodOutboxSummary, useFloodOutboxSyncProcessor } from '../data/use-flood-reports';
import { Wordmark } from '@/components/brand/wordmark';
import { OfflineBadge } from '@/components/ui/offline-badge';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/ui/page';
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
  { to: '/resident' as const, label: 'Resident' },
  { to: '/ping' as const, label: 'Ping Rescue' },
  { to: '/reports' as const, label: 'Reports' },
  { to: '/bantay-baha' as const, label: 'Flood' },
  { to: '/admin' as const, label: 'Admin' },
];

function RootLayout() {
  const syncFloodOutbox = useFloodOutboxSyncProcessor();
  const outboxSummaryQuery = useFloodOutboxSummary();
  const online = useOnlineStatus();
  const outboxSummary = outboxSummaryQuery.data;
  const hasOutboxWork = Boolean(outboxSummary?.total);
  const pathname = useRouterState({ select: state => state.location.pathname });
  const isResidentRoute = pathname.startsWith('/resident');
  const visibleNav = isResidentRoute
    ? navItems.filter(item => item.to === '/' || item.to === '/resident' || item.to === '/ping')
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
          </nav>
        </div>
      </header>
      {!online || hasOutboxWork ? (
        <section
          className="offline-banner"
          aria-label="Flood report sync status"
          aria-live="polite"
        >
          <p>{getSyncBannerCopy(online, outboxSummary)}</p>
          <button
            type="button"
            className="button--secondary"
            disabled={!online || syncFloodOutbox.isPending}
            onClick={() => syncFloodOutbox.mutate()}
          >
            {syncFloodOutbox.isPending ? 'Syncing' : 'Retry sync'}
          </button>
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
  to: '/' | '/resident' | '/ping' | '/reports' | '/bantay-baha' | '/admin';
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

function useOnlineStatus() {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  useEffect(() => {
    const markOnline = () => setOnline(true);
    const markOffline = () => setOnline(false);

    window.addEventListener('online', markOnline);
    window.addEventListener('offline', markOffline);

    return () => {
      window.removeEventListener('online', markOnline);
      window.removeEventListener('offline', markOffline);
    };
  }, []);

  return online;
}

function getSyncBannerCopy(
  online: boolean,
  outboxSummary: { failed: number; pending: number; syncing: number; total: number } | undefined
) {
  if (!online) {
    return 'Offline mode: reports will sync when internet returns.';
  }

  if (!outboxSummary?.total) {
    return 'Flood report sync is ready.';
  }

  if (outboxSummary.failed > 0) {
    return `${outboxSummary.failed} flood report${outboxSummary.failed === 1 ? '' : 's'} waiting to sync. Retry will keep using the local copy.`;
  }

  if (outboxSummary.syncing > 0) {
    return 'Flood reports are syncing.';
  }

  return `${outboxSummary.pending} flood report${outboxSummary.pending === 1 ? '' : 's'} saved on this device.`;
}
