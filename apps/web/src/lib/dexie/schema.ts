export const dexieSchema = {
  databaseName: 'bagyoRescue',
  version: 6,
  stores: {
    reports: 'id, createdAt, priority, status, location',
    floodReports: 'id, createdAt, expiresAt, status, confidence, riskLevel, barangay',
    outbox: 'id, type, entityId, status, createdAt, updatedAt, syncedAt',
    rescuePings: 'id, createdAt, syncStatus, phoneNumber',
  },
} as const;
