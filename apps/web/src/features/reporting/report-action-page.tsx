import {
  IconAlertTriangle,
  IconCheck,
  IconCurrentLocation,
  IconMapPin,
  IconRefresh,
  IconSend,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  ResidentAccessGate,
  type ResidentAccessSession,
} from '@/features/resident/resident-access-gate';
import {
  useReportHistoriesQuery,
  useSubmitReportHistoryMutation,
  useSyncReportHistoriesMutation,
} from '@/hooks/query/report-histories';
import { Constants } from '@/lib/supabase/types';
import type {
  ReportHistory,
  ReportHistorySyncStatus,
  ReportHistoryType,
  ReportHistoryWaterLevel,
} from '@/lib/dexie';
import { Alert, AlertBody } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OfflineBadge, useOnlineStatus } from '@/components/ui/offline-badge';
import { Page, PageDescription, PageHeader, PageTitle } from '@/components/ui/page';
import { cn } from '@/lib/utils';

type CapturedLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
};

type ReportActionPageProps = {
  type: ReportHistoryType;
};

export function ReportActionPage({ type }: ReportActionPageProps) {
  const isFloodReport = type === 'Flood Report';

  return (
    <Page width="wide" className="flex flex-col gap-10">
      <PageHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex max-w-2xl flex-col gap-2">
            <PageTitle>{isFloodReport ? 'Report flood' : 'Request rescue'}</PageTitle>
            <PageDescription>
              {isFloodReport
                ? 'Send a flood condition update from your family record. Saves offline and syncs when signal returns.'
                : 'Send your rescue request with family verification and GPS. Saves offline and syncs when signal returns.'}
            </PageDescription>
          </div>
          <OfflineBadge showOnline />
        </div>
      </PageHeader>

      <ResidentAccessGate
        title={isFloodReport ? 'Verify before reporting flood' : 'Verify before requesting rescue'}
        description="Scan QR, upload QR, or enter family code and PIN to continue."
      >
        {access => <VerifiedReportForm type={type} access={access} />}
      </ResidentAccessGate>
    </Page>
  );
}

