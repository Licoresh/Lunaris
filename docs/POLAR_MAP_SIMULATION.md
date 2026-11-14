# Map and simulation

LUNARIS is available at `/lunaris`. The map shows all nine NASA 2024 refined candidate regions with approximate representative centers. Dashed circles are area-equivalent illustrations, not official boundaries. Historical sunlight and Earth visibility cover all nine centers. Elevation and slope layers show six local LOLA raster patches; only Malapert Massif and Nobile Rim 1 candidate centers fall inside these high-resolution files. All six patches have separate 3D meshes. Display previews are downsampled, so zooming changes view scale but adds no detail.

Map data are generated from the local NASA GeoTIFFs with `python scripts/build_polar_map.py`. The script applies GeoTIFF scale and offset, converts visibility fractions to percentages, preserves NoData transparency, and writes PNG previews and `src/data/map-layers.json`.

## Illustrative simulation

Run two site/date scenarios side by side. Each interval can span 1–60 days; choose the same site in both scenarios to compare alternate dates. An hourly time slider moves through both intervals by relative progress. The charts show simulated Sun and Earth elevation against the assumed horizon, total and longest visibility windows, darkness duration, and modeled time to the next set event.

NASA PGDA Product 69 long-term illumination and Earth-visibility averages at each approximate candidate center set the above-horizon fraction of each curve. Illustrative 29.53-day and 27.32-day cycles, longitude phase offsets, and a January 1, 2026 phase origin provide repeatable scenarios, not date-specific ephemerides. The obstruction control changes the assumed horizon.

The relative solar-input index averages the positive sine of simulated solar elevation above the assumed horizon. It is a horizontal-collector geometry proxy, not irradiance, watts, or array output. Darkness duration offers energy-storage and thermal-planning context; it does not estimate equipment temperature. Earth visibility is geometric and does not establish a usable radio link. No terrain-horizon ray tracing, thermal model, or operational link budget is included. PDF reports include both scenarios, their NASA baseline metrics, modeled windows, and assumptions.

Sources: [NASA lunar phases](https://science.nasa.gov/moon/moon-phases/), [NASA PGDA lunar polar illumination](https://pgda.gsfc.nasa.gov/products/69), and [NASA PGDA lunar south-pole topography](https://pgda.gsfc.nasa.gov/products/78).
