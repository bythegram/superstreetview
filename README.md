# Super Street View

A browser-based exploration game built on top of Google Maps Street View. Players navigate real-world streets to collect diamonds and rockets, earning points and unlocking new levels as they go.

## How to Play

- **Diamonds** (blue crystal markers on the mini-map) appear near your starting location. Click one to collect it and earn a point. Three new diamonds spawn around where you picked up the last one, leading you further down the street.
- **Rockets** (green crystal markers on the mini-map) are wormholes. Click one to teleport to a random Google Street View location anywhere in the world.
- Your **score** is displayed in the bottom-left corner and is saved to `localStorage` so it persists across sessions.
- The game progression is divided into **levels**. Every 10 points you gain a level, which increases the distance at which new markers spawn, making the game progressively harder.

## Tech Stack

| Layer | Technology |
|---|---|
| Map & Street View | [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) |
| Bundler | [Vite 6](https://vite.dev/) |
| Linter | [ESLint 9](https://eslint.org/) (`eslint:recommended`) |
| Formatter | [Prettier 3](https://prettier.io/) |
| Icons | [Font Awesome Pro 5.13](https://fontawesome.com/) |
| Font | [Roboto Mono – Google Fonts](https://fonts.google.com/specimen/Roboto+Mono) |
| Analytics | Google Analytics (UA) |
| Location data | `collections_en.json` (bundled locally, fetched directly by the client) |

## Project Structure

```
superstreetview/
├── src/
│   ├── main.js             # Entry point – geolocation & global bootstrap
│   ├── config.js           # API key and default coordinates
│   ├── state.js            # Shared mutable game state
│   ├── map.js              # Map & Street View initialisation
│   ├── markers.js          # Rocket (wormhole) and diamond marker logic
│   ├── score.js            # Score tracking and level-ups
│   ├── timer.js            # Countdown timer (stub – see ROADMAP)
│   └── movement.js         # Tilt-to-move and heading helpers
├── public/
│   ├── collections_en.json # Dataset of curated Street View locations
│   └── icons/              # Sprite & icon assets (GIFs and PNGs)
├── index.html              # Main HTML shell
├── style.css               # All styling
├── vite.config.js          # Vite bundler configuration
├── eslint.config.js        # ESLint flat config (eslint:recommended + Prettier)
└── .prettierrc             # Prettier code-style settings
```

## Local Setup

### Prerequisites

- **Node.js 18+** and **npm** (used to run the Vite dev server and build).
- A [Google Maps Platform](https://console.cloud.google.com/) project with the **Maps JavaScript API** and **Geocoding API** enabled, and a valid API key restricted to your deployment domain.

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/bythegram/superstreetview.git
   cd superstreetview
   ```

2. Install dev dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file (never committed) with your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```
   > ⚠️ **Restrict your API key** in Google Cloud Console to your deployment domain (e.g. your GitHub Pages URL) to prevent unauthorised use. See the [ROADMAP](ROADMAP.md) for additional security recommendations.

4. Start the Vite development server:
   ```bash
   npm run dev
   ```

5. Open the URL printed by Vite (default: `http://localhost:5173`) in your browser.

6. Allow the browser to access your location when prompted. If you deny the request the game falls back to Toronto, Canada (43.6532°N, 79.3832°W).

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with hot-module reload |
| `npm run build` | Production build → output in `dist/` |
| `npm run preview` | Serve the production build locally for testing |
| `npm run lint` | Run ESLint on all source files |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format all source files with Prettier |
| `npm run format:check` | Check formatting without writing (used in CI) |

## Known Issues & Future Plans

See [ROADMAP.md](ROADMAP.md) for the full list of planned improvements and known bugs.

## Contributing

Pull requests are welcome! Please open an issue first to discuss any large changes. See [AGENT_SKILLS.md](AGENT_SKILLS.md) for the list of automated agent capabilities available in this repository.

## License

This project does not currently specify a license. All rights reserved by the original authors until a license is added.
