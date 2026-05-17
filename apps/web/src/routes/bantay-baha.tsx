import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import {
  IconAlertTriangle,
  IconCloudUpload,
  IconMapPin,
  IconRadar,
  IconReport,
  IconShieldCheck,
  IconWifi,
  IconLifebuoy,
  IconClipboardCheck,
} from '@tabler/icons-react';
import { useMemo } from 'react';
import { useFloodOutboxSummary, useFloodReports } from '../data/use-flood-reports';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Page } from '@/components/ui/page';
import { cn } from '@/lib/utils';

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

  const localStatus = getLocalStatus(floodReportsQuery.isFetching, outboxSummary);
  const localStatusTone = getLocalStatusTone(localStatus);

  return (
    <Page width="wide" className="flex flex-col gap-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="justify-start gap-6 border-primary-soft p-5 shadow-raised sm:p-7">
          <div>
            <h1 className="max-w-3xl font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.98] tracking-normal text-foreground">
              Flood help starts with the right action.
            </h1>
            <p className="mt-5 max-w-2xl text-body-lg text-muted-foreground">
              Choose the fastest path for your situation. Reports work offline and will sync when
              the connection is available.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <EmergencyAction
              to="/ping"
              icon={IconLifebuoy}
              tone="danger"
              label="Need rescue now"
              detail="Send your location to responders"
            />
            <EmergencyAction
              to="/bantay-baha/report"
              icon={IconReport}
              tone="primary"
              label="Report flooding"
              detail="Share water level and area"
            />
            <EmergencyAction
              to="/bantay-baha/nearby"
              icon={IconRadar}
              tone="secondary"
              label="Check nearby"
              detail="View local flood reports"
            />
          </div>

          <div className="grid gap-3 border-t pt-5 md:grid-cols-3">
            <HeroGuidance icon={IconClipboardCheck} title="Verified only" tone="primary" />
            <HeroGuidance icon={IconShieldCheck} title="Get to safety" tone="safe" />
            <HeroGuidance icon={IconWifi} title="Works offline" tone="neutral" />
          </div>
        </Card>

        <Card className="gap-5 border-border-strong bg-surface-sunken p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-md',
                metricToneClasses[localStatusTone]
              )}
            >
              <IconCloudUpload className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-label-md font-semibold text-muted-foreground">Device status</p>
              <h2 className="mt-1 text-heading-lg text-foreground">{localStatus}</h2>
              <p className="mt-1 text-body-md text-muted-foreground">
                {getLocalStatusDetail(localStatus, outboxSummary)}
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <SituationRow
              icon={IconAlertTriangle}
              label="Urgent reports"
              value={`${urgentRiskCount} high or critical`}
              tone={urgentRiskCount > 0 ? 'signal' : 'safe'}
            />
            <SituationRow
              icon={IconMapPin}
              label="Active reports"
              value={`${activeReports.length} nearby records`}
              tone="primary"
            />
            <SituationRow icon={IconWifi} label="Offline use" value="Available" tone="neutral" />
          </div>

          <div className="mt-auto rounded-md border bg-surface p-4">
            <h3 className="text-body-md font-bold text-foreground">Use reports for</h3>
            <ul className="mt-3 grid list-disc gap-2 pl-5 text-label-md text-muted-foreground">
              <li>Flooded streets</li>
              <li>Water level changes</li>
              <li>Team routing</li>
            </ul>
          </div>
        </Card>
      </section>

      <section className="rounded-md border border-signal-200 border-l-4 border-l-signal-500 bg-signal-50 p-4 text-foreground shadow-raised sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md border border-signal-200 bg-surface text-signal-700">
              <IconAlertTriangle className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-heading-md text-foreground">
                If water is rising or someone is trapped
              </h2>
              <p className="mt-1 max-w-3xl text-body-md text-muted-foreground">
                Request rescue first. Use flood reports after people are out of immediate danger.
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="danger"
            size="lg"
            className="min-h-12 w-full shrink-0 whitespace-normal px-5 font-bold text-white sm:w-auto"
          >
            <Link to="/ping" className="!text-white">
              <IconLifebuoy className="size-5 text-white" aria-hidden="true" />
              <span className="text-white">Ping rescue</span>
            </Link>
          </Button>
        </div>
      </section>

      <section
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        aria-label="Bagyo Rescue flood report summary"
      >
        <FloodMetric
          icon={IconRadar}
          tone="primary"
          value={activeReports.length}
          label="Active local reports"
          detail="Still within the current flood window"
        />
        <FloodMetric
          icon={IconAlertTriangle}
          tone={urgentRiskCount > 0 ? 'signal' : 'neutral'}
          value={urgentRiskCount}
          label="High or critical risk"
          detail="Needs the fastest coordinator review"
        />
        <FloodMetric
          icon={IconShieldCheck}
          tone="safe"
          value={reports.length}
          label="Saved reports"
          detail="Stored locally for review and sync"
        />
        <FloodMetric
          icon={IconCloudUpload}
          tone={localStatusTone}
          value={localStatus}
          label="Local status"
          detail={getLocalStatusDetail(localStatus, outboxSummary)}
        />
      </section>
    </Page>
  );
}

