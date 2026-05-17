import { db, type FloodReport, type OutboxItem } from '@/db/schema';

let activeSyncPromise: Promise<SyncOutboxResult> | null = null;

export type SyncOutboxResult = {
  failed: number;
  skipped: number;
  synced: number;
};

export async function syncOutbox() {
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  activeSyncPromise = syncOutboxItems().finally(() => {
    activeSyncPromise = null;
  });

  return activeSyncPromise;
}

async function syncOutboxItems(): Promise<SyncOutboxResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { failed: 0, skipped: 0, synced: 0 };
  }

  const items = await db.outbox
    .where('type')
    .equals('flood-report.create')
    .and(item => item.status !== 'synced')
    .sortBy('createdAt');

  const result: SyncOutboxResult = {
    failed: 0,
    skipped: 0,
    synced: 0,
  };

  for (const item of items) {
    const report = await db.floodReports.get(item.entityId);

    if (!report) {
      await markFailed(item, 'Local flood report was not found.');
      result.failed += 1;
      continue;
    }

    await markSyncing(item);

    try {
      const { createFloodReportData } = await import('@/data/flood-reports/create-flood-report');

      await createFloodReportData({ payload: toFloodReportInsert(report) });
      await markSynced(item, report.id);
      result.synced += 1;
    } catch (error) {
      await markFailed(item, getErrorMessage(error));
      result.failed += 1;
    }
  }

  return result;
}

async function markSyncing(item: OutboxItem) {
  await db.outbox.update(item.id, {
    attempts: item.attempts + 1,
    lastError: null,
    status: 'syncing',
    updatedAt: Date.now(),
  });
}

async function markSynced(item: OutboxItem, reportId: string) {
  const now = Date.now();

  await db.transaction('rw', db.floodReports, db.outbox, async () => {
    await db.floodReports.update(reportId, { syncedAt: now });
    await db.outbox.update(item.id, {
      lastError: null,
      status: 'synced',
      syncedAt: now,
      updatedAt: now,
    });
  });
}

async function markFailed(item: OutboxItem, lastError: string) {
  await db.outbox.update(item.id, {
    lastError,
    status: 'failed',
    updatedAt: Date.now(),
  });
}

function toFloodReportInsert(report: FloodReport) {
  return {
    accuracy: report.accuracy,
    barangay: report.barangay,
    client_report_id: report.id,
    confidence: report.confidence,
    expires_at: new Date(report.expiresAt).toISOString(),
    latitude: report.latitude,
    longitude: report.longitude,
    reported_at: new Date(report.createdAt).toISOString(),
    risk_level: report.riskLevel,
    status: report.status,
    updated_at: new Date().toISOString(),
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Flood report sync failed.';
}
