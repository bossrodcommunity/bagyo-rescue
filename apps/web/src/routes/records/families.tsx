import { createFileRoute } from '@tanstack/react-router';
import { familiesDataset } from '@/features/crm/datasets';
import { CrmCrudPage } from '@/features/crm/crm-crud-page';

export const Route = createFileRoute('/records/families')({
  component: FamiliesPage,
});

function FamiliesPage() {
  return <CrmCrudPage dataset={familiesDataset} />;
}