type EmergencyActionProps = {
  to: '/ping' | '/bantay-baha/report' | '/bantay-baha/nearby';
  icon: typeof IconRadar;
  tone: 'danger' | 'primary' | 'secondary';
  label: string;
  detail: string;
};

const emergencyActionClasses: Record<EmergencyActionProps['tone'], string> = {
  danger: 'border-danger-soft bg-danger-soft text-danger hover:border-danger hover:bg-danger-soft',
  primary: 'border-primary bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'border-border-strong bg-surface text-foreground hover:bg-surface-sunken',
};

function EmergencyAction({ to, icon: Icon, tone, label, detail }: EmergencyActionProps) {
  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-[116px] flex-col justify-between rounded-lg border p-4 transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        emergencyActionClasses[tone]
      )}
    >
      <Icon className="size-7" aria-hidden="true" />
      <span>
        <span className="block text-body-lg font-bold">{label}</span>
        <span className="mt-1 block text-label-md opacity-90">{detail}</span>
      </span>
    </Link>
  );
}

type HeroGuidanceProps = {
  icon: typeof IconRadar;
  title: string;
  tone: FloodMetricProps['tone'];
};

function HeroGuidance({ icon: Icon, title, tone }: HeroGuidanceProps) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-surface-sunken p-3">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-md',
          metricToneClasses[tone]
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="min-w-0 text-label-md font-bold text-foreground">{title}</p>
    </div>
  );
}

type SituationRowProps = {
  icon: typeof IconRadar;
  label: string;
  value: string;
  tone: FloodMetricProps['tone'];
};

function SituationRow({ icon: Icon, label, value, tone }: SituationRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-surface p-3">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-md',
          metricToneClasses[tone]
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-label-md font-semibold text-foreground">{label}</p>
        <p className="text-label-md text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

type FloodMetricProps = {
  icon: typeof IconRadar;
  tone: 'neutral' | 'primary' | 'safe' | 'signal' | 'danger';
  value: number | string;
  label: string;
  detail: string;
};

const metricToneClasses: Record<FloodMetricProps['tone'], string> = {
  neutral: 'bg-muted text-muted-foreground',
  primary: 'bg-primary-soft text-primary-pressed',
  safe: 'bg-safe-soft text-safe',
  signal: 'bg-signal-soft text-signal',
  danger: 'bg-danger-soft text-danger',
};

function FloodMetric({ icon: Icon, tone, value, label, detail }: FloodMetricProps) {
  return (
    <Card className="min-h-40 justify-between gap-5 p-5">
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-md',
          metricToneClasses[tone]
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <span className="block font-display text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-normal text-foreground">
          {value}
        </span>
        <p className="mt-3 text-body-md font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-label-md text-muted-foreground">{detail}</p>
      </div>
    </Card>
  );
}

function getLocalStatus(
  isFetching: boolean,
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
  if (outboxSummary?.failed) return 'Retry';
  if (outboxSummary?.syncing || isFetching) return 'Syncing';
  if (outboxSummary?.pending) return 'Saved';

  return 'Ready';
}

function getLocalStatusTone(status: string): FloodMetricProps['tone'] {
  if (status === 'Retry') return 'danger';
  if (status === 'Syncing') return 'primary';
  if (status === 'Saved') return 'signal';

  return 'safe';
}

function getLocalStatusDetail(
  status: string,
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
  if (status === 'Retry') {
    if (outboxSummary?.lastError) return outboxSummary.lastError;

    return `${outboxSummary?.failed ?? 0} waiting for another sync attempt`;
  }

  if (status === 'Syncing') {
    return 'Pushing local reports to Supabase';
  }

  if (status === 'Saved') {
    return `${outboxSummary?.pending ?? 0} saved on this device`;
  }

  return 'No flood reports waiting to sync';
}
