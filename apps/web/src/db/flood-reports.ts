import { db, type FloodReport, type FloodRiskLevel } from './schema';

const floodReportLifetimeMs = 6 * 60 * 60 * 1000;

export type AddFloodReportInput = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  barangay: string | null;
  riskLevel: FloodRiskLevel;
};

export async function listFloodReports() {
  const now = Date.now();

  await db.floodReports.where('expiresAt').below(now).modify({ status: 'expired' });

  return db.floodReports.orderBy('createdAt').reverse().toArray();
}

export async function addFloodReport(input: AddFloodReportInput) {
  const now = Date.now();
  const report: FloodReport = {
    ...input,
    id: crypto.randomUUID(),
    status: 'active',
    confidence: 'low',
    createdAt: now,
    expiresAt: now + floodReportLifetimeMs,
  };

  await db.floodReports.add(report);
  return report;
}
