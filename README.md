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
| DOM manipulation | [jQuery 3.4.1](https://jquery.com/) |
| Icons | [Font Awesome Pro 5.13](https://fontawesome.com/) |
| Font | [Roboto Mono – Google Fonts](https://fonts.google.com/specimen/Roboto+Mono) |
| Analytics | Google Analytics (UA) |
| Location data | `collections_en.json` (bundled locally, fetched directly by the client) |

## Project Structure

```
superstreetview/
├── index.html          # Main HTML shell
├── game.js             # All game logic (map init, markers, scoring, timer)
├── style.css           # All styling
├── collections_en.json # Dataset of curated Street View locations (loaded directly by the client)
└── icons/              # Sprite & icon assets (GIFs and PNGs)
    ├── rocket.gif
    ├── diamond.gif
    ├── crystalblue.png
    ├── crystalgreen.png
    └── ...
```

## Local Setup

### Prerequisites

- A static file server or any web server (e.g. `python3 -m http.server 8000`, [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), or similar). No PHP is required.
- A [Google Maps Platform](https://console.cloud.google.com/) project with the **Maps JavaScript API** and **Geocoding API** enabled, and a valid API key restricted to your deployment domain.

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/bythegram/superstreetview.git
   cd superstreetview
   ```

2. Replace the placeholder API key in `game.js` (and `index.html`) with your own key:
   ```js
   // game.js line 16
   var apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
   ```
   > ⚠️ **Restrict your API key** in Google Cloud Console to your deployment domain (e.g. your GitHub Pages URL) to prevent unauthorised use. See the [ROADMAP](ROADMAP.md) for additional security recommendations.

3. Start a local static server:
   ```bash
   python3 -m http.server 8000
   ```

4. Open `http://localhost:8000` in your browser.

5. Allow the browser to access your location when prompted. If you deny the request the game falls back to Toronto, Canada (43.6532°N, 79.3832°W).

## Known Issues & Future Plans

See [ROADMAP.md](ROADMAP.md) for the full list of planned improvements and known bugs.

## Contributing

Pull requests are welcome! Please open an issue first to discuss any large changes. See [AGENT_SKILLS.md](AGENT_SKILLS.md) for the list of automated agent capabilities available in this repository.

## License

This project does not currently specify a license. All rights reserved by the original authors until a license is added.
