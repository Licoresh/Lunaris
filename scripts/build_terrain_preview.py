"""Create compact browser terrain meshes from the locally stored NASA LOLA GeoTIFFs."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import rasterio
from rasterio.enums import Resampling


ROOT = Path(__file__).resolve().parents[1]
GRID_SIZE = 257
SITE_METRICS = json.loads((ROOT / "src/data/site-metrics.json").read_text(encoding="utf-8"))
PRODUCTS = {
    "malapert-massif": ROOT / "data/nasa/terrain/Site23_final_adj_5mpp_surf.tif",
    "connecting-ridge": ROOT / "data/nasa/terrain/Site01_final_adj_5mpp_surf.tif",
    "shackleton-rim": ROOT / "data/nasa/terrain/Site04_final_adj_5mpp_surf.tif",
}


def build(site_id: str, source: Path) -> None:
    with rasterio.open(source) as dataset:
        values = dataset.read(
            1,
            out_shape=(GRID_SIZE, GRID_SIZE),
            resampling=Resampling.bilinear,
        ).astype(np.float64)
        finite = values[np.isfinite(values)]
        if finite.size != values.size: raise ValueError("Nonfinite terrain samples: preserve holes rather than invent heights")
        payload = {
            "schemaVersion": 1,
            "siteId": site_id,
            "source": str(source.relative_to(ROOT)).replace("\\", "/"),
            "sourceResolutionMeters": abs(dataset.transform.a),
            "displayGridSize": GRID_SIZE,
            "displaySpacingMeters": (dataset.bounds.right - dataset.bounds.left) / (GRID_SIZE - 1),
            "boundsMeters": [dataset.bounds.left, dataset.bounds.bottom, dataset.bounds.right, dataset.bounds.top],
            "focusPointMeters": SITE_METRICS["sites"][site_id]["metrics"]["elevation"]["projectedCenterMeters"],
            "minimumMeters": round(float(finite.min()), 2),
            "maximumMeters": round(float(finite.max()), 2),
            "heightsMeters": np.round(values, 1).reshape(-1).tolist(),
        }
    destination = ROOT / "src/data" / f"terrain-{site_id}.json"
    destination.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {destination.relative_to(ROOT)} from {source.name}")


if __name__ == "__main__":
    for key, path in PRODUCTS.items():
        build(key, path)
