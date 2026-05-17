import { createFileRoute } from '@tanstack/react-router';
import { evacuationCenterAssignmentsDataset } from '@/features/crm/datasets';
import { CrmCrudPage } from '@/features/crm/crm-crud-page';

export const Route = createFileRoute('/records/evacuation-center-assignments')({
  component: EvacuationCenterAssignmentsPage,
});

function EvacuationCenterAssignmentsPage() {
  return <CrmCrudPage dataset={evacuationCenterAssignmentsDataset} />;
}
