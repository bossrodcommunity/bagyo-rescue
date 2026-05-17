import Dexie, { type EntityTable } from 'dexie';

export type RescuePriority = 'critical' | 'high' | 'medium' | 'low';
export type RescueStatus = 'new' | 'triaged' | 'responding' | 'resolved';

export type RescueReport = {
  id: string;
  household: string;
  location: string;
  priority: RescuePriority;
  status: RescueStatus;
  people: number;
  notes: string;
  createdAt: number;
};

export const db = new Dexie('bagyoRescue') as Dexie & {
  reports: EntityTable<RescueReport, 'id'>;
};

db.version(1).stores({
  reports: 'id, createdAt, priority, status, location',
});
