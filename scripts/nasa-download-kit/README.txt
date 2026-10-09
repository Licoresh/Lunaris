CLPS Lunar Mission Browser - NASA Data Downloader
================================================

IMPORTANT: This ZIP contains a downloader, not the NASA binary datasets.
Our environment could verify the official download URLs, but could not
retrieve the binary files to include them in this archive.

ON WINDOWS:
1. Extract this ZIP to a folder (do not run it inside the ZIP).
2. Double-click START_DOWNLOAD.bat.
3. Wait for the files to download from NASA.
4. Look inside CLPS-NASA-Data (created next to the downloader).
5. Read CLPS-NASA-Data/download_report.txt if anything fails.
6. Rerun START_DOWNLOAD.bat to retry missing files.

DOWNLOADS (7):
- 3D-Moon/moon_small.glb -- NASA Moon web-ready model
- Terrain/Site01_final_adj_5mpp_surf.tif -- Connecting Ridge elevation
- Terrain/Site01_final_adj_5mpp_slp.tif -- Connecting Ridge slope
- Terrain/Site04_final_adj_5mpp_surf.tif -- Shackleton Rim elevation
- Terrain/Site04_final_adj_5mpp_slp.tif -- Shackleton Rim slope
- Sunlight/AVGVISIB_75S_120M_201608.TIF -- polar average sunlight
- Earth-Visibility/AVGVISIB_75S_120M_201608_EARTH.TIF -- polar average Earth visibility

Sources:
https://svs.gsfc.nasa.gov/14959/
https://pgda.gsfc.nasa.gov/products/78
https://pgda.gsfc.nasa.gov/products/69

Notes:
- These are raw scientific rasters and may be large.
- You need internet access and sufficient free disk space.
- NASA polar illumination and Earth visibility maps are LONG-TERM AVERAGES,
  not exact predictions for dates chosen by the user.
- The Moon model is for display, not for deriving landing-site slope.
- The script downloads files only from the official NASA domains shown above.
- The downloaded datasets are NOT yet a functioning web app.

Additional locally available exploration rasters:
- Site06 elevation and slope: Nobile Rim 1
- Site07 elevation and slope: Peak near Shackleton
- Site11 elevation and slope: de Gerlache Rim
