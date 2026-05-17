export const dexieSchema = {
  databaseName: 'bagyoRescue',
  version: 5,
  stores: {
    reportHistories: 'id, type, createdAt, syncStatus, familyId',
  },
} as const;
