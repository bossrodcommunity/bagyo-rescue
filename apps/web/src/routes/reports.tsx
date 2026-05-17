import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState, type FormEvent } from 'react';
import { IconPlus, IconX } from '@tabler/icons-react';
import {
  useAddRescueReport,
  useRescueReports,
  useUpdateReportStatus,
} from '../data/use-rescue-reports';
import type { RescuePriority, RescueReport } from '@/lib/dexie';
import { Page, PageHeader, PageTitle, PageDescription } from '@/components/ui/page';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertBody } from '@/components/ui/alert';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { useOnlineStatus } from '@/components/ui/offline-badge';
import { cn } from '@/lib/utils';

const priorities: RescuePriority[] = ['critical', 'high', 'medium', 'low'];
const statuses: RescueReport['status'][] = ['new', 'triaged', 'responding', 'resolved'];

export const Route = createFileRoute('/reports')({
  component: ReportsPage,
});

function ReportsPage() {
  const reportsQuery = useRescueReports();
  const addReport = useAddRescueReport();
  const updateStatus = useUpdateReportStatus();
  const reports = reportsQuery.data ?? [];
  const isOnline = useOnlineStatus();

  const [isFormOpen, setIsFormOpen] = useState(reports.length === 0);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const sortedReports = useMemo(() => {
    return [...reports].sort(
      (a, b) => priorityRank(a.priority) - priorityRank(b.priority) || b.createdAt - a.createdAt
    );
  }, [reports]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const formElement = event.currentTarget;
    const household = String(form.get('household') ?? '').trim();
    const location = String(form.get('location') ?? '').trim();
    const notes = String(form.get('notes') ?? '').trim();
    const priority = String(form.get('priority') ?? 'medium') as RescuePriority;
    const people = Number(form.get('people') ?? 1);

    if (!household || !location || !Number.isFinite(people) || people < 1) {
      setFormError('Punan ang lahat ng required fields.');
      return;
    }

    addReport.mutate(
      { household, location, priority, people, notes },
      {
        onSuccess: () => {
          formElement.reset();
          setIsFormOpen(false);
        },
        onError: error => {
          setFormError(error instanceof Error ? error.message : 'Hindi nai-save.');
        },
      }
    );
  }

  return (
    <Page width="wide" className="flex flex-col gap-10">
      <PageHeader>
        <PageTitle>Rescue queue</PageTitle>
        <PageDescription>
          File a new rescue report or work through the queue. Saves locally, syncs when online.
        </PageDescription>
      </PageHeader>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-heading-md font-semibold text-foreground">Bagong Report</h2>
          <Button
            size="md"
            variant={isFormOpen ? 'ghost' : 'primary'}
            type="button"
            onClick={() => {
              setIsFormOpen(open => !open);
              setFormError(null);
            }}
            aria-expanded={isFormOpen}
            aria-controls="new-report-form"
            aria-label={isFormOpen ? 'Hide form' : 'Add report'}
          >
            {isFormOpen ? (
              <>
                <IconX aria-hidden="true" />
                Itago
              </>
            ) : (
              <>
                <IconPlus aria-hidden="true" />
                Magdagdag
              </>
            )}
          </Button>
        </div>

        {isFormOpen ? (
          <Card asChild>
            <form id="new-report-form" onSubmit={handleSubmit} className="gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Label htmlFor="household" className="sm:col-span-2">
                  Pangalan ng pamilya o tao
                  <Input
                    id="household"
                    name="household"
                    required
                    autoComplete="off"
                    placeholder="Requester or household"
                  />
                </Label>
                <Label htmlFor="location" className="sm:col-span-2">
                  Lokasyon
                  <Input
                    id="location"
                    name="location"
                    required
                    autoComplete="off"
                    placeholder="Address o landmark"
                  />
                </Label>
                <Label htmlFor="priority">
                  Antas
                  <Select id="priority" name="priority" defaultValue="medium" required>
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>
                        {priorityLabel(priority)}
                      </option>
                    ))}
                  </Select>
                </Label>
                <Label htmlFor="people">
                  Ilan kayo?
                  <Input
                    id="people"
                    name="people"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    defaultValue={1}
                    required
                  />
                </Label>
                <Label htmlFor="notes" className="sm:col-span-2">
                  Karagdagang sabihin
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Halimbawa: matanda sa bahay, walang kuryente"
                  />
                </Label>
              </div>
              {formError ? (
                <Alert tone="danger">
                  <AlertBody>{formError}</AlertBody>
                </Alert>
              ) : null}
              {!isOnline ? (
                <Alert tone="signal">
                  <AlertBody>
                    Naka-offline ka — ise-save dito sa phone at ipapadala kapag may signal.
                  </AlertBody>
                </Alert>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  size="md"
                  isLoading={addReport.isPending}
                  loadingLabel="Ise-save..."
                  aria-label="Save report"
                >
                  I-save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setIsFormOpen(false);
                    setFormError(null);
                  }}
                  aria-label="Cancel"
                >
                  Kanselahin
                </Button>
              </div>
            </form>
          </Card>
        ) : null}
      </section>

      <section aria-label="Queue" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-heading-md font-semibold text-foreground">Queue</h2>
          <span className="text-label-md text-muted-foreground">{sortedReports.length} total</span>
        </div>
        {reportsQuery.isLoading ? (
          <p className="text-body-md text-muted-foreground">Loading reports.</p>
        ) : sortedReports.length === 0 ? (
          <p className="text-body-md text-muted-foreground">No reports yet.</p>
        ) : (
          <ul className="flex flex-col rounded-md border border-border bg-surface">
            {sortedReports.map((report, index) => (
              <ReportRow
                key={report.id}
                report={report}
                isExpanded={expandedReportId === report.id}
                isLast={index === sortedReports.length - 1}
                onToggle={() =>
                  setExpandedReportId(current => (current === report.id ? null : report.id))
                }
                onStatusChange={status => updateStatus.mutate({ id: report.id, status })}
                isUpdating={updateStatus.isPending}
              />
            ))}
          </ul>
        )}
      </section>
    </Page>
  );
}

