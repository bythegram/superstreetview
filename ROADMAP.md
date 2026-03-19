# Roadmap

This document tracks known bugs, planned improvements, and best-practice refactors for Super Street View, ordered roughly by priority.

---

## 🐛 Bug Fixes

### Critical

- ✅ **Exposed API key** (`game.js` line 16 & `index.html` line 43) — _Resolved_  
  The Google Maps API key has been locked down in Google Cloud Console to only accept requests from the GitHub Pages URL, preventing unauthorised use from other origins.

- ✅ **`json.php` fetches raw remote data without validation** — _Resolved_  
  The PHP backend has been removed entirely. `collections_en.json` is now bundled locally in the repository and loaded directly by the client via `jQuery.getJSON('collections_en.json', ...)`, eliminating the server-side vulnerability.

### Medium

- **`moveForward` uses an implicit global `i`** (`game.js` line 153)  
  The `for` loop is missing a `var`/`let` declaration for `i`, leaking it into the global scope.  
  _Fix:_ Change `for(i=0;` to `for(let i=0;`.

- **`addWormhole` and `addBunch` declare `markerPos2` but never use it** (`game.js` lines 186, 278)  
  Dead code increases cognitive load and maintenance cost.  
  _Fix:_ Remove both unused `markerPos2` declarations.

- **Timer is entirely commented out** (`game.js` lines 363–399)  
  The countdown timer that enforces a time-limit per life is disabled, making the game infinite and removing any urgency.  
  _Fix:_ Restore the timer logic, test the lives/game-over flow end-to-end, then remove the dead comment block.

- **`upScore` reads `#highscore` and checks `(highScore + 1) % 10`** (`game.js` line 329)  
  The condition uses the `highScore` variable (read from the game-over overlay element) rather than `newScore`, causing the level-up trigger to fire based on the best-ever score rather than the current session score.  
  _Fix:_ Replace the `highScore` reference in the level-up modulo check with `newScore` directly.

- **`jQuery.post()` used for GET-style requests** (`game.js` lines 23, 36, 231)  
  The Google Geocoding and Geolocation APIs are called with `$.post()`. These are GET requests; using POST may fail or produce unexpected results.  
  _Fix:_ Use `$.getJSON()` or `$.ajax({ method: 'GET' })` with the correct URL and parameters.

### Low

- **`localStorage` score is never reset on new game**  
  After "Game Over" the persisted score is not cleared, so the score counter on a fresh reload starts at the last session's value.  
  _Fix:_ Clear or reset the `score` key in `localStorage` when a new game begins.

---

## 🚀 Improvements

### Architecture / Code Quality

- **Replace `var` with `let` / `const` throughout `game.js`**  
  All variables currently use `var`, which has function scope and allows accidental re-declaration. Switching to `const`/`let` prevents a class of bugs and makes intent clearer.

- **Extract configuration into a single config object or `.env` file**  
  Constants such as `lat`, `lng`, `apiKey`, marker URLs, and level thresholds are scattered throughout the file. Centralising them makes tuning easier and reduces the chance of inconsistency.

- **Modularise `game.js` with ES modules or a bundler**  
  All game logic lives in one 430-line file with no module boundaries. Splitting into logical modules (e.g., `map.js`, `markers.js`, `score.js`, `timer.js`) and bundling with Vite, Rollup, or esbuild would improve maintainability and enable tree-shaking.

- **Remove jQuery dependency**  
  jQuery 3.4.1 is included solely for `$.post()` and basic DOM selectors. The equivalent native `fetch()` and `document.getElementById()` / `querySelectorAll()` calls are available in every modern browser, eliminating a ~30 KB dependency.

- **Add a linter and formatter**  
  Adopt [ESLint](https://eslint.org/) (with the `eslint:recommended` ruleset) and [Prettier](https://prettier.io/) to enforce consistent style automatically. Add them as `devDependencies` in a `package.json` and run them in CI.

- **Replace Font Awesome Pro CDN link** (`index.html` line 9)  
  The current link requires a valid Font Awesome Pro subscription token to load. Replacing it with the free CDN or self-hosted SVGs removes the external dependency.

### Features

- **Restart / play again button on the "Game Over" screen**  
  Currently the only way to restart is a full page reload. A button that re-initialises game state provides a better user experience.

- **Mobile tilt-to-move**  
  The `tilt()` and `DeviceOrientationEvent` handler exist in the code but `tilt()` currently calls `moveForward()` on any positive β value, causing continuous movement. Add a dead-zone threshold and test on real mobile devices.

- **Multiplayer / leaderboard support**  
  The score is stored only in `localStorage`. Adding a lightweight backend (e.g., a serverless function + database) to record and display high scores globally would increase engagement.

- **Accessibility improvements**  
  The game currently has no ARIA labels, keyboard navigation, or colour-contrast compliance. Add semantic HTML, `aria-live` regions for score updates, and ensure at least WCAG 2.1 AA colour contrast on all text.

- **Progressive Web App (PWA)**  
  Add a `manifest.json` and a service worker so the game can be installed to the home screen and caches assets for offline play.

### Security & Privacy

- **Add a `Content-Security-Policy` header**  
  Restrict which origins can load scripts, styles, and images by setting a strict CSP meta tag or HTTP header.

- **Replace Google Analytics Universal Analytics (`ga()`)**  
  UA (Universal Analytics) was sunset in July 2023. Migrate to Google Analytics 4 (`gtag.js`) or a privacy-respecting alternative such as [Plausible](https://plausible.io/) or [Fathom](https://usefathom.com/).

---

## ✅ Best Practices Checklist

| Practice | Status |
|---|---|
| API keys stored in environment variables, not source | ⚠️ Partial – key restricted to GitHub Pages referrer domain |
| `let`/`const` instead of `var` | ❌ TODO |
| ESLint + Prettier configured | ❌ TODO |
| No unused variables | ❌ TODO |
| Timer and lives system fully working | ❌ TODO |
| All external assets served locally or from a CDN with SRI | ⚠️ Partial |
| `Content-Security-Policy` header set | ❌ TODO |
| Google Analytics 4 (replace UA) | ❌ TODO |
| PWA manifest + service worker | ❌ TODO |
| README with setup instructions | ✅ Done |
| `.gitignore` present | ✅ Done |
| Open-source license declared | ❌ TODO |