function VerifiedReportForm({
  type,
  access,
}: {
  type: ReportHistoryType;
  access: ResidentAccessSession & { endSession: () => void };
}) {
  const isOnline = useOnlineStatus();
  const reportHistoriesQuery = useReportHistoriesQuery(type);
  const submitReportHistory = useSubmitReportHistoryMutation();
  const syncReportHistories = useSyncReportHistoriesMutation();
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const hasAttemptedStartupSyncRef = useRef(false);

  const reportHistories = reportHistoriesQuery.data ?? [];
  const queuedCount = useMemo(
    () => reportHistories.filter(report => report.syncStatus !== 'sent').length,
    [reportHistories]
  );
  const isFloodReport = type === 'Flood Report';

  useEffect(() => {
    if (!isOnline) {
      hasAttemptedStartupSyncRef.current = false;
      return;
    }

    if (hasAttemptedStartupSyncRef.current || syncReportHistories.isPending) return;

    hasAttemptedStartupSyncRef.current = true;
    syncReportHistories.mutate();
  }, [isOnline, syncReportHistories]);

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
    const peopleCount = Number(form.get('peopleCount') ?? access.session.family.total_members);
    const note = String(form.get('note') ?? '').trim();
    const waterLevel = (String(form.get('waterLevel') ?? '') ||
      null) as ReportHistoryWaterLevel | null;

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
          familyId: access.session.family.id,
          houseId: access.session.house.id,
          familyCode: access.session.family.family_code,
          accessMethod: access.accessMethod,
          phoneNumber: phoneNumber || (access.session.family.head_of_family_phone_number ?? null),
          latitude: capturedLocation?.latitude ?? null,
          longitude: capturedLocation?.longitude ?? null,
          accuracyMeters: capturedLocation?.accuracyMeters ?? null,
          waterLevel,
          peopleCount,
          note,
        },
      },
      {
        onSuccess: reportHistory => {
          formElement.reset();
          setCapturedLocation(null);
          setFeedback(
            reportHistory.syncStatus === 'sent'
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
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
      <Card asChild elevated>
        <form onSubmit={handleSubmit} className="gap-5">
          <CardHeader>
            <CardTitle>{isFloodReport ? 'Flood condition' : 'Rescue details'}</CardTitle>
            <CardDescription>
              {access.session.family.family_name} · {access.session.barangay.name}
            </CardDescription>
          </CardHeader>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface-sunken p-4">
            <div className="flex flex-col">
              <span className="text-caption text-muted-foreground">Verified family</span>
              <span className="text-body-md font-medium text-foreground">
                {access.session.family.family_code}
              </span>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={access.endSession}>
              End session
            </Button>
          </div>

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
            <Label htmlFor="phoneNumber" className="sm:col-span-2">
              Phone number
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                defaultValue={access.session.family.head_of_family_phone_number ?? ''}
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
                defaultValue={access.session.family.total_members}
                required
              />
            </Label>

            {isFloodReport ? (
              <Label htmlFor="waterLevel">
                Water level
                <Select
                  id="waterLevel"
                  name="waterLevel"
                  defaultValue={access.session.house.water_level}
                >
                  {Constants.public.Enums.water_level.map(level => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Select>
              </Label>
            ) : null}

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
            <Alert tone="safe">
              <AlertBody>{feedback}</AlertBody>
            </Alert>
          ) : null}
          {!isOnline ? (
            <Alert tone="signal">
              <AlertBody>Naka-offline ka. Naka-save sa device at susubukan ulit.</AlertBody>
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-2">
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
            <Button
              type="button"
              size="lg"
              variant="ghost"
              isLoading={syncReportHistories.isPending}
              loadingLabel="Syncing..."
              onClick={() => syncReportHistories.mutate()}
            >
              <IconRefresh aria-hidden="true" />
              Retry sync
            </Button>
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
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-sunken p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="inline-flex items-center gap-2 text-body-md font-medium text-foreground">
            <span aria-hidden="true" className="inline-block size-2 rounded-full bg-safe" />
            GPS captured
          </span>
          <p className="text-label-md text-muted-foreground">
            {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
            {location.accuracyMeters !== null ? ` · ±${Math.round(location.accuracyMeters)}m` : ''}
          </p>
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

function ReportHistoryItem({ reportHistory }: { reportHistory: ReportHistory }) {
  return (
    <li className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-body-md font-medium text-foreground">
            {reportHistory.familyCode}
          </span>
          <span className="text-label-md text-muted-foreground">
            {reportHistory.peopleCount ?? 0} people · {formatTimeSince(reportHistory.createdAt)} ago
          </span>
          {reportHistory.latitude !== null && reportHistory.longitude !== null ? (
            <a
              href={buildMapsUrl({
                latitude: reportHistory.latitude,
                longitude: reportHistory.longitude,
              })}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-label-md text-primary hover:underline"
            >
              <IconMapPin aria-hidden="true" className="size-4" />
              <span className="truncate">
                {formatCoordinate(reportHistory.latitude)},{' '}
                {formatCoordinate(reportHistory.longitude)}
              </span>
            </a>
          ) : null}
          {reportHistory.lastSyncError ? (
            <span className="text-caption text-danger">{reportHistory.lastSyncError}</span>
          ) : null}
        </div>
        <ReportSyncStatusBadge status={reportHistory.syncStatus} />
      </div>
    </li>
  );
}

const syncDotClassName: Record<ReportHistorySyncStatus, string> = {
  queued: 'bg-signal',
  sending: 'bg-primary',
  sent: 'bg-safe',
  failed: 'bg-danger',
};

const syncLabel: Record<ReportHistorySyncStatus, string> = {
  queued: 'Queued',
  sending: 'Sending',
  sent: 'Sent',
  failed: 'Retrying',
};

const syncIcon: Record<ReportHistorySyncStatus, typeof IconCheck> = {
  queued: IconAlertTriangle,
  sending: IconRefresh,
  sent: IconCheck,
  failed: IconAlertTriangle,
};

function ReportSyncStatusBadge({ status }: { status: ReportHistorySyncStatus }) {
  const Icon = syncIcon[status];

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 text-label-md text-muted-foreground"
      title={syncLabel[status]}
    >
      <span
        aria-hidden="true"
        className={cn('inline-block size-2 rounded-full', syncDotClassName[status])}
      />
      <Icon aria-hidden="true" className="size-3.5" />
      {syncLabel[status]}
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
