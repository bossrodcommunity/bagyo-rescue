import {
  IconAlertTriangle,
  IconCheck,
  IconCurrentLocation,
  IconKey,
  IconMapPin,
  IconRefresh,
  IconSend,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ResidentAccessPanel } from '@/features/resident/resident-access-gate';
import {
  type ResidentAccessSession,
  useResidentAccessSession,
} from '@/features/resident/resident-access-session';
import {
  useLinkPendingReportHistoriesToAccessMutation,
  useReportHistoriesQuery,
  useSubmitReportHistoryMutation,
  useSyncReportHistoriesMutation,
} from '@/hooks/query/report-histories';
import { Constants } from '@/lib/supabase/types';
import type {
  ReportHistoryOutboxStatus,
  ReportHistoryType,
  ReportHistoryWaterLevel,
  ReportHistoryWithOutboxState,
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
  const { access, setAccess, endSession } = useResidentAccessSession();

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

      <FamilyAccessSection access={access} endSession={endSession} onAuthenticated={setAccess} />
      <ReportForm type={type} access={access} />
    </Page>
  );
}

function FamilyAccessSection({
  access,
  endSession,
  onAuthenticated,
}: {
  access: ResidentAccessSession | null;
  endSession: () => void;
  onAuthenticated: (access: ResidentAccessSession) => void;
}) {
  const [isAddingAccess, setIsAddingAccess] = useState(false);

  if (access) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-safe-soft p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-safe text-text-on-safe">
            <IconShieldCheck aria-hidden="true" className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-body-md font-medium text-foreground">
              {access.session.family.family_code}
            </span>
            <span className="truncate text-label-md text-muted-foreground">
              {access.session.family.family_name}
            </span>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={endSession}>
          Unlink
        </Button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
            <IconKey aria-hidden="true" className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-body-md font-semibold text-foreground">Family code optional</h2>
            <p className="text-label-md text-muted-foreground">
              File now without a code. Add your family code and PIN later to sync pending reports.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsAddingAccess(value => !value)}
        >
          {isAddingAccess ? 'Close' : 'Add'}
        </Button>
      </div>

      {isAddingAccess ? (
        <ResidentAccessPanel
          title="Link family"
          description="Scan QR, upload QR, or enter family code and PIN. Pending local reports will sync after this."
          onAuthenticated={nextAccess => {
            onAuthenticated(nextAccess);
            setIsAddingAccess(false);
          }}
        />
      ) : null}
    </section>
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
  const linkPendingReportHistories = useLinkPendingReportHistoriesToAccessMutation();
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const syncedAccessFamilyCodeRef = useRef<string | null>(null);

  const reportHistories = reportHistoriesQuery.data ?? [];
  const queuedCount = useMemo(
    () => reportHistories.filter(report => report.outbox_status !== 'sent').length,
    [reportHistories]
  );
  const isFloodReport = type === 'Flood Report';

  useEffect(() => {
    if (!access) {
      syncedAccessFamilyCodeRef.current = null;
      return;
    }

    if (!isOnline) {
      syncedAccessFamilyCodeRef.current = null;
      return;
    }

    if (
      syncedAccessFamilyCodeRef.current === access.session.family.family_code ||
      linkPendingReportHistories.isPending ||
      syncReportHistories.isPending
    ) {
      return;
    }

    syncedAccessFamilyCodeRef.current = access.session.family.family_code;
    linkPendingReportHistories.mutate(
      {
        payload: {
          family_id: access.session.family.id,
          house_id: access.session.house.id,
          family_code: access.session.family.family_code,
          access_method: access.accessMethod,
          phone_number: access.session.family.head_of_family_phone_number,
          people_count: access.session.family.total_members,
        },
      },
      {
        onSuccess: () => {
          syncReportHistories.mutate({ family_code: access.session.family.family_code });
        },
      }
    );
  }, [access, isOnline, linkPendingReportHistories, syncReportHistories]);

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
            <Label htmlFor="phoneNumber" className="sm:col-span-2">
              Phone number
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

            {isFloodReport ? (
              <Label htmlFor="waterLevel">
                Water level
                <Select
                  id="waterLevel"
                  name="waterLevel"
                  defaultValue={
                    access?.session.house.water_level ?? Constants.public.Enums.water_level[0]
                  }
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
          {!access ? (
            <Alert tone="signal">
              <AlertBody>
                Reports stay local until this device is linked with a family code and PIN.
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
                isLoading={linkPendingReportHistories.isPending || syncReportHistories.isPending}
                loadingLabel="Syncing..."
                onClick={() => {
                  linkPendingReportHistories.mutate(
                    {
                      payload: {
                        family_id: access.session.family.id,
                        house_id: access.session.house.id,
                        family_code: access.session.family.family_code,
                        access_method: access.accessMethod,
                        phone_number: access.session.family.head_of_family_phone_number,
                        people_count: access.session.family.total_members,
                      },
                    },
                    {
                      onSuccess: () =>
                        syncReportHistories.mutate({
                          family_code: access.session.family.family_code,
                        }),
                    }
                  );
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

function ReportHistoryItem({ reportHistory }: { reportHistory: ReportHistoryWithOutboxState }) {
  const needsFamilyAccess = !reportHistory.family_code && reportHistory.outbox_status !== 'sent';

  return (
    <li className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-body-md font-medium text-foreground">
            {reportHistory.family_code ?? 'No family linked'}
          </span>
          <span className="text-label-md text-muted-foreground">
            {reportHistory.people_count ?? 0} people · {formatTimeSince(reportHistory.created_at)}{' '}
            ago
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
          {reportHistory.outbox_last_error ? (
            <span className="text-caption text-danger">{reportHistory.outbox_last_error}</span>
          ) : null}
        </div>
        <ReportSyncStatusBadge
          status={reportHistory.outbox_status}
          needsFamilyAccess={needsFamilyAccess}
        />
      </div>
    </li>
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
