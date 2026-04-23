// Pure geo helpers — no deps, no side effects.
// Used by the Service Area distance calculator to show operators how far
// each Infinity facility is from their entered lat/lon.

const EARTH_RADIUS_MILES = 3958.8;

const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

// Great-circle (air) distance in miles between two lat/lon points.
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Initial compass bearing (degrees from true north, 0–360) from point 1 to 2.
export function bearing(lat1, lon1, lat2, lon2) {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

export function bearingToCardinal(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// Converts DMS to decimal degrees.
// degrees, minutes, seconds are all positive numbers.
// hemisphere is "N", "S", "E", or "W".
export function dmsToDd(degrees, minutes, seconds, hemisphere) {
  const dd = degrees + minutes / 60 + seconds / 3600;
  const isNegative = hemisphere === 'S' || hemisphere === 'W';
  return isNegative ? -dd : dd;
}

// Converts decimal degrees to DMS components.
// type is "lat" or "lon" — determines which hemisphere pair to use.
// Returns: { degrees, minutes, seconds, hemisphere }
export function ddToDms(dd, type) {
  const hemisphere =
    type === 'lat' ? (dd >= 0 ? 'N' : 'S') : (dd >= 0 ? 'E' : 'W');
  const absDd = Math.abs(dd);
  const degrees = Math.floor(absDd);
  const minutesFloat = (absDd - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 3600 * 10) / 10;
  return { degrees, minutes, seconds, hemisphere };
}
