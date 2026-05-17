import { dexie } from './client';
import type { RescuePing, RescuePingSyncStatus } from './types';

export type AddRescuePingInput = {
  phoneNumber: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  note: string;
};

export type UpdateRescuePingSyncStateInput = {
  id: string;
  syncStatus: RescuePingSyncStatus;
  lastSyncError?: string | null;
  syncedAt?: number | null;
  incrementRetryCount?: boolean;
};

function createRescuePingId() {
  return `ping_${crypto.randomUUID().replaceAll('-', '')}`;
}

export async function addRescuePing(input: AddRescuePingInput) {
  const rescuePing: RescuePing = {
    ...input,
    id: createRescuePingId(),
    syncStatus: 'queued',
    retryCount: 0,
    lastSyncError: null,
    syncedAt: null,
    createdAt: Date.now(),
  };

  await dexie.rescuePings.add(rescuePing);
  return rescuePing;
}

export async function getRescuePing(id: string) {
  return dexie.rescuePings.get(id);
}

export async function listRescuePings() {
  return dexie.rescuePings.orderBy('createdAt').reverse().toArray();
}

export async function listRescuePingsForSync() {
  return dexie.rescuePings.where('syncStatus').anyOf('queued', 'failed').sortBy('createdAt');
}

export async function updateRescuePingSyncState({
  id,
  syncStatus,
  lastSyncError,
  syncedAt,
  incrementRetryCount = false,
}: UpdateRescuePingSyncStateInput) {
  const rescuePing = await getRescuePing(id);

  if (!rescuePing) {
    return;
  }

  await dexie.rescuePings.update(id, {
    syncStatus,
    lastSyncError: lastSyncError ?? null,
    syncedAt: syncedAt ?? rescuePing.syncedAt,
    retryCount: rescuePing.retryCount + (incrementRetryCount ? 1 : 0),
  });
}
