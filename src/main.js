/**
 * Main entry point.
 *
 * Wires up geolocation and exposes `getLocation` as the Google Maps API
 * callback on `window` so the Maps script tag can invoke it once loaded.
 */

import { apiKey, DEFAULT_LAT, DEFAULT_LNG } from './config.js';
import { initMap } from './map.js';
import { registerTiltListener } from './movement.js';

// ---------------------------------------------------------------------------
// Geolocation
// ---------------------------------------------------------------------------

function browserGeolocationSuccess(position) {
  console.debug('[geolocation] Browser geolocation succeeded.', {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  });

  // Resolve the raw coordinates to the nearest street intersection.
  const geocodeUrl =
    'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
    position.coords.latitude +
    ',' +
    position.coords.longitude +
    '&key=' +
    apiKey;
  console.debug(
    '[geolocation] Fetching reverse-geocode:',
    geocodeUrl.replace(apiKey, '<redacted>')
  );

  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((success) => {
      console.debug('[geolocation] Geocode API response status:', success.status);
      console.debug(
        '[geolocation] Geocode API results (' +
          (success.results ? success.results.length : 0) +
          ' total):',
        success.results
          ? success.results.map((r, i) => ({
              index: i,
              formatted_address: r.formatted_address,
              types: r.types,
              location: r.geometry && r.geometry.location,
            }))
          : []
      );

      const result = success.results && success.results[1];
      if (result && result.geometry && result.geometry.location) {
        console.debug('[geolocation] Selected result[1]:', {
          formatted_address: result.formatted_address,
          types: result.types,
          location: result.geometry.location,
        });
        initMap({
          coords: {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          },
        });
      } else {
        console.warn(
          '[geolocation] No usable result at index 1; falling back to default coordinates.',
          { DEFAULT_LAT, DEFAULT_LNG }
        );
        initMap({ coords: { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG } });
      }
    })
    .catch((err) => {
      console.error(
        '[geolocation] Geocode API fetch failed; falling back to default coordinates.',
        err
      );
      initMap({ coords: { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG } });
    });
}

function browserGeolocationFail(error) {
  console.warn('[geolocation] Browser geolocation failed; trying IP-based geolocation.', {
    code: error && error.code,
    message: error && error.message,
  });

  // Fall back to Google's IP-based geolocation.
  fetch('https://www.googleapis.com/geolocation/v1/geolocate?key=' + apiKey, { method: 'POST' })
    .then((response) => response.json())
    .then((success) => {
      console.debug('[geolocation] IP-based geolocation succeeded.', {
        latitude: success.location && success.location.lat,
        longitude: success.location && success.location.lng,
        accuracy: success.accuracy,
      });
      initMap({
        coords: {
          latitude: success.location.lat,
          longitude: success.location.lng,
        },
      });
    })
    .catch((err) => {
      console.error(
        '[geolocation] IP-based geolocation failed; falling back to default coordinates.',
        err,
        { DEFAULT_LAT, DEFAULT_LNG }
      );
      initMap({ coords: { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG } });
    });
}

/**
 * Request the device's current position and hand off to `initMap`.
 * Called automatically by the Google Maps JS API via `callback=getLocation`.
 */
function getLocation() {
  console.debug('[geolocation] getLocation() called — starting geolocation flow.');
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      browserGeolocationSuccess,
      browserGeolocationFail,
      options
    );
  } else {
    console.warn(
      '[geolocation] navigator.geolocation is not available; using default coordinates.',
      {
        DEFAULT_LAT,
        DEFAULT_LNG,
      }
    );
  }
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

// Expose getLocation globally so the Maps API `callback=getLocation` works.
window.getLocation = getLocation;

// Register device-orientation listeners for mobile tilt-to-move.
registerTiltListener();
