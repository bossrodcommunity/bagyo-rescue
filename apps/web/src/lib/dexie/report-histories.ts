import { dexie } from './client';
import type {
  ReportHistory,
  ReportHistoryOutbox,
  ReportHistoryOutboxStatus,
  ReportHistoryWithOutboxState,
} from './types';

export type AddReportHistoryInput = Pick<
  ReportHistory,
  | 'type'
  | 'family_id'
  | 'house_id'
  | 'family_code'
  | 'access_method'
  | 'phone_number'
  | 'latitude'
  | 'longitude'
  | 'accuracy_meters'
  | 'water_level'
  | 'people_count'
  | 'note'
>;

export type UpdateReportHistoryOutboxStateInput = {
  id: string;
  status: ReportHistoryOutboxStatus;
  last_error?: string | null;
  synced_at?: string | null;
  increment_attempt_count?: boolean;
};

export type ListReportHistoriesWithOutboxStateInput = {
  family_code?: string;
  type?: ReportHistory['type'];
};

export type ListReportHistoryOutboxForSyncInput = {
  family_code?: string;
};

export type LinkPendingReportHistoriesToAccessInput = {
  family_id: string;
  house_id: string;
  family_code: string;
  access_method: ReportHistory['access_method'];
  phone_number?: string | null;
  people_count?: number | null;
};

export type UpdateReportHistoryInput = {
  id: string;
  payload: Partial<
    Pick<
      ReportHistory,
      | 'phone_number'
      | 'latitude'
      | 'longitude'
      | 'accuracy_meters'
      | 'water_level'
      | 'people_count'
      | 'note'
    >
  >;
};

export type DeleteReportHistoryInput = {
  id: string;
};

function createReportHistoryId() {
  return `report_${crypto.randomUUID().replaceAll('-', '')}`;
}

function createReportHistoryOutboxId() {
  return `outbox_${crypto.randomUUID().replaceAll('-', '')}`;
}

function sortReportHistoriesByNewest(a: ReportHistory, b: ReportHistory) {
  return Date.parse(b.created_at) - Date.parse(a.created_at);
}

function sortOutboxByOldest(a: ReportHistoryOutbox, b: ReportHistoryOutbox) {
  return Date.parse(a.created_at) - Date.parse(b.created_at);
}

function createOutboxStateFallback(reportHistory: ReportHistory): ReportHistoryWithOutboxState {
  return {
    ...reportHistory,
    outbox_status: 'sent',
    outbox_attempt_count: 0,
    outbox_last_error: null,
    outbox_synced_at: reportHistory.created_at,
  };
}

function mergeReportHistoryWithOutboxState(
  reportHistory: ReportHistory,
  outbox: ReportHistoryOutbox | undefined
): ReportHistoryWithOutboxState {
  if (!outbox) {
    return createOutboxStateFallback(reportHistory);
  }

  return {
    ...reportHistory,
    outbox_status: outbox.status,
    outbox_attempt_count: outbox.attempt_count,
    outbox_last_error: outbox.last_error,
    outbox_synced_at: outbox.synced_at,
  };
}

export async function addReportHistory(input: AddReportHistoryInput) {
  const now = new Date().toISOString();
  const reportHistory: ReportHistory = {
    ...input,
    id: createReportHistoryId(),
    source: 'web',
    status: 'New',
    client_created_at: now,
    created_at: now,
    updated_at: now,
  };
  const outbox: ReportHistoryOutbox = {
    id: createReportHistoryOutboxId(),
    report_history_id: reportHistory.id,
    family_code: reportHistory.family_code,
    action: 'insert_report_history',
    status: 'queued',
    attempt_count: 0,
    last_error: null,
    synced_at: null,
    created_at: now,
    updated_at: now,
  };

  await dexie.transaction('rw', dexie.reportHistories, dexie.reportHistoryOutbox, async () => {
    await dexie.reportHistories.add(reportHistory);
    await dexie.reportHistoryOutbox.add(outbox);
  });

  return mergeReportHistoryWithOutboxState(reportHistory, outbox);
}

export async function getReportHistory(id: string) {
  return dexie.reportHistories.get(id);
}

export async function getReportHistoryWithOutboxState(id: string) {
  const reportHistory = await getReportHistory(id);

  if (!reportHistory) {
    return undefined;
  }

  const outbox = await dexie.reportHistoryOutbox
    .where('report_history_id')
    .equals(reportHistory.id)
    .first();

  return mergeReportHistoryWithOutboxState(reportHistory, outbox);
}

export async function listReportHistoriesWithOutboxState({
  family_code,
  type,
}: ListReportHistoriesWithOutboxStateInput = {}) {
  const reportHistories = await listReportHistories({ family_code, type });

  if (reportHistories.length === 0) {
    return [];
  }

  const outboxRows = await dexie.reportHistoryOutbox
    .where('report_history_id')
    .anyOf(reportHistories.map(reportHistory => reportHistory.id))
    .toArray();
  const outboxByReportHistoryId = new Map(
    outboxRows.map(outbox => [outbox.report_history_id, outbox])
  );

  return reportHistories.map(reportHistory =>
    mergeReportHistoryWithOutboxState(reportHistory, outboxByReportHistoryId.get(reportHistory.id))
  );
}

