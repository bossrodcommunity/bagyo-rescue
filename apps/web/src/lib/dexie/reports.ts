import { dexie } from './client';
import type { RescueReport } from './types';

const starterReports: RescueReport[] = [
  {
    id: 'seed-1',
    household: 'Santos family',
    location: 'Barangay 3, Zone A',
    priority: 'critical',
    status: 'responding',
    people: 5,
    notes: 'Roof access only, two children and one senior.',
    createdAt: Date.now() - 1000 * 60 * 42,
  },
  {
    id: 'seed-2',
    household: 'Community clinic',
    location: 'Riverside Road',
    priority: 'high',
    status: 'triaged',
    people: 12,
    notes: 'Needs medicine transport and drinking water.',
    createdAt: Date.now() - 1000 * 60 * 24,
  },
  {
    id: 'seed-3',
    household: 'Evacuation desk',
    location: 'Municipal gym',
    priority: 'medium',
    status: 'new',
    people: 38,
    notes: 'Registration queue is moving slowly.',
    createdAt: Date.now() - 1000 * 60 * 8,
  },
];

export async function seedReports() {
  const count = await dexie.reports.count();

  if (count > 0) {
    return;
  }

  await dexie.reports.bulkAdd(starterReports);
}

export async function listReports() {
  await seedReports();
  return dexie.reports.orderBy('createdAt').reverse().toArray();
}

export async function addReport(input: Omit<RescueReport, 'id' | 'createdAt' | 'status'>) {
  const report: RescueReport = {
    ...input,
    id: crypto.randomUUID(),
    status: 'new',
    createdAt: Date.now(),
  };

  await dexie.reports.add(report);
  return report;
}

export async function updateReportStatus(id: string, status: RescueReport['status']) {
  await dexie.reports.update(id, { status });
}
