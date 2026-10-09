# Planner method and challenge alignment

The supplied challenge description calls for comparing sites and dates using Sun/Earth positions relative to the horizon. The default planner addresses geometric comparison with real NASA/JPL Horizons responses. It does not claim the full terrain-aware engineering problem is solved.

Requests use OBSERVER ephemerides, CENTER coord@301, geodetic positive-east longitude/north-positive latitude, zero km height relative to the lunar reference sphere, targets Sun 10 and Earth 399, quantity 4, airless apparent angles, UTC and one-hour steps. The response identifies the lunar mean-Earth frame (MEAN_ME or MOON_ME) and source ephemeris; raw headers and request links are exportable. The current captured responses cite DE441.

Input intervals are 1–31 days within 2024–2030. Endpoints are 00:00 UTC; the last sample is the end boundary. The server checks frame, sample count and equal hourly timestamps. NASA failures produce an explicit error, never synthetic substitution. Calls are serialized in each process and a bounded 32-entry memory cache avoids repeated identical requests. No credentials or local SPICE installation are needed. Internet and a Next.js server are required.

Window boundaries are linearly interpolated between hourly samples where body-center elevation crosses the assumed constant mask. Percentages use summed interval durations, not a count of samples. Windows are clipped to the requested interval. A 0-degree mask is the flat local reference horizon; it does not include local topography or horizon dip. Other masks are user assumptions, not measured terrain.

Unmodeled: azimuth-dependent ridge/crater horizon, actual observer terrain elevation, solar/terrestrial disk extent, eclipses, panel orientation/efficiency, battery behavior, antenna pointing, Earth ground-station visibility and link budget. Hourly interpolation can miss short windows. No independent SPICE/GIS cross-validation is claimed. Existing PGDA long-term averages cannot substitute for these computations.

NASA methodology: https://ssd.jpl.nasa.gov/horizons/manual.html and https://ssd-api.jpl.nasa.gov/doc/horizons.html.

Local data status: four Site01/Site04 terrain rasters plus solar/Earth visibility averages are present. Terrain uncertainty and Site23 rasters are absent. The local SPICE folder contains only a README. Future validated terrain horizons should be derived from adequate regional elevation coverage with documented frame and observer-height transformations.
