# Map and simulation

LUNARIS is available at `/lunaris`. The map shows all nine NASA 2024 refined candidate regions with approximate representative centers. Dashed circles are area-equivalent illustrations, not official boundaries. Historical sunlight and Earth visibility cover all nine centers. Elevation and slope layers show six local LOLA raster patches; only Malapert Massif and Nobile Rim 1 candidate centers fall inside these high-resolution files. All six patches have separate 3D meshes. Display previews are downsampled, so zooming changes view scale but adds no detail.

Map data are generated from the local NASA GeoTIFFs with `python scripts/build_polar_map.py`. The script applies GeoTIFF scale and offset, converts visibility fractions to percentages, preserves NoData transparency, and writes PNG previews and `src/data/map-layers.json`.

## Illustrative simulation

The simulation accepts intervals of 1–60 days and samples hourly. Two sine curves use periods of 29.53 days for the Sun and 27.32 days for Earth. NASA site averages set the fraction of each cycle above the assumed horizon. Amplitudes, longitude offsets and the January 1, 2026 phase origin are illustrative choices. Dates select a repeatable scenario; they do not predict the actual sky.

The time slider selects a sample. The obstruction control demonstrates how a raised assumed horizon changes the displayed windows. The PDF includes the scenario values and method. The calculation does not model terrain shadows, actual libration, electrical power, eclipses or operational communication links.

Sources: [NASA lunar phases](https://science.nasa.gov/moon/moon-phases/), [NASA PGDA lunar polar illumination](https://pgda.gsfc.nasa.gov/products/69), and [NASA PGDA lunar south-pole topography](https://pgda.gsfc.nasa.gov/products/78).
