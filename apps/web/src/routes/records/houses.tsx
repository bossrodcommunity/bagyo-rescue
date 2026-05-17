import { createFileRoute } from '@tanstack/react-router';
import { housesDataset } from '@/features/crm/datasets';
import { CrmCrudPage } from '@/features/crm/crm-crud-page';

export const Route = createFileRoute('/records/houses')({
  component: HousesPage,
});

function HousesPage() {
  return <CrmCrudPage dataset={housesDataset} />;
}
