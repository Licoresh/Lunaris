# LUNARIS — lunar planning and CLPS mission browser

Next.js / React / TypeScript / Three.js application. The default Site & Date Planner compares NASA/JPL Horizons Sun/Earth geometry at three published south-polar research points. The CLPS catalog contains five missions and 28 instrument/payload entries. Existing NASA terrain tools remain at `/terrain`.

## Run
```powershell
npm install
npm run dev
```
Open http://localhost:3000. Production: `npm run build`, then `npm start`. Requires Node.js 22+ and network access to NASA/JPL for new planner requests. The planner requires a Next.js server runtime; a static-only host cannot serve `/api/ephemeris`.

## Checks
`npm test` (27 tests), `npm run science:test` (3 Python checks), `npm run typecheck`, `npx eslint src`, `npm run build`.
`node scripts/inspect-moon.mjs` audits the original GLB without modifying it.
`node scripts/check-planner.mjs` checks the running API against NASA and saves reference responses.

## Actual data sources
- Twelve NASA LOLA 5 m/pixel elevation/slope GeoTIFFs: Site01, Site04, Site06, Site07, Site11, and Site23, PGDA product 78. Terrain uncertainty rasters are not included.
- NASA 120 m/pixel long-term solar illumination and Earth visibility GeoTIFFs: PGDA product 69. Used for 1 km neighborhood median statistics, not selected-date predictions.
- Date planner: live NASA/JPL Horizons airless apparent Sun/Earth center azimuth/elevation. No local SPICE kernels. Hourly sampling; linear crossing estimates; 0 km reference-sphere observer height.
- CLPS facts: official NASA source links per mission, with LROC primary observations for IM-1 coordinates.
- Moon: original RenderX Sketchfab `src/moon.glb`, copied byte-for-byte to `public/models/moon.glb`; source retained as recoverable backup. CC BY 4.0 attribution appears in the UI. No replacement sphere.

See `docs/CLPS_DATA_REVIEW.md`, `docs/MOON_MODEL.md`, `docs/PLANNER_METHOD.md` and `docs/TEST_REPORT.md`.

## Scientific limits
The Moon now has landmark-calibrated overview pins and geographic focus; its artistic mesh is not survey-grade. Date geometry is not terrain-aware illumination, electrical power or operational radio prediction. The constant obstruction mask is an assumption for sensitivity exploration. Historical raster metrics remain separate. Independent scientific validation remains required.


## Polar map and educational simulation

`/terrain` defaults to the NASA polar map with pan, zoom, four layer choices and site focus. Run simulation produces an offline illustrative scenario from NASA historical averages and sine-wave math; it is not an actual date forecast. See `docs/POLAR_MAP_SIMULATION.md`. Regenerate map assets with `python scripts/build_polar_map.py` (Rasterio, NumPy, Pillow). The suite currently contains 27 tests.
