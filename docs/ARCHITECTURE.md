# Architecture

LUNARIS is a single Next.js App Router application. The browser owns interaction and rendering; it does not parse large scientific rasters. React Three Fiber renders either the official NASA SVS GLB, when present, or a clearly identified procedural sphere. Site markers use a documented positive-east spherical transform and remain reference points rather than landing ellipses.

## Scientific data boundary

1. Original files live below `data/nasa/` and are not sent to clients.
2. `scripts/inspect_nasa_rasters.py` records checksums, CRS, affine transform, bounds, NoData, dimensions and pixel size.
3. A future sampling stage must transform published coordinates into each raster CRS, reject out-of-bounds/NoData cells, and validate samples independently before emitting `data/processed` JSON.
4. The UI accepts only validated, provenance-bearing values. Until then its measurement fields render `Data unavailable`.

No server or database is required for the current build. Date-specific SPICE and terrain-horizon work is deliberately feature-disabled.
