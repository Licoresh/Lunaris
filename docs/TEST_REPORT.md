# Verification report — 2026-10-08

Executed after integration:
- Production build: PASS (/, /terrain, /api/ephemeris).
- TypeScript: PASS. ESLint on src: PASS.
- Vitest: 21 tests PASS: search and combined filters, status/provider counts, mission relationships, dates, GLB byte identity, geometry normalization, camera fit, coordinate convention, provenance, real Horizons response parsing, date validation and interpolated windows.
- Existing Python science suite: 3 PASS. These test metadata and bounds, not independent GIS agreement.
- Live API: Connecting Ridge and Shackleton Rim Nov 1–8, 2026 return HTTP 200, 169 hourly samples per body. Invalid interval returns HTTP 400. Responses saved in docs/horizons-*-reference.json.
- Production browser: real planner comparison renders both sites and windows; time slider changes readout; mask 10 degrees changes opportunities to zero for this case. Fresh production tab console has no errors.
- Earlier browser checks: original Moon texture renders; zoom/reset and drag interaction exercised; search, combined filters, empty results, selection, closing/reopening briefs, timeline-to-mission, payload-to-mission and comparison selectors exercised.
- Responsive checks at 1440 and 390 pixels: no document horizontal overflow; Moon and navigation visible. Not a physical touch-device test.

Not verified / not complete:
- Superseded by the calibration follow-up in MOON_MODEL.md: sourced-location pins and focus are enabled for illustrative overview use.
- Terrain-aware date illumination, electrical power and operational communication modeling remain unimplemented.
- Actual touch/pinch device behavior, comprehensive accessibility audit, forced WebGL context loss, failed-download retry and download interaction are not fully browser-tested.
- NASA source pages reviewed through research tools; not every external link was clicked from the app.
- Existing /terrain route compiles; its full UI regression flow was not repeated after preservation.

Do not describe all acceptance criteria as passed. See MOON_MODEL.md and PLANNER_METHOD.md for the scientific gates.

## Geographic alignment follow-up (2026-10-08)
- Original texture inspected against USGS/IAU Tycho, Aristarchus and Copernicus coordinates; Mare Crisium and Mare Orientale checked independently at regional scale.
- Reproducible UV/geometry rotation fit: 16008 samples, proper rotation, RMS 0.07924 degrees; this is mesh consistency, NOT geographic accuracy.
- Added real-triangle marker positioning with calibrated radial intersection for polar UV gaps. Three research locations and two sourced mission locations now support focus.
- 22 tests pass, including actual GLB loading, all five landmarks and all five runtime location coordinates. Source ESLint and production build pass.
- Fresh production browser: terrain-to-overview switch, Connecting Ridge focus, Shackleton selection/focus, mission IM-1 selection/focus, missing-coordinate focus disabled. Console errors: none. Visual proof saved as calibrated-globe.png.
- Fixed terrain label cleanup errors seen during first switch test by rendering its reference label outside the Canvas.
- Automated tests verify the surface mapping; exhaustive far-side click, touch, reduced-motion and accessibility testing is still not claimed. Artistic polar texture distortion remains visible.

## Polar map and simulation follow-up — 2026-10-09
26 tests pass; TypeScript, source ESLint and production build pass. Browser verified Earth/elevation layer switching, zoom/reset/site focus, selected-site synchronization, simulation run and time/obstruction sliders. No new console errors during the final checks (the existing browser retained earlier model-fetch errors from before server restart). Screenshot: simulation-preview.png. Four disposable files removed; cleanup-report.json records them. Download button implementation was not exercised in-browser. The model remains explicitly illustrative, with no true date ephemeris claims.
