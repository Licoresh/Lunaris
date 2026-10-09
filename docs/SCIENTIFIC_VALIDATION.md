# Scientific validation

## Current result

Fourteen official GeoTIFFs (twelve terrain rasters across six PGDA regions and two polar average rasters) passed signature, checksum, and Rasterio metadata inspection. LUNARIS displays reproducible NASA-derived 1 km neighborhood medians: elevation and slope for Site01/Connecting Ridge and Site04/Shackleton Rim, plus historical illumination and Earth visibility for all three reference points. Six terrain regions are available in the map. Site01, Site04, and Site23 remain the three reference sites with derived neighborhood metrics. The other three map regions are exploratory coverage only.

Status is **NASA-derived / tested**, not **validated against an independent reference**. An external GIS spot-check remains required before promoting that status.

## Coordinate conventions

Reference markers use selenographic latitude and positive-east longitude in the range 0–360°. The display frame maps north to +Y, 0°E to +Z, and 90°E to +X. The raster pipeline transforms from a 1,737,400 m lunar sphere into each file’s south-polar stereographic CRS. Projected centers were checked against raster bounds. This does not verify the absent NASA GLB’s prime-meridian alignment.

## Derived measurement method

`scripts/build_site_metrics.py` reads valid pixels inside a 1,000 m circular radius around each approximate research point and reports the median, spatial minimum/maximum, valid-pixel count, native resolution, source file and SHA-256. Illumination and Earth-visibility `int16` values use the embedded scale factor `0.00004` and are converted from fractions to percentages. Terrain float values are elevation in meters and slope in degrees.

The neighborhood reduces sensitivity to a single pixel but does not turn an approximate research coordinate into a certified landing zone. Min/max values are spatial ranges, not uncertainty bounds.

## Raster admission checklist

1. Capture file checksum and source metadata with `scripts/inspect_nasa_rasters.py`.
2. Confirm driver, CRS, MOON_ME/DE421 frame, transform, 5 m or 120 m pixel size, units, bounds and NoData.
3. Transform longitude/latitude into the raster’s south-polar stereographic coordinates using the exact product definition—never index it as a geographic raster.
4. Reject out-of-bounds, masked and NoData samples. State whether a result is point, neighborhood statistic or modeled average.
5. Compare at least two fixed samples with an independent GIS inspection and retain tolerances/results.
6. Only then emit a provenance-bearing processed JSON value and change its status to `nasa-derived`.

LOLA elevation is meters and published slope products are degrees. PGDA averages must remain labeled historical/model averages. Earth visibility is only geometric line-of-sight opportunity, not link availability.

## Date-specific gate

Do not enable date-specific results until kernel identity and coverage, UTC conversion, lunar body-fixed frames, Sun/Earth vectors, observer height, local horizon, terrain occlusion, step size, boundary behavior and independent reference cases all pass. Missing horizon modeling must never be described as precision illumination or communications prediction.
