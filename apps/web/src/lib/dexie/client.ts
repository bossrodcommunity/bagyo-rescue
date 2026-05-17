import Dexie, { type EntityTable } from 'dexie';
import { dexieSchema } from './schema';
import type { FloodOutboxItem, FloodReport, ReportHistory, ReportHistoryOutbox } from './types';

export type BagyoRescueDexie = Dexie & {
  floodReports: EntityTable<FloodReport, 'id'>;
  outbox: EntityTable<FloodOutboxItem, 'id'>;
  reportHistories: EntityTable<ReportHistory, 'id'>;
  reportHistoryOutbox: EntityTable<ReportHistoryOutbox, 'id'>;
};

export function createDexieClient() {
  const dexie = new Dexie(dexieSchema.databaseName) as BagyoRescueDexie;

  dexie.version(dexieSchema.version).stores(dexieSchema.stores);

  return dexie;
}

export const dexie = createDexieClient();
