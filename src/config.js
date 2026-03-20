/**
 * Game configuration constants.
 *
 * VITE_GOOGLE_MAPS_API_KEY is injected at build time via Vite's env-variable
 * system.  During local development, set the key in a `.env.local` file:
 *
 *   VITE_GOOGLE_MAPS_API_KEY=your_key_here
 *
 * The empty-string fallback means the game will still load (showing the
 * "development key" error from the Maps API) when no key is configured.
 */
export const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';

/** Default map centre (Toronto City Hall) used when geolocation is unavailable. */
export const DEFAULT_LAT = 43.653608;
export const DEFAULT_LNG = -79.384293;
