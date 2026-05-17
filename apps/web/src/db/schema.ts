import Dexie, { type EntityTable } from 'dexie';

export type RescuePriority = 'critical' | 'high' | 'medium' | 'low';
export type RescueStatus = 'new' | 'triaged' | 'responding' | 'resolved';
export type FloodRiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown';
export type FloodReportStatus = 'active' | 'cleared' | 'disputed' | 'expired';
export type FloodReportConfidence = 'low' | 'medium' | 'high';
export type OutboxItemType = 'flood-report.create';
export type OutboxItemStatus = 'pending' | 'syncing' | 'failed' | 'synced';

export type AddFloodReportInput = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  barangay: string | null;
  riskLevel: FloodRiskLevel;
};

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

export type FloodReport = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  barangay: string | null;
  riskLevel: FloodRiskLevel;
  status: FloodReportStatus;
  confidence: FloodReportConfidence;
  createdAt: number;
  expiresAt: number;
  syncedAt?: number;
};

export type OutboxItem = {
  id: string;
  type: OutboxItemType;
  entityId: string;
  payload: AddFloodReportInput;
  status: OutboxItemStatus;
  attempts: number;
  lastError: string | null;
  createdAt: number;
  updatedAt: number;
  syncedAt: number | null;
};

export const db = new Dexie('bagyoRescue') as Dexie & {
  reports: EntityTable<RescueReport, 'id'>;
  floodReports: EntityTable<FloodReport, 'id'>;
  outbox: EntityTable<OutboxItem, 'id'>;
};

db.version(1).stores({
  reports: 'id, createdAt, priority, status, location',
});

db.version(2).stores({
  reports: 'id, createdAt, priority, status, location',
  floodReports: 'id, createdAt, expiresAt, status, confidence, floodLevel, transportMode',
});

db.version(3)
  .stores({
    reports: 'id, createdAt, priority, status, location',
    floodReports: 'id, createdAt, expiresAt, status, confidence, riskLevel',
  })
  .upgrade(transaction =>
    transaction
      .table('floodReports')
      .toCollection()
      .modify(report => {
        report.riskLevel ??= getRiskLevelFromLegacyFloodLevel(report.floodLevel);
        delete report.floodLevel;
        delete report.transportMode;
        delete report.passability;
      })
  );

db.version(4)
  .stores({
    reports: 'id, createdAt, priority, status, location',
    floodReports: 'id, createdAt, expiresAt, status, confidence, riskLevel, barangay',
  })
  .upgrade(transaction =>
    transaction
      .table('floodReports')
      .toCollection()
      .modify(report => {
        report.barangay ??= null;
      })
  );

db.version(5).stores({
  reports: 'id, createdAt, priority, status, location',
  floodReports: 'id, createdAt, expiresAt, status, confidence, riskLevel, barangay',
  outbox: 'id, type, entityId, status, createdAt, updatedAt, syncedAt',
});

function getRiskLevelFromLegacyFloodLevel(floodLevel: string | undefined): FloodRiskLevel {
  if (floodLevel === 'ankle') return 'low';
  if (floodLevel === 'knee' || floodLevel === 'waist') return 'medium';
  if (floodLevel === 'chest') return 'high';
  if (floodLevel === 'roof') return 'critical';

  return 'unknown';
}
