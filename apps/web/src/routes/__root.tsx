import { Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';

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
      <Outlet />
    </>
  );
}
