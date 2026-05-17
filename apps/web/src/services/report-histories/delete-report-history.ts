import { deleteReportHistory, type DeleteReportHistoryInput } from '@/lib/dexie';

export type DeleteReportHistoryServiceArgs = {
  payload: DeleteReportHistoryInput;
};

export async function deleteReportHistoryService({ payload }: DeleteReportHistoryServiceArgs) {
  return deleteReportHistory(payload);
}

export type DeleteReportHistoryServiceResponse = Awaited<
  ReturnType<typeof deleteReportHistoryService>
>;
