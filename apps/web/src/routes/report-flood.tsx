import { createFileRoute } from '@tanstack/react-router';
import { ReportActionPage } from '@/features/reporting/report-action-page';

export const Route = createFileRoute('/report-flood')({
  component: ReportFloodPage,
});

function ReportFloodPage() {
  return <ReportActionPage type="Flood Report" />;
}
