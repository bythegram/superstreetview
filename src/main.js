/**
 * Main entry point.
 *
 * Wires up geolocation and exposes `getLocation` as the Google Maps API
 * callback on `window` so the Maps script tag can invoke it once loaded.
 *
 * Geolocation is deferred until the user dismisses the intro screen so that
 * the browser permission prompt appears in direct response to a user gesture.
 */

import { apiKey, DEFAULT_LAT, DEFAULT_LNG } from './config.js';
import { initMap, relocate } from './map.js';
import { registerTiltListener } from './movement.js';
import { state } from './state.js';

// ---------------------------------------------------------------------------
// Flags that coordinate the Maps API ready callback with the Play button
// ---------------------------------------------------------------------------

/** Set to true once the Google Maps JS API has finished loading. */
let mapsReady = false;

/** Set to true once the user has clicked the Play button on the intro screen. */
let userReady = false;

// ---------------------------------------------------------------------------
// Geolocation helpers
// ---------------------------------------------------------------------------

/**
 * Options shared by all getCurrentPosition calls.
 * A 10-second timeout gives the device enough time to obtain a GPS fix on
 * cold-start (the 5-second default was too tight and triggered
 * kCLErrorLocationUnknown / POSITION_UNAVAILABLE on iOS/macOS).
 */
const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

/**
 * Fall back to Google's IP-based geolocation and call `mapAction` with the
 * resolved position.  If the IP call also fails, `mapAction` is called with
 * the hard-coded default coordinates so the game always starts.
 *
 * @param {Function} mapAction - Either `initMap` or `relocate`.
 */
function ipGeolocationFallback(mapAction) {
  fetch('https://www.googleapis.com/geolocation/v1/geolocate?key=' + apiKey, { method: 'POST' })
    .then((response) => response.json())
    .then((data) => {
      if (data.location && typeof data.location.lat === 'number') {
        console.debug('[geolocation] IP-based geolocation succeeded.', {
          latitude: data.location.lat,
          longitude: data.location.lng,
          accuracy: data.accuracy,
        });
        mapAction({ coords: { latitude: data.location.lat, longitude: data.location.lng } });
      } else {
        console.warn(
          '[geolocation] IP-based geolocation returned no location; using default coordinates.',
          { DEFAULT_LAT, DEFAULT_LNG }
        );
        mapAction({ coords: { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG } });
      }
    })
    .catch((err) => {
      console.error('[geolocation] IP-based geolocation failed; using default coordinates.', err, {
        DEFAULT_LAT,
        DEFAULT_LNG,
      });
      mapAction({ coords: { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG } });
    });
}

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

  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((data) => {
      const result = data.results && data.results[0];
      if (result && result.geometry && result.geometry.location) {
        initMap({
          coords: {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          },
        });
      } else {
        console.warn('[geolocation] No usable geocode result; using raw browser coordinates.', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        initMap({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      }
    })
    .catch((err) => {
      console.error('[geolocation] Geocode API fetch failed; using raw browser coordinates.', err);
      initMap({
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
    });
}

function browserGeolocationFail(error) {
  console.warn('[geolocation] Browser geolocation failed; trying IP-based geolocation.', {
    code: error && error.code,
    message: error && error.message,
  });
  ipGeolocationFallback(initMap);
}

/**
 * Request the device's current position and hand off to `initMap`.
 * Only called once both the Maps API is loaded *and* the user has clicked Play.
 */
function startGeolocation() {
  console.debug('[geolocation] startGeolocation() called — starting geolocation flow.');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      browserGeolocationSuccess,
      browserGeolocationFail,
      GEO_OPTIONS
    );
  } else {
    console.warn(
      '[geolocation] navigator.geolocation is not available; using IP-based geolocation.'
    );
    ipGeolocationFallback(initMap);
  }
}

/**
 * Called automatically by the Google Maps JS API via `callback=getLocation`.
 * Marks the Maps API as ready and starts geolocation only if the user has
 * already clicked Play; otherwise defers to the Play button handler.
 */
function getLocation() {
  console.debug('[geolocation] getLocation() called — Maps API is ready.');
  mapsReady = true;
  if (userReady) {
    startGeolocation();
  }
}

// ---------------------------------------------------------------------------
// Find Me
// ---------------------------------------------------------------------------

function findMeGeolocationSuccess(position) {
  console.debug('[geolocation] Find Me: browser geolocation succeeded.', {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  });

  const geocodeUrl =
    'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
    position.coords.latitude +
    ',' +
    position.coords.longitude +
    '&key=' +
    apiKey;

  const mapAction = state.map === null ? initMap : relocate;

  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((data) => {
      const result = data.results && data.results[0];
      if (result && result.geometry && result.geometry.location) {
        mapAction({
          coords: {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          },
        });
      } else {
        console.warn('[geolocation] Find Me: no usable geocode result; using raw coordinates.');
        mapAction({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      }
    })
    .catch((err) => {
      console.error('[geolocation] Find Me: geocode fetch failed; using raw coordinates.', err);
      mapAction({
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
    });
}

function findMeGeolocationFail(error) {
  console.warn('[geolocation] Find Me: browser geolocation failed.', {
    code: error && error.code,
    message: error && error.message,
  });
  if (state.map === null) {
    // Map hasn't been initialised yet — try IP-based geolocation before
    // falling back to the hard-coded default coordinates.
    console.warn('[geolocation] Find Me: map not yet initialised; trying IP-based geolocation.');
    ipGeolocationFallback(initMap);
    return;
  }
  const titleAlert = document.getElementById('title-alert');
  if (titleAlert) {
    titleAlert.textContent = 'Location unavailable';
    titleAlert.style.display = 'block';
    setTimeout(() => {
      titleAlert.textContent = '';
      titleAlert.style.display = 'none';
    }, 3000);
  }
}

/**
 * Request the device's current position and move the game to that location.
 * Exposed on `window` so the find-me button wired in map.js can call it.
 */
function findMe() {
  console.debug('[geolocation] findMe() called — requesting current position.');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      findMeGeolocationSuccess,
      findMeGeolocationFail,
      GEO_OPTIONS
    );
  } else {
    console.warn('[geolocation] findMe: navigator.geolocation is not available.');
    const titleAlert = document.getElementById('title-alert');
    if (titleAlert) {
      titleAlert.textContent = 'Geolocation not supported';
      titleAlert.style.display = 'block';
      setTimeout(() => {
        titleAlert.textContent = '';
        titleAlert.style.display = 'none';
      }, 3000);
    }
  }
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

// Expose getLocation globally so the Maps API `callback=getLocation` works.
window.getLocation = getLocation;

// Expose findMe globally so the find-me button wired in map.js can call it.
window.findMe = findMe;

// Register device-orientation listeners for mobile tilt-to-move.
registerTiltListener();

// ---------------------------------------------------------------------------
// Intro screen — wire up the Play button
// ---------------------------------------------------------------------------

const playBtn = document.getElementById('play-btn');
const introEl = document.getElementById('intro');

if (playBtn && introEl) {
  playBtn.addEventListener('click', () => {
    console.debug('[intro] Play clicked — hiding intro and starting game.');
    introEl.style.display = 'none';
    userReady = true;
    if (mapsReady) {
      startGeolocation();
    }
  });
}
