import {
  IconAlertTriangle,
  IconCheck,
  IconCurrentLocation,
  IconDeviceFloppy,
  IconEdit,
  IconMapPin,
  IconRefresh,
  IconSend,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  type ResidentAccessSession,
  useResidentAccessSession,
} from '@/features/resident/resident-access-session';
import {
  useDeleteReportHistoryMutation,
  useReportHistoriesQuery,
  useSubmitReportHistoryMutation,
  useSyncReportHistoriesMutation,
  useUpdateReportHistoryMutation,
} from '@/hooks/query/report-histories';
import { Constants } from '@/lib/supabase/types';
import type {
  ReportHistoryOutboxStatus,
  ReportHistoryType,
  ReportHistoryWaterLevel,
  ReportHistoryWithOutboxState,
} from '@/lib/dexie';
import { Alert, AlertBody, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OfflineBadge, useOnlineStatus } from '@/components/ui/offline-badge';
import { Page, PageDescription, PageHeader, PageTitle } from '@/components/ui/page';
import { Toast, ToastBody, ToastClose } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import floodPersonModelUrl from '@/assets/reporting/flood-person-model.png';

type CapturedLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
};

type ReportActionPageProps = {
  type: ReportHistoryType;
};

type FloodReportWaterLevel = NonNullable<ReportHistoryWaterLevel>;

const DEFAULT_FLOOD_REPORT_WATER_LEVEL = 'Unknown' satisfies FloodReportWaterLevel;

const WATER_LEVEL_OPTIONS = [
  { value: 'Unknown', label: 'Unknown', description: 'Hindi sigurado' },
  { value: 'Ankle', label: 'Ankle', description: 'Bukong-bukong' },
  { value: 'Knee', label: 'Knee', description: 'Tuhod' },
  { value: 'Waist', label: 'Waist', description: 'Baywang' },
  { value: 'Chest', label: 'Chest', description: 'Dibdib' },
  { value: 'Roof', label: 'Roof', description: 'Bubong' },
] satisfies Array<{
  value: FloodReportWaterLevel;
  label: string;
  description: string;
}>;

function getFloodReportWaterLevel(value: string | null | undefined) {
  const isWaterLevel = Constants.public.Enums.water_level.some(level => level === value);

  return isWaterLevel ? (value as FloodReportWaterLevel) : DEFAULT_FLOOD_REPORT_WATER_LEVEL;
}

