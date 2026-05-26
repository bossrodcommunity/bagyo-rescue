import { createFileRoute } from '@tanstack/react-router';
import {
  IconAlertTriangle,
  IconCheckbox,
  IconCloudStorm,
  IconHome,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Page, PageDescription, PageHeader, PageTitle } from '@/components/ui/page';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/safety-tips')({
  component: SafetyTipsPage,
});

type Phase = {
  id: string;
  icon: typeof IconShieldCheck;
  titleTl: string;
  titleEn: string;
  iconClassName: string;
  tips: Array<{ tl: string; en: string }>;
};

const phases: Phase[] = [
  {
    id: 'before',
    icon: IconCheckbox,
    titleTl: 'Bago ang Bagyo',
    titleEn: 'Before the Typhoon',
    iconClassName: 'bg-primary-soft text-primary',
    tips: [
      {
        tl: 'Maghanda ng emergency kit: tubig, pagkain, gamot, flashlight, at baterya.',
        en: 'Prepare an emergency kit: water, food, medicine, flashlight, and batteries.',
      },
      {
        tl: 'Alamin ang pinakamalapit na evacuation center sa inyong lugar.',
        en: 'Know the nearest evacuation center in your area.',
      },
      {
        tl: 'Siguraduhing naka-charge ang inyong cellphone at power bank.',
        en: 'Make sure your phone and power bank are fully charged.',
      },
      {
        tl: 'Itali o itago ang mga bagay sa labas na maaaring tangayin ng hangin.',
        en: 'Tie down or store outdoor items that could be blown away.',
      },
      {
        tl: 'Mag-imbak ng malinis na tubig sa mga lalagyan para sa inumin at pagluluto.',
        en: 'Store clean water in containers for drinking and cooking.',
      },
      {
        tl: 'Sundin ang mga advisory ng PAGASA at lokal na pamahalaan.',
        en: 'Follow PAGASA advisories and local government announcements.',
      },
      {
        tl: 'Ilagay ang mahahalagang dokumento sa waterproof na lalagyan.',
        en: 'Place important documents in a waterproof container.',
      },
    ],
  },
  {
    id: 'during',
    icon: IconCloudStorm,
    titleTl: 'Habang may Bagyo',
    titleEn: 'During the Typhoon',
    iconClassName: 'bg-accent-soft text-warning',
    tips: [
      {
        tl: 'Manatili sa loob ng matibay na bahay. Huwag lumabas kung hindi kailangan.',
        en: 'Stay inside a sturdy house. Do not go out unless necessary.',
      },
      {
        tl: 'Lumayo sa mga bintana at pintuan na salamin.',
        en: 'Stay away from glass windows and doors.',
      },
      {
        tl: 'Huwag tumawid sa mga baha o rumaragasang tubig.',
        en: 'Do not cross flooded areas or rushing water.',
      },
      {
        tl: 'Kung tumataas ang baha, umakyat sa mas mataas na lugar agad.',
        en: 'If water is rising, move to higher ground immediately.',
      },
      {
        tl: 'Makinig sa mga balita at emergency alert sa radyo o cellphone.',
        en: 'Listen to news and emergency alerts on radio or phone.',
      },
      {
        tl: 'Panatilihing malapit ang inyong emergency kit at mga dokumento.',
        en: 'Keep your emergency kit and documents close.',
      },
    ],
  },
  {
    id: 'after',
    icon: IconHome,
    titleTl: 'Pagkatapos ng Bagyo',
    titleEn: 'After the Typhoon',
    iconClassName: 'bg-safe-soft text-safe',
    tips: [
      {
        tl: 'Suriin kung may nasaktan sa pamilya. Humingi ng tulong kung kailangan.',
        en: 'Check family members for injuries. Ask for help if needed.',
      },
      {
        tl: 'Lumayo sa mga naputol na linya ng kuryente at poste.',
        en: 'Stay away from downed power lines and poles.',
      },
      {
        tl: 'Huwag uminom ng tubig-baha. Gumamit lamang ng malinis na tubig.',
        en: 'Do not drink floodwater. Use only clean water.',
      },
      {
        tl: 'Dokumentuhin ang mga pinsala sa bahay para sa insurance o ayuda.',
        en: 'Document house damage for insurance or relief claims.',
      },
      {
        tl: 'Makipag-ugnayan sa kamag-anak at ipaalam na ligtas kayo.',
        en: 'Contact relatives and let them know you are safe.',
      },
      {
        tl: 'I-report ang mga naharang na kalsada o tulay sa lokal na pamahalaan.',
        en: 'Report blocked roads or bridges to local authorities.',
      },
      {
        tl: 'Mag-ingat sa mga pagguho ng lupa at pagbaha pagkatapos ng ulan.',
        en: 'Watch for landslides and flooding even after the rain stops.',
      },
    ],
  },
];

function SafetyTipsPage() {
  return (
    <Page width="narrow" className="flex flex-col gap-8">
      <PageHeader>
        <PageTitle>Mga payo sa kaligtasan</PageTitle>
        <PageDescription>
          Mga dapat gawin bago, habang, at pagkatapos ng bagyo. Maaaring i-save ang page na ito
          kahit walang internet.
        </PageDescription>
      </PageHeader>

      <div className="flex flex-col gap-6">
        {phases.map(phase => (
          <PhaseSection key={phase.id} phase={phase} />
        ))}
      </div>

      <footer className="border-t border-border pt-6">
        <p className="text-label-md text-muted-foreground">
          Pinagkunan: NDRRMC, Philippine Red Cross, at PAGASA public advisories.
        </p>
        <p className="mt-1 text-caption text-muted-foreground">
          Source: NDRRMC, Philippine Red Cross, and PAGASA public advisories.
        </p>
      </footer>
    </Page>
  );
}

function PhaseSection({ phase }: { phase: Phase }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = phase.icon;

  return (
    <section aria-labelledby={`phase-${phase.id}`} className="flex flex-col gap-3">
      <button
        type="button"
        className="flex items-center gap-3"
        aria-expanded={isExpanded}
        aria-controls={`phase-${phase.id}-content`}
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-md',
            phase.iconClassName
          )}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="flex flex-col items-start gap-0.5">
          <h2 id={`phase-${phase.id}`} className="text-heading-md font-semibold text-foreground">
            {phase.titleTl}
          </h2>
          <span className="text-label-md text-muted-foreground">{phase.titleEn}</span>
        </div>
        <IconAlertTriangle
          aria-hidden="true"
          className={cn(
            'ml-auto size-4 shrink-0 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {isExpanded ? (
        <ul
          id={`phase-${phase.id}-content`}
          className="flex flex-col gap-2"
          role="list"
          aria-label={phase.titleTl}
        >
          {phase.tips.map((tip, index) => (
            <li key={index}>
              <Card className="gap-1 p-4">
                <p className="text-body-md text-foreground">{tip.tl}</p>
                <p className="text-label-md text-muted-foreground">{tip.en}</p>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
