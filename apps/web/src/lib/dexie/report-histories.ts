import { dexie } from './client';
import type { ReportHistory, ReportHistorySyncStatus } from './types';

export type AddReportHistoryInput = Omit<
  ReportHistory,
  'id' | 'syncStatus' | 'retryCount' | 'lastSyncError' | 'syncedAt' | 'createdAt'
>;

export type UpdateReportHistorySyncStateInput = {
  id: string;
  syncStatus: ReportHistorySyncStatus;
  lastSyncError?: string | null;
  syncedAt?: number | null;
  incrementRetryCount?: boolean;
};

function createReportHistoryId() {
  return `report_${crypto.randomUUID().replaceAll('-', '')}`;
}

export async function addReportHistory(input: AddReportHistoryInput) {
  const reportHistory: ReportHistory = {
    ...input,
    id: createReportHistoryId(),
    syncStatus: 'queued',
    retryCount: 0,
    lastSyncError: null,
    syncedAt: null,
    createdAt: Date.now(),
  };

  await dexie.reportHistories.add(reportHistory);
  return reportHistory;
}

export async function getReportHistory(id: string) {
  return dexie.reportHistories.get(id);
}

export async function listReportHistories(type?: ReportHistory['type']) {
  return type
    ? dexie.reportHistories.where('type').equals(type).reverse().sortBy('createdAt')
    : dexie.reportHistories.orderBy('createdAt').reverse().toArray();
}

export async function listReportHistoriesForSync() {
  return dexie.reportHistories.where('syncStatus').anyOf('queued', 'failed').sortBy('createdAt');
}

export async function updateReportHistorySyncState({
  id,
  syncStatus,
  lastSyncError,
  syncedAt,
  incrementRetryCount = false,
}: UpdateReportHistorySyncStateInput) {
  const reportHistory = await getReportHistory(id);

  if (!reportHistory) {
    return;
  }

  await dexie.reportHistories.update(id, {
    syncStatus,
    lastSyncError: lastSyncError ?? null,
    syncedAt: syncedAt ?? reportHistory.syncedAt,
    retryCount: reportHistory.retryCount + (incrementRetryCount ? 1 : 0),
  });
}
