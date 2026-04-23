// Stub analytics logger. Currently logs to console in dev only.
// TODO: wire up backend endpoint for coordinate logging
export async function logCoordinateLookup(lat, lon) {
  if (import.meta.env.DEV) {
    console.log('[coord lookup]', { lat, lon, timestamp: Date.now() });
  }
  return Promise.resolve();
}
