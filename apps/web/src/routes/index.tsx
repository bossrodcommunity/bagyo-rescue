import { createFileRoute, Link } from '@tanstack/react-router';
import { IconAlertTriangle, IconLifebuoy, IconPhoneCall } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useReportHistoriesQuery } from '@/hooks/query/report-histories';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Page, PageDescription, PageHeader, PageTitle } from '@/components/ui/page';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const actions = [
  {
    to: '/report-flood' as const,
    title: 'Report Flood',
    description: 'Send water level and flood condition updates.',
    icon: IconAlertTriangle,
  },
  {
    to: '/request-rescue' as const,
    title: 'Rescue Request',
    description: 'Ask responders for urgent help with GPS.',
    icon: IconLifebuoy,
  },
  {
    to: '/hotlines' as const,
    title: 'Emergency Hotlines',
    description: 'Call national and local emergency numbers.',
    icon: IconPhoneCall,
  },
];

function HomePage() {
  const reportHistoriesQuery = useReportHistoriesQuery();
  const reports = reportHistoriesQuery.data ?? [];
  const summary = useMemo(
    () => ({
      pending: reports.filter(report => report.syncStatus !== 'sent').length,
      sent: reports.filter(report => report.syncStatus === 'sent').length,
      total: reports.length,
    }),
    [reports]
  );

  return (
    <Page className="flex flex-col gap-10">
      <PageHeader>
        <PageTitle>Bagyo Rescue</PageTitle>
        <PageDescription>
          Report flooding, request rescue, or find emergency numbers. Reports save on this device
          first and sync when signal is available.
        </PageDescription>
      </PageHeader>

      <section aria-label="Emergency actions" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {actions.map(action => {
          const Icon = action.icon;

          return (
            <Card key={action.to} asChild elevated className="p-0">
              <Link to={action.to} className="flex min-h-44 flex-col justify-between gap-5 p-5">
                <CardHeader className="gap-3 p-0">
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <CardTitle>{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </CardHeader>
                <Button asChild variant="ghost" size="md" className="self-start">
                  <span>Open</span>
                </Button>
              </Link>
            </Card>
          );
        })}
      </section>

      <section
        className="grid grid-cols-3 gap-6 border-t border-border pt-6"
        aria-label="Device sync summary"
      >
        <Metric label="Pending" value={summary.pending} />
        <Metric label="Sent" value={summary.sent} />
        <Metric label="Total" value={summary.total} />
      </section>
    </Page>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="flex flex-col gap-1">
      <span className="font-display text-display-lg text-foreground">{value}</span>
      <span className="text-label-md text-muted-foreground">{label}</span>
    </article>
  );
}
