# Data sources

## Lunar terrain

Elevation and slope previews use LRO Lunar Orbiter Laser Altimeter (LOLA) rasters from NASA Goddard [PGDA product 78](https://pgda.gsfc.nasa.gov/products/78). The map includes six 5 m/pixel elevation/slope pairs: Connecting Ridge (Site01), Shackleton Rim (Site04), Nobile Rim 1 (Site06), Peak near Shackleton (Site07), de Gerlache Rim (Site11), and Malapert Massif (Site23).

## Sunlight and Earth visibility

The sunlight and Earth-visibility layers use NASA Goddard [PGDA product 69](https://pgda.gsfc.nasa.gov/products/69), at 120 m/pixel. These are modeled averages over an 18.6-year lunar cycle. Earth visibility means that some portion of Earth's disk is geometrically visible above terrain; it does not establish radio-link availability.

## Site measurements

The comparison offers six NASA terrain regions. Connecting Ridge, Shackleton Rim, and Malapert Massif use approximate published research coordinates. Nobile Rim 1, Peak near Shackleton, and de Gerlache Rim use the geographic centers of their PGDA terrain-raster footprints, derived from the raster bounds. Each metric is the median of valid cells within 1 km of its comparison point. Raster-center points are reproducible regional references, not published landing coordinates or ellipses. These measurements are not safety ratings. Coordinates and source products are linked in the interface.

## Moon model

The 3D overview uses the RenderX lunar model from [Sketchfab](https://sketchfab.com/3d-models/moon-26cc0b7878bb4d919b68e2be399db466), under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The UI retains attribution. The model supports visual orientation; it is not a survey-grade terrain surface.

## Local files and regeneration

The source GeoTIFFs are kept under `data/nasa/` and excluded from Git because of their size. The checked-in map previews and layer manifest are regenerated with `python scripts/build_polar_map.py`; Python packages are listed in `scripts/requirements.txt`. The local inventory contains six elevation/slope pairs and two historical polar-average rasters. No terrain-uncertainty rasters or local SPICE kernels are included.
