/**
 * Shared mutable game state.
 *
 * All modules that need to read or write the live panorama, map, or marker
 * arrays import from here so there is a single source of truth.
 */

/** Street-View markers (panorama layer). */
export const markers = [];
/** Small map markers corresponding to rockets. */
export const smlMarkers = [];

/** Street-View coin markers (panorama layer). */
export const coins = [];
/** Small map markers corresponding to diamonds. */
export const smlCoins = [];

/**
 * Central game-state object.  Using an object lets any module mutate the
 * values via property assignment without needing separate setter exports.
 */
export const state = {
  /** google.maps.StreetViewPanorama instance. */
  panorama: null,
  /** google.maps.Map instance. */
  map: null,
  /** LatLng of the player's starting location. */
  firstCenter: null,
  /** Raw position object from the Geolocation API. */
  origPos: null,
  /** Current game level (increases every 10 points). */
  level: 1,
};

/** Monotonically-increasing ID generator for coin markers. */
let currentId = 0;
export const uniqueId = () => ++currentId;