function WaterLevelButtonGroup({
  id,
  name = 'waterLevel',
  value,
  onChange,
  className,
}: {
  id: string;
  name?: string;
  value: FloodReportWaterLevel;
  onChange: (value: FloodReportWaterLevel) => void;
  className?: string;
}) {
  const legendId = `${id}-legend`;

  return (
    <fieldset aria-labelledby={legendId} className={cn('flex flex-col gap-1.5', className)}>
      <legend id={legendId} className="mb-1.5 text-label-md text-foreground">
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-medium">Water level</span>
        </span>
      </legend>
      <div className="grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-3 sm:grid-cols-2">
        <div className="grid grid-cols-1 gap-2">
          {WATER_LEVEL_OPTIONS.map(option => (
            <label key={option.value} className="block cursor-pointer">
              <input
                className="peer sr-only"
                type="radio"
                name={name}
                value={option.value}
                checked={option.value === value}
                onChange={() => onChange(option.value)}
              />
              <span
                className={cn(
                  'flex h-[4.25rem] flex-col items-center justify-center gap-1 rounded-md border border-border bg-surface px-2 py-2 text-center sm:h-20 sm:px-2.5 sm:py-3',
                  'transition-colors hover:border-primary/60 hover:bg-primary-soft/30',
                  'peer-focus-visible:border-primary peer-focus-visible:ring-1 peer-focus-visible:ring-ring',
                  'peer-checked:border-primary peer-checked:bg-primary-soft/70 peer-checked:text-primary'
                )}
              >
                <span className="text-body-md font-semibold leading-tight">{option.label}</span>
                <span className="text-caption leading-tight text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
        <FloodLevelPersonScale value={value} />
      </div>
    </fieldset>
  );
}

const WATER_LEVEL_SCALE: Record<
  FloodReportWaterLevel,
  {
    label: string;
    heightPercent: number;
    markerTopPercent: number;
    bandClassName: string;
    markerClassName: string;
  }
> = {
  Ankle: {
    label: 'Ankle level',
    heightPercent: 18,
    markerTopPercent: 82,
    bandClassName: 'bg-[#FDE68A]',
    markerClassName: 'border-[#D97706]',
  },
  Knee: {
    label: 'Knee level',
    heightPercent: 34,
    markerTopPercent: 66,
    bandClassName: 'bg-[#FDBA74]',
    markerClassName: 'border-[#EA580C]',
  },
  Waist: {
    label: 'Waist level',
    heightPercent: 50,
    markerTopPercent: 50,
    bandClassName: 'bg-danger/25',
    markerClassName: 'border-danger',
  },
  Chest: {
    label: 'Chest level',
    heightPercent: 62,
    markerTopPercent: 38,
    bandClassName: 'bg-danger/35',
    markerClassName: 'border-danger',
  },
  Roof: {
    label: 'Above head or roof level',
    heightPercent: 84,
    markerTopPercent: 16,
    bandClassName: 'bg-danger/45',
    markerClassName: 'border-danger',
  },
  Unknown: {
    label: 'Unknown water level',
    heightPercent: 0,
    markerTopPercent: 50,
    bandClassName: 'bg-muted',
    markerClassName: 'border-muted-foreground',
  },
};

function FloodLevelPersonScale({ value }: { value: FloodReportWaterLevel }) {
  const scale = WATER_LEVEL_SCALE[value];
  const isUnknown = value === 'Unknown';

  return (
    <div
      className="relative mx-auto flex h-full min-h-[27rem] w-full items-end justify-center overflow-hidden rounded-md border border-border bg-surface sm:min-h-[31rem]"
      aria-label={`Flood level visualization: ${scale.label}`}
    >
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 bottom-0 transition-[height] duration-200',
          scale.bandClassName
        )}
        style={{ height: `${scale.heightPercent}%` }}
      />
      {!isUnknown ? (
        <div
          aria-hidden="true"
          className={cn('absolute left-0 right-0 z-20 border-t-2', scale.markerClassName)}
          style={{ top: `${scale.markerTopPercent}%` }}
        />
      ) : null}
      <img
        src={floodPersonModelUrl}
        alt=""
        aria-hidden="true"
        className="relative z-10 h-[24rem] w-full max-w-36 object-contain sm:h-[28rem] sm:max-w-48"
      />
      <span className="absolute bottom-2 left-2 z-20 rounded-md bg-surface/95 px-2 py-1 text-caption font-semibold text-foreground shadow-raised">
        {isUnknown ? 'Unknown' : value}
      </span>
    </div>
  );
}

export function ReportActionPage({ type }: ReportActionPageProps) {
  const isFloodReport = type === 'Flood Report';
  const { access } = useResidentAccessSession();

  return (
    <Page width="narrow" className="flex flex-col gap-6 pb-24 pt-6 sm:pt-10">
      <PageHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex max-w-2xl flex-col gap-2">
            <PageTitle>{isFloodReport ? 'Report flood' : 'Request rescue'}</PageTitle>
            <PageDescription>
              {isFloodReport
                ? 'Send a flood condition update now. It saves on this device first.'
                : 'Send an urgent rescue request now. It saves on this device first.'}
            </PageDescription>
          </div>
          <OfflineBadge showOnline />
        </div>
      </PageHeader>

      <ReportForm type={type} access={access} />
    </Page>
  );
}

function ReportForm({
  type,
  access,
}: {
  type: ReportHistoryType;
  access: ResidentAccessSession | null;
}) {
  const isOnline = useOnlineStatus();
  const reportHistoriesQuery = useReportHistoriesQuery({ type });
  const submitReportHistory = useSubmitReportHistoryMutation();
  const syncReportHistories = useSyncReportHistoriesMutation();
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedWaterLevel, setSelectedWaterLevel] = useState<FloodReportWaterLevel>(() =>
    getFloodReportWaterLevel(access?.session.house.water_level)
  );

  const reportHistories = reportHistoriesQuery.data ?? [];
  const queuedCount = useMemo(
    () => reportHistories.filter(report => report.outbox_status !== 'sent').length,
    [reportHistories]
  );
  const isFloodReport = type === 'Flood Report';
  const shouldPrioritizeRescue =
    isFloodReport && ['Waist', 'Chest', 'Roof'].includes(selectedWaterLevel);

  useEffect(() => {
    setSelectedWaterLevel(getFloodReportWaterLevel(access?.session.house.water_level));
  }, [access?.session.house.water_level]);

  useEffect(() => {
    if (!feedback) return;

    const timeoutId = window.setTimeout(() => setFeedback(null), 4_000);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  async function handleLocate() {
    setLocationError(null);
    setFormError(null);
    setIsLocating(true);

    try {
      setCapturedLocation(await getCurrentLocation());
    } catch (error) {
      setCapturedLocation(null);
      setLocationError(error instanceof Error ? error.message : 'Hindi makuha ang GPS.');
    } finally {
      setIsLocating(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFeedback(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const phoneNumber = normalizePhoneNumber(String(form.get('phoneNumber') ?? ''));
    const peopleCount = Number(
      form.get('peopleCount') ?? access?.session.family.total_members ?? 1
    );
    const note = String(form.get('note') ?? '').trim();
    const waterLevel = isFloodReport ? selectedWaterLevel : null;

    if (!isFloodReport && !capturedLocation) {
      setFormError('Kunin muna ang GPS location.');
      return;
    }

    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      setFormError('Ilagay ang tamang phone number.');
      return;
    }

    if (!Number.isFinite(peopleCount) || peopleCount < 0) {
      setFormError('Ilagay ang tamang bilang ng tao.');
      return;
    }

    submitReportHistory.mutate(
      {
        payload: {
          type,
          family_id: access?.session.family.id ?? null,
          house_id: access?.session.house.id ?? null,
          family_code: access?.session.family.family_code ?? null,
          access_method: access?.accessMethod ?? 'local',
          phone_number: phoneNumber || (access?.session.family.head_of_family_phone_number ?? null),
          latitude: capturedLocation?.latitude ?? null,
          longitude: capturedLocation?.longitude ?? null,
          accuracy_meters: capturedLocation?.accuracyMeters ?? null,
          water_level: waterLevel,
          people_count: peopleCount,
          note,
        },
      },
      {
        onSuccess: reportHistory => {
          formElement.reset();
          setSelectedWaterLevel(getFloodReportWaterLevel(access?.session.house.water_level));
          setCapturedLocation(null);
          setFeedback(
            !access
              ? 'Naka-save sa device. Add family code and PIN to sync.'
              : reportHistory.outbox_status === 'sent'
                ? 'Naipadala ang report.'
                : 'Naka-save sa device. Ipapadala kapag may signal.'
          );
        },
        onError: error => {
          setFormError(error instanceof Error ? error.message : 'Hindi nai-save.');
        },
      }
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <Card asChild elevated>
        <form onSubmit={handleSubmit} className="gap-5">
          <CardHeader>
            <CardTitle>{isFloodReport ? 'Flood condition' : 'Rescue details'}</CardTitle>
            <CardDescription>
              {access
                ? `${access.session.family.family_name} · ${access.session.barangay.name}`
                : 'No family code required to save on this device.'}
            </CardDescription>
          </CardHeader>

          <Button
            type="button"
            variant={isFloodReport ? 'secondary' : 'primary'}
            size="lg"
            className="w-full justify-center"
            isLoading={isLocating}
            loadingLabel="Kinukuha ang GPS..."
            aria-label="Get GPS location"
            onClick={handleLocate}
          >
            <IconCurrentLocation aria-hidden="true" />
            {isFloodReport ? 'Add GPS location' : 'Kunin ang GPS'}
          </Button>

          {capturedLocation ? <LocationPreview location={capturedLocation} /> : null}
          {locationError ? (
            <Alert tone="danger">
              <AlertBody>{locationError}</AlertBody>
            </Alert>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isFloodReport ? (
              <WaterLevelButtonGroup
                id="waterLevel"
                className="sm:col-span-2"
                value={selectedWaterLevel}
                onChange={setSelectedWaterLevel}
              />
            ) : null}

            {shouldPrioritizeRescue ? (
              <Alert tone="danger" className="sm:col-span-2">
                <AlertTitle>Rescue priority notice</AlertTitle>
                <AlertBody>
                  This level may need urgent rescue. Add GPS and details so responders can
                  prioritize this report.
                </AlertBody>
              </Alert>
            ) : null}

            <Label htmlFor="phoneNumber">
              Phone number (optional)
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                defaultValue={access?.session.family.head_of_family_phone_number ?? ''}
                placeholder="09xx xxx xxxx"
              />
            </Label>

            <Label htmlFor="peopleCount">
              People affected
              <Input
                id="peopleCount"
                name="peopleCount"
                type="number"
                inputMode="numeric"
                min={0}
                defaultValue={access?.session.family.total_members ?? 1}
                required
              />
            </Label>

            <Label htmlFor="note" className="sm:col-span-2">
              Note
              <Textarea
                id="note"
                name="note"
                placeholder={
                  isFloodReport
                    ? 'Halimbawa: mabilis ang taas ng tubig, baha sa kalsada'
                    : 'Halimbawa: nasa bubong, may bata, mataas ang tubig'
                }
              />
            </Label>
          </div>

          {formError ? (
            <Alert tone="danger">
              <AlertBody>{formError}</AlertBody>
            </Alert>
          ) : null}
          {feedback ? (
            <div className="fixed left-4 right-4 top-4 z-50 flex justify-end sm:left-auto sm:right-6 sm:top-6">
              <Toast tone="safe" className="sm:max-w-lg">
                <ToastBody>{feedback}</ToastBody>
                <ToastClose aria-label="Dismiss notification" onClick={() => setFeedback(null)} />
              </Toast>
            </div>
          ) : null}
          {!isOnline ? (
            <Alert tone="signal">
              <AlertBody>Naka-offline ka. Naka-save sa device at susubukan ulit.</AlertBody>
            </Alert>
          ) : null}
          {!access ? (
            <Alert
              tone="signal"
              className="border-signal/30 border-l-4 border-l-signal bg-signal-soft/60 pl-4 [&_[data-slot=alert-rail]]:hidden"
            >
              <AlertTitle>Saved on this device only</AlertTitle>
              <AlertBody className="text-label-md">
                Link family code and PIN later to sync when signal returns.
              </AlertBody>
            </Alert>
          ) : null}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Button
              type="submit"
              size="lg"
              variant={isFloodReport ? 'primary' : 'danger'}
              isLoading={submitReportHistory.isPending}
              loadingLabel="Ipinapadala..."
              aria-label="Send report"
            >
              <IconSend aria-hidden="true" />
              Ipadala
            </Button>
            {access ? (
              <Button
                type="button"
                size="lg"
                variant="ghost"
                isLoading={syncReportHistories.isPending}
                loadingLabel="Syncing..."
                onClick={() => {
                  syncReportHistories.mutate({
                    family_code: access.session.family.family_code,
                  });
                }}
              >
                <IconRefresh aria-hidden="true" />
                Sync
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <section aria-label="Recent reports" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-heading-md font-semibold text-foreground">History</h2>
          <span className="text-label-md text-muted-foreground">{queuedCount} pending</span>
        </div>
        {reportHistoriesQuery.isLoading ? (
          <p className="text-body-md text-muted-foreground">Loading reports.</p>
        ) : reportHistories.length === 0 ? (
          <p className="text-body-md text-muted-foreground">No reports yet on this device.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {reportHistories.slice(0, 8).map(reportHistory => (
              <ReportHistoryItem key={reportHistory.id} reportHistory={reportHistory} />
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

function LocationPreview({ location }: { location: CapturedLocation }) {
  return <CoordinatePreview location={location} title="GPS captured" />;
}

type CoordinatePreviewLocation = Pick<CapturedLocation, 'latitude' | 'longitude'> & {
  accuracyMeters?: number | null;
};

function CoordinatePreview({
  location,
  title = 'Location preview',
  compact = false,
}: {
  location: CoordinatePreviewLocation;
  title?: string;
  compact?: boolean;
}) {
  const isOnline = useOnlineStatus();
  const accuracyLabel =
    location.accuracyMeters !== undefined && location.accuracyMeters !== null
      ? ` · ±${Math.round(location.accuracyMeters)}m`
      : '';

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-md border border-border bg-surface-sunken',
        compact ? 'p-3' : 'p-4'
      )}
    >
      {isOnline ? (
        <iframe
          title={`${title}: ${formatCoordinate(location.latitude)}, ${formatCoordinate(
            location.longitude
          )}`}
          src={buildMapsEmbedUrl(location)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className={cn(
            'w-full rounded-md border border-border bg-surface-sunken',
            compact ? 'h-44' : 'h-64'
          )}
        />
      ) : (
        <LocalCoordinatePreviewMap location={location} title={title} compact={compact} />
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="inline-flex items-center gap-2 text-body-md font-medium text-foreground">
            <span aria-hidden="true" className="inline-block size-2 rounded-full bg-safe" />
            {title}
          </span>
          <p className="text-label-md text-muted-foreground">
            {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
            {accuracyLabel}
          </p>
        </div>
        <Button asChild variant="ghost" size={compact ? 'sm' : 'md'}>
          <a href={buildMapsUrl(location)} target="_blank" rel="noreferrer">
            <IconMapPin aria-hidden="true" />
            Open map
          </a>
        </Button>
      </div>
    </div>
  );
}

function LocalCoordinatePreviewMap({
  location,
  title,
  compact,
}: {
  location: CoordinatePreviewLocation;
  title: string;
  compact: boolean;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border border-border bg-primary-soft',
        compact ? 'h-44' : 'h-64'
      )}
      aria-label={`${title}: ${formatCoordinate(location.latitude)}, ${formatCoordinate(
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

function ReportHistoryItem({ reportHistory }: { reportHistory: ReportHistoryWithOutboxState }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const deleteReportHistory = useDeleteReportHistoryMutation();
  const needsFamilyAccess = !reportHistory.family_code && reportHistory.outbox_status !== 'sent';
  const canEdit = reportHistory.outbox_status !== 'sent';
  const reportLocation =
    reportHistory.latitude !== null && reportHistory.longitude !== null
      ? {
          latitude: reportHistory.latitude,
          longitude: reportHistory.longitude,
          accuracyMeters: reportHistory.accuracy_meters,
        }
      : null;

  return (
    <li className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-body-md font-medium text-foreground">
            {reportHistory.family_code ?? 'No family linked'}
          </span>
          <span className="text-label-md text-muted-foreground">
            {reportHistory.people_count ?? 0} people · {formatTimeSince(reportHistory.created_at)}{' '}
            ago
          </span>
          {reportHistory.outbox_last_error ? (
            <span className="text-caption text-danger">{reportHistory.outbox_last_error}</span>
          ) : null}
        </div>
        <ReportSyncStatusBadge
          status={reportHistory.outbox_status}
          needsFamilyAccess={needsFamilyAccess}
        />
      </div>
      {isEditing ? (
        <ReportHistoryEditForm
          reportHistory={reportHistory}
          onCancel={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
        />
      ) : reportLocation ? (
        <CoordinatePreview location={reportLocation} title="Saved location" compact />
      ) : null}
      {!isEditing ? (
        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
          {canEdit ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsConfirmingDelete(false);
                setIsEditing(true);
              }}
            >
              <IconEdit aria-hidden="true" />
              Edit
            </Button>
          ) : (
            <span className="flex items-center text-caption text-muted-foreground">
              Sent reports are locked.
            </span>
          )}
          {isConfirmingDelete ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={deleteReportHistory.isPending}
                onClick={() => setIsConfirmingDelete(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={deleteReportHistory.isPending}
                loadingLabel="Deleting..."
                onClick={() => {
                  deleteReportHistory.mutate({
                    payload: { id: reportHistory.id },
                  });
                }}
              >
                Delete
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={deleteReportHistory.isPending}
              onClick={() => setIsConfirmingDelete(true)}
            >
              <IconTrash aria-hidden="true" />
              Delete
            </Button>
          )}
        </div>
      ) : null}
    </li>
  );
}

function ReportHistoryEditForm({
  reportHistory,
  onCancel,
  onSaved,
}: {
  reportHistory: ReportHistoryWithOutboxState;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const updateReportHistory = useUpdateReportHistoryMutation();
  const isFloodReport = reportHistory.type === 'Flood Report';
  const [editLocation, setEditLocation] = useState<CapturedLocation | null>(() =>
    reportHistory.latitude !== null && reportHistory.longitude !== null
      ? {
          latitude: reportHistory.latitude,
          longitude: reportHistory.longitude,
          accuracyMeters: reportHistory.accuracy_meters,
        }
      : null
  );
  const [isLocating, setIsLocating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedWaterLevel, setSelectedWaterLevel] = useState<FloodReportWaterLevel>(() =>
    getFloodReportWaterLevel(reportHistory.water_level)
  );

  async function handleLocate() {
    setLocationError(null);
    setEditError(null);
    setIsLocating(true);

    try {
      setEditLocation(await getCurrentLocation());
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Hindi makuha ang GPS.');
    } finally {
      setIsLocating(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEditError(null);

    const form = new FormData(event.currentTarget);
    const phoneNumber = normalizePhoneNumber(String(form.get('phoneNumber') ?? ''));
    const peopleCount = Number(form.get('peopleCount') ?? 0);
    const note = String(form.get('note') ?? '').trim();
    const waterLevel = isFloodReport ? selectedWaterLevel : null;

    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      setEditError('Ilagay ang tamang phone number.');
      return;
    }

    if (!Number.isFinite(peopleCount) || peopleCount < 0) {
      setEditError('Ilagay ang tamang bilang ng tao.');
      return;
    }

    if (!isFloodReport && !editLocation) {
      setEditError('Kunin muna ang GPS location.');
      return;
    }

    updateReportHistory.mutate(
      {
        payload: {
          id: reportHistory.id,
          payload: {
            phone_number: phoneNumber || null,
            people_count: peopleCount,
            note: note || null,
            water_level: isFloodReport ? waterLevel : null,
            latitude: editLocation?.latitude ?? null,
            longitude: editLocation?.longitude ?? null,
            accuracy_meters: editLocation?.accuracyMeters ?? null,
          },
        },
      },
      {
        onSuccess: onSaved,
        onError: error => {
          setEditError(error instanceof Error ? error.message : 'Hindi nai-save ang changes.');
        },
      }
    );
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-md border border-border bg-surface-sunken p-3"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-body-md font-semibold text-foreground">Edit report</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={updateReportHistory.isPending}
          onClick={onCancel}
        >
          <IconX aria-hidden="true" />
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {isFloodReport ? (
          <WaterLevelButtonGroup
            id={`edit-water-${reportHistory.id}`}
            className="sm:col-span-2"
            value={selectedWaterLevel}
            onChange={setSelectedWaterLevel}
          />
        ) : null}

        <Label htmlFor={`edit-phone-${reportHistory.id}`}>
          Phone number (optional)
          <Input
            id={`edit-phone-${reportHistory.id}`}
            name="phoneNumber"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={reportHistory.phone_number ?? ''}
            placeholder="09xx xxx xxxx"
          />
        </Label>

        <Label htmlFor={`edit-people-${reportHistory.id}`}>
          People affected
          <Input
            id={`edit-people-${reportHistory.id}`}
            name="peopleCount"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={reportHistory.people_count ?? 0}
            required
          />
        </Label>

        <Label htmlFor={`edit-note-${reportHistory.id}`} className="sm:col-span-2">
          Note
          <Textarea
            id={`edit-note-${reportHistory.id}`}
            name="note"
            defaultValue={reportHistory.note ?? ''}
          />
        </Label>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="md"
        className="w-full justify-center"
        isLoading={isLocating}
        loadingLabel="Kinukuha ang GPS..."
        onClick={handleLocate}
      >
        <IconCurrentLocation aria-hidden="true" />
        Update GPS location
      </Button>

      {editLocation ? (
        <CoordinatePreview location={editLocation} title="Edited location" compact />
      ) : null}
      {locationError ? (
        <Alert tone="danger">
          <AlertBody>{locationError}</AlertBody>
        </Alert>
      ) : null}
      {editError ? (
        <Alert tone="danger">
          <AlertBody>{editError}</AlertBody>
        </Alert>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="ghost"
          size="md"
          disabled={updateReportHistory.isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="md"
          isLoading={updateReportHistory.isPending}
          loadingLabel="Saving..."
        >
          <IconDeviceFloppy aria-hidden="true" />
          Save
        </Button>
      </div>
    </form>
  );
}

const syncDotClassName: Record<ReportHistoryOutboxStatus, string> = {
  queued: 'bg-signal',
  sending: 'bg-primary',
  sent: 'bg-safe',
  failed: 'bg-danger',
};

const syncLabel: Record<ReportHistoryOutboxStatus, string> = {
  queued: 'Queued',
  sending: 'Sending',
  sent: 'Sent',
  failed: 'Retrying',
};

const syncIcon: Record<ReportHistoryOutboxStatus, typeof IconCheck> = {
  queued: IconAlertTriangle,
  sending: IconRefresh,
  sent: IconCheck,
  failed: IconAlertTriangle,
};

function ReportSyncStatusBadge({
  status,
  needsFamilyAccess = false,
}: {
  status: ReportHistoryOutboxStatus;
  needsFamilyAccess?: boolean;
}) {
  const Icon = syncIcon[status];
  const label = needsFamilyAccess ? 'Needs family' : syncLabel[status];

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 text-label-md text-muted-foreground"
      title={label}
    >
      <span
        aria-hidden="true"
        className={cn('inline-block size-2 rounded-full', syncDotClassName[status])}
      />
      <Icon aria-hidden="true" className="size-3.5" />
      {label}
    </span>
  );
}

function getCurrentLocation(): Promise<CapturedLocation> {
  if (!navigator.geolocation) {
    return Promise.reject(new Error('Hindi supported ang GPS sa browser na ito.'));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
        });
      },
      error => {
        reject(new Error(getGeolocationErrorMessage(error)));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15_000,
        timeout: 20_000,
      }
    );
  });
}

function getGeolocationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return 'Hindi pinayagan ang GPS. Permission denied.';
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return 'Hindi available ang GPS ngayon.';
  }

  if (error.code === error.TIMEOUT) {
    return 'Nag-timeout ang GPS. Subukan ulit.';
  }

  return 'Hindi makuha ang GPS.';
}

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d+]/g, '').trim();
}

function isValidPhoneNumber(value: string) {
  return value.replace(/\D/g, '').length >= 7;
}

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

function buildMapsUrl(location: Pick<CapturedLocation, 'latitude' | 'longitude'>) {
  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
}

function buildMapsEmbedUrl(location: Pick<CapturedLocation, 'latitude' | 'longitude'>) {
  const query = encodeURIComponent(`${location.latitude},${location.longitude}`);

  return `https://maps.google.com/maps?q=${query}&z=16&output=embed`;
}

function formatTimeSince(timestamp: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(timestamp)) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