async function listReportHistories({
  family_code,
  type,
}: ListReportHistoriesWithOutboxStateInput = {}) {
  if (family_code && type) {
    const reportHistories = await dexie.reportHistories
      .where('[family_code+type]')
      .equals([family_code, type])
      .toArray();

    return reportHistories.sort(sortReportHistoriesByNewest);
  }

  if (family_code) {
    const reportHistories = await dexie.reportHistories
      .where('family_code')
      .equals(family_code)
      .toArray();

    return reportHistories.sort(sortReportHistoriesByNewest);
  }

  if (type) {
    const reportHistories = await dexie.reportHistories.where('type').equals(type).toArray();

    return reportHistories.sort(sortReportHistoriesByNewest);
  }

  return dexie.reportHistories.orderBy('created_at').reverse().toArray();
}

export async function listReportHistoryOutboxForSync({
  family_code,
}: ListReportHistoryOutboxForSyncInput = {}) {
  const outboxRows = family_code
    ? await dexie.reportHistoryOutbox.where('family_code').equals(family_code).toArray()
    : await dexie.reportHistoryOutbox.where('status').anyOf('queued', 'failed').toArray();

  return outboxRows
    .filter(
      outbox =>
        Boolean(outbox.family_code) && (outbox.status === 'queued' || outbox.status === 'failed')
    )
    .sort(sortOutboxByOldest);
}

export async function linkPendingReportHistoriesToAccess({
  family_id,
  house_id,
  family_code,
  access_method,
  phone_number = null,
  people_count = null,
}: LinkPendingReportHistoriesToAccessInput) {
  const normalizedFamilyCode = family_code.trim().toUpperCase();
  const now = new Date().toISOString();
  let linked = 0;

  await dexie.transaction('rw', dexie.reportHistories, dexie.reportHistoryOutbox, async () => {
    const pendingOutboxRows = await dexie.reportHistoryOutbox
      .where('status')
      .anyOf('queued', 'failed')
      .toArray();

    for (const outbox of pendingOutboxRows) {
      if (outbox.family_code) continue;

      const reportHistory = await dexie.reportHistories.get(outbox.report_history_id);
      if (!reportHistory || reportHistory.family_code) continue;

      await dexie.reportHistories.update(reportHistory.id, {
        family_id,
        house_id,
        family_code: normalizedFamilyCode,
        access_method,
        phone_number: reportHistory.phone_number ?? phone_number,
        people_count: reportHistory.people_count ?? people_count,
        updated_at: now,
      });
      await dexie.reportHistoryOutbox.update(outbox.id, {
        family_code: normalizedFamilyCode,
        status: 'queued',
        last_error: null,
        updated_at: now,
      });
      linked += 1;
    }
  });

  return { linked };
}

export async function updateReportHistory({ id, payload }: UpdateReportHistoryInput) {
  const now = new Date().toISOString();
  const reportHistory = await getReportHistory(id);

  if (!reportHistory) {
    throw new Error('Report was not found on this device.');
  }

  await dexie.transaction('rw', dexie.reportHistories, dexie.reportHistoryOutbox, async () => {
    await dexie.reportHistories.update(id, {
      ...payload,
      updated_at: now,
    });

    const outbox = await dexie.reportHistoryOutbox.where('report_history_id').equals(id).first();

    if (outbox && outbox.status !== 'sent') {
      await dexie.reportHistoryOutbox.update(outbox.id, {
        status: 'queued',
        last_error: null,
        updated_at: now,
      });
    }
  });

  const updatedReportHistory = await getReportHistoryWithOutboxState(id);

  if (!updatedReportHistory) {
    throw new Error('Updated report was not found on this device.');
  }

  return updatedReportHistory;
}

export async function deleteReportHistory({ id }: DeleteReportHistoryInput) {
  await dexie.transaction('rw', dexie.reportHistories, dexie.reportHistoryOutbox, async () => {
    await dexie.reportHistoryOutbox.where('report_history_id').equals(id).delete();
    await dexie.reportHistories.delete(id);
  });

  return { id };
}

export async function updateReportHistoryOutboxState({
  id,
  status,
  last_error,
  synced_at,
  increment_attempt_count = false,
}: UpdateReportHistoryOutboxStateInput) {
  const outbox = await dexie.reportHistoryOutbox.get(id);

  if (!outbox) {
    return;
  }

  await dexie.reportHistoryOutbox.update(id, {
    status,
    last_error: last_error ?? null,
    synced_at: synced_at ?? outbox.synced_at,
    attempt_count: outbox.attempt_count + (increment_attempt_count ? 1 : 0),
    updated_at: new Date().toISOString(),
  });
}
