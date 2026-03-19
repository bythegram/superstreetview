/**
 * Markers module — creates, manages and removes map markers for rockets
 * (wormholes) and diamonds (coins).
 */

import { markers, smlMarkers, coins, smlCoins, state, uniqueId } from './state.js';
import { upScore } from './score.js';

// ---------------------------------------------------------------------------
// Rocket / wormhole markers
// ---------------------------------------------------------------------------

/**
 * Place a rocket marker at a random location within `d` metres of `position`.
 *
 * @param {{ coords: { latitude: number, longitude: number } }} position
 * @param {number} [d=200]  Approximate radius in metres.
 */
export function addWormhole(position, d) {
  const hard = d || 200;
  const r = hard / 111300;
  const y0 = position.coords.latitude;
  const x0 = position.coords.longitude;
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y1 = w * Math.sin(t);
  const x1 = x / Math.cos(y0);

  const markerPos = { lat: y0 + y1, lng: x0 + x1 };

  const workMarker = new google.maps.Marker({
    position: markerPos,
    map: state.panorama,
    icon: { url: 'icons/rocket.gif' },
  });
  const workMarkersml = new google.maps.Marker({
    position: markerPos,
    map: state.map,
    icon: 'icons/crystalgreen.png',
  });

  google.maps.event.addListener(workMarker, 'click', function () {
    clearMarkers();
    markers.length = 0;
    smlMarkers.length = 0;

    const scoreEl = document.getElementById('score');

    if (scoreEl.classList.contains('outta')) {
      state.map.setCenter(state.firstCenter);
      state.panorama.setPosition(state.firstCenter);
      scoreEl.classList.remove('outta');
      document.getElementById('time').classList.remove('pauseInterval');

      const titleAlert = document.getElementById('title-alert');
      titleAlert.textContent = '';
      titleAlert.style.display = 'none';

      for (let i = 1; i < 3; i++) {
        const rand = Math.floor(Math.random() * state.level * 10) + 1;
        addWormhole(state.origPos, rand * 100);
      }
    } else {
      upScore();

      const panoEl = document.getElementById('pano');
      panoEl.style.pointerEvents = 'none';

      fetch('collections_en.json')
        .then((response) => response.json())
        .then((data) => {
          // data['1'] is the array of location collections;
          // each entry's title is at ['1'], and lat/lng coords are at ['5']['2']['3']['1']/['2']
          const locations = data['1'];
          const rand = locations[Math.floor(Math.random() * locations.length)];
          const json = [
            {
              lat: rand['5']['2']['3']['1'],
              lng: rand['5']['2']['3']['2'],
              title: rand['1'],
            },
          ];

          state.map.setCenter({ lat: json[0].lat, lng: json[0].lng });
          state.panorama.setPosition({ lat: json[0].lat, lng: json[0].lng });
          const newPos = { coords: { latitude: json[0].lat, longitude: json[0].lng } };

          scoreEl.classList.add('outta');
          document.getElementById('time').classList.add('pauseInterval');

          const titleAlert = document.getElementById('title-alert');
          titleAlert.textContent = json[0].title;
          titleAlert.style.display = 'block';

          addWormhole(newPos, 1);
        })
        .catch(() => {
          panoEl.style.pointerEvents = 'inherit';
        });

      panoEl.style.pointerEvents = 'inherit';
    }
  });

  markers.push(workMarker);
  smlMarkers.push(workMarkersml);
}

// ---------------------------------------------------------------------------
// Diamond / coin markers
// ---------------------------------------------------------------------------

/**
 * Place a diamond marker at a random location near `position`.
 *
 * @param {{ coords: { latitude: number, longitude: number } }} position
 */
export function addBunch(position) {
  const rand = Math.floor(Math.random() * state.level * 10) + 1;
  const hard = rand * 100;
  const r = hard / 111300;
  const y0 = position.coords.latitude;
  const x0 = position.coords.longitude;
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y1 = w * Math.sin(t);
  const x1 = x / Math.cos(y0);

  const newY = y0 + y1;
  const newX = x0 + x1;
  const markerPos = { lat: newY, lng: newX };
  const markerPos2 = { coords: { latitude: newY, longitude: newX } };

  const id = uniqueId();

  const coinMarker = new google.maps.Marker({
    position: markerPos,
    map: state.panorama,
    icon: { url: 'icons/diamond.gif' },
  });
  const coinMarkersml = new google.maps.Marker({
    position: markerPos,
    map: state.map,
    icon: 'icons/crystalblue.png',
  });

  coins[id] = coinMarker;
  smlCoins[id] = coinMarkersml;

  google.maps.event.addListener(coinMarker, 'click', function () {
    clearCoin(id);
    upScore();

    for (let i = 1; i < 4; i++) {
      addBunch(markerPos2);
    }
  });
}

// ---------------------------------------------------------------------------
// Marker removal helpers
// ---------------------------------------------------------------------------

/** Set every rocket marker's map to `targetMap` (pass `null` to hide). */
export function setMapOnAll(targetMap) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(targetMap);
    smlMarkers[i].setMap(targetMap);
  }
}

/** Hide all rocket markers. */
export function clearMarkers() {
  setMapOnAll(null);
}

/** Hide the diamond marker pair identified by `id`. */
export function clearCoin(id) {
  coins[id].setMap(null);
  smlCoins[id].setMap(null);
}
