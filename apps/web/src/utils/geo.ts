export type GeoPoint = {
  latitude: number;
  longitude: number;
};

const earthRadiusMeters = 6_371_000;

export function getDistanceMeters(from: GeoPoint, to: GeoPoint) {
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
