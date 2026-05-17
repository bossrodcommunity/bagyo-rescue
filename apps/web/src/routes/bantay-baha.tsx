import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useFloodReports } from '../data/use-flood-reports';

export const Route = createFileRoute('/bantay-baha')({
  component: BantayBahaPage,
});

function BantayBahaPage() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const floodReportsQuery = useFloodReports();
  const reports = floodReportsQuery.data ?? [];

  const activeReports = useMemo(
    () => reports.filter(report => report.status === 'active' && report.expiresAt > Date.now()),
    [reports]
  );

  const urgentRiskCount = activeReports.filter(report =>
    ['high', 'critical'].includes(report.riskLevel)
  ).length;

  if (pathname !== '/bantay-baha') {
    return <Outlet />;
  }

  return (
    <main className="page">
      <section className="module-hero module-hero--flood">
        <div>
          <p className="eyebrow">Crowdsourced flood warnings</p>
          <h1>BantayBaha keeps flood risk visible for rescue teams.</h1>
          <p>
            Prompt nearby flood risk from GPS, save it locally, and keep responders oriented around
            the Bagyo Rescue mission.
          </p>
        </div>
        <div className="action-row">
          <Link to="/bantay-baha/report" className="button">
            Baha dito
          </Link>
          <Link to="/bantay-baha/nearby" className="button button--secondary">
            Nearby reports
          </Link>
        </div>
      </section>

      <section className="metrics" aria-label="BantayBaha local report summary">
        <article>
          <span>{activeReports.length}</span>
          <p>Active local reports</p>
        </article>
        <article>
          <span>{urgentRiskCount}</span>
          <p>High or critical risk</p>
        </article>
        <article>
          <span>{reports.length}</span>
          <p>Total saved reports</p>
        </article>
        <article>
          <span>{floodReportsQuery.isFetching ? 'Syncing' : 'Ready'}</span>
          <p>Local status</p>
        </article>
      </section>
    </main>
  );
}
