import { addReportHistory, getReportHistory, type AddReportHistoryInput } from '@/lib/dexie';
import { syncReportHistoriesService } from './sync-report-histories';

export type SubmitReportHistoryServiceArgs = {
  payload: AddReportHistoryInput;
};

export async function submitReportHistoryService({ payload }: SubmitReportHistoryServiceArgs) {
  const reportHistory = await addReportHistory(payload);

  if (typeof navigator === 'undefined' || navigator.onLine) {
    await syncReportHistoriesService();
  }

  return (await getReportHistory(reportHistory.id)) ?? reportHistory;
}

export type SubmitReportHistoryServiceResponse = Awaited<
  ReturnType<typeof submitReportHistoryService>
>;
