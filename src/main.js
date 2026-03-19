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
  // Resolve the raw coordinates to the nearest street intersection.
  fetch(
    'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
      position.coords.latitude +
      ',' +
      position.coords.longitude +
      '&key=' +
      apiKey
  )
    .then((response) => response.json())
    .then((success) => {
      console.log(success);
      initMap({
        coords: {
          latitude: success.results[1].geometry.location.lat,
          longitude: success.results[1].geometry.location.lng,
        },
      });
    })
    .catch(() => {
      initMap({ coords: { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG } });
    });
}

function browserGeolocationFail() {
  // Fall back to Google's IP-based geolocation.
  fetch('https://www.googleapis.com/geolocation/v1/geolocate?key=' + apiKey, { method: 'POST' })
    .then((response) => response.json())
    .then((success) => {
      initMap({
        coords: {
          latitude: success.location.lat,
          longitude: success.location.lng,
        },
      });
    })
    .catch(() => {
      initMap({ coords: { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG } });
    });
}

/**
 * Request the device's current position and hand off to `initMap`.
 * Called automatically by the Google Maps JS API via `callback=getLocation`.
 */
function getLocation() {
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
  }
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

// Expose getLocation globally so the Maps API `callback=getLocation` works.
window.getLocation = getLocation;

// Register device-orientation listeners for mobile tilt-to-move.
registerTiltListener();
