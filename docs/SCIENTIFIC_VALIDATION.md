# Scientific method

Fourteen local NASA GeoTIFFs provide six elevation/slope regions and two long-term polar-average layers. `scripts/inspect_nasa_rasters.py` records source metadata; `scripts/build_site_metrics.py` applies raster scale and offset, projects approximate site coordinates into each raster CRS, and summarizes valid cells within 1 km. Processed values include source paths, checksums, resolution and pixel counts in `src/data/site-metrics.json`.

Site markers use positive-east selenographic longitude. The polar map uses a lunar polar stereographic projection with a 1,737,400 m reference radius. The displayed terrain rasters are regional patches; unprocessed or missing fields remain unavailable.

Neighborhood medians describe nearby terrain, not a landing ellipse. Spatial minimum and maximum are not uncertainty bounds. The source rasters do not include terrain-uncertainty products. Independent GIS comparison of the derived values remains outstanding.

Historical sunlight and Earth visibility are averages across an 18.6-year modeled cycle. The separate simulation uses illustrative periodic curves and is not a date-specific prediction. No local SPICE kernels, terrain-horizon illumination model, power model or operational communications model are used.
