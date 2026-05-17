import { createRescuePingData } from '@/data/rescue-pings';
import {
  getRescuePing,
  listRescuePingsForSync,
  updateRescuePingSyncState,
  type RescuePing,
} from '@/lib/dexie';

export type SyncRescuePingsServiceDependencies = {
  createRescuePingData: typeof createRescuePingData;
};

export type SyncRescuePingsServiceArgs = {
  dependencies?: SyncRescuePingsServiceDependencies;
};

export type SyncRescuePingsServiceResult = {
  sent: number;
  failed: number;
};

export async function syncRescuePingsService({
  dependencies = {
    createRescuePingData,
  },
}: SyncRescuePingsServiceArgs = {}): Promise<SyncRescuePingsServiceResult> {
  const queuedPings = await listRescuePingsForSync();
  let sent = 0;
  let failed = 0;

  for (const rescuePing of queuedPings) {
    await updateRescuePingSyncState({
      id: rescuePing.id,
      syncStatus: 'sending',
      lastSyncError: null,
    });

    try {
      await dependencies.createRescuePingData({
        payload: toRescuePingPayload(rescuePing),
      });
      await updateRescuePingSyncState({
        id: rescuePing.id,
        syncStatus: 'sent',
        lastSyncError: null,
        syncedAt: Date.now(),
      });
      sent += 1;
    } catch (error) {
      await updateRescuePingSyncState({
        id: rescuePing.id,
        syncStatus: 'failed',
        lastSyncError:
          error instanceof Error ? error.message : 'Hindi naipadala. Could not send ping.',
        incrementRetryCount: true,
      });
      failed += 1;
    }
  }

  return { sent, failed };
}

export async function getLatestRescuePingSyncState(id: string) {
  return getRescuePing(id);
}

function toRescuePingPayload(rescuePing: RescuePing) {
  return {
    id: rescuePing.id,
    phone_number: rescuePing.phoneNumber,
    latitude: roundCoordinate(rescuePing.latitude),
    longitude: roundCoordinate(rescuePing.longitude),
    accuracy_meters:
      rescuePing.accuracyMeters === null ? null : Math.round(rescuePing.accuracyMeters * 100) / 100,
    note: rescuePing.note.trim() || null,
    source: 'web',
    client_created_at: new Date(rescuePing.createdAt).toISOString(),
  };
}

function roundCoordinate(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}
