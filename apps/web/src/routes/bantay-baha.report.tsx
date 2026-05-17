import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useAddFloodReport } from '../data/use-flood-reports';
import type { FloodRiskLevel } from '../db/schema';
import { type CurrentLocationState, useCurrentLocation } from '../hooks/use-current-location';

const riskLevels: { value: FloodRiskLevel; label: string; detail: string }[] = [
  { value: 'low', label: 'Low', detail: 'Passable, monitor only' },
  { value: 'medium', label: 'Medium', detail: 'Rising water or slow passage' },
  { value: 'high', label: 'High', detail: 'Unsafe for most movement' },
  { value: 'critical', label: 'Critical', detail: 'Rescue attention needed' },
  { value: 'unknown', label: 'Unknown', detail: 'Hindi matantiya' },
];

export const Route = createFileRoute('/bantay-baha/report')({
  component: FloodReportPage,
});

function FloodReportPage() {
  const addFloodReport = useAddFloodReport();
  const { location, detectLocation } = useCurrentLocation();
  const [riskLevel, setRiskLevel] = useState<FloodRiskLevel>('medium');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  function submitReport() {
    if (location.status !== 'ready') {
      setLocationError('Use GPS before submitting a report.');
      return;
    }

    setLocationError(null);

    addFloodReport.mutate(
      {
        latitude: location.status === 'ready' ? location.latitude : null,
        longitude: location.status === 'ready' ? location.longitude : null,
        accuracy: location.status === 'ready' ? location.accuracy : null,
        barangay: null,
        riskLevel,
      },
      {
        onSuccess: report => setSubmittedReportId(report.id),
      }
    );
  }

  return (
    <main className="page page--narrow">
      <section className="toolbar">
        <div>
          <p className="eyebrow">Bagyo Rescue flood report</p>
          <h1>Report flooding here</h1>
        </div>
        <Link to="/bantay-baha" className="button button--secondary">
          Back
        </Link>
      </section>

      <section className="report-panel" aria-label="Flood report form">
        <div className="location-card">
          <div>
            <h2>Current location</h2>
            <p>{getLocationCopy(location)}</p>
            <LocationCoordinateBadges location={location} />
            <small>Use GPS to add your current location.</small>
          </div>
          <button type="button" className="button--secondary" onClick={detectLocation}>
            {location.status === 'loading' ? 'Detecting' : 'Use GPS'}
          </button>
        </div>

        {locationError ? <p className="form-error">{locationError}</p> : null}

        <OptionGroup
          title="Flood risk level"
          options={riskLevels}
          selectedValue={riskLevel}
          onSelect={setRiskLevel}
        />

        <button type="button" onClick={submitReport} disabled={addFloodReport.isPending}>
          {addFloodReport.isPending ? 'Saving report' : 'Submit flood report'}
        </button>

        {submittedReportId ? (
          <div className="success-message">
            <p>Flood report saved locally. It can sync later.</p>
            <Link to="/bantay-baha/nearby">View nearby reports</Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function LocationCoordinateBadges({ location }: { location: CurrentLocationState }) {
  if (location.status !== 'ready') {
    return null;
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;

  return (
    <div className="coordinate-badges" aria-label="GPS coordinates">
      <span className="coordinate-badge">Lat {location.latitude.toFixed(5)}</span>
      <span className="coordinate-badge">Long {location.longitude.toFixed(5)}</span>
      <a
        className="coordinate-map-link"
        href={googleMapsUrl}
        rel="noreferrer"
        target="_blank"
      >
        Open in Google Maps
      </a>
    </div>
  );
}

function OptionGroup<TValue extends string>({
  title,
  options,
  selectedValue,
  onSelect,
}: {
  title: string;
  options: { value: TValue; label: string; detail?: string }[];
  selectedValue: TValue;
  onSelect: (value: TValue) => void;
}) {
  return (
    <fieldset className="option-group">
      <legend>{title}</legend>
      <div className="option-grid">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            className={option.value === selectedValue ? 'option-card active' : 'option-card'}
            onClick={() => onSelect(option.value)}
          >
            <span>{option.label}</span>
            {option.detail ? <small>{option.detail}</small> : null}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function getLocationCopy(location: CurrentLocationState) {
  if (location.status === 'loading') {
    return 'Finding your location now.';
  }

  if (location.status === 'ready') {
    return 'GPS location added.';
  }

  if (location.status === 'error') {
    return location.message;
  }

  return 'Use GPS before submitting a report.';
}
