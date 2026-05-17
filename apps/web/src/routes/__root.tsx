import { Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useFloodOutboxSummary, useFloodOutboxSyncProcessor } from '../data/use-flood-reports';

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => (
    <main className="page page--narrow">
      <h1>Page not found</h1>
      <p>The rescue workspace could not find that route.</p>
      <Link to="/" className="button">
        Back to dashboard
      </Link>
    </main>
  ),
});

function RootLayout() {
  const syncFloodOutbox = useFloodOutboxSyncProcessor();
  const outboxSummaryQuery = useFloodOutboxSummary();
  const online = useOnlineStatus();
  const outboxSummary = outboxSummaryQuery.data;
  const hasOutboxWork = Boolean(outboxSummary?.total);

  return (
    <>
      <header className="app-header">
        <Link to="/" className="brand" aria-label="Bagyo Rescue dashboard">
          <span className="brand-mark">BR</span>
          <span>Bagyo Rescue</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link to="/" activeProps={{ className: 'active' }}>
            Dashboard
          </Link>
          <Link to="/reports" activeProps={{ className: 'active' }}>
            Reports
          </Link>
          <Link to="/bantay-baha" activeProps={{ className: 'active' }}>
            Flood reporting
          </Link>
        </nav>
      </header>
      {!online || hasOutboxWork ? (
        <section className="offline-banner" aria-label="Flood report sync status">
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
    </>
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
    return `${outboxSummary.failed} flood report sync failed, will retry.`;
  }

  if (outboxSummary.syncing > 0) {
    return 'Flood reports are syncing.';
  }

  return `${outboxSummary.pending} flood report${outboxSummary.pending === 1 ? '' : 's'} saved on this device.`;
}
