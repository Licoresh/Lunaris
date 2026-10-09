# Moon model alignment and evidence

Updated 2026-10-08. The original `src/moon.glb` and `public/models/moon.glb` remain byte-identical, SHA256 `8cd444d1f739701c769b226c9be8afa13b452e71c4e5280ae6ab2f51721f4c70`. No binary, geometry, material or texture modification was applied. Runtime still only centers and uniformly scales the authored scene.

## Resolved display alignment

The embedded 8192 x 4096 texture is equirectangular with **south at image top**, north at bottom, longitude 0 at horizontal center, and east increasing rightward. This was established by inspecting the actual embedded texture, not inferred from the GLB node rotations.

| Check | Latitude N | Longitude E | Evidence |
|---|---:|---:|---|
| Tycho | -43.30 | -11.22 | https://planetarynames.wr.usgs.gov/Feature/6163 |
| Aristarchus | 23.73 | -47.49 | https://planetarynames.wr.usgs.gov/Feature/380 |
| Copernicus | 9.62 | -20.08 | https://planetarynames.wr.usgs.gov/Feature/1296 |
| Mare Crisium (regional holdout) | 16.18 | 59.10 | https://planetarynames.wr.usgs.gov/Feature/3671 |
| Mare Orientale (regional holdout) | -19.87 | -94.67 | https://planetarynames.wr.usgs.gov/Feature/3685 |

The first three crater centers align visually with the predicted texture pixels. The two seas provide independent, widely separated regional checks, not precisely measured control points. `moon-landmark-check.png` contains 360-pixel crops of the original full-resolution image centered on the predicted coordinates. These are visual checks, not an independent survey or reference-frame solution.

GLTF image UV origin is the top left. Therefore u = wrapped(lon + 180)/360 and v = lat/180 + 0.5. The known coordinate convention resolves the meridian, pole direction and east/west handedness.

## Actual geometry and runtime placement

`scripts/calibrate-moon.mjs` extracts every 17th UV/world-position pair from every mesh, with original node transforms and centered geometry. `scripts/fit-moon.py` uses an orthogonal least-squares SVD fit from geographic unit vectors to those mesh directions. The matrix is recorded in `moon-transform-fit.json` and `src/lib/moon.ts`. It is a proper rotation (determinant +1), not a reflection. Sample residual RMS is 0.07924 degrees; maximum 1.0378 degrees, dominated by pole topology. **These numbers measure mesh-to-UV consistency, not geographic accuracy.** Reproduce with Node then Python (NumPy required).

Pins normally interpolate the actual mesh triangle containing the requested UV coordinate. Polar triangle fans leave small uncovered UV wedges (including the Shackleton Rim reference point). When no triangle contains the coordinate, the calibrated radial direction is raycast onto the actual mesh. Pins are then offset slightly above the surface and retain normal depth testing; the Moon occludes far-side markers. The original model is never replaced with a synthetic sphere.

The camera uses the transformed geographic north vector as up. Focus travels by quaternion interpolation of its unit direction at an exterior radius, avoiding a straight chord through the Moon. Reduced-motion settings use an immediate focus. User orbit cancels movement. Keyboard-accessible location buttons provide an alternative to clicking small, crowded polar pins. Catalog filters also filter mission pins. Unknown coordinates never produce a pin or an enabled focus.

This solves **illustrative overview alignment**. Near-pole UV distortion and the artistic mesh prevent meter-level site separation, engineering navigation, or terrain-horizon inference. Research points are approximate published locations; mission coordinates retain their own source precision. No NASA ME/PA reference-frame accuracy claim is made. Labels explicitly retain these limits.

## Original asset

RenderX, https://sketchfab.com/3d-models/moon-26cc0b7878bb4d919b68e2be399db466, CC BY 4.0 (embedded metadata). Attribution remains in the UI. Five meshes, 272118 vertices, 520192 triangles, one 8192 x 4096 sRGB JPEG. Approximately 171 MiB texture memory with mipmaps. Precise centering/scale and on-demand rendering remain. Lighting is illustrative, not date-specific solar illumination.

## Validation

22 tests pass, including loading the original GLB and placing five check landmarks, all three research sites, and both catalog mission coordinates on its actual mesh. Tests cover wrapped longitude, north/south direction, east/west convention, proper rotation, surface radius and agreement with the calibrated frame. Type checking, source ESLint and production build pass. Browser verification and any limitations are recorded in TEST_REPORT.md.
