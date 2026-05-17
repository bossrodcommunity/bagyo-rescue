import { createFileRoute } from '@tanstack/react-router';
import { IconPhoneCall } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Page, PageDescription, PageHeader, PageTitle } from '@/components/ui/page';

export const Route = createFileRoute('/hotlines')({
  component: EmergencyHotlinesPage,
});

const hotlines = [
  { name: 'National Emergency Hotline', number: '911', note: 'Police, fire, ambulance' },
  { name: 'Philippine Red Cross', number: '143', note: 'Emergency assistance' },
  { name: 'NDRRMC Operations Center', number: '(02) 8911-1406', note: 'Disaster coordination' },
  { name: 'BFP', number: '(02) 8426-0219', note: 'Fire and rescue' },
];

function EmergencyHotlinesPage() {
  return (
    <Page width="narrow" className="flex flex-col gap-8">
      <PageHeader>
        <PageTitle>Emergency hotlines</PageTitle>
        <PageDescription>
          Call directly when mobile signal and voice service are available.
        </PageDescription>
      </PageHeader>

      <ul className="flex flex-col gap-3">
        {hotlines.map(hotline => (
          <li key={hotline.name}>
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <CardTitle>{hotline.name}</CardTitle>
                  <CardDescription>{hotline.note}</CardDescription>
                </div>
                <Button asChild size="md" className="shrink-0">
                  <a href={`tel:${hotline.number.replace(/[^\d+]/g, '')}`}>
                    <IconPhoneCall aria-hidden="true" />
                    {hotline.number}
                  </a>
                </Button>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </Page>
  );
}