type ReportRowProps = {
  report: RescueReport;
  isExpanded: boolean;
  isLast: boolean;
  onToggle: () => void;
  onStatusChange: (status: RescueReport['status']) => void;
  isUpdating: boolean;
};

function ReportRow({
  report,
  isExpanded,
  isLast,
  onToggle,
  onStatusChange,
  isUpdating,
}: ReportRowProps) {
  return (
    <li
      className={cn(
        'transition-colors',
        !isLast && 'border-b border-border',
        isExpanded && 'bg-surface-sunken'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="grid w-full grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-3 text-left hover:bg-muted/40"
      >
        <PriorityBadge priority={report.priority} />
        <span className="min-w-0 truncate text-body-md text-foreground">{report.location}</span>
        <span className="hidden text-label-md text-muted-foreground sm:inline">
          {formatTimeSince(report.createdAt)}
        </span>
        <StatusBadge status={report.status} />
      </button>
      {isExpanded ? (
        <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-label-md text-muted-foreground">
              Requester · {report.household}
            </span>
            <span className="text-label-md text-muted-foreground">People · {report.people}</span>
            <span className="text-label-md text-muted-foreground sm:hidden">
              Filed {formatTimeSince(report.createdAt)} ago
            </span>
            {report.notes ? (
              <p className="mt-1 text-body-md text-foreground">{report.notes}</p>
            ) : null}
          </div>
          <Label htmlFor={`status-${report.id}`} className="sm:max-w-44">
            Status
            <Select
              id={`status-${report.id}`}
              value={report.status}
              disabled={isUpdating}
              onChange={event =>
                onStatusChange(event.currentTarget.value as RescueReport['status'])
              }
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </Select>
          </Label>
        </div>
      ) : null}
    </li>
  );
}

function priorityRank(priority: RescuePriority) {
  return priorities.indexOf(priority);
}

function priorityLabel(priority: RescuePriority) {
  return (
    {
      critical: 'Kritikal',
      high: 'Mataas',
      medium: 'Katamtaman',
      low: 'Mababa',
    } satisfies Record<RescuePriority, string>
  )[priority];
}

function statusLabel(status: RescueReport['status']) {
  return (
    {
      new: 'Bago',
      triaged: 'Sinuri',
      responding: 'Tumutugon',
      resolved: 'Tapos',
    } satisfies Record<RescueReport['status'], string>
  )[status];
}

function formatTimeSince(timestamp: number) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
