import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  IconCamera,
  IconKeyboard,
  IconPhotoUp,
  IconPlayerStop,
  IconQrcode,
  IconUpload,
} from '@tabler/icons-react';
import QRCode from 'qrcode';
import QrScanner from 'qr-scanner';
import { type ChangeEvent, type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { searchFamiliesData } from '@/data';
import {
  getResidentFamilyAccessData,
  getResidentSessionData,
  type ResidentFamilyAccessData,
  type ResidentSessionData,
  updateResidentFamilyStatusData,
  updateResidentHouseReportData,
} from '@/features/resident/_data';
import { Constants, type Database } from '@/lib/supabase/types';
import { Page, PageHeader, PageTitle, PageDescription } from '@/components/ui/page';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SosButton } from '@/components/ui/sos-button';
import { Input, Select, Textarea, Checkbox } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertBody } from '@/components/ui/alert';
import {
  TableWrap,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/data-table';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/resident')({
  component: ResidentPortalPage,
});

const ACCESS_SEARCH_LIMIT = 6;
const QR_ACCESS_SOURCE_LABELS: Record<ResidentAccessMode, string> = {
  scan: 'Scan QR',
  upload: 'Upload QR',
  manual: 'Manual entry',
};

// QR codes are bitmap images decoded by phone cameras — they require concrete
// max-contrast black/white at draw time, not theme tokens.
const QR_FOREGROUND = '#000000';
const QR_BACKGROUND = '#ffffff';

function ResidentPortalPage() {
  const [session, setSession] = useState<ResidentSessionData | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [residentError, setResidentError] = useState<string | null>(null);

  const sessionMutation = useMutation({
    mutationFn: getResidentSessionData,
    onSuccess: data => {
      setSession(data);
      setFeedback(null);
      setResidentError(null);
    },
  });
  const familyMutation = useMutation({
    mutationFn: updateResidentFamilyStatusData,
    onSuccess: family => {
      setSession(current => (current ? { ...current, family } : current));
      setFeedback('Naipadala ang update ng pamilya.');
      setResidentError(null);
    },
  });
  const houseMutation = useMutation({
    mutationFn: updateResidentHouseReportData,
    onSuccess: house => {
      setSession(current => (current ? { ...current, house } : current));
      setFeedback('Naipadala ang ulat ng bahay.');
      setResidentError(null);
    },
  });

  function handleAccessSubmit(credentials: ResidentAccessCredentials) {
    sessionMutation.mutate(credentials);
  }

  function handleFamilySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    const form = new FormData(event.currentTarget);
    const totalMembers = session.family.total_members;
    const currentInsideCount = readFormNumber(form, 'currentInsideCount');
    const evacuatedCount = readFormNumber(form, 'evacuatedCount');
    const missingOrUnconfirmedCount = readFormNumber(form, 'missingOrUnconfirmedCount');

    if (currentInsideCount + evacuatedCount + missingOrUnconfirmedCount > totalMembers) {
      familyMutation.reset();
      setFeedback(null);
      setResidentError('Hindi pwedeng mas marami sa total ng pamilya.');
      return;
    }

    familyMutation.mutate({
      familyId: session.family.id,
      payload: {
        current_inside_count: currentInsideCount,
        evacuated_count: evacuatedCount,
        missing_or_unconfirmed_count: missingOrUnconfirmedCount,
        needs_assistance: form.get('needsAssistance') === 'on',
        notes: readFormString(form, 'notes') || null,
      },
    });
  }

  function handleHouseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    const form = new FormData(event.currentTarget);
    houseMutation.mutate({
      houseId: session.house.id,
      familyCode: session.family.family_code,
      payload: {
        current_status: readFormString(
          form,
          'currentStatus'
        ) as Database['public']['Enums']['house_status'],
        water_level: readFormString(
          form,
          'waterLevel'
        ) as Database['public']['Enums']['water_level'],
      },
    });
  }

  return (
    <Page className="flex flex-col gap-10">
      <section aria-label="Emergency" className="flex flex-col gap-2.5">
        <SosButton asChild>
          <Link to="/reports" />
        </SosButton>
        <p className="text-label-md text-muted-foreground">
          Pindutin para humingi ng tulong ngayon. Tap to request rescue now.
        </p>
      </section>

      <PageHeader>
        <PageTitle>Para sa pamilya</PageTitle>
        <PageDescription>
          I-type o i-scan ang family code para makita ang status ng pamilya at malapit na evacuation
          center.
        </PageDescription>
      </PageHeader>

      {!session ? (
        <ResidentAccessForm
          error={sessionMutation.error}
          isSubmitting={sessionMutation.isPending}
          onSubmit={handleAccessSubmit}
        />
      ) : (
        <section className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ResidentBreadcrumb session={session} />
            <Button
              variant="ghost"
              size="sm"
              type="button"
              aria-label="End session"
              onClick={() => {
                setSession(null);
                setFeedback(null);
                setResidentError(null);
              }}
            >
              Tapusin ang session
            </Button>
          </div>
          <ResidentSummary session={session} />
          <FamilyMembersTable session={session} />
          <EvacuationCentersList session={session} />
          <ResidentUpdateForms
            feedback={feedback}
            familyError={familyMutation.error}
            houseError={houseMutation.error}
            residentError={residentError}
            isFamilySubmitting={familyMutation.isPending}
            isHouseSubmitting={houseMutation.isPending}
            session={session}
            onFamilySubmit={handleFamilySubmit}
            onHouseSubmit={handleHouseSubmit}
          />
        </section>
      )}
    </Page>
  );
}

