import { createFileRoute, Link } from '@tanstack/react-router';
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconLifebuoy,
  IconMapPin,
  IconPhoneCall,
  IconRefresh,
  IconShieldCheck,
  IconX,
} from '@tabler/icons-react';
import { useMemo } from 'react';
import { useReportHistoriesQuery } from '@/hooks/query/report-histories';
import type { ReportHistoryOutboxStatus, ReportHistoryWithOutboxState } from '@/lib/dexie';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnlineStatus } from '@/components/ui/offline-badge';
import { Page, PageDescription, PageHeader, PageTitle } from '@/components/ui/page';
import { cn } from '@/lib/utils';

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
  {
    to: '/safety-tips' as const,
    title: 'Safety Tips',
    description: 'Prepare before, during, and after a typhoon.',
    icon: IconShieldCheck,
  },
];

const statusConfig: Record<
  ReportHistoryOutboxStatus,
  { label: string; icon: typeof IconCheck; className: string }
> = {
  queued: {
    label: 'Pending',
    icon: IconClock,
    className: 'bg-accent-soft text-warning',
  },
  sending: {
    label: 'Sending',
    icon: IconRefresh,
    className: 'bg-primary-soft text-primary',
  },
  sent: {
    label: 'Sent',
    icon: IconCheck,
    className: 'bg-success-soft text-success',
  },
  failed: {
    label: 'Retry later',
    icon: IconX,
    className: 'bg-danger/10 text-danger',
  },
};

function HomePage() {
  const reportHistoriesQuery = useReportHistoriesQuery();
  const reports = reportHistoriesQuery.data ?? [];
  const recentReports = reports.slice(0, 6);
  const summary = useMemo(
    () => ({
      pending: reports.filter(report => report.outbox_status !== 'sent').length,
      sent: reports.filter(report => report.outbox_status === 'sent').length,
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

      <section aria-label="Emergency actions" className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
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

      <section className="flex flex-col gap-4" aria-label="Recent reports and requests">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-heading-md font-semibold text-foreground">Your reports</h2>
            <p className="text-body-sm text-muted-foreground">
              Flood reports and rescue requests saved on this device.
            </p>
          </div>
          <span className="shrink-0 text-label-md text-muted-foreground">
            {reports.length} total
          </span>
        </div>

        {reportHistoriesQuery.isLoading ? (
          <p className="text-body-sm text-muted-foreground">Loading reports...</p>
        ) : recentReports.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No reports yet</CardTitle>
              <CardDescription>
                Use Flood or Rescue to save your first report on this device.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {recentReports.map(report => (
              <ReportSummaryItem key={report.id} report={report} />
            ))}
          </div>
        )}
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

function ReportSummaryItem({ report }: { report: ReportHistoryWithOutboxState }) {
  const isFloodReport = report.type === 'Flood Report';
  const Icon = isFloodReport ? IconAlertTriangle : IconLifebuoy;
  const status = statusConfig[report.outbox_status];
  const StatusIcon = status.icon;
  const target = isFloodReport ? '/report-flood' : '/request-rescue';
  const details = [
    report.people_count !== null ? `${report.people_count} people` : null,
    isFloodReport && report.water_level ? report.water_level : null,
    report.family_code ?? 'No family linked',
  ].filter(Boolean);
  const location =
    report.latitude !== null && report.longitude !== null
      ? {
          latitude: Number(report.latitude),
          longitude: Number(report.longitude),
          accuracyMeters: report.accuracy_meters !== null ? Number(report.accuracy_meters) : null,
        }
      : null;

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <Link to={target} className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-md',
              isFloodReport ? 'bg-accent-soft text-warning' : 'bg-primary-soft text-primary'
            )}
          >
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="truncate text-body-md font-semibold text-foreground">{report.type}</h3>
            <p className="text-body-sm text-muted-foreground">
              {details.join(' · ')} · {formatTimeSince(report.created_at)}
            </p>
          </div>
        </Link>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-caption font-semibold',
            status.className
          )}
        >
          <StatusIcon aria-hidden="true" className="size-3.5" />
          {status.label}
        </span>
      </div>

      {report.note ? (
        <p className="line-clamp-2 text-body-sm text-foreground">{report.note}</p>
      ) : null}

      {location && Number.isFinite(location.latitude) && Number.isFinite(location.longitude) ? (
        <ReportMapPreview location={location} />
      ) : null}
    </Card>
  );
}

type ReportMapLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
};

function ReportMapPreview({ location }: { location: ReportMapLocation }) {
  const isOnline = useOnlineStatus();
  const accuracyLabel =
    location.accuracyMeters !== null ? ` · ±${Math.round(location.accuracyMeters)}m` : '';

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-sunken p-3">
      {isOnline ? (
        <iframe
          title={`Report location: ${formatCoordinate(location.latitude)}, ${formatCoordinate(
            location.longitude
          )}`}
          src={buildMapsEmbedUrl(location)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-40 w-full rounded-md border border-border bg-surface-sunken sm:h-48"
        />
      ) : (
        <LocalReportMapPreview location={location} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-body-sm text-muted-foreground">
          <IconMapPin aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">
            {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
            {accuracyLabel}
          </span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <a href={buildMapsUrl(location)} target="_blank" rel="noreferrer">
            <IconMapPin aria-hidden="true" />
            Open map
          </a>
        </Button>
      </div>
    </div>
  );
}

function LocalReportMapPreview({ location }: { location: ReportMapLocation }) {
  return (
    <div
      className="relative h-40 overflow-hidden rounded-md border border-border bg-primary-soft sm:h-48"
      aria-label={`Report location: ${formatCoordinate(location.latitude)}, ${formatCoordinate(
        location.longitude
      )}`}
    >
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index} className="border-r border-b border-primary/10" aria-hidden="true" />
        ))}
      </div>
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary/20"
      />
      <span
        aria-hidden="true"
        className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-primary/20"
      />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/20 bg-surface/90 text-primary shadow-raised"
      >
        <IconMapPin className="size-6" />
      </span>
      <span className="absolute bottom-2 left-2 rounded-md bg-surface/95 px-2 py-1 text-caption text-muted-foreground shadow-raised">
        {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
      </span>
    </div>
  );
}

function formatTimeSince(value: string) {
  const elapsedMs = Date.now() - Date.parse(value);
  const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60_000));

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`;
  }

  const elapsedHours = Math.round(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`;
  }

  return `${Math.round(elapsedHours / 24)}d ago`;
}

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

function buildMapsUrl(location: Pick<ReportMapLocation, 'latitude' | 'longitude'>) {
  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
}

function buildMapsEmbedUrl(location: Pick<ReportMapLocation, 'latitude' | 'longitude'>) {
  const query = encodeURIComponent(`${location.latitude},${location.longitude}`);

  return `https://maps.google.com/maps?q=${query}&z=16&output=embed`;
}
