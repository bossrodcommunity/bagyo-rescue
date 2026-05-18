import { createFileRoute } from '@tanstack/react-router';
import { ReportActionPage } from '@/features/reporting/report-action-page';

export const Route = createFileRoute('/request-rescue')({
  component: RequestRescuePage,
});

function RequestRescuePage() {
  return <ReportActionPage type="Rescue Request" />;
}
