# Polar map and illustrative simulation

Updated 2026-10-09. `/terrain` now defaults to a coordinate-referenced NASA polar map. The original 3D terrain and Moon remain in the adjacent tab.

## Map

Fourteen local GeoTIFF map layers (six elevation/slope pairs plus two historical polar averages) are rendered with `python scripts/build_polar_map.py`. Rasterio applies band scale/offset, converts visibility fractions to percentages, averages pixels to preview resolution, and preserves NoData transparency. The manifest `src/data/map-layers.json` records source paths, SHA256 hashes, projected bounds, source resolution and display resolution. Source images are unchanged.

Projection: spherical lunar polar stereographic, radius 1,737,400 m, latitude of origin -90 degrees, central meridian 0 degrees, scale 1. Formula: rho=2R*tan((90+latitude)/2); x=rho*sin(longitude), northing=rho*cos(longitude). SVG y is negative northing. 0 E points upward; 90 E points right. This is independent of the artistic GLB calibration. Coordinates are approximate research points.

Controls: drag/touch pan, wheel or +/- zoom, arrow-key pan, layer picker, grid toggle, focus/reset and accessible site buttons. Fixed display rasters are used rather than downloading new tiles at deeper zoom. Illumination/Earth previews are ~596 m/pixel from 120 m sources; terrain previews are approximately 20 to 26 m/pixel from 5 m sources. Zoom does not add resolution. Terrain layers cover Site01, Site04, Site06, Site07, Site11, and Site23. Double-click a site marker or name to open its 3D terrain; a separate button supports touch and keyboard. Elevation colors clip at -3000 to 6000 m and slope at 0 to 45 degrees. The width readout is projected distance, not a geodesic scale bar.

## Simulation

The disabled analysis notice was replaced with Run simulation. It accepts 1–60 days, samples hourly, works offline, has a time slider and obstruction slider, and exports labeled JSON. The existing homepage Horizons planner remains a separate live geometry tool.

For a historical fraction f, h(t)=A*(sin(2*pi*t/P+phase)-cos(pi*f)). This yields fraction f above zero over a complete cycle. Solar P=29.53 days/A=5 degrees; Earth P=27.32 days/A=7 degrees. January 1 2026 is an arbitrary epoch. Longitude offsets and amplitudes are illustrative. NASA site historical medians supply f. These curves are NOT actual Sun/Earth ephemerides or observed elevations. Selected dates merely index a repeatable scenario. No terrain, physical power, real libration, radio links or eclipse model is claimed. Horizon crossings use linear interpolation between hourly samples.

Sources: https://science.nasa.gov/moon/moon-phases/ for approximate lunar periods; https://pgda.gsfc.nasa.gov/products/69 for historical fractions; https://pgda.gsfc.nasa.gov/products/78 for terrain.

## Cleanup

Removed disposable texture preview, obsolete page backup, one-off wiring script and unused model-directory placeholder. Exact paths and sizes are in cleanup-report.json. Preserved original GLB and runtime copy, NASA rasters, source code, scripts needed to reproduce outputs, calibration evidence, tests and fixtures. Dependencies and build outputs remain because the app is running.

## Checks

26 tests passed, including raster coordinate agreement, projection round trips, date bounds, horizon interpolation and obstruction monotonicity. TypeScript, source ESLint and production build passed. Browser checks exercised simulation execution/time/obstruction controls and elevation-layer focus. See latest completion notes in TEST_REPORT.md.


October 2026 exploration update: the map region picker adds NASA PGDA product 78 Site06 (Nobile Rim 1), Site07 (Peak near Shackleton), and Site11 (de Gerlache Rim). Both elevation and slope are downloaded by scripts/download_exploration.py and rendered by scripts/build_polar_map.py. Region navigation focuses raster bounds, not a certified landing coordinate. These map-only regions do not change the three comparison/simulation reference sites. Mission Control is top-aligned and sticky on desktop; narrow layouts place a collapsible panel before the map.