type ResidentAccessFormProps = {
  error: Error | null;
  isSubmitting: boolean;
  onSubmit: (credentials: ResidentAccessCredentials) => void;
};

type ResidentAccessCredentials = {
  familyCode: string;
  pinCode: string;
};

type ResidentAccessMode = 'scan' | 'upload' | 'manual';

function ResidentAccessForm({ error, isSubmitting, onSubmit }: ResidentAccessFormProps) {
  const uploadInputId = useId();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [familyCode, setFamilyCode] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [activeMode, setActiveMode] = useState<ResidentAccessMode>('manual');
  const [validatedFamily, setValidatedFamily] = useState<ResidentFamilyAccessData | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const familyOptionsQuery = useQuery({
    queryKey: ['resident-access-options', 'families', familyCode.trim()],
    queryFn: async () => {
      const searchText = familyCode.trim();
      const response = await searchFamiliesData({
        limit: ACCESS_SEARCH_LIMIT,
        sortBy: 'family_name',
        orderBy: 'asc',
        filters: searchText ? { searchText } : undefined,
      });

      return response.records.map(family => ({
        id: family.id,
        code: family.family_code,
        title: family.family_name,
        subtitle: family.head_of_family,
      }));
    },
    enabled: familyCode.trim().length >= 2,
    staleTime: 30_000,
  });

  const familyValidationMutation = useMutation({
    mutationFn: getResidentFamilyAccessData,
    onSuccess: family => {
      setValidatedFamily(family);
      setFamilyCode(family.family_code);
      setPinCode('');
      setAccessError(null);
      setScanStatus(`Validated through ${QR_ACCESS_SOURCE_LABELS[activeMode]}.`);
    },
    onError: (validationError: Error) => {
      setValidatedFamily(null);
      setPinCode('');
      setAccessError(validationError.message);
    },
  });

  const normalizedFamilyCode = normalizeResidentFamilyCode(familyCode);
  const isFamilyCodeValidated =
    validatedFamily !== null &&
    normalizeResidentFamilyCode(validatedFamily.family_code) === normalizedFamilyCode;
  const isBusy = isSubmitting || familyValidationMutation.isPending;

  useEffect(() => {
    if (!isCameraActive) return;

    const video = videoRef.current;

    if (!video) {
      setIsCameraActive(false);
      return;
    }

    let isMounted = true;
    const scanner = new QrScanner(
      video,
      result => {
        const nextFamilyCode = parseResidentQrAccessCode(result.data);

        if (!nextFamilyCode) return;

        setFamilyCode(nextFamilyCode);
        setScanStatus('Na-scan na ang QR.');
        familyValidationMutation.mutate({ familyCode: nextFamilyCode });
        setIsCameraActive(false);
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
        onDecodeError: () => {},
      }
    );

    scanner.start().catch((cameraError: unknown) => {
      if (!isMounted) return;

      setAccessError(getErrorMessage(cameraError, 'Hindi nag-start ang camera.'));
      setIsCameraActive(false);
    });

    return () => {
      isMounted = false;
      scanner.destroy();
    };
  }, [isCameraActive]);

  function resetValidatedFamilyFor(nextValue: string) {
    if (
      validatedFamily &&
      normalizeResidentFamilyCode(validatedFamily.family_code) !==
        normalizeResidentFamilyCode(nextValue)
    ) {
      setValidatedFamily(null);
      setPinCode('');
    }
  }

  function handleFamilyCodeChange(nextValue: string) {
    resetValidatedFamilyFor(nextValue);
    setAccessError(null);
    setScanStatus(null);
    setFamilyCode(nextValue);
  }

  function validateFamilyCode(nextValue = familyCode) {
    const nextFamilyCode = parseResidentQrAccessCode(nextValue);

    if (!nextFamilyCode) {
      setValidatedFamily(null);
      setPinCode('');
      setAccessError('Mag-type o mag-scan muna ng family code.');
      return;
    }

    setFamilyCode(nextFamilyCode);
    setScanStatus('Vina-validate...');
    familyValidationMutation.mutate({ familyCode: nextFamilyCode });
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
      setScanStatus('Na-upload na ang QR.');
      familyValidationMutation.mutate({ familyCode: nextFamilyCode });
    } catch (uploadError) {
      setValidatedFamily(null);
      setPinCode('');
      setAccessError(getErrorMessage(uploadError, 'Walang family QR na nahanap sa image na iyon.'));
      setScanStatus(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFamilyCodeValidated) {
      validateFamilyCode();
      return;
    }

    if (!pinCode.trim()) {
      setAccessError('I-type ang PIN code para magsimula.');
      return;
    }

    onSubmit({
      familyCode: validatedFamily.family_code,
      pinCode: pinCode.trim(),
    });
  }

  return (
    <Card elevated asChild>
      <form className="gap-5" onSubmit={handleSubmit}>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-label-md font-medium text-foreground">
            Paano gusto mong mag-sign in?
          </legend>
          <div
            className="grid grid-cols-3 overflow-hidden rounded-md border border-border"
            role="tablist"
            aria-label="Family access method"
          >
            <AccessTabButton
              isActive={activeMode === 'scan'}
              onClick={() => setActiveMode('scan')}
              icon={<IconCamera aria-hidden="true" />}
              label="Scan QR"
            />
            <AccessTabButton
              isActive={activeMode === 'upload'}
              onClick={() => {
                setIsCameraActive(false);
                setActiveMode('upload');
              }}
              icon={<IconUpload aria-hidden="true" />}
              label="Upload"
            />
            <AccessTabButton
              isActive={activeMode === 'manual'}
              onClick={() => {
                setIsCameraActive(false);
                setActiveMode('manual');
              }}
              icon={<IconKeyboard aria-hidden="true" />}
              label="Type"
              isLast
            />
          </div>
        </fieldset>

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
                disabled={isBusy}
                aria-label="Start camera"
                onClick={() => {
                  setAccessError(null);
                  setScanStatus('Itutok ang camera sa QR.');
                  setIsCameraActive(true);
                }}
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
                    setIsCameraActive(false);
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
              className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-surface-sunken p-6 text-center text-foreground hover:bg-muted/40"
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
              disabled={isBusy}
              onChange={handleQrUpload}
            />
          </section>
        ) : null}

        {activeMode === 'manual' ? (
          <section className="flex flex-col gap-3" aria-label="Manual family code entry">
            <ResidentAccessCombobox
              label="Family code"
              name="familyCode"
              value={familyCode}
              options={familyOptionsQuery.data ?? []}
              isLoading={familyOptionsQuery.isFetching}
              error={familyOptionsQuery.error}
              placeholder="Hanapin o i-type ang pangalan ng pamilya"
              hasSearchStarted={familyCode.trim().length >= 2}
              disabled={isBusy}
              onInputChange={handleFamilyCodeChange}
              onSelect={option => {
                setFamilyCode(option.code);
                setAccessError(null);
                setScanStatus('Vina-validate...');
                familyValidationMutation.mutate({ familyCode: option.code });
              }}
            />
            <Button
              variant="secondary"
              size="md"
              type="button"
              className="self-start"
              disabled={isBusy}
              aria-label="Validate code"
              onClick={() => validateFamilyCode()}
            >
              I-validate ang code
            </Button>
          </section>
        ) : null}

        {activeMode !== 'manual' ? (
          <Label htmlFor="familyCodeReadout">
            Family code
            <Input
              id="familyCodeReadout"
              name="familyCode"
              value={familyCode}
              placeholder="Scan o upload ng QR"
              disabled={isBusy}
              onChange={event => handleFamilyCodeChange(event.currentTarget.value)}
            />
          </Label>
        ) : null}

        {isFamilyCodeValidated ? (
          <section className="flex flex-col gap-3 rounded-md border border-border bg-surface-sunken p-4">
            <div className="flex items-center gap-3">
              <IconQrcode aria-hidden="true" className="size-5 text-primary" />
              <div className="flex flex-col">
                <strong className="text-body-md text-foreground">
                  {validatedFamily.family_code}
                </strong>
                <span className="text-label-md text-muted-foreground">
                  {validatedFamily.family_name} · {validatedFamily.head_of_family}
                </span>
              </div>
            </div>
            <ResidentFamilyQrPreview familyCode={validatedFamily.family_code} />
            <Label htmlFor="pinCode">
              PIN code
              <Input
                id="pinCode"
                name="pinCode"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={4}
                value={pinCode}
                disabled={isSubmitting}
                required
                className="max-w-40"
                onChange={event => {
                  setAccessError(null);
                  setPinCode(event.currentTarget.value);
                }}
              />
            </Label>
          </section>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="self-start"
          isLoading={isBusy}
          aria-label={isFamilyCodeValidated ? 'Start session' : 'Continue'}
        >
          {isFamilyCodeValidated ? 'Simulan' : 'Magpatuloy'}
        </Button>
        {scanStatus ? <p className="text-label-md text-primary">{scanStatus}</p> : null}
        {accessError ? (
          <Alert tone="danger">
            <AlertBody>{accessError}</AlertBody>
          </Alert>
        ) : null}
        {error ? (
          <Alert tone="danger">
            <AlertBody>{error.message}</AlertBody>
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
  icon: React.ReactNode;
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

type AccessComboboxOption = {
  id: string;
  code: string;
  title: string;
  subtitle?: string | null;
};

type ResidentAccessComboboxProps = {
  label: string;
  name: string;
  value: string;
  options: AccessComboboxOption[];
  isLoading: boolean;
  error: Error | null;
  placeholder: string;
  hasSearchStarted: boolean;
  disabled: boolean;
  onInputChange: (value: string) => void;
  onSelect: (option: AccessComboboxOption) => void;
};

function ResidentAccessCombobox({
  label,
  name,
  value,
  options,
  isLoading,
  error,
  placeholder,
  hasSearchStarted,
  disabled,
  onInputChange,
  onSelect,
}: ResidentAccessComboboxProps) {
  const inputId = useId();
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const showListbox = isOpen && !disabled;

  return (
    <div
      className="relative flex flex-col gap-1.5"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <label htmlFor={inputId} className="text-label-md font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Input
          id={inputId}
          name={name}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          required
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showListbox}
          value={value}
          onChange={event => {
            onInputChange(event.currentTarget.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={event => {
            if (event.key === 'Escape') setIsOpen(false);
          }}
        />
        {showListbox ? (
          <div
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-30 mt-1.5 flex max-h-72 flex-col gap-0.5 overflow-y-auto rounded-md border bg-surface p-1.5 shadow-raised"
          >
            {isLoading ? (
              <p className="px-3 py-2 text-label-md text-muted-foreground">Hinahanap...</p>
            ) : null}
            {error ? <p className="px-3 py-2 text-label-md text-danger">Hindi available.</p> : null}
            {!isLoading && !error && hasSearchStarted && options.length === 0 ? (
              <p className="px-3 py-2 text-label-md text-muted-foreground">Walang nahanap.</p>
            ) : null}
            {!isLoading && !error && !hasSearchStarted ? (
              <p className="px-3 py-2 text-label-md text-muted-foreground">
                Mag-type ng 2 letters o higit pa.
              </p>
            ) : null}
            {!error
              ? options.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={value === option.code}
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => {
                      onSelect(option);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex min-h-11 flex-col items-start gap-0.5 rounded-sm px-3 py-2 text-left',
                      'hover:bg-muted/40 aria-[selected=true]:bg-primary-soft'
                    )}
                  >
                    <span className="text-caption font-semibold text-primary">{option.code}</span>
                    <strong className="text-body-md font-medium text-foreground">
                      {option.title}
                    </strong>
                    {option.subtitle ? (
                      <small className="text-label-md text-muted-foreground">
                        {option.subtitle}
                      </small>
                    ) : null}
                  </button>
                ))
              : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ResidentFamilyQrPreview({ familyCode }: { familyCode: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    QRCode.toDataURL(familyCode, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 160,
      color: {
        dark: QR_FOREGROUND,
        light: QR_BACKGROUND,
      },
    })
      .then(url => {
        if (isCurrent) setQrDataUrl(url);
      })
      .catch(() => {
        if (isCurrent) setQrDataUrl(null);
      });

    return () => {
      isCurrent = false;
    };
  }, [familyCode]);

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
      {qrDataUrl ? (
        <img
          alt={`QR code for ${familyCode}`}
          src={qrDataUrl}
          className="size-16 rounded-sm border border-border bg-white"
        />
      ) : (
        <span className="size-16 rounded-sm border border-border bg-muted" />
      )}
      <div className="flex flex-col">
        <strong className="text-body-md font-medium text-foreground">Family QR</strong>
        <small className="text-label-md text-muted-foreground">{familyCode}</small>
      </div>
    </div>
  );
}

function ResidentBreadcrumb({ session }: { session: ResidentSessionData }) {
  return (
    <p className="text-label-md text-muted-foreground">
      <span className="font-medium text-foreground">{session.family.family_name}</span> ·{' '}
      {session.barangay.name}, {session.lgu.city_or_municipality}
    </p>
  );
}

function ResidentSummary({ session }: { session: ResidentSessionData }) {
  return (
    <section aria-label="Household status" className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <SummaryItem label="Address" value={session.house.address} />
      <SummaryItem label="Miyembro ng pamilya" value={`${session.family.total_members} tao`} />
      <SummaryItem label="Status ng bahay" value={String(session.house.current_status)} />
      <SummaryItem label="Lalim ng tubig" value={String(session.house.water_level)} />
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-4">
      <span className="text-caption uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-body-lg text-foreground">{value}</span>
    </div>
  );
}

function FamilyMembersTable({ session }: { session: ResidentSessionData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mga miyembro</CardTitle>
        <CardDescription>Family members in your household roster.</CardDescription>
      </CardHeader>
      <TableWrap>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Pangalan</TableHeaderCell>
              <TableHeaderCell>Phone</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Edad</TableHeaderCell>
              <TableHeaderCell>Flags</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {session.residents.map(resident => (
              <TableRow key={resident.id}>
                <TableCell>
                  {resident.first_name} {resident.last_name}
                </TableCell>
                <TableCell>{resident.phone_number ?? '—'}</TableCell>
                <TableCell>{resident.current_status}</TableCell>
                <TableCell>{resident.age ?? '—'}</TableCell>
                <TableCell>{formatResidentFlags(resident)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrap>
    </Card>
  );
}

function EvacuationCentersList({ session }: { session: ResidentSessionData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mga evacuation center</CardTitle>
        <CardDescription>Available centers in your LGU.</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {session.evacuationCenters.map(center => {
          const occupancyTone = getOccupancyTone(center.current_occupancy, center.capacity);
          const destination = encodeURIComponent(`${center.name}, ${center.address}`);
          const mapsHref = `https://www.google.com/maps/search/?api=1&query=${destination}`;

          return (
            <article
              key={center.id}
              className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span
                    aria-label={`Occupancy ${center.current_occupancy} of ${center.capacity}`}
                    className={cn(
                      'inline-block size-2 shrink-0 rounded-full',
                      occupancyTone === 'safe' && 'bg-safe',
                      occupancyTone === 'signal' && 'bg-signal',
                      occupancyTone === 'danger' && 'bg-danger'
                    )}
                  />
                  <h3 className="text-body-lg font-medium text-foreground">{center.name}</h3>
                </div>
                <p className="text-label-md text-muted-foreground">{center.address}</p>
              </div>
              <dl className="grid grid-cols-3 gap-3">
                <SmallStat label="Status" value={String(center.status)} />
                <SmallStat label="Tao" value={`${center.current_occupancy} / ${center.capacity}`} />
                <SmallStat label="Supplies" value={formatCenterSupplies(center)} />
              </dl>
              <Button asChild variant="ghost" size="sm" className="self-start">
                <a href={mapsHref} target="_blank" rel="noreferrer" aria-label="Take me here">
                  Idirect ako dito →
                </a>
              </Button>
            </article>
          );
        })}
      </div>
    </Card>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col">
      <dt className="text-caption uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="m-0 truncate text-label-md text-foreground">{value}</dd>
    </div>
  );
}

function getOccupancyTone(current: number, capacity: number): 'safe' | 'signal' | 'danger' {
  if (capacity <= 0) return 'signal';
  const ratio = current / capacity;
  if (ratio >= 0.9) return 'danger';
  if (ratio >= 0.6) return 'signal';
  return 'safe';
}

type ResidentUpdateFormsProps = {
  feedback: string | null;
  familyError: Error | null;
  houseError: Error | null;
  residentError: string | null;
  isFamilySubmitting: boolean;
  isHouseSubmitting: boolean;
  session: ResidentSessionData;
  onFamilySubmit: (event: FormEvent<HTMLFormElement>) => void;
  onHouseSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function ResidentUpdateForms({
  feedback,
  familyError,
  houseError,
  residentError,
  isFamilySubmitting,
  isHouseSubmitting,
  session,
  onFamilySubmit,
  onHouseSubmit,
}: ResidentUpdateFormsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card asChild>
        <form onSubmit={onFamilySubmit} className="gap-4">
          <CardHeader>
            <CardTitle>Update pamilya</CardTitle>
            <CardDescription>Family counts and notes.</CardDescription>
          </CardHeader>
          <Label htmlFor="currentInsideCount">
            Nasa loob ng bahay
            <Input
              id="currentInsideCount"
              name="currentInsideCount"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={session.family.current_inside_count}
              required
            />
          </Label>
          <Label htmlFor="evacuatedCount">
            Lumikas na
            <Input
              id="evacuatedCount"
              name="evacuatedCount"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={session.family.evacuated_count}
              required
            />
          </Label>
          <Label htmlFor="missingOrUnconfirmedCount">
            Nawawala
            <Input
              id="missingOrUnconfirmedCount"
              name="missingOrUnconfirmedCount"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={session.family.missing_or_unconfirmed_count}
              required
            />
          </Label>
          <label className="flex min-h-11 items-center gap-2.5 text-label-md font-medium text-foreground">
            <Checkbox name="needsAssistance" defaultChecked={session.family.needs_assistance} />
            Kailangan ng tulong
          </label>
          <Label htmlFor="notes">
            Karagdagang sabihin
            <Textarea id="notes" name="notes" defaultValue={session.family.notes ?? ''} />
          </Label>
          <Button
            type="submit"
            size="md"
            isLoading={isFamilySubmitting}
            className="self-start"
            aria-label="Save family status"
          >
            I-save
          </Button>
          {residentError ? (
            <Alert tone="danger">
              <AlertBody>{residentError}</AlertBody>
            </Alert>
          ) : null}
          {familyError ? (
            <Alert tone="danger">
              <AlertBody>{familyError.message}</AlertBody>
            </Alert>
          ) : null}
        </form>
      </Card>

      <Card asChild>
        <form onSubmit={onHouseSubmit} className="gap-4">
          <CardHeader>
            <CardTitle>Update bahay</CardTitle>
            <CardDescription>Household condition right now.</CardDescription>
          </CardHeader>
          <Label htmlFor="currentStatus">
            Status ng bahay
            <Select
              id="currentStatus"
              name="currentStatus"
              defaultValue={session.house.current_status}
              required
            >
              {Constants.public.Enums.house_status.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </Label>
          <Label htmlFor="waterLevel">
            Lalim ng tubig
            <Select
              id="waterLevel"
              name="waterLevel"
              defaultValue={session.house.water_level}
              required
            >
              {Constants.public.Enums.water_level.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          </Label>
          <Button
            type="submit"
            size="md"
            isLoading={isHouseSubmitting}
            className="self-start"
            aria-label="Submit report"
          >
            I-submit
          </Button>
          {houseError ? (
            <Alert tone="danger">
              <AlertBody>{houseError.message}</AlertBody>
            </Alert>
          ) : null}
          {feedback ? (
            <Alert tone="safe">
              <AlertBody>{feedback}</AlertBody>
            </Alert>
          ) : null}
        </form>
      </Card>
    </section>
  );
}

function readFormString(form: FormData, key: string) {
  return String(form.get(key) ?? '').trim();
}

function normalizeResidentFamilyCode(value: string) {
  return value.trim().toUpperCase();
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

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function readFormNumber(form: FormData, key: string) {
  const value = Number(form.get(key) ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function formatResidentFlags(resident: ResidentSessionData['residents'][number]) {
  const flags = [
    resident.is_child ? 'Bata' : null,
    resident.is_senior ? 'Senior' : null,
    resident.is_pwd ? 'PWD' : null,
    resident.is_pregnant ? 'Buntis' : null,
  ].filter(Boolean);

  if (!flags.length) return <span className="text-muted-foreground">—</span>;

  return (
    <span className="flex flex-wrap gap-1.5">
      {flags.map(flag => (
        <span
          key={String(flag)}
          className="inline-flex items-center rounded-sm border border-border bg-muted/40 px-1.5 py-0.5 text-caption text-foreground"
        >
          {flag}
        </span>
      ))}
    </span>
  );
}

function formatCenterSupplies(center: ResidentSessionData['evacuationCenters'][number]) {
  const supplies = [
    center.has_food_supply ? 'Pagkain' : null,
    center.has_water_supply ? 'Tubig' : null,
    center.has_medical_support ? 'Medikal' : null,
    center.has_power ? 'Kuryente' : null,
  ].filter(Boolean);

  return supplies.length ? supplies.join(', ') : 'Wala';
}
