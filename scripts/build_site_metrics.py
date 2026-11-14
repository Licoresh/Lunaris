"""Build provenance-bearing metrics for NASA candidate regions and local terrain studies."""
from __future__ import annotations
import hashlib, json, math
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import rasterio
from rasterio.windows import Window
from rasterio.warp import transform

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src/data/site-metrics.json"
SOURCE_CRS = "+proj=longlat +R=1737400 +no_defs"
RADIUS_M = 1000.0
SITES = {
    "connecting-ridge": {"latitude": -89.4, "longitude": 233.0, "terrain": "Site01", "basis": "published-research-point"},
    "shackleton-rim": {"latitude": -89.8, "longitude": 213.0, "terrain": "Site04", "basis": "published-research-point"},
    "malapert-massif": {"latitude": -86.0, "longitude": 4.0, "terrain": "Site23", "basis": "published-research-point"},
    "nobile-rim-1": {"terrain": "Site06", "basis": "raster-footprint-center"},
    "peak-near-shackleton": {"terrain": "Site07", "basis": "raster-footprint-center"},
    "de-gerlache-rim": {"terrain": "Site11", "basis": "raster-footprint-center"},
    "peak-near-cabeus-b": {"latitude": -83.6, "longitude": 291.3, "basis": "approximate-candidate-region-center"},
    "haworth": {"latitude": -86.8, "longitude": 337.2, "basis": "approximate-candidate-region-center"},
    "malapert-massif-candidate": {"latitude": -86.0, "longitude": 359.8, "terrain": "Site23", "basis": "approximate-candidate-region-center"},
    "mons-mouton-plateau": {"latitude": -84.3, "longitude": 30.6, "basis": "approximate-candidate-region-center"},
    "mons-mouton": {"latitude": -85.4, "longitude": 31.7, "basis": "approximate-candidate-region-center"},
    "nobile-rim-1-candidate": {"latitude": -85.4, "longitude": 37.3, "terrain": "Site06", "basis": "approximate-candidate-region-center"},
    "nobile-rim-2": {"latitude": -84.0, "longitude": 58.8, "basis": "approximate-candidate-region-center"},
    "de-gerlache-rim-2": {"latitude": -88.2, "longitude": 295.4, "basis": "approximate-candidate-region-center"},
    "slater-plain": {"latitude": -87.2, "longitude": 125.5, "basis": "approximate-candidate-region-center"},
}
FILES = {
    "Site23.elevation": ROOT / "data/nasa/terrain/Site23_final_adj_5mpp_surf.tif",
    "Site23.slope": ROOT / "data/nasa/terrain/Site23_final_adj_5mpp_slp.tif",
    "Site01.elevation": ROOT / "data/nasa/terrain/Site01_final_adj_5mpp_surf.tif",
    "Site01.slope": ROOT / "data/nasa/terrain/Site01_final_adj_5mpp_slp.tif",
    "Site04.elevation": ROOT / "data/nasa/terrain/Site04_final_adj_5mpp_surf.tif",
    "Site04.slope": ROOT / "data/nasa/terrain/Site04_final_adj_5mpp_slp.tif",
    "Site06.elevation": ROOT / "data/nasa/terrain/Site06_final_adj_5mpp_surf.tif",
    "Site06.slope": ROOT / "data/nasa/terrain/Site06_final_adj_5mpp_slp.tif",
    "Site07.elevation": ROOT / "data/nasa/terrain/Site07_final_adj_5mpp_surf.tif",
    "Site07.slope": ROOT / "data/nasa/terrain/Site07_final_adj_5mpp_slp.tif",
    "Site11.elevation": ROOT / "data/nasa/terrain/Site11_final_adj_5mpp_surf.tif",
    "Site11.slope": ROOT / "data/nasa/terrain/Site11_final_adj_5mpp_slp.tif",
    "illumination": ROOT / "data/nasa/illumination/AVGVISIB_75S_120M_201608.TIF",
    "earthVisibility": ROOT / "data/nasa/earth-visibility/AVGVISIB_75S_120M_201608_EARTH.TIF",
}

