import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import { useRescueReports } from '../data/use-rescue-reports';
import { Page, PageHeader, PageTitle, PageDescription } from '@/components/ui/page';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

function DashboardPage() {
  const reportsQuery = useRescueReports();
  const reports = reportsQuery.data ?? [];

  const summary = useMemo(() => {
    return reports.reduce(
      (totals, report) => {
        totals.people += report.people;
        totals[report.priority] += 1;
        totals[report.status] += 1;
        return totals;
      },
      {
        people: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        new: 0,
        triaged: 0,
        responding: 0,
        resolved: 0,
      }
    );
  }, [reports]);

  const newCount = summary.new;
  const inProgress = summary.triaged + summary.responding;
  const resolvedCount = summary.resolved;
  const urgent = summary.critical + summary.high;

  return (
    <Page className="flex flex-col gap-10">
      <PageHeader>
        <PageTitle>Coordinator</PageTitle>
        <PageDescription>A live count of rescue requests waiting on your team.</PageDescription>
      </PageHeader>

      <section aria-label="Rescue report summary" className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <Metric tone="danger" value={newCount} label="Bagong Report" sublabel="Untriaged" />
        <Metric tone="signal" value={inProgress} label="Ginagawa" sublabel="In progress" />
        <Metric tone="safe" value={resolvedCount} label="Tapos" sublabel="Resolved" />
      </section>

      <section className="module-hero module-hero--flood" aria-label="Flood reporting">
        <div>
          <p className="eyebrow">Current flood conditions</p>
          <h2>Report flooding from your current location.</h2>
          <p>
            Bagyo Rescue includes a local flood reporting flow for teams and residents who need to
            mark active flooding nearby.
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

      <p className="text-label-md text-muted-foreground">
        {reports.length} total &middot; {urgent} urgent &middot; {summary.people} people affected
      </p>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button asChild variant="ghost" size="md">
          <Link to="/reports" className="gap-1.5">
            Open rescue queue
            <IconArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="md">
          <Link to="/admin" className="gap-1.5">
            Manage records
            <IconArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </Page>
  );
}

type MetricProps = {
  tone: 'danger' | 'signal' | 'safe';
  value: number;
  label: string;
  sublabel: string;
};

const toneDot: Record<MetricProps['tone'], string> = {
  danger: 'bg-danger',
  signal: 'bg-signal',
  safe: 'bg-safe',
};

function Metric({ tone, value, label, sublabel }: MetricProps) {
  return (
    <article className="flex flex-col gap-2">
      <span className="font-display text-display-2xl tracking-tight text-foreground">{value}</span>
      <span className="flex items-center gap-2 text-body-md font-medium text-foreground">
        <span
          aria-hidden="true"
          className={cn('inline-block size-2 rounded-full', toneDot[tone])}
        />
        {label}
      </span>
      <span className="text-label-md text-muted-foreground">{sublabel}</span>
    </article>
  );
}
