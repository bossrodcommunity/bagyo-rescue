import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { IconPrinter, IconQrcode } from '@tabler/icons-react';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { searchFamiliesData } from '@/data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Page, PageDescription, PageHeader, PageTitle } from '@/components/ui/page';

export const Route = createFileRoute('/records/qr-generator')({
  component: QrGeneratorPage,
});

type FamilyForQr = {
  family_code: string;
  family_name: string;
  head_of_family: string;
  pin_code: string;
};

function QrGeneratorPage() {
  const [page, setPage] = useState(1);
  const limit = 50;

  const familiesQuery = useQuery({
    queryKey: ['qr-generator-families', page],
    queryFn: () => searchFamiliesData({ limit, page, sortBy: 'family_name', orderBy: 'asc' }),
  });

  const families: FamilyForQr[] = (familiesQuery.data?.records ?? []).map(r => ({
    family_code: r.family_code,
    family_name: r.family_name,
    head_of_family: r.head_of_family,
    pin_code: r.pin_code,
  }));
  const total_records = familiesQuery.data?.total_records ?? 0;
  const totalPages = Math.max(1, Math.ceil(total_records / limit));

  return (
    <Page className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <PageHeader>
          <PageTitle>QR Code Generator</PageTitle>
          <PageDescription>
            Generate and print QR codes for family codes. Residents scan these to access the family
            status portal.
          </PageDescription>
        </PageHeader>
        <Button
          type="button"
          size="md"
          disabled={families.length === 0}
          onClick={() => window.print()}
        >
          <IconPrinter aria-hidden="true" />
          Print QR codes
        </Button>
      </div>

      {familiesQuery.isLoading ? (
        <p className="text-body-md text-muted-foreground">Loading families...</p>
      ) : families.length === 0 ? (
        <Card className="p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <IconQrcode aria-hidden="true" className="size-10 text-muted-foreground" />
            <p className="text-body-md text-muted-foreground">
              No families found. Create families in the CRM first, then come back to generate QR
              codes.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <p className="text-label-md text-muted-foreground print:hidden">
            Showing {families.length} of {total_records} families (page {page} of {totalPages})
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 print:grid-cols-3 print:gap-2">
            {families.map(family => (
              <QrCard key={family.family_code} family={family} />
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              aria-label="QR generator pagination"
              className="flex items-center justify-center gap-3 print:hidden"
            >
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="text-label-md text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </nav>
          ) : null}
        </>
      )}
    </Page>
  );
}

function QrCard({ family }: { family: FamilyForQr }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    QRCode.toDataURL(family.family_code, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 200,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(url => {
        if (mountedRef.current) setQrDataUrl(url);
      })
      .catch(() => {});

    return () => {
      mountedRef.current = false;
    };
  }, [family.family_code]);

  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-surface p-4 text-center print:break-inside-avoid print:border-slate-300 print:p-3">
      {qrDataUrl ? (
        <img
          alt={`QR code for ${family.family_code}`}
          src={qrDataUrl}
          className="size-32 rounded-sm border border-border bg-white print:size-28"
        />
      ) : (
        <span className="size-32 rounded-sm border border-border bg-muted print:size-28" />
      )}
      <div className="flex flex-col gap-0.5">
        <span className="truncate text-body-md font-semibold text-foreground print:text-sm">
          {family.family_name}
        </span>
        <span className="font-mono text-label-md font-semibold text-primary print:text-xs">
          {family.family_code}
        </span>
        <span className="text-caption text-muted-foreground print:text-xs">
          PIN: {family.pin_code}
        </span>
        <span className="truncate text-caption text-muted-foreground print:text-xs">
          {family.head_of_family}
        </span>
      </div>
    </div>
  );
}
