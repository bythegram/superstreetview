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

- ✅ **`moveForward` uses an implicit global `i`** (`game.js` line 153) — _Resolved_  
  Changed `for(i=0;` to `for(let i=0;`.

- ✅ **`addWormhole` declares `markerPos2` but never uses it** (`game.js` line 186) — _Resolved_  
  Removed the unused `markerPos2` declaration from `addWormhole`.

- ✅ **Timer is entirely commented out** (`game.js` lines 363–399) — _Resolved_  
  The countdown timer has been restored in `src/timer.js`. The interval now ticks every second, deducting a life on expiry (or returning the player to origin if out-of-bounds), and shows the game-over overlay when lives reach zero.

- ✅ **`upScore` reads `#highscore` and checks `(highScore + 1) % 10`** (`game.js` line 329) — _Resolved_  
  The condition now uses `newScore % 10 === 0`, triggering level-up correctly every 10 points scored in the current session.

- ✅ **`jQuery.post()` used for GET-style requests** (`game.js` lines 23, 36, 231) — _Resolved_  
  The Google Geocoding and Geolocation APIs were called with `$.post()`. Replaced with native `fetch()` using the correct HTTP methods (`GET` for Geocoding, `POST` for Geolocation).

### Low

- ✅ **`localStorage` score is never reset on new game** — _Resolved_  
  `restartGame()` clears the persisted `score` key from `localStorage` when the player starts a new game via the "Play Again" button.

---

## 🚀 Improvements

### Architecture / Code Quality

- ✅ **Replace `var` with `let` / `const` throughout `game.js`** — _Resolved_  
  All variables now use `const` or `let` as appropriate.

- ✅ **Remove jQuery dependency** — _Resolved_  
  jQuery 3.4.1 has been removed. All DOM queries, class manipulation, AJAX calls, and timers now use native browser APIs (`fetch`, `document.getElementById`, `classList`, `setTimeout`, `dataset`, `style`).

- **Extract configuration into a single config object or `.env` file**  
  Constants such as `lat`, `lng`, `apiKey`, marker URLs, and level thresholds are scattered throughout the file. Centralising them makes tuning easier and reduces the chance of inconsistency.

- ✅ **Modularise `game.js` with ES modules or a bundler** — _Resolved_  
  `game.js` has been split into seven ES modules under `src/` (`config.js`, `state.js`, `map.js`, `markers.js`, `score.js`, `timer.js`, `movement.js`) with `src/main.js` as the Vite entry point. Static assets moved to `public/`. The build outputs a minified, tree-shaken bundle in `dist/`.

- ✅ **Add a linter and formatter** — _Resolved_  
  ESLint 9 (flat config, `eslint:recommended` + `eslint-config-prettier`) and Prettier 3 are configured as `devDependencies`. A dedicated `lint` CI job runs `npm run lint` and `npm run format:check` before every deploy.

- **Replace Font Awesome Pro CDN link** (`index.html` line 9)  
  The current link requires a valid Font Awesome Pro subscription token to load. Replacing it with the free CDN or self-hosted SVGs removes the external dependency.

### Features

- ✅ **Restart / play again button on the "Game Over" screen** — _Resolved_  
  A "Play Again" button now appears on the Game Over screen. Clicking it calls `restartGame()`, which resets the score, level, lives, and all markers then re-seeds the starting location — no page reload required.

- **Mobile tilt-to-move**  
  The `tilt()` and `DeviceOrientationEvent` handler exist in the code but `tilt()` currently calls `moveForward()` on any positive β value, causing continuous movement. Add a dead-zone threshold and test on real mobile devices.

- **Multiplayer / leaderboard support**  
  The score is stored only in `localStorage`. Adding a lightweight backend (e.g., a serverless function + database) to record and display high scores globally would increase engagement.

- ✅ **Accessibility improvements**  
  Added `lang="en"` and `<meta name="viewport">` to the HTML document; a skip-navigation link for keyboard users; semantic `role` attributes (`complementary`, `application`, `dialog`, `timer`, `status`); `aria-live` regions for score updates and location alerts; `aria-modal` and focus management for the game-over dialog; `aria-hidden` on all decorative icons; a `.sr-only` utility class for visually hidden labels; WCAG 2.1 AA colour-contrast fixes (restart button changed from white to black text on `#00ff66`; dark semi-transparent background added to the HUD panel so `#00ff66` text is readable over variable Street View imagery); and `:focus-visible` outlines on all interactive elements.

- ✅ **Progressive Web App (PWA)**  
  Added `public/manifest.json` (name, icons, theme colour, display mode) and `public/sw.js` (cache-first service worker that pre-caches the app shell and caches same-origin assets on demand). The service worker is registered in `src/main.js` on the `load` event. Two PNG app icons (192 × 192 and 512 × 512) were added under `public/icons/`.

### Security & Privacy

- ✅ **Add a `Content-Security-Policy` header**  
  A `<meta http-equiv="Content-Security-Policy">` tag was added to `index.html`. It sets `default-src 'self'` and adds explicit allowlists for Google Maps, Google Fonts, and Font Awesome (the only required external origins). `object-src 'none'`, `base-uri 'self'`, and `form-action 'self'` are included to block the most common injection vectors.

---

## ✅ Best Practices Checklist

| Practice | Status |
|---|---|
| API keys stored in environment variables, not source | ⚠️ Partial – key restricted to GitHub Pages referrer domain |
| `let`/`const` instead of `var` | ✅ Done |
| ESLint + Prettier configured | ✅ Done |
| No unused variables | ✅ Done |
| Timer and lives system fully working | ✅ Done |
| Restart / play again button on Game Over screen | ✅ Done |
| `localStorage` score reset on new game | ✅ Done |
| All external assets served locally or from a CDN with SRI | ⚠️ Partial |
| `Content-Security-Policy` header set | ✅ Done |
| Google Analytics 4 (replace UA) | ✅ Done |
| PWA manifest + service worker | ✅ Done |
| README with setup instructions | ✅ Done |
| `.gitignore` present | ✅ Done |
| Open-source license declared | ❌ TODO |
| jQuery removed (vanilla JS) | ✅ Done |
| Accessibility (ARIA, keyboard nav, WCAG AA contrast) | ✅ Done |
