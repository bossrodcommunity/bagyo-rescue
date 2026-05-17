import { createFileRoute } from '@tanstack/react-router';
import { ReportActionPage } from '@/features/reporting/report-action-page';

export const Route = createFileRoute('/ping')({
  component: PingAliasPage,
});

function PingAliasPage() {
  return <ReportActionPage type="Rescue Request" />;
}
