import { updateReportHistory, type UpdateReportHistoryInput } from '@/lib/dexie';

export type UpdateReportHistoryServiceArgs = {
  payload: UpdateReportHistoryInput;
};

export async function updateReportHistoryService({ payload }: UpdateReportHistoryServiceArgs) {
  return updateReportHistory(payload);
}

export type UpdateReportHistoryServiceResponse = Awaited<
  ReturnType<typeof updateReportHistoryService>
>;
