# NASA source registry

Last source-page review: 2026-10-08. Binary retrieval and scientific validation are separate statuses.

| Purpose | Official source | Product detail | Current status |
|---|---|---|---|
| Moon visualization | [NASA SVS 14959](https://svs.gsfc.nasa.gov/14959/) | `moon_small.glb`, 13.2 MB, LRO imagery/topography, credit NASA GSFC | Download retried 2026-10-08; NASA SVS timed out; fallback active |
| Elevation and slope | [NASA GSFC PGDA product 78](https://pgda.gsfc.nasa.gov/products/78) | Site01, Site04, Site06, Site07, Site11, and Site23 5 m/pixel elevation/slope GeoTIFFs, south polar stereographic X/Y meters | Downloaded and metadata-inspected 2026-10-08 through 2026-10-09; map-only regions are not added to the mission metric summaries |
| Historical illumination and Earth visibility | [NASA GSFC PGDA product 69](https://pgda.gsfc.nasa.gov/products/69) | 75°S–90°S, 120 m/pixel average GeoTIFFs over an 18.6-year modeled cycle | Downloaded and metadata-inspected 2026-10-08 through 2026-10-09; map-only regions are not added to the mission metric summaries |
| Date geometry | [NASA/JPL NAIF](https://naif.jpl.nasa.gov/naif/data.html) | SPICE kernels and documentation | Not configured; feature disabled |
| Research-site coordinates | [NASA/TM—2007-215025](https://ntrs.nasa.gov/citations/20070034951) | Approximate Sites A1, B and E used as reference markers | Cited; not landing ellipses |

For every binary record the exact URL, retrieval UTC date, byte size, SHA-256, CRS, units, resolution, bounds, temporal coverage, NoData representation, and credit. The downloader’s URLs must be verified against the live NASA product page before treating files as authoritative.
