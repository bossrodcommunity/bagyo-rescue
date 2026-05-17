import {
  addReportHistory,
  getReportHistoryWithOutboxState,
  type AddReportHistoryInput,
} from '@/lib/dexie';
import { syncReportHistoriesService } from './sync-report-histories';

export type SubmitReportHistoryServiceArgs = {
  payload: AddReportHistoryInput;
};

export async function submitReportHistoryService({ payload }: SubmitReportHistoryServiceArgs) {
  const reportHistory = await addReportHistory(payload);

  if (typeof navigator === 'undefined' || navigator.onLine) {
    await syncReportHistoriesService({ family_code: payload.family_code ?? undefined });
  }

  return (await getReportHistoryWithOutboxState(reportHistory.id)) ?? reportHistory;
}

export type SubmitReportHistoryServiceResponse = Awaited<
  ReturnType<typeof submitReportHistoryService>
>;
