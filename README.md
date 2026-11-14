# LUNARIS

LUNARIS is an educational lunar south-pole planning explorer built for the NASA Space Apps challenge. It brings NASA's nine refined candidate regions, long-term lighting and Earth-visibility layers, local LOLA terrain data, comparison tools and an illustrative Sun/Earth simulation into one interface.

## Features

- Interactive south-polar map with all nine regions in NASA's 2024 refined Artemis candidate set. Dashed circles show area-equivalent sizes, not official region outlines.
- Historical sunlight and Earth-visibility values for all nine approximate region centers, plus elevation and slope layers for six local LOLA raster patches.
- Compare candidate regions and run an illustrative Sun/Earth window simulation. Local 5 m elevation and slope are available at the Malapert Massif and Nobile Rim 1 candidate centers only.
- 3D Moon overview with all nine region markers and six separate high-resolution terrain meshes.
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

- NASA named the nine refined candidate regions in its [2024 Artemis III update](https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/). Approximate representative centers are from the [Ohio University Lunar Planner](https://www.its.ohio.edu/foundations/lunar/). NASA's [2025 candidate-region analysis](https://ntrs.nasa.gov/citations/20250007692) provides region areas and perimeters used to draw area-equivalent circles. These markers and circles are not official boundaries or touchdown coordinates.
- Elevation and slope previews use NASA Goddard Planetary Geology, Geophysics and Geochemistry Laboratory (PGDA) [product 78](https://pgda.gsfc.nasa.gov/products/78), LRO/LOLA 5 m/pixel regional rasters. Six site pairs are in `data/nasa/terrain/`. Raw rasters are excluded from Git because of their size. Checked-in PNG previews and manifests support the app and can be regenerated with `python scripts/build_polar_map.py`.
- Historical illumination and Earth-visibility layers use NASA PGDA [product 69](https://pgda.gsfc.nasa.gov/products/69), at 120 m/pixel. These are long-term modeled averages, not predictions for a selected date. Source rasters are local under `data/nasa/illumination/` and `data/nasa/earth-visibility/` and are excluded from Git.
- The 3D overview Moon is the RenderX model from [Sketchfab](https://sketchfab.com/3d-models/moon-26cc0b7878bb4d919b68e2be399db466), used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). NASA datasets and imagery retain their respective source-team credits. LUNARIS is an independent educational project and is not affiliated with NASA.

## Demo

Start with the default polar map and select among all nine candidate regions. Compare their long-term lighting and Earth-visibility summaries, then run the illustrative simulation. Elevation and slope show six local 5 m raster patches; the 3D explorer also provides all six meshes. See [`docs/POLAR_MAP_SIMULATION.md`](docs/POLAR_MAP_SIMULATION.md) for the simulation method and limits.

## Checks

```powershell
npm test
npm run science:test
npm run typecheck
npm run lint
npm run build
```

See [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) for data sources, local raster inventory and scientific limits.
