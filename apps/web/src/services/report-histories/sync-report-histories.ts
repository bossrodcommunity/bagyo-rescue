import { type PublicTableInsert } from '@/data';
import { createReportHistoryData } from '@/data/report-histories';
import {
  getReportHistory,
  listReportHistoryOutboxForSync,
  updateReportHistoryOutboxState,
  type ReportHistory,
  type ReportHistoryOutbox,
} from '@/lib/dexie';

export type SyncReportHistoriesServiceDependencies = {
  createReportHistoryData: typeof createReportHistoryData;
};

export type SyncReportHistoriesServiceArgs = {
  family_code?: string;
  dependencies?: SyncReportHistoriesServiceDependencies;
};

export type SyncReportHistoriesServiceResult = {
  sent: number;
  failed: number;
};

export async function syncReportHistoriesService({
  family_code,
  dependencies = {
    createReportHistoryData,
  },
}: SyncReportHistoriesServiceArgs = {}): Promise<SyncReportHistoriesServiceResult> {
  const queuedActions = await listReportHistoryOutboxForSync({ family_code });
  let sent = 0;
  let failed = 0;

  for (const outbox of queuedActions) {
    await updateReportHistoryOutboxState({
      id: outbox.id,
      status: 'sending',
      last_error: null,
    });

    try {
      const reportHistory = await getReportHistory(outbox.report_history_id);

      if (!reportHistory) {
        throw new Error('Report was not found on this device.');
      }

      await dependencies.createReportHistoryData({
        payload: toReportHistoryPayload(reportHistory, outbox),
      });
      await updateReportHistoryOutboxState({
        id: outbox.id,
        status: 'sent',
        last_error: null,
        synced_at: new Date().toISOString(),
      });
      sent += 1;
    } catch (error) {
      await updateReportHistoryOutboxState({
        id: outbox.id,
        status: 'failed',
        last_error: error instanceof Error ? error.message : 'Hindi naipadala ang report.',
        increment_attempt_count: true,
      });
      failed += 1;
    }
  }

  return { sent, failed };
}

function toReportHistoryPayload(
  reportHistory: ReportHistory,
  outbox: ReportHistoryOutbox
): PublicTableInsert<'report_histories'> {
  if (outbox.action !== 'insert_report_history') {
    throw new Error(`Unsupported outbox action: ${outbox.action}`);
  }

  return {
    ...reportHistory,
    latitude: reportHistory.latitude === null ? null : roundCoordinate(reportHistory.latitude),
    longitude: reportHistory.longitude === null ? null : roundCoordinate(reportHistory.longitude),
    accuracy_meters:
      reportHistory.accuracy_meters === null
        ? null
        : Math.round(reportHistory.accuracy_meters * 100) / 100,
    note: reportHistory.note?.trim() || null,
  };
}

function roundCoordinate(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}
