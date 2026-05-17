import { createFileRoute } from '@tanstack/react-router';
import { evacuationCentersDataset } from '@/features/crm/datasets';
import { CrmCrudPage } from '@/features/crm/crm-crud-page';

export const Route = createFileRoute('/records/evacuation-centers')({
  component: EvacuationCentersPage,
});

function EvacuationCentersPage() {
  return <CrmCrudPage dataset={evacuationCentersDataset} />;
}
