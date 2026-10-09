"""Inspect local NASA GeoTIFFs and emit a provenance manifest without inventing samples."""
from __future__ import annotations
import argparse, hashlib, json, math
from datetime import datetime, timezone
from pathlib import Path

try:
    import rasterio
except ImportError as exc:
    raise SystemExit("rasterio is required: python -m pip install -r scripts/requirements.txt") from exc

KINDS = {"terrain": "data/nasa/terrain", "illumination": "data/nasa/illumination", "earth-visibility": "data/nasa/earth-visibility"}

def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()

def inspect(path: Path, kind: str, root: Path) -> dict:
    with rasterio.open(path) as src:
        nodata = src.nodata
        json_nodata = None if nodata is None or (isinstance(nodata, float) and math.isnan(nodata)) else nodata
        return {
            "kind": kind, "file": path.relative_to(root).as_posix(), "sha256": sha256(path),
            "bytes": path.stat().st_size, "driver": src.driver, "width": src.width, "height": src.height,
            "bands": src.count, "dtypes": list(src.dtypes), "crs": src.crs.to_string() if src.crs else None,
            "transform": list(src.transform)[:6], "bounds": list(src.bounds), "nodata": json_nodata,
            "pixelSize": [abs(src.transform.a), abs(src.transform.e)], "tags": src.tags(),
            "validation": "metadata-inspected; site sampling not validated",
        }

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", type=Path, default=Path("data/processed/raster-manifest.json"))
    args = parser.parse_args(); root = args.root.resolve(); records = []
    for kind, relative in KINDS.items():
        for path in sorted((root / relative).glob("*.[Tt][Ii][Ff]")):
            records.append(inspect(path, kind, root))
    output = args.output if args.output.is_absolute() else root / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    payload = {"schemaVersion": 1, "generatedAt": datetime.now(timezone.utc).isoformat(), "records": records,
               "note": "Metadata only. Values must not enter the UI until coordinate and reference checks pass."}
    output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Inspected {len(records)} raster(s); wrote {output}")

if __name__ == "__main__": main()
