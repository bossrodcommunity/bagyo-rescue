import { createFileRoute } from '@tanstack/react-router';
import { contactPersonsDataset } from '@/features/crm/datasets';
import { CrmCrudPage } from '@/features/crm/crm-crud-page';

export const Route = createFileRoute('/admin')({
  component: AdminContactsPage,
});

function AdminContactsPage() {
  return <CrmCrudPage dataset={contactPersonsDataset} />;
}
