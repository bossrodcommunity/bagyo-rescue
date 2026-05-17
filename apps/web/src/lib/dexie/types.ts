export type ReportHistorySyncStatus = 'queued' | 'sending' | 'sent' | 'failed';
export type ReportHistoryType = 'Flood Report' | 'Rescue Request';
export type ReportHistoryWaterLevel =
  | 'None'
  | 'Ankle'
  | 'Knee'
  | 'Waist'
  | 'Chest'
  | 'Roof'
  | 'Unknown';
export type ResidentAccessMethod = 'scan' | 'upload' | 'manual';

export type ReportHistory = {
  id: string;
  type: ReportHistoryType;
  familyId: string;
  houseId: string;
  familyCode: string;
  accessMethod: ResidentAccessMethod;
  phoneNumber: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  waterLevel: ReportHistoryWaterLevel | null;
  peopleCount: number | null;
  note: string;
  syncStatus: ReportHistorySyncStatus;
  retryCount: number;
  lastSyncError: string | null;
  syncedAt: number | null;
  createdAt: number;
};
