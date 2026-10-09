# LUNARIS — Master Codex implementation brief

You are the senior full-stack developer and scientific-computing engineer building **LUNARIS**, a scientifically traceable, responsive CLPS lunar landing-site comparison browser for NASA Space Apps.

## Hard requirements
- MODIFY this repo, do not rebuild from scratch. Read README and docs first.
- Target Windows local development and clean deployment. Use Next.js App Router, React, TypeScript, Tailwind, React Three Fiber, a Python offline raster-preprocessing pipeline only where beneficial; avoid unnecessary paid services.
- Only the Moon itself is 3D. Charts, selectors, tables and timelines are 2D.
- Show high-quality visual design, mobile accessibility and graceful failure for missing files.
- Use only authentic data from named NASA/official sources and cite URLs in docs and in the UI, track exact files and retrieval dates. Never invent values, mission coordinates, download URLs, slopes, dates or 'NASA scores'.
- **Do not call a model visually correct without verifying scale/orientation**, and do not derive local slope from a generic textured sphere.
- Distinguish precomputed average illumination and visibility maps from date-specific visibility computations. Date-specific outputs require vetted SPICE kernels, correct coordinate transforms, terrain horizons and validation.
- If required science input is unavailable, build a documented disabled state or unmistakable demo mode instead of fabricated results.
- No hardcoded fake percentages in production and no API key secrets in client bundles.

## User journeys
1. Explore zoomable, rotatable Moon; pick a candidate lunar south-pole site.
2. View provenance-aware terrain/slope/illumination/visibility metrics with clear units and temporal coverage.
3. Select two sites; compare differences side by side, with explanations of trade-offs.
4. Choose mission dates; show date-specific predictions ONLY after scientifically sound models and verification exist. Otherwise explain why this mode is unavailable.
5. Export a comparison report with dataset references and limitations when all data in it is real and tested.

## Staged implementation. STOP after each phase and report results.
**Phase 1: product UI and 3D**. Stabilize npm build, robust real NASA GLB loading, normalize transforms, loaders, camera/lighting, polished 2D dashboard and responsive behavior. Keep demo labeled.
**Phase 2: NASA ingestion**. Implement offline Python scripts to read verified NASA LOLA GeoTIFFs (rasterio/GDAL), inspect metadata, sample verified coordinates, produce documented processed JSON/tiles. Validate with tests and QGIS-style comparisons. Add visible data provenance, coverage masks and uncertainty.
**Phase 3: comparison**. Replace synthetic scores with traceable processed datasets; site comparison and 2D charts. Clearly display averages and geographical coverage. Never invent missing values.
**Phase 4: date-specific engine**. Add SPICE kernels and tests for Sun/Earth position, Moon frames, horizon masking, terrain occlusion and timestamp UTC handling. If reference validation unavailable, feature flag off and document.
**Phase 5: final quality**. Tests, perf, accessibility, security, attribution, NASA challenge wording compliance, README, deployment and 2-minute demonstration walkthrough.

## Acceptance criteria
- npm install, npm run typecheck, npm run build pass.
- App works with and without /public/models/moon_small.glb.
- No uncited NASA-derived numbers or misleading forecasts.
- Data pipeline outputs source/checksum/units/CRS/coverage and test results.
- Entire site functional on desktop, tablet and mobile; keyboard accessible.
- User can easily tell synthetic from validated data.

Start with Phase 1 only. Follow CODEX_PHASE1_PROMPT.md for the first pass, then advance only when earlier checks pass. Optimize token/credit use: read only relevant files, keep diffs minimal, summarize rather than repeatedly dumping all code.
