import { createFileRoute } from '@tanstack/react-router';
import { residentsDataset } from '@/features/crm/datasets';
import { CrmCrudPage } from '@/features/crm/crm-crud-page';

export const Route = createFileRoute('/records/residents')({
  component: ResidentsPage,
});

function ResidentsPage() {
  return <CrmCrudPage dataset={residentsDataset} />;
}
