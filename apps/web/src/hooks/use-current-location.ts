import { useState } from 'react';

export type CurrentLocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; latitude: number; longitude: number; accuracy: number | null }
  | { status: 'error'; message: string };

export function useCurrentLocation() {
  const [location, setLocation] = useState<CurrentLocationState>({ status: 'idle' });

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocation({ status: 'error', message: 'Location is not available in this browser.' });
      return;
    }

    setLocation({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation({
          status: 'ready',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
        });
      },
      () => {
        setLocation({
          status: 'error',
          message: 'Allow location access so Bagyo Rescue can check flood reports near you.',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 30_000,
      }
    );
  }

  return { location, detectLocation };
}
