import { createFileRoute } from '@tanstack/react-router';
import {
  IconAlertTriangle,
  IconCheck,
  IconCurrentLocation,
  IconMapPin,
  IconPhone,
  IconRefresh,
  IconSend,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  useRescuePingsQuery,
  useSubmitRescuePingMutation,
  useSyncRescuePingsMutation,
} from '@/hooks/query/rescue-pings';
import type { RescuePing, RescuePingSyncStatus } from '@/lib/dexie';
import { Alert, AlertBody } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OfflineBadge, useOnlineStatus } from '@/components/ui/offline-badge';
import { Page, PageDescription, PageHeader, PageTitle } from '@/components/ui/page';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/ping')({
  component: PingRescuePage,
});

type CapturedLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
};

function PingRescuePage() {
  const isOnline = useOnlineStatus();
  const rescuePingsQuery = useRescuePingsQuery();
  const submitRescuePing = useSubmitRescuePingMutation();
  const syncRescuePings = useSyncRescuePingsMutation();
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const hasAttemptedStartupSyncRef = useRef(false);

  const rescuePings = rescuePingsQuery.data ?? [];
  const queuedCount = useMemo(
    () => rescuePings.filter(ping => ping.syncStatus !== 'sent').length,
    [rescuePings]
  );

  useEffect(() => {
    if (!isOnline) {
      hasAttemptedStartupSyncRef.current = false;
      return;
    }

    if (hasAttemptedStartupSyncRef.current || syncRescuePings.isPending) return;

    hasAttemptedStartupSyncRef.current = true;
    syncRescuePings.mutate();
  }, [isOnline, syncRescuePings]);

  async function handleLocate() {
    setLocationError(null);
    setFormError(null);
    setIsLocating(true);

    try {
      const location = await getCurrentLocation();
      setCapturedLocation(location);
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
    const note = String(form.get('note') ?? '').trim();

    if (!capturedLocation) {
      setFormError('Kunin muna ang GPS location.');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setFormError('Ilagay ang tamang phone number.');
      return;
    }

    submitRescuePing.mutate(
      {
        payload: {
          phoneNumber,
          latitude: capturedLocation.latitude,
          longitude: capturedLocation.longitude,
          accuracyMeters: capturedLocation.accuracyMeters,
          note,
        },
      },
      {
        onSuccess: rescuePing => {
          formElement.reset();
          setCapturedLocation(null);
          setFeedback(
            rescuePing.syncStatus === 'sent'
              ? 'Naipadala ang rescue ping.'
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
    <Page width="wide" className="flex flex-col gap-10">
      <PageHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex max-w-2xl flex-col gap-2">
            <PageTitle>Ping rescue</PageTitle>
            <PageDescription>
              Ipadala ang GPS location at phone number sa rescue queue. Sends now, or queues on this
              device until signal returns.
            </PageDescription>
          </div>
          <OfflineBadge showOnline />
        </div>
        <div className="mt-2 flex flex-wrap gap-6 text-label-md text-muted-foreground">
          <span>
            <span className="text-foreground font-medium">{queuedCount}</span> pending
          </span>
          <span>
            <span className="text-foreground font-medium">{rescuePings.length}</span> total on this
            device
          </span>
        </div>
      </PageHeader>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card asChild elevated>
          <form onSubmit={handleSubmit} className="gap-5">
            <CardHeader>
              <CardTitle>Emergency details</CardTitle>
              <CardDescription>GPS, phone number, and a short note.</CardDescription>
            </CardHeader>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={isLocating}
              loadingLabel="Kinukuha ang GPS..."
              aria-label="Get GPS location"
              onClick={handleLocate}
            >
              <IconCurrentLocation aria-hidden="true" />
              Kunin ang GPS
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
                  placeholder="09xx xxx xxxx"
                  required
                />
              </Label>
              <Label htmlFor="note" className="sm:col-span-2">
                Note
                <Textarea
                  id="note"
                  name="note"
                  placeholder="Halimbawa: nasa bubong, may bata, mataas ang tubig"
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
                <AlertBody>
                  Naka-offline ka. Naka-save sa device at awtomatikong susubukan ulit.
                </AlertBody>
              </Alert>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                size="lg"
                variant="danger"
                isLoading={submitRescuePing.isPending}
                loadingLabel="Ipinapadala..."
                aria-label="Send ping"
              >
                <IconSend aria-hidden="true" />
                Ipadala
              </Button>
              <Button
                type="button"
                size="lg"
                variant="ghost"
                isLoading={syncRescuePings.isPending}
                loadingLabel="Syncing..."
                onClick={() => syncRescuePings.mutate()}
              >
                <IconRefresh aria-hidden="true" />
                Retry sync
              </Button>
            </div>
          </form>
        </Card>

        <section aria-label="Recent rescue pings" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-heading-md font-semibold text-foreground">Recent pings</h2>
            <span className="text-label-md text-muted-foreground">This device</span>
          </div>
          {rescuePingsQuery.isLoading ? (
            <p className="text-body-md text-muted-foreground">Loading pings.</p>
          ) : rescuePings.length === 0 ? (
            <p className="text-body-md text-muted-foreground">No pings yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {rescuePings.slice(0, 8).map(rescuePing => (
                <PingHistoryItem key={rescuePing.id} rescuePing={rescuePing} />
              ))}
            </ul>
          )}
        </section>
      </section>
    </Page>
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
      <GoogleMapFrame location={location} title="Captured GPS location" />
    </div>
  );
}

function PingHistoryItem({ rescuePing }: { rescuePing: RescuePing }) {
  return (
    <li className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="inline-flex items-center gap-2 text-label-md text-muted-foreground">
            <IconPhone aria-hidden="true" className="size-4" />
            {rescuePing.phoneNumber}
          </span>
          <a
            href={buildMapsUrl(rescuePing)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-body-md text-primary hover:underline"
          >
            <IconMapPin aria-hidden="true" className="size-4" />
            <span className="truncate">
              {formatCoordinate(rescuePing.latitude)}, {formatCoordinate(rescuePing.longitude)}
            </span>
          </a>
          <span className="text-caption text-muted-foreground">
            {formatTimeSince(rescuePing.createdAt)} ago
          </span>
          {rescuePing.lastSyncError ? (
            <span className="text-caption text-danger">{rescuePing.lastSyncError}</span>
          ) : null}
        </div>
        <PingSyncStatusBadge status={rescuePing.syncStatus} />
      </div>
      <GoogleMapFrame
        location={rescuePing}
        title={`Rescue ping map for ${rescuePing.phoneNumber}`}
        className="mt-3"
      />
    </li>
  );
}

function GoogleMapFrame({
  location,
  title,
  className,
}: {
  location: Pick<RescuePing, 'latitude' | 'longitude'>;
  title: string;
  className?: string;
}) {
  return (
    <iframe
      title={title}
      src={buildMapsEmbedUrl(location)}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={cn('h-48 w-full rounded-sm border border-border bg-surface', className)}
    />
  );
}

const syncDotClassName: Record<RescuePingSyncStatus, string> = {
  queued: 'bg-signal',
  sending: 'bg-primary',
  sent: 'bg-safe',
  failed: 'bg-danger',
};

const syncLabel: Record<RescuePingSyncStatus, string> = {
  queued: 'Queued',
  sending: 'Sending',
  sent: 'Sent',
  failed: 'Retrying',
};

const syncIcon: Record<RescuePingSyncStatus, typeof IconCheck> = {
  queued: IconAlertTriangle,
  sending: IconRefresh,
  sent: IconCheck,
  failed: IconAlertTriangle,
};

function PingSyncStatusBadge({ status }: { status: RescuePingSyncStatus }) {
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

function buildMapsUrl(rescuePing: Pick<RescuePing, 'latitude' | 'longitude'>) {
  return `https://www.google.com/maps?q=${rescuePing.latitude},${rescuePing.longitude}`;
}

function buildMapsEmbedUrl(rescuePing: Pick<RescuePing, 'latitude' | 'longitude'>) {
  return `https://maps.google.com/maps?q=${rescuePing.latitude},${rescuePing.longitude}&z=16&output=embed`;
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
