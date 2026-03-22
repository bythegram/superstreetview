# Agent Skills

This document describes the automated agent capabilities available for the **Super Street View** repository. Agents can be used by contributors and maintainers to accelerate development tasks.

---

## Available Agent Skills

### 1. Code Review

**Trigger:** Open a pull request or run the review agent manually.  
**What it does:**
- Analyses the `src/` modules (`main.js`, `map.js`, `markers.js`, `score.js`, `timer.js`, `movement.js`), `style.css`, and `index.html` for code-quality issues.
- Flags undeclared variables, dead code, unused variables, and implicit globals.
- Checks for exposed credentials or API keys.
- Verifies that `let`/`const` is preferred over `var`.
- Reports violations with file name and line number.

**Output:** A list of annotated findings with severity (`critical`, `medium`, `low`) and a suggested fix for each.

---

### 2. Security Scan

**Trigger:** Runs automatically on every push; can also be triggered manually.  
**What it does:**
- Scans source files for hardcoded secrets, API keys, and tokens using pattern matching.
- Verifies that no credentials appear in `.gitignore`-excluded files that have accidentally been committed.
- Checks `index.html` for missing `Content-Security-Policy` meta tags.
- Verifies that the Google Maps API key is domain-restricted in Google Cloud Console.

**Output:** A security report listing each finding with its file, line, and recommended remediation.

---

### 3. Dependency Audit

**Trigger:** Manual or scheduled weekly.  
**What it does:**
- Parses CDN URLs in `index.html` (Font Awesome, Google Fonts) and resolves them to versioned package identifiers.
- Queries the [GitHub Advisory Database](https://github.com/advisories) for known CVEs in those versions.
- Checks whether Subresource Integrity (`integrity=`) attributes are present on all external `<script>` and `<link>` tags.

**Output:** A table of dependencies with their current version, latest version, and any known vulnerabilities.

---

### 4. Documentation Generator

**Trigger:** Manual, or when source files change significantly.  
**What it does:**
- Reads each `src/` module and generates JSDoc-style comments for each public function.
- Updates the function reference section of this file with signatures, parameters, return values, and a one-line description.
- Detects functions that lack inline comments and flags them for human review.

**Output:** Updated source files with JSDoc comments and/or a generated API reference document.

---

### 5. ROADMAP Updater

**Trigger:** Manual or when a bug-fix PR is merged.  
**What it does:**
- Cross-references merged pull request titles and linked issues against items in `ROADMAP.md`.
- Marks completed items with ✅ and the merge date.
- Proposes new items based on recurring themes in recent issues and PR descriptions.

**Output:** A diff to `ROADMAP.md` with completed items ticked off and new items appended.

---

### 6. Performance Profiler

**Trigger:** Manual.  
**What it does:**
- Measures the total size of all assets served to the browser (HTML, JS, CSS, images).
- Identifies unminified files and estimates savings from minification and compression.
- Checks whether images in `icons/` can be converted to a more efficient format (e.g., WebP instead of GIF/PNG).

**Output:** A performance report with current vs. optimised asset sizes and actionable recommendations.

---

### 7. Documentation Updater

**Trigger:** Required on every pull request or code change; can also be run manually.  
**What it does:**
- Reviews all changes made to source files (`src/main.js`, `src/map.js`, `src/markers.js`, `src/score.js`, `src/timer.js`, `src/movement.js`, `src/state.js`, `src/config.js`, `index.html`, `style.css`, `public/collections_en.json`, etc.).
- Updates `README.md` to reflect any changes to the tech stack, project structure, prerequisites, or setup steps.
- Updates `ROADMAP.md` to mark completed items (✅), revise in-progress items, and add new items based on changes or issues introduced by the code change.
- Ensures that both documents are accurate and consistent with the current state of the codebase after every commit.

**Output:** Updated `README.md` and/or `ROADMAP.md` committed alongside (or immediately after) the code change.

---

## Function Reference (`src/`)

The codebase is split across eight ES modules under `src/`. Key exported functions are listed below.

### `src/main.js`

| Function | Parameters | Description |
|---|---|---|
| `getLocation()` | – | Maps API `callback` target. Sets `mapsReady = true` and starts geolocation if the user has already clicked Play. Exposed on `window`. |
| `findMe()` | – | Requests the device's current position and moves the game to that location mid-session. Exposed on `window`. |

### `src/map.js`

| Function | Parameters | Description |
|---|---|---|
| `initMap(position)` | `position` – `{coords:{latitude,longitude}}` | Initialises the Google Map and Street View panorama, seeds 7 rockets + 8 diamonds, and starts the 60 s countdown timer. |
| `showGameOver()` | – | Syncs the high-score display and reveals the game-over overlay; moves keyboard focus to the restart button. |
| `restartGame()` | – | Clears all markers, resets score/level/lives, returns the panorama to the start, and re-seeds the initial marker set — no page reload required. |
| `relocate(position)` | `position` – `{coords:{latitude,longitude}}` | Moves the game to a new location without resetting the score or timer. Used by the "Find Me" button. |

### `src/markers.js`

| Function | Parameters | Description |
|---|---|---|
| `addWormhole(position, d)` | `position` – position object; `d` – radius in metres | Places a rocket marker at a random location within `d` metres of `position`. On click, teleports the player to a random Street View location from `collections_en.json`. |
| `addBunch(position)` | `position` – position object | Places a diamond marker near `position`. On click, increments the score and spawns three new diamonds nearby. |
| `clearMarkers()` | – | Removes all rocket markers from both the panorama and mini-map layers. |
| `clearCoin(id)` | `id` – integer | Removes the diamond marker pair identified by `id` from both layers. |
| `setMapOnAll(targetMap)` | `targetMap` – `google.maps.Map` or `null` | Sets (or clears) the map reference for every rocket marker and its mini-map counterpart. |

### `src/score.js`

| Function | Parameters | Description |
|---|---|---|
| `upScore()` | – | Increments the score by 1, persists it to `localStorage`, updates the high-score display, and triggers a level-up (+ spawns 8 rockets) every 10 points. |

### `src/timer.js`

| Function | Parameters | Description |
|---|---|---|
| `startTimer(duration, display)` | `duration` – seconds; `display` – DOM element | Starts (or restarts) a countdown timer that ticks every second. On expiry: returns out-of-bounds players to start, deducts a life, or shows game-over when lives reach zero. |

### `src/movement.js`

| Function | Parameters | Description |
|---|---|---|
| `moveForward(pano)` | `pano` – `StreetViewPanorama` | Advances the panorama one step towards the adjacent node closest to the current heading. |
| `difference(link)` | `link` – Street View link object | Returns the angular difference (0–180°) between the panorama's current heading and a link's heading. |
| `tilt(x)` | `x` – device β angle | Triggers `moveForward` when the device is tilted forward (positive β). |
| `registerTiltListener()` | – | Registers a `deviceorientation` event listener that calls `tilt()` on each orientation update. |
