import { useMutation } from '@tanstack/react-query';
import {
  IconCamera,
  IconKeyboard,
  IconPhotoUp,
  IconPlayerStop,
  IconUpload,
} from '@tabler/icons-react';
import QrScanner from 'qr-scanner';
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { getResidentSessionData, type ResidentSessionData } from '@/features/resident/_data';
import { Alert, AlertBody } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { type ResidentAccessMethod } from '@/lib/dexie';

export type ResidentAccessSession = {
  session: ResidentSessionData;
  accessMethod: ResidentAccessMethod;
};

export type ResidentAccessGateProps = {
  title?: string;
  description?: string;
  children: (access: ResidentAccessSession & { endSession: () => void }) => ReactNode;
};

const residentAccessStorageKey = 'bagyo-rescue.resident-access-session';

function getStoredResidentAccessSession() {
  const storedValue = window.localStorage.getItem(residentAccessStorageKey);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as ResidentAccessSession;
  } catch {
    window.localStorage.removeItem(residentAccessStorageKey);
    return null;
  }
}

function setStoredResidentAccessSession(access: ResidentAccessSession) {
  window.localStorage.setItem(residentAccessStorageKey, JSON.stringify(access));
}

function clearStoredResidentAccessSession() {
  window.localStorage.removeItem(residentAccessStorageKey);
}

export function ResidentAccessGate({
  title = 'Family verification',
  description = 'Scan, upload, or enter your family code and PIN before sending a report.',
  children,
}: ResidentAccessGateProps) {
  const [access, setAccess] = useState<ResidentAccessSession | null>(() =>
    getStoredResidentAccessSession()
  );

  if (access) {
    return children({
      ...access,
      endSession: () => {
        clearStoredResidentAccessSession();
        setAccess(null);
      },
    });
  }

  return (
    <ResidentAccessPanel
      title={title}
      description={description}
      onAuthenticated={nextAccess => {
        setStoredResidentAccessSession(nextAccess);
        setAccess(nextAccess);
      }}
    />
  );
}

