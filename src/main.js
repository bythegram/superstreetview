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

      const result = success.results && success.results[0];
      if (result && result.geometry && result.geometry.location) {
        console.debug('[geolocation] Selected result[0]:', {
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
          '[geolocation] No usable result at index 0; falling back to default coordinates.',
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
 * Only called once both the Maps API is loaded *and* the user has clicked Play.
 */
function startGeolocation() {
  console.debug('[geolocation] startGeolocation() called — starting geolocation flow.');
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
    initMap({ coords: { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG } });
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
  console.debug(
    '[geolocation] Find Me: fetching reverse-geocode:',
    geocodeUrl.replace(apiKey, '<redacted>')
  );

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
    console.warn(
      '[geolocation] Find Me: map not yet initialised; falling back to default coordinates.',
      { DEFAULT_LAT, DEFAULT_LNG }
    );
    initMap({ coords: { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG } });
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
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      findMeGeolocationSuccess,
      findMeGeolocationFail,
      options
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
      findMe();
    }
  });
}
