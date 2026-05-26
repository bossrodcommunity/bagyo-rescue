import { createFileRoute } from '@tanstack/react-router';
import { IconPhoneCall } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Page, PageDescription, PageHeader, PageTitle } from '@/components/ui/page';

export const Route = createFileRoute('/hotlines')({
  component: EmergencyHotlinesPage,
});

type Hotline = {
  name: string;
  number: string;
  note: string;
};

type HotlineGroup = {
  titleTl: string;
  titleEn: string;
  hotlines: Hotline[];
};

const hotlineGroups: HotlineGroup[] = [
  {
    titleTl: 'Pang-emergency',
    titleEn: 'Emergency',
    hotlines: [
      { name: 'National Emergency Hotline', number: '911', note: 'Police, fire, ambulance' },
      { name: 'Philippine Red Cross', number: '143', note: 'Emergency assistance' },
      {
        name: 'PNP Patrol',
        number: '117',
        note: 'Philippine National Police emergency response',
      },
      { name: 'Bureau of Fire Protection', number: '(02) 8426-0219', note: 'Fire and rescue' },
      {
        name: 'Philippine Coast Guard',
        number: '(02) 8527-3877',
        note: 'Maritime and flood rescue',
      },
    ],
  },
  {
    titleTl: 'Sakuna at kalamidad',
    titleEn: 'Disaster response',
    hotlines: [
      {
        name: 'NDRRMC Operations Center',
        number: '(02) 8911-1406',
        note: 'National disaster coordination',
      },
      {
        name: 'DSWD Disaster Response',
        number: '(02) 8852-8081',
        note: 'Relief and social welfare assistance',
      },
      {
        name: 'PAGASA',
        number: '(02) 8284-0800',
        note: 'Typhoon bulletins and weather updates',
      },
    ],
  },
];

function EmergencyHotlinesPage() {
  return (
    <Page width="narrow" className="flex flex-col gap-8">
      <PageHeader>
        <PageTitle>Mga emergency hotline</PageTitle>
        <PageDescription>
          Tumawag kapag may signal at voice service. Ang mga numero ay mula sa opisyal na portal ng
          gobyerno.
        </PageDescription>
        <p className="text-label-md text-muted-foreground">
          Call when mobile signal and voice service are available. Numbers sourced from official
          government portals.
        </p>
      </PageHeader>

      <div className="flex flex-col gap-6">
        {hotlineGroups.map(group => (
          <section key={group.titleEn} className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-heading-md font-semibold text-foreground">{group.titleTl}</h2>
              <span className="text-label-md text-muted-foreground">{group.titleEn}</span>
            </div>
            <ul className="flex flex-col gap-3">
              {group.hotlines.map(hotline => (
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
          </section>
        ))}
      </div>

      <footer className="border-t border-border pt-6">
        <p className="text-label-md text-muted-foreground">
          Pinagkunan: ehotlines.e.gov.ph, ndrrmc.gov.ph, redcross.org.ph
        </p>
        <p className="mt-1 text-caption text-muted-foreground">
          Source: ehotlines.e.gov.ph, ndrrmc.gov.ph, redcross.org.ph
        </p>
      </footer>
    </Page>
  );
}