function ResidentAccessPanel({
  title,
  description,
  onAuthenticated,
}: {
  title: string;
  description: string;
  onAuthenticated: (access: ResidentAccessSession) => void;
}) {
  const uploadInputId = useId();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [activeMode, setActiveMode] = useState<ResidentAccessMethod>('manual');
  const [familyCode, setFamilyCode] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [accessError, setAccessError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const accessMutation = useMutation({
    mutationFn: getResidentSessionData,
    onSuccess: session => {
      onAuthenticated({ session, accessMethod: activeMode });
      setAccessError(null);
      setScanStatus(null);
      setIsCameraActive(false);
    },
    onError: (error: Error) => {
      setAccessError(error.message);
    },
  });

  useEffect(() => {
    return () => {
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, []);

  function stopCamera() {
    scannerRef.current?.destroy();
    scannerRef.current = null;
    setIsCameraActive(false);
  }

  function handleStartCamera() {
    const video = videoRef.current;

    if (!video) {
      setAccessError('Hindi available ang camera preview.');
      return;
    }

    setActiveMode('scan');
    setAccessError(null);
    setScanStatus('Itutok ang camera sa family QR.');
    setIsCameraActive(true);

    scannerRef.current?.destroy();
    const scanner = new QrScanner(
      video,
      result => {
        const nextFamilyCode = parseResidentQrAccessCode(result.data);

        if (!nextFamilyCode) return;

        setFamilyCode(nextFamilyCode);
        setScanStatus('Na-scan ang QR. Ilagay ang PIN.');
        scannerRef.current = null;
        setIsCameraActive(false);
        scanner.destroy();
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
        onDecodeError: () => {},
      }
    );
    scannerRef.current = scanner;

    scanner.start().catch((error: unknown) => {
      setAccessError(getErrorMessage(error, 'Hindi nag-start ang camera.'));
      scannerRef.current = null;
      setIsCameraActive(false);
      scanner.destroy();
    });
  }

  async function handleQrUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';

    if (!file) return;

    setActiveMode('upload');
    setScanStatus('Binabasa ang QR image...');
    setAccessError(null);

    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
        alsoTryWithoutScanRegion: true,
      });
      const nextFamilyCode = parseResidentQrAccessCode(result.data);

      if (!nextFamilyCode) {
        throw new Error('Walang nahanap na family code sa QR image.');
      }

      setFamilyCode(nextFamilyCode);
      setScanStatus('Na-upload ang QR. Ilagay ang PIN.');
    } catch (error) {
      setAccessError(getErrorMessage(error, 'Walang family QR na nahanap sa image na iyon.'));
      setScanStatus(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAccessError(null);

    const nextFamilyCode = parseResidentQrAccessCode(familyCode);

    if (!nextFamilyCode) {
      setAccessError('Ilagay muna ang family code.');
      return;
    }

    if (!pinCode.trim()) {
      setAccessError('Ilagay ang PIN code.');
      return;
    }

    accessMutation.mutate({
      familyCode: nextFamilyCode,
      pinCode: pinCode.trim(),
    });
  }

  return (
    <Card elevated asChild>
      <form className="gap-5" onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <div
          className="grid grid-cols-3 overflow-hidden rounded-md border border-border"
          role="tablist"
          aria-label="Family access method"
        >
          <AccessTabButton
            isActive={activeMode === 'scan'}
            onClick={() => setActiveMode('scan')}
            icon={<IconCamera aria-hidden="true" />}
            label="Scan"
          />
          <AccessTabButton
            isActive={activeMode === 'upload'}
            onClick={() => {
              stopCamera();
              setActiveMode('upload');
            }}
            icon={<IconUpload aria-hidden="true" />}
            label="Upload"
          />
          <AccessTabButton
            isActive={activeMode === 'manual'}
            onClick={() => {
              stopCamera();
              setActiveMode('manual');
            }}
            icon={<IconKeyboard aria-hidden="true" />}
            label="Code"
            isLast
          />
        </div>

        {activeMode === 'scan' ? (
          <section className="flex flex-col gap-3" aria-label="Scan QR">
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md bg-foreground">
              <video
                ref={videoRef}
                muted
                playsInline
                aria-label="QR scanner camera preview"
                className="size-full object-cover"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="md"
                disabled={accessMutation.isPending}
                aria-label="Start camera"
                onClick={handleStartCamera}
              >
                <IconCamera aria-hidden="true" />
                Simulan
              </Button>
              {isCameraActive ? (
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  aria-label="Stop camera"
                  onClick={() => {
                    stopCamera();
                    setScanStatus(null);
                  }}
                >
                  <IconPlayerStop aria-hidden="true" />
                  Itigil
                </Button>
              ) : null}
            </div>
          </section>
        ) : null}

        {activeMode === 'upload' ? (
          <section className="flex flex-col gap-3" aria-label="Upload QR">
            <label
              htmlFor={uploadInputId}
              className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-surface-sunken p-6 text-center text-foreground hover:bg-muted/40"
            >
              <IconPhotoUp aria-hidden="true" className="size-7 text-muted-foreground" />
              <span className="text-body-md">Mag-upload ng family QR image</span>
              <span className="text-caption text-muted-foreground">
                PNG, JPG, or a clear screenshot.
              </span>
            </label>
            <input
              id={uploadInputId}
              className="sr-only"
              type="file"
              accept="image/*"
              disabled={accessMutation.isPending}
              onChange={handleQrUpload}
            />
          </section>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
          <Label htmlFor="familyCode">
            Family code
            <Input
              id="familyCode"
              name="familyCode"
              value={familyCode}
              placeholder="FAM-ABC123"
              autoComplete="off"
              disabled={accessMutation.isPending}
              required
              onChange={event => {
                setFamilyCode(parseResidentQrAccessCode(event.currentTarget.value));
                setAccessError(null);
              }}
            />
          </Label>
          <Label htmlFor="pinCode">
            PIN
            <Input
              id="pinCode"
              name="pinCode"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={pinCode}
              disabled={accessMutation.isPending}
              required
              onChange={event => {
                setPinCode(event.currentTarget.value);
                setAccessError(null);
              }}
            />
          </Label>
        </div>

        <Button
          type="submit"
          size="lg"
          className="self-start"
          isLoading={accessMutation.isPending}
          loadingLabel="Checking..."
        >
          Continue
        </Button>

        {scanStatus ? <p className="text-label-md text-primary">{scanStatus}</p> : null}
        {accessError ? (
          <Alert tone="danger">
            <AlertBody>{accessError}</AlertBody>
          </Alert>
        ) : null}
      </form>
    </Card>
  );
}

function AccessTabButton({
  isActive,
  onClick,
  icon,
  label,
  isLast = false,
}: {
  isActive: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  isLast?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 px-3 py-2 text-label-md transition-colors',
        !isLast && 'border-r border-border',
        isActive
          ? 'bg-surface text-foreground font-semibold'
          : 'bg-surface-sunken text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function parseResidentQrAccessCode(value: string) {
  const rawValue = value.trim();

  if (!rawValue) return '';

  const jsonCode = parseResidentQrJsonCode(rawValue);
  if (jsonCode) return normalizeResidentFamilyCode(jsonCode);

  const urlCode = parseResidentQrUrlCode(rawValue);
  if (urlCode) return normalizeResidentFamilyCode(urlCode);

  return normalizeResidentFamilyCode(rawValue);
}

function parseResidentQrJsonCode(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (!parsed || typeof parsed !== 'object') return '';

    const record = parsed as Record<string, unknown>;
    const code = record.familyCode ?? record.family_code ?? record.code;

    return typeof code === 'string' ? code : '';
  } catch {
    return '';
  }
}

function parseResidentQrUrlCode(value: string) {
  try {
    const url = new URL(value);
    const queryCode =
      url.searchParams.get('familyCode') ??
      url.searchParams.get('family_code') ??
      url.searchParams.get('code');

    if (queryCode) return queryCode;

    const hashParams = new URLSearchParams(url.hash.replace(/^#\/?\??/, ''));
    const hashCode =
      hashParams.get('familyCode') ?? hashParams.get('family_code') ?? hashParams.get('code');

    if (hashCode) return hashCode;

    return decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1) ?? '');
  } catch {
    return '';
  }
}

function normalizeResidentFamilyCode(value: string) {
  return value.trim().toUpperCase();
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
