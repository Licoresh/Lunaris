# LUNARIS

LUNARIS is an educational lunar south-pole terrain explorer built for the NASA Space Apps challenge. It brings NASA-derived map layers, site comparisons, 3D terrain views and an illustrative Sun/Earth simulation into one interface, with data limits shown alongside the results.

## Features

- Interactive south-polar map with historical sunlight and Earth-visibility layers, plus elevation and slope previews for six areas: Connecting Ridge, Shackleton Rim, Nobile Rim 1, Peak near Shackleton, de Gerlache Rim and Malapert Massif.
- Map pan, zoom, layer selection, coverage exploration and 3D terrain views for all six NASA raster regions.
- Compare six areas and run an illustrative Sun/Earth window simulation. Three areas use published research coordinates; three use their terrain-raster footprint centers. Dates select a repeatable educational scenario, not a forecast.
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

Start with the default polar map, switch through its four layers and choose one of six terrain areas. Open its 3D terrain, compare its measurements with another area, then run the illustrative simulation. The interface distinguishes published research coordinates from raster-center comparison areas. See [`docs/DEMO_GUIDE.md`](docs/DEMO_GUIDE.md) and [`docs/POLAR_MAP_SIMULATION.md`](docs/POLAR_MAP_SIMULATION.md) for the walkthrough and limits.

## Checks

```powershell
npm test
npm run science:test
npm run typecheck
npm run lint
npm run build
```

See [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) for data sources, local raster inventory and scientific limits.
