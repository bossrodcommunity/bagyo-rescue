import { createFileRoute } from '@tanstack/react-router';
import { contactPersonsDataset } from '@/features/crm/datasets';
import { CrmCrudPage } from '@/features/crm/crm-crud-page';

export const Route = createFileRoute('/records/contact-persons')({
  component: ContactPersonsPage,
});

function ContactPersonsPage() {
  return <CrmCrudPage dataset={contactPersonsDataset} />;
}
