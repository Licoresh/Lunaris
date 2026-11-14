# Data sources

## Candidate regions

NASA's [2024 Artemis III update](https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/) names nine refined lunar south-pole candidate regions. The map uses approximate representative centers from the [Ohio University Lunar Planner](https://www.its.ohio.edu/foundations/lunar/). NASA's [2025 candidate-region analysis](https://ntrs.nasa.gov/citations/20250007692) supplies the reported area and perimeter values. Dashed map circles are area-equivalent illustrations, not NASA region boundaries. Centers are not touchdown coordinates.

## Lunar terrain

Elevation and slope previews use LRO Lunar Orbiter Laser Altimeter (LOLA) rasters from NASA Goddard [PGDA product 78](https://pgda.gsfc.nasa.gov/products/78). The map includes six 5 m/pixel elevation/slope pairs: Connecting Ridge (Site01), Shackleton Rim (Site04), Nobile Rim 1 (Site06), Peak near Shackleton (Site07), de Gerlache Rim (Site11), and Malapert Massif (Site23).

## Sunlight and Earth visibility

The sunlight and Earth-visibility layers use NASA Goddard [PGDA product 69](https://pgda.gsfc.nasa.gov/products/69), at 120 m/pixel. For each candidate center, the app reports a 1 km neighborhood median from these modeled long-term averages. They summarize historical illumination and geometric Earth visibility; they are not date-specific predictions, power estimates or radio-link guarantees.

## Site measurements

The mission planner compares all nine NASA candidate regions. Elevation and slope values are calculated only where the candidate center falls inside a local 5 m LOLA raster. In the current files, this applies to Malapert Massif (Site23) and Nobile Rim 1 (Site06); the other seven candidate centers show these fields as unavailable. Six additional local terrain study patches remain available for map and 3D exploration, but they are separate from NASA's refined nine-region list. These measurements are not safety ratings. Coordinates and source products are linked in the interface.

## Moon model

The 3D overview uses the RenderX lunar model from [Sketchfab](https://sketchfab.com/3d-models/moon-26cc0b7878bb4d919b68e2be399db466), under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The UI retains attribution. The model supports visual orientation; it is not a survey-grade terrain surface.

## Local files and regeneration

The source GeoTIFFs are kept under `data/nasa/` and excluded from Git because of their size. The checked-in map previews and layer manifest are regenerated with `python scripts/build_polar_map.py`; metrics can be regenerated with `python scripts/build_site_metrics.py`. Python packages are listed in `scripts/requirements.txt`. The local inventory contains six elevation/slope pairs and two historical polar-average rasters. No terrain-uncertainty rasters or local SPICE kernels are included.
