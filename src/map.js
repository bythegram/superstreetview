/**
 * Map module — initialises the Google Maps map and Street View panorama.
 */

import { state } from './state.js';
import { startTimer } from './timer.js';
import { addWormhole, addBunch } from './markers.js';

/**
 * Initialise the map and panorama centred on `position`, then seed the
 * initial set of markers.
 *
 * This function is the `callback` target for the Google Maps script tag so it
 * is reached only after the Maps JS API has fully loaded.
 *
 * @param {{ coords: { latitude: number, longitude: number } }} position
 */
export function initMap(position) {
  const scoreEl = document.getElementById('score');
  const localScore = localStorage.getItem('score');

  if (localScore) {
    scoreEl.textContent = localScore;
    scoreEl.dataset.score = localScore;
  } else {
    scoreEl.textContent = '0';
    scoreEl.dataset.score = '0';
  }

  state.firstCenter = { lat: position.coords.latitude, lng: position.coords.longitude };

  state.map = new google.maps.Map(document.getElementById('map'), {
    center: state.firstCenter,
    zoom: 16,
    streetViewControl: false,
    disableDefaultUI: true,
    draggable: false,
    scrollwheel: false,
  });

  state.panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), {
    position: state.firstCenter,
    pov: { heading: 34, pitch: 10 },
    addressControl: false,
    fullscreenControl: false,
    zoomControl: false,
    panControl: false,
  });

  const oneMinute = 60;
  const display = document.getElementById('time');
  startTimer(oneMinute, display);

  state.origPos = position;

  for (let i = 1; i < 8; i++) {
    const rand = Math.floor(Math.random() * 10) + 1;
    addWormhole(state.origPos, rand * 100);
  }
  for (let i = 1; i < 9; i++) {
    addBunch(state.origPos);
  }

  state.map.setStreetView(state.panorama);

  state.panorama.addListener('position_changed', function () {
    state.map.setCenter(state.panorama.getPosition());
  });

  const styles = [
    {
      stylers: [{ hue: '#eee' }, { saturation: -100 }],
    },
    {
      featureType: 'all',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ];

  state.map.setOptions({ styles });
}
