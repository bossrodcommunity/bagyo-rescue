import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useFloodOutboxSummary, useFloodReports } from '../data/use-flood-reports';

export const Route = createFileRoute('/bantay-baha')({
  component: BantayBahaPage,
});

function BantayBahaPage() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const floodReportsQuery = useFloodReports();
  const outboxSummaryQuery = useFloodOutboxSummary();
  const reports = floodReportsQuery.data ?? [];
  const outboxSummary = outboxSummaryQuery.data;

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
          <p className="eyebrow">Bagyo Rescue flood reporting</p>
          <h1>Report current flooding where you are.</h1>
          <p>
            Use your current GPS location or barangay to submit active flood conditions, then check
            local reports that can guide rescue decisions.
          </p>
        </div>
        <div className="action-row">
          <Link to="/bantay-baha/report" className="button">
            Report flooding
          </Link>
          <Link to="/bantay-baha/nearby" className="button button--secondary">
            Check nearby flooding
          </Link>
        </div>
      </section>

      <section className="metrics" aria-label="Bagyo Rescue flood report summary">
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
          <span>{getLocalStatus(floodReportsQuery.isFetching, outboxSummary)}</span>
          <p>Local status</p>
        </article>
      </section>
    </main>
  );
}

function getLocalStatus(
  isFetching: boolean,
  outboxSummary: { failed: number; pending: number; syncing: number; total: number } | undefined
) {
  if (outboxSummary?.failed) return 'Retry';
  if (outboxSummary?.syncing || isFetching) return 'Syncing';
  if (outboxSummary?.pending) return 'Saved';

  return 'Ready';
}
