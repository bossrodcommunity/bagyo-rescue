import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useFloodReports } from '../data/use-flood-reports';
import type { FloodReportWithSyncStatus } from '../db/flood-reports';
import { useCurrentLocation } from '../hooks/use-current-location';
import { formatDistance, getDistanceMeters } from '../utils/geo';

const nearbyRadiusMeters = 5_000;

export const Route = createFileRoute('/bantay-baha/nearby')({
  component: NearbyFloodReportsPage,
});

function NearbyFloodReportsPage() {
  const floodReportsQuery = useFloodReports();
  const { location, detectLocation } = useCurrentLocation();
  const [barangayFilter, setBarangayFilter] = useState('');
  const reports = floodReportsQuery.data ?? [];

  const nearbyReports = useMemo(() => {
    const activeReports = reports.filter(isActiveFloodReport);
    const normalizedBarangayFilter = barangayFilter.trim().toLowerCase();

    if (normalizedBarangayFilter) {
      return activeReports
        .filter(report => report.barangay?.toLowerCase().includes(normalizedBarangayFilter))
        .map(report => ({ report, distanceMeters: null }));
    }

    if (location.status !== 'ready') {
      return activeReports.map(report => ({ report, distanceMeters: null }));
    }

    return activeReports
      .filter(hasGpsLocation)
      .map(report => ({
        report,
        distanceMeters: getDistanceMeters(location, report),
      }))
      .filter(item => item.distanceMeters <= nearbyRadiusMeters)
      .sort((left, right) => left.distanceMeters - right.distanceMeters);
  }, [barangayFilter, location, reports]);

  return (
    <main className="page page--nearby">
      <section className="toolbar toolbar--nearby">
        <div>
          <p className="eyebrow">Nearby flood reports</p>
          <h1>Check your area</h1>
          <p className="toolbar-copy">
            Use GPS for distance-ranked reports, or filter by barangay when location access is not
            available.
          </p>
        </div>
        <div className="action-row">
          <button type="button" className="button--secondary" onClick={detectLocation}>
            {location.status === 'loading' ? 'Detecting' : 'Use GPS'}
          </button>
          <Link to="/bantay-baha/report" className="button">
            Report flooding
          </Link>
        </div>
      </section>

      <section className="status-panel status-panel--nearby">
        <strong>{nearbyReports.length}</strong>
        <p>{getNearbyStatusCopy(location.status, nearbyReports.length)}</p>
      </section>

      <label className="field-group field-group--inline">
        <span>Barangay</span>
        <input
          value={barangayFilter}
          onChange={event => setBarangayFilter(event.target.value)}
          placeholder="Filter by barangay"
        />
      </label>

      <section className="nearby-list" aria-label="Active nearby flood reports">
        {nearbyReports.length > 0 ? (
          nearbyReports.map(({ report, distanceMeters }) => (
            <article className="flood-report-card" key={report.id}>
              <div className="report-card-main">
                <span className={`pill pill--${report.riskLevel}`}>{formatRiskLevel(report)}</span>
                <h2>{getRiskHeadline(report)}</h2>
                <p>{formatLocationSource(report)}</p>
              </div>
              <dl className="report-meta">
                <div>
                  <dt>Distance</dt>
                  <dd>
                    {distanceMeters === null ? formatArea(report) : formatDistance(distanceMeters)}
                  </dd>
                </div>
                <div>
                  <dt>Confidence</dt>
                  <dd>{report.confidence}</dd>
                </div>
                <div>
                  <dt>Expires</dt>
                  <dd>{formatExpiry(report.expiresAt)}</dd>
                </div>
                <div>
                  <dt>Sync</dt>
                  <dd>{getSyncStatusCopy(report)}</dd>
                </div>
              </dl>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <h2>No active flood reports nearby</h2>
            <p>
              Local reports will appear here after someone submits a Bagyo Rescue flood report from
              this device.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function isActiveFloodReport(report: FloodReportWithSyncStatus) {
  return report.status === 'active' && report.expiresAt > Date.now();
}

function hasGpsLocation(
  report: FloodReportWithSyncStatus
): report is FloodReportWithSyncStatus & { latitude: number; longitude: number } {
  return report.latitude !== null && report.longitude !== null;
}

function formatRiskLevel(report: FloodReportWithSyncStatus) {
  return `${report.riskLevel} risk`;
}

function getRiskHeadline(report: FloodReportWithSyncStatus) {
  if (report.riskLevel === 'critical') return 'Immediate rescue risk';
  if (report.riskLevel === 'high') return 'High flood risk nearby';
  if (report.riskLevel === 'medium') return 'Flood risk reported';
  if (report.riskLevel === 'low') return 'Low flood risk reported';

  return 'Flood risk needs verification';
}

function formatLocationSource(report: FloodReportWithSyncStatus) {
  if (report.latitude !== null && report.longitude !== null) {
    return report.barangay
      ? `Confirmed by GPS near ${report.barangay}.`
      : 'Confirmed by current GPS location.';
  }

  return report.barangay
    ? `Confirmed by barangay: ${report.barangay}.`
    : 'Location needs confirmation.';
}

function formatArea(report: FloodReportWithSyncStatus) {
  return report.barangay ?? 'Use GPS';
}

function formatExpiry(expiresAt: number) {
  const minutesLeft = Math.max(0, Math.round((expiresAt - Date.now()) / 60_000));

  if (minutesLeft < 60) {
    return `${minutesLeft} min`;
  }

  return `${Math.round(minutesLeft / 60)} hr`;
}

function getNearbyStatusCopy(locationStatus: string, reportCount: number) {
  if (locationStatus === 'loading') {
    return `active local report${reportCount === 1 ? '' : 's'} while GPS loads.`;
  }

  if (locationStatus === 'ready') {
    return `active report${reportCount === 1 ? '' : 's'} within 5 km.`;
  }

  if (locationStatus === 'error') {
    return `active local report${reportCount === 1 ? '' : 's'} without distance sorting.`;
  }

  return `active local report${reportCount === 1 ? '' : 's'}. Use GPS to sort within 5 km.`;
}

function getSyncStatusCopy(report: FloodReportWithSyncStatus) {
  if (report.syncStatus === 'syncing') return 'Syncing';
  if (report.syncStatus === 'synced') return 'Synced';
  if (report.syncStatus === 'failed') return 'Sync failed';

  return 'Saved locally';
}
