import { createFileRoute } from '@tanstack/react-router';
import { lgusDataset } from '@/features/crm/datasets';
import { CrmCrudPage } from '@/features/crm/crm-crud-page';

export const Route = createFileRoute('/records/lgus')({
  component: LgusPage,
});

function LgusPage() {
  return <CrmCrudPage dataset={lgusDataset} />;
}
