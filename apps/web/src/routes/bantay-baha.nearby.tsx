import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useFloodReports } from '../data/use-flood-reports';
import type { FloodReport } from '../db/schema';
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
    <main className="page page--narrow">
      <section className="toolbar toolbar--nearby">
        <div>
          <p className="eyebrow">Nearby flood reports</p>
          <h1>Check your area</h1>
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

      <section className="status-panel">
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
              <div>
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

function isActiveFloodReport(report: FloodReport) {
  return report.status === 'active' && report.expiresAt > Date.now();
}

function hasGpsLocation(
  report: FloodReport
): report is FloodReport & { latitude: number; longitude: number } {
  return report.latitude !== null && report.longitude !== null;
}

function formatRiskLevel(report: FloodReport) {
  return `${report.riskLevel} risk`;
}

function getRiskHeadline(report: FloodReport) {
  if (report.riskLevel === 'critical') return 'Immediate rescue risk';
  if (report.riskLevel === 'high') return 'High flood risk nearby';
  if (report.riskLevel === 'medium') return 'Flood risk reported';
  if (report.riskLevel === 'low') return 'Low flood risk reported';

  return 'Flood risk needs verification';
}

function formatLocationSource(report: FloodReport) {
  if (report.latitude !== null && report.longitude !== null) {
    return report.barangay
      ? `Confirmed by GPS near ${report.barangay}.`
      : 'Confirmed by current GPS location.';
  }

  return report.barangay
    ? `Confirmed by barangay: ${report.barangay}.`
    : 'Location needs confirmation.';
}

function formatArea(report: FloodReport) {
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
    return 'Getting your current location to sort nearby flood reports.';
  }

  if (locationStatus === 'ready') {
    return `${reportCount} active report${reportCount === 1 ? '' : 's'} within 5 km.`;
  }

  if (locationStatus === 'error') {
    return 'Location is blocked. Showing active local reports without distance sorting.';
  }

  return 'Use GPS to filter active local reports within 5 km.';
}
