/**
 * Score module — handles score display, high-score tracking, and level-ups.
 */

import { state } from './state.js';
import { addWormhole } from './markers.js';

/** Increment the player's score by one and handle level-up side-effects. */
export function upScore() {
  const plusOneEl = document.getElementById('plusOne');
  plusOneEl.style.display = 'inline';
  setTimeout(() => {
    plusOneEl.style.display = 'none';
  }, 500);

  const scoreEl = document.getElementById('score');
  const score = parseInt(scoreEl.dataset.score, 10);
  const newScore = score + 1;
  scoreEl.textContent = newScore;
  scoreEl.dataset.score = newScore;

  const highscoreEl = document.getElementById('highscore');
  const highScore = parseInt(highscoreEl.textContent, 10);
  if (newScore > highScore) {
    highscoreEl.textContent = newScore;
  }

  if (newScore % 10 === 0) {
    const plusLiveEl = document.getElementById('plusLive');
    plusLiveEl.style.display = 'inline';
    setTimeout(() => {
      plusLiveEl.style.display = 'none';
    }, 500);

    const livesEl = document.getElementById('lives');
    const lives = parseInt(livesEl.textContent, 10) + 1;
    livesEl.textContent = lives;

    document.body.classList.remove('level' + state.level);
    state.level++;

    for (let i = 1; i < 9; i++) {
      const rand = Math.floor(Math.random() * state.level * 10) + 1;
      addWormhole(state.origPos, rand * 100);
    }

    document.body.classList.add('level' + state.level);
  }

  localStorage.setItem('score', newScore);
}
