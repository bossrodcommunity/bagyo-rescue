import { createReportHistoryData } from '@/data/report-histories';
import {
  getReportHistory,
  listReportHistoriesForSync,
  updateReportHistorySyncState,
  type ReportHistory,
} from '@/lib/dexie';

export type SyncReportHistoriesServiceDependencies = {
  createReportHistoryData: typeof createReportHistoryData;
};

export type SyncReportHistoriesServiceArgs = {
  dependencies?: SyncReportHistoriesServiceDependencies;
};

export type SyncReportHistoriesServiceResult = {
  sent: number;
  failed: number;
};

export async function syncReportHistoriesService({
  dependencies = {
    createReportHistoryData,
  },
}: SyncReportHistoriesServiceArgs = {}): Promise<SyncReportHistoriesServiceResult> {
  const queuedReports = await listReportHistoriesForSync();
  let sent = 0;
  let failed = 0;

  for (const reportHistory of queuedReports) {
    await updateReportHistorySyncState({
      id: reportHistory.id,
      syncStatus: 'sending',
      lastSyncError: null,
    });

    try {
      await dependencies.createReportHistoryData({
        payload: toReportHistoryPayload(reportHistory),
      });
      await updateReportHistorySyncState({
        id: reportHistory.id,
        syncStatus: 'sent',
        lastSyncError: null,
        syncedAt: Date.now(),
      });
      sent += 1;
    } catch (error) {
      await updateReportHistorySyncState({
        id: reportHistory.id,
        syncStatus: 'failed',
        lastSyncError: error instanceof Error ? error.message : 'Hindi naipadala ang report.',
        incrementRetryCount: true,
      });
      failed += 1;
    }
  }

  return { sent, failed };
}

export async function getLatestReportHistorySyncState(id: string) {
  return getReportHistory(id);
}

function toReportHistoryPayload(reportHistory: ReportHistory) {
  return {
    id: reportHistory.id,
    type: reportHistory.type,
    family_id: reportHistory.familyId,
    house_id: reportHistory.houseId,
    family_code: reportHistory.familyCode,
    access_method: reportHistory.accessMethod,
    phone_number: reportHistory.phoneNumber,
    latitude: reportHistory.latitude === null ? null : roundCoordinate(reportHistory.latitude),
    longitude: reportHistory.longitude === null ? null : roundCoordinate(reportHistory.longitude),
    accuracy_meters:
      reportHistory.accuracyMeters === null
        ? null
        : Math.round(reportHistory.accuracyMeters * 100) / 100,
    water_level: reportHistory.waterLevel,
    people_count: reportHistory.peopleCount,
    note: reportHistory.note.trim() || null,
    source: 'web',
    status: 'New' as const,
    client_created_at: new Date(reportHistory.createdAt).toISOString(),
  };
}

function roundCoordinate(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}
