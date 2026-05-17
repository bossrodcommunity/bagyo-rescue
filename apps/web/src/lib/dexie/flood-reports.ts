import { dexie } from './client';
import type { AddFloodReportInput, FloodOutboxItem, FloodReport } from './types';

const floodReportLifetimeMs = 6 * 60 * 60 * 1000;

export type FloodReportSyncStatus = 'saved-local' | 'syncing' | 'synced' | 'failed';
export type FloodReportWithSyncStatus = FloodReport & {
  syncStatus: FloodReportSyncStatus;
  syncError: string | null;
};

export async function listFloodReports() {
  const now = Date.now();

  await dexie.floodReports.where('expiresAt').below(now).modify({ status: 'expired' });

  const [reports, outboxItems] = await Promise.all([
    dexie.floodReports.orderBy('createdAt').reverse().toArray(),
    dexie.outbox.toArray(),
  ]);
  const outboxByEntityId = new Map(outboxItems.map(item => [item.entityId, item]));

  return reports.map(report => {
    const outboxItem = outboxByEntityId.get(report.id);

    return {
      ...report,
      syncStatus: getFloodReportSyncStatus(report, outboxItem),
      syncError: getPublicSyncErrorMessage(outboxItem?.lastError ?? null),
    };
  });
}

export async function addFloodReport(input: AddFloodReportInput) {
  const now = Date.now();
  const reportId = crypto.randomUUID();
  const report: FloodReport = {
    ...input,
    id: reportId,
    status: 'active',
    confidence: 'low',
    createdAt: now,
    expiresAt: now + floodReportLifetimeMs,
  };
  const outboxItem: FloodOutboxItem = {
    id: crypto.randomUUID(),
    type: 'flood-report.create',
    entityId: reportId,
    payload: input,
    status: 'pending',
    attempts: 0,
    lastError: null,
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
  };

  await dexie.transaction('rw', dexie.floodReports, dexie.outbox, async () => {
    await dexie.floodReports.add(report);
    await dexie.outbox.add(outboxItem);
  });

  return report;
}

export async function getFloodOutboxSummary() {
  const items = await dexie.outbox
    .where('type')
    .equals('flood-report.create')
    .and(item => item.status !== 'synced')
    .toArray();
  const failedItems = items
    .filter(item => item.status === 'failed')
    .sort((left, right) => right.updatedAt - left.updatedAt);

  return {
    failed: failedItems.length,
    lastError: getPublicSyncErrorMessage(failedItems[0]?.lastError ?? null),
    pending: items.filter(item => item.status === 'pending').length,
    syncing: items.filter(item => item.status === 'syncing').length,
    total: items.length,
  };
}

function getFloodReportSyncStatus(
  report: FloodReport,
  outboxItem: FloodOutboxItem | undefined
): FloodReportSyncStatus {
  if (outboxItem?.status === 'syncing') return 'syncing';
  if (outboxItem?.status === 'failed') return 'failed';
  if (outboxItem?.status === 'synced' || report.syncedAt) return 'synced';

  return 'saved-local';
}

function getPublicSyncErrorMessage(message: string | null) {
  if (!message) return null;

  if (
    message.includes('SUPABASE_URL') ||
    message.includes('SUPABASE_ANON_KEY') ||
    message.includes('Supabase is not configured')
  ) {
    return 'Setup needed: online sending is not configured.';
  }

  return message;
}