def site_coordinates(site: dict) -> tuple[float, float]:
    if site["basis"] in {"published-research-point", "approximate-candidate-region-center"}:
        return site["latitude"], site["longitude"]
    source = FILES[f'{site["terrain"]}.elevation']
    with rasterio.open(source) as ds:
        x = (ds.bounds.left + ds.bounds.right) / 2
        y = (ds.bounds.bottom + ds.bounds.top) / 2
        longitude, latitude = transform(ds.crs, SOURCE_CRS, [x], [y])
    return round(float(latitude[0]), 6), round(float(longitude[0]) % 360, 6)

def digest(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()

def neighborhood(path: Path, longitude: float, latitude: float, kind: str) -> dict:
    with rasterio.open(path) as ds:
        x, y = transform(SOURCE_CRS, ds.crs, [longitude], [latitude])
        x, y = x[0], y[0]
        if not (ds.bounds.left <= x <= ds.bounds.right and ds.bounds.bottom <= y <= ds.bounds.top):
            raise ValueError(f"{longitude},{latitude} projects outside {path.name}: {x},{y}")
        row, col = ds.index(x, y)
        rx = math.ceil(RADIUS_M / abs(ds.transform.a)); ry = math.ceil(RADIUS_M / abs(ds.transform.e))
        window = Window(col - rx, row - ry, 2 * rx + 1, 2 * ry + 1).intersection(Window(0, 0, ds.width, ds.height))
        values = ds.read(1, window=window, masked=True).astype("float64")
        win_transform = ds.window_transform(window)
        rows, cols = np.indices(values.shape)
        xs = win_transform.c + (cols + 0.5) * win_transform.a
        ys = win_transform.f + (rows + 0.5) * win_transform.e
        circle = (xs - x) ** 2 + (ys - y) ** 2 <= RADIUS_M ** 2
        data = values[circle & ~np.ma.getmaskarray(values)].compressed()
        if data.size == 0: raise ValueError(f"No valid values near {longitude},{latitude} in {path.name}")
        data = data * ds.scales[0] + ds.offsets[0]
        if kind in {"illumination", "earthVisibility"}: data = data * 100.0
        return {
            "value": round(float(np.median(data)), 2), "min": round(float(np.min(data)), 2),
            "max": round(float(np.max(data)), 2), "unit": "%" if kind in {"illumination", "earthVisibility"} else ("°" if kind == "slope" else "m"),
            "validPixels": int(data.size), "radiusMeters": RADIUS_M, "resolutionMeters": abs(ds.transform.a),
            "projectedCenterMeters": [round(x, 3), round(y, 3)], "method": "circular-neighborhood-median",
            "sourceFile": path.relative_to(ROOT).as_posix(), "sha256": digest(path), "status": "nasa-derived",
        }

def main() -> None:
    for name, path in FILES.items():
        if not path.exists(): raise SystemExit(f"Missing required source for {name}: {path}")
    result = {"schemaVersion": 2, "generatedAt": datetime.now(timezone.utc).isoformat(),
              "coordinateConvention": "selenographic latitude; positive-east longitude 0-360",
              "method": "1 km circular-neighborhood medians at published research points, NASA terrain-raster centers, or approximate NASA candidate-region centers, as identified per site",
              "sites": {}}
    for site_id, site in SITES.items():
        latitude, longitude = site_coordinates(site)
        metrics = {
            "illumination": neighborhood(FILES["illumination"], longitude, latitude, "illumination"),
            "earthVisibility": neighborhood(FILES["earthVisibility"], longitude, latitude, "earthVisibility"),
        }
        if site.get("terrain"):
            metrics["elevation"] = neighborhood(FILES[f'{site["terrain"]}.elevation'], longitude, latitude, "elevation")
            metrics["slope"] = neighborhood(FILES[f'{site["terrain"]}.slope'], longitude, latitude, "slope")
        result["sites"][site_id] = {"latitude": latitude, "longitude": longitude, "coordinateBasis": site["basis"], "metrics": metrics}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, indent=2, allow_nan=False), encoding="utf-8")
    print(f"Wrote {OUT} with {len(result['sites'])} sites")

if __name__ == "__main__": main()
