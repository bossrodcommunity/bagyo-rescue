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

export type RescuePingSyncStatus = 'queued' | 'sending' | 'sent' | 'failed';

export type RescuePing = {
  id: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  note: string;
  syncStatus: RescuePingSyncStatus;
  retryCount: number;
  lastSyncError: string | null;
  syncedAt: number | null;
  createdAt: number;
};

export type FloodRiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown';
export type FloodReportStatus = 'active' | 'cleared' | 'disputed' | 'expired';
export type FloodReportConfidence = 'low' | 'medium' | 'high';
export type FloodOutboxItemType = 'flood-report.create';
export type FloodOutboxItemStatus = 'pending' | 'syncing' | 'failed' | 'synced';

export type AddFloodReportInput = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  barangay: string | null;
  riskLevel: FloodRiskLevel;
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

export type FloodOutboxItem = {
  id: string;
  type: FloodOutboxItemType;
  entityId: string;
  payload: AddFloodReportInput;
  status: FloodOutboxItemStatus;
  attempts: number;
  lastError: string | null;
  createdAt: number;
  updatedAt: number;
  syncedAt: number | null;
};
