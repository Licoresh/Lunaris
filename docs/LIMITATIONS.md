# Known limitations

- Original Sketchfab Moon has landmark-calibrated display alignment, UV triangle markers and geographic focus. Visual landmark checks do not establish survey-grade accuracy or a NASA lunar reference-frame tie.
- Planner uses live NASA/JPL Horizons. Local SPICE kernels are not downloaded. Date geometry is relative to a reference horizon, not an azimuth-dependent terrain horizon.
- Constant obstruction mask is an assumption. No electrical power, battery or operational communication link model.
- Historic PGDA averages are separate from the date planner. Site metrics are 1 km neighborhood medians, not safety certifications.
- Terrain-uncertainty rasters are absent. Six local elevation/slope regions are available in the map, including Malapert Site23. Derived comparison metrics remain limited to Connecting Ridge, Shackleton Rim, and Malapert. Independent GIS validation remains outstanding.
- CLPS data are a five-mission curated snapshot. IM-3 schedule and precise Blue Ghost coordinates require further review.
- Original 8K Moon texture is memory intensive. Binary kept intact with source backup; lower-memory devices may fail and receive an error state.
- See TEST_REPORT.md for tests performed and not performed.
