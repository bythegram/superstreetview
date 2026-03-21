/**
 * Timer module.
 *
 * Manages the countdown timer that enforces a time-limit per life.
 * When the timer expires:
 *   - If the player has lives remaining and is out-of-bounds ('outta'), they are
 *     returned to the start and a wormhole is added; otherwise one life is deducted.
 *   - If the player has no lives left, the game-over overlay is shown.
 */

import { state } from './state.js';
import { addWormhole } from './markers.js';

/** Handle for the active setInterval so it can be cleared on restart. */
let myTimer = null;

/**
 * Start (or restart) the countdown timer.
 *
 * Clears any previously running timer, then ticks every second, updating
 * `_display` with the remaining time in MM:SS format.
 *
 * @param {number} _duration - Duration in seconds.
 * @param {HTMLElement} _display - Element whose textContent will be updated.
 */
export function startTimer(_duration, _display) {
  if (myTimer !== null) {
    clearInterval(myTimer);
    myTimer = null;
  }

  let timer = _duration;
  myTimer = setInterval(function () {
    if (!document.getElementById('time').classList.contains('pauseInterval')) {
      let minutes = Math.floor(timer / 60);
      let seconds = Math.floor(timer % 60);
      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;
      _display.textContent = minutes + ':' + seconds;
      if (--timer < 0) {
        const livesEl = document.getElementById('lives');
        const lives = parseInt(livesEl.textContent, 10);
        if (lives === 0) {
          clearInterval(myTimer);
          myTimer = null;
          const highscoreEl = document.getElementById('highscore');
          const scoreEl = document.getElementById('score');
          const currentScore = parseInt(scoreEl.dataset.score, 10);
          const storedHigh = parseInt(highscoreEl.textContent, 10);
          if (currentScore > storedHigh) {
            highscoreEl.textContent = currentScore;
          }
          document.getElementById('gameover').style.display = 'block';
          document.getElementById('restart-btn').focus();
        } else {
          timer = _duration;
          if (document.getElementById('score').classList.contains('outta')) {
            state.map.setCenter(state.firstCenter);
            state.panorama.setPosition(state.firstCenter);
            addWormhole(state.origPos, 500);
            document.getElementById('score').classList.remove('outta');
          } else {
            livesEl.textContent = lives - 1;
          }
        }
      }
    }
  }, 1000);
}
