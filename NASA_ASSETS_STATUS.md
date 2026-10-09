# NASA assets and local map data

Last updated: 2026-10-09.

The repository contains fourteen NASA GeoTIFF source rasters: six LOLA elevation/slope pairs for Site01 (Connecting Ridge), Site04 (Shackleton Rim), Site06 (Nobile Rim 1), Site07 (Peak near Shackleton), Site11 (de Gerlache Rim), and Site23 (Malapert Massif), plus historical illumination and Earth visibility rasters. Raw GeoTIFFs are intentionally excluded from Git because they are large; the checked-in map previews are reproducible from them.

On Windows, run `DOWNLOAD_NASA_FILES.bat` to retrieve the scientific data and verify file signatures. Then run `python scripts/build_polar_map.py` to regenerate the map previews and layer manifest. Python dependencies are listed in `scripts/requirements.txt`.

The interactive Moon is the RenderX Sketchfab model in `src/moon.glb`, with the identical runtime copy in `public/models/moon.glb`. NASA's separate `moon_small.glb` downloader entry is optional and is not used by the application. See `docs/MOON_MODEL.md` for attribution and alignment limits.

Historical illumination and Earth visibility are long-term averages, not selected-date predictions. Map-only terrain regions support visual exploration; neighborhood metrics remain limited to the three published reference sites. No terrain uncertainty products are included.
