import { createFileRoute } from '@tanstack/react-router';
import { barangaysDataset } from '@/features/crm/datasets';
import { CrmCrudPage } from '@/features/crm/crm-crud-page';

export const Route = createFileRoute('/records/barangays')({
  component: BarangaysPage,
});

function BarangaysPage() {
  return <CrmCrudPage dataset={barangaysDataset} />;
}
