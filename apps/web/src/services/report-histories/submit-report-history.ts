import {
  addReportHistory,
  getReportHistoryWithOutboxState,
  type AddReportHistoryInput,
} from '@/lib/dexie';
import { syncReportHistoriesService } from './sync-report-histories';

export type SubmitReportHistoryServiceArgs = {
  payload: AddReportHistoryInput;
};

function canAttemptImmediateSync(payload: AddReportHistoryInput) {
  return Boolean(payload.family_code) && (typeof navigator === 'undefined' || navigator.onLine);
}

export async function submitReportHistoryService({ payload }: SubmitReportHistoryServiceArgs) {
  const reportHistory = await addReportHistory(payload);
  const savedReportHistory =
    (await getReportHistoryWithOutboxState(reportHistory.id)) ?? reportHistory;

  if (canAttemptImmediateSync(payload)) {
    void syncReportHistoriesService({ family_code: payload.family_code ?? undefined }).catch(() => {
      // The local outbox row is the source of truth. Failed syncs are retried by the sync flow.
    });
  }

  return savedReportHistory;
}

export type SubmitReportHistoryServiceResponse = Awaited<
  ReturnType<typeof submitReportHistoryService>
>;
