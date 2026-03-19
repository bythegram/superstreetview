# Agent Skills

This document describes the automated agent capabilities available for the **Super Street View** repository. Agents can be used by contributors and maintainers to accelerate development tasks.

---

## Available Agent Skills

### 1. Code Review

**Trigger:** Open a pull request or run the review agent manually.  
**What it does:**
- Analyses `game.js`, `style.css`, `index.html`, and `json.php` for code-quality issues.
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
- Checks PHP files for unsafe `file_get_contents` calls on remote URLs, missing output sanitisation, and missing `Content-Type` headers.
- Verifies that no credentials appear in `.gitignore`-excluded files that have accidentally been committed.
- Checks `index.html` for missing `Content-Security-Policy` meta tags.

**Output:** A security report listing each finding with its file, line, and recommended remediation.

---

### 3. Dependency Audit

**Trigger:** Manual or scheduled weekly.  
**What it does:**
- Parses CDN URLs in `index.html` (jQuery, Font Awesome, Google Fonts) and resolves them to versioned package identifiers.
- Queries the [GitHub Advisory Database](https://github.com/advisories) for known CVEs in those versions.
- Checks whether Subresource Integrity (`integrity=`) attributes are present on all external `<script>` and `<link>` tags.

**Output:** A table of dependencies with their current version, latest version, and any known vulnerabilities.

---

### 4. Documentation Generator

**Trigger:** Manual, or when source files change significantly.  
**What it does:**
- Reads `game.js` and generates JSDoc-style comments for each public function.
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

## Function Reference (`game.js`)

| Function | Parameters | Description |
|---|---|---|
| `getLocation()` | – | Entry point. Requests browser geolocation and dispatches to `browserGeolocationSuccess` or `browserGeolocationFail`. |
| `browserGeolocationSuccess(position)` | `position` – GeolocationPosition | Reverse-geocodes the browser position to the nearest intersection, then calls `initMap`. |
| `browserGeolocationFail()` | – | Falls back to Google Geolocation API. On failure, falls back to hardcoded Toronto coordinates. |
| `initMap(position)` | `position` – `{coords: {latitude, longitude}}` | Initialises the Google Map and Street View panorama, starts the timer, and seeds the initial markers. |
| `addWormhole(position, d)` | `position` – position object; `d` – radius in metres | Places a rocket marker on the panorama and mini-map. On click, teleports the player to a random Street View location. |
| `addBunch(position)` | `position` – position object | Places a diamond marker. On click, increments the score and spawns three new diamonds nearby. |
| `upScore()` | – | Increments the score, updates `localStorage`, checks for a level-up, and spawns new rocket markers when a level is reached. |
| `startTimer(duration, display)` | `duration` – seconds; `display` – jQuery element | Countdown timer (currently commented out). Decrements remaining time and triggers Game Over when time runs out and no lives remain. |
| `clearMarkers()` | – | Removes all rocket markers from the map and panorama. |
| `clearCoin(id)` | `id` – integer | Removes a specific diamond marker by its array index. |
| `setMapOnAll(map)` | `map` – google.maps.Map or null | Helper that sets (or unsets) the map for every rocket marker and its mini-map counterpart. |
| `moveForward(pano)` | `pano` – StreetViewPanorama | Advances the panorama to the adjacent Street View node closest to the current heading. |
| `difference(link)` | `link` – Street View link object | Returns the angular difference (in degrees) between the current panorama heading and a link's heading. |
| `tilt(x)` | `x` – device β angle | Triggers `moveForward` when the device is tilted forward (positive β). |
