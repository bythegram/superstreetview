/**
 * Map module — initialises the Google Maps map and Street View panorama.
 */

import { state, markers, smlMarkers, coins, smlCoins } from './state.js';
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

  document.getElementById('restart-btn').addEventListener('click', restartGame);
  document.getElementById('end-game-btn').addEventListener('click', showGameOver);
}

/**
 * Show the Game Over overlay.
 *
 * Syncs the high-score display with the current score and reveals the overlay.
 * Called automatically when the timer expires, or manually via the end-game
 * button while the timer is disabled.
 */
export function showGameOver() {
  const scoreEl = document.getElementById('score');
  const highscoreEl = document.getElementById('highscore');
  const currentScore = parseInt(scoreEl.dataset.score, 10);
  const storedHigh = parseInt(highscoreEl.textContent, 10);
  if (currentScore > storedHigh) {
    highscoreEl.textContent = currentScore;
  }
  document.getElementById('gameover').style.display = 'block';
  // Move focus into the dialog so keyboard/AT users can interact with it
  document.getElementById('restart-btn').focus();
}

/**
 * Re-initialise the game state without reloading the page.
 *
 * Clears all existing markers, resets the score, level and lives counters,
 * returns the panorama to the starting location, and re-seeds the initial
 * set of rockets and diamonds.
 */
export function restartGame() {
  // Hide the game over screen.
  document.getElementById('gameover').style.display = 'none';

  // Reset current score and clear the persisted value in localStorage.
  const scoreEl = document.getElementById('score');
  scoreEl.textContent = '0';
  scoreEl.dataset.score = '0';
  localStorage.removeItem('score');

  // Reset the level counter.
  document.body.classList.remove('level' + state.level);
  state.level = 1;

  // Reset lives counter.
  document.getElementById('lives').textContent = '1';

  // Remove all rocket markers from both layers.
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
    smlMarkers[i].setMap(null);
  }
  markers.length = 0;
  smlMarkers.length = 0;

  // Remove all coin markers from both layers.
  for (let i = 0; i < coins.length; i++) {
    if (coins[i]) coins[i].setMap(null);
    if (smlCoins[i]) smlCoins[i].setMap(null);
  }
  coins.length = 0;
  smlCoins.length = 0;

  // Clear any out-of-bounds state.
  scoreEl.classList.remove('outta');
  document.getElementById('time').classList.remove('pauseInterval');

  // Hide the location title alert if it was showing.
  const titleAlert = document.getElementById('title-alert');
  titleAlert.textContent = '';
  titleAlert.style.display = 'none';

  // Return the panorama and mini-map to the player's starting location.
  state.panorama.setPosition(state.firstCenter);
  state.map.setCenter(state.firstCenter);

  // Restart the countdown timer.
  const oneMinute = 60;
  const display = document.getElementById('time');
  startTimer(oneMinute, display);

  // Re-seed the initial set of rocket (wormhole) markers.
  for (let i = 1; i < 8; i++) {
    const rand = Math.floor(Math.random() * 10) + 1;
    addWormhole(state.origPos, rand * 100);
  }

  // Re-seed the initial set of diamond (coin) markers.
  for (let i = 1; i < 9; i++) {
    addBunch(state.origPos);
  }

  // Return focus to the game area for keyboard/AT users
  document.getElementById('pano').focus();
}
