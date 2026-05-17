import { createFileRoute } from '@tanstack/react-router';
import { AuthPanel } from '@/components/auth/auth-panel';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Page } from '@/components/ui/page';
import { contactPersonsDataset } from '@/features/crm/datasets';
import { CrmCrudPage } from '@/features/crm/crm-crud-page';
import { useAuth } from '@/lib/auth';

export const Route = createFileRoute('/admin')({
  component: AdminContactsPage,
});

function AdminContactsPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Page width="narrow">
        <Card>
          <CardHeader>
            <CardTitle>Checking session</CardTitle>
            <CardDescription>Loading admin access.</CardDescription>
          </CardHeader>
        </Card>
      </Page>
    );
  }

  if (!isAuthenticated) {
    return (
      <Page width="narrow" className="flex flex-col gap-6">
        <AuthPanel />
      </Page>
    );
  }

  return <CrmCrudPage dataset={contactPersonsDataset} />;
}
