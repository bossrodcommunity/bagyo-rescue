import { Link, createFileRoute } from '@tanstack/react-router';
import { IconArrowRight } from '@tabler/icons-react';
import { CrmNavigation } from '@/features/crm/crm-crud-page';
import { crmRoutes } from '@/features/crm/crm-routes';
import { Page, PageHeader, PageTitle, PageDescription } from '@/components/ui/page';

export const Route = createFileRoute('/records/')({
  component: RecordsIndexPage,
});

function RecordsIndexPage() {
  return (
    <Page width="wide" className="flex flex-col gap-8">
      <PageHeader>
        <PageTitle>CRM workspace</PageTitle>
        <PageDescription>Browse, create, update, and delete operational records.</PageDescription>
      </PageHeader>

      <section
        aria-label="Data access routes"
        className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]"
      >
        <CrmNavigation />
        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="text-heading-md font-semibold text-foreground">Data modules</h2>
          <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
            {crmRoutes.map(route => (
              <li key={route.datasetId}>
                <Link
                  to={route.to}
                  className="flex min-h-16 items-center justify-between gap-4 px-5 py-4 hover:bg-muted/40"
                >
                  <span className="flex flex-col gap-0.5">
                    <strong className="text-body-md font-medium text-foreground">
                      {route.label}
                    </strong>
                    <small className="text-label-md text-muted-foreground">
                      {route.description}
                    </small>
                  </span>
                  <IconArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </Page>
  );
}
