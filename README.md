# LUNARIS

LUNARIS is an educational lunar south-pole mission-planning browser built for the NASA Space Apps challenge. The challenge asks teams to compare candidate landing sites and dates while considering sunlight, terrain and direct-to-Earth communication. LUNARIS brings terrain layers, site summaries and sky-geometry tools into one interface, while labeling assumptions and data gaps.

## Features

- Interactive south-polar map with historical sunlight and Earth-visibility layers, plus elevation and slope previews for six areas: Connecting Ridge, Shackleton Rim, Nobile Rim 1, Peak near Shackleton, de Gerlache Rim and Malapert Massif.
- Map pan, zoom, layer selection, coverage exploration and 3D terrain views where regional models are available.
- Site comparisons and an illustrative Sun/Earth window simulation. Simulation dates select a repeatable educational scenario; they are not date-specific ephemerides or forecasts.
- PDF exports for comparison and simulation reports.

## Run locally

Requirements: Node.js 22 or newer. Python 3.10+ and the packages in `scripts/requirements.txt` are needed only to regenerate map previews.

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root opens the south-polar explorer. The map and illustrative simulation use bundled outputs and work offline.

For a production build, run `npm run build` followed by `npm start`.

## Data and attribution

- Elevation and slope previews are derived from NASA Goddard Planetary Geology, Geophysics and Geochemistry Laboratory (PGDA) [product 78](https://pgda.gsfc.nasa.gov/products/78), LRO/LOLA 5 m/pixel regional rasters. Six site pairs are in the local `data/nasa/terrain/` folder. Raw rasters are excluded from Git because of their size. Checked-in PNG previews and manifests support the app and can be regenerated with `python scripts/build_polar_map.py`.
- Historical illumination and Earth-visibility layers use NASA PGDA [product 69](https://pgda.gsfc.nasa.gov/products/69), at 120 m/pixel. These are long-term modeled averages, not predictions for a selected date. Source rasters are local under `data/nasa/illumination/` and `data/nasa/earth-visibility/` and are excluded from Git.
- The 3D overview Moon is the RenderX model from [Sketchfab](https://sketchfab.com/3d-models/moon-26cc0b7878bb4d919b68e2be399db466), used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). NASA datasets and imagery retain their respective source-team credits. LUNARIS is an independent educational project and is not affiliated with NASA.

## Demo

Start with the default polar map, switch through its four layers and choose a terrain coverage region. Use **Focus site** or open a site's 3D terrain where available. Inspect the site comparison and illustrative simulation, including its method and limits. See [`docs/DEMO_GUIDE.md`](docs/DEMO_GUIDE.md) and [`docs/POLAR_MAP_SIMULATION.md`](docs/POLAR_MAP_SIMULATION.md) for walkthroughs and scientific limits.

## Checks

```powershell
npm test
npm run science:test
npm run typecheck
npm run lint
npm run build
```

See [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) for source status and [`NASA_ASSETS_STATUS.md`](NASA_ASSETS_STATUS.md) for the local raster inventory.
