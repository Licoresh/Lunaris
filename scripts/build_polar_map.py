"""Render local NASA rasters in their original lunar polar projection."""
from pathlib import Path
import json, hashlib
import numpy as np
import rasterio
from rasterio.enums import Resampling
from PIL import Image
root=Path(__file__).resolve().parents[1]; out=root/'public/maps';out.mkdir(exist_ok=True)
items=[]
for path in (root/'data/nasa').rglob('*'):
 if path.suffix.lower()!='.tif':continue
 name=path.stem; kind='earth' if 'EARTH' in name else 'sun' if 'AVGVISIB' in name else 'slope' if '_slp' in name else 'elevation'
 with rasterio.open(path) as ds:
  if ds.crs is None or ds.transform.a <= 0 or ds.transform.e >= 0: raise ValueError(f'Unexpected raster georeferencing: {path}')
  size=1536 if kind in ['sun','earth'] else 800
  a=ds.read(1,out_shape=(size,size),masked=True,resampling=Resampling.average).astype(float)*ds.scales[0]+ds.offsets[0]
  if a.count()==0 or not np.isfinite(a.compressed()).all(): raise ValueError(f'Invalid raster values: {path}')
  if kind in ['sun','earth']:a*=100
  low,high=(0,100) if kind in ['sun','earth'] else (0,45) if kind=='slope' else (-3000,6000)
  t=np.clip((a.filled(low)-low)/(high-low),0,1); colors=np.array([[12,22,38],[41,111,134],[108,194,172],[246,220,137]])
  k=t*3;i=np.minimum(k.astype(int),2);f=(k-i)[...,None];rgb=colors[i]*(1-f)+colors[i+1]*f
  rgba=np.concatenate([rgb,np.where(np.ma.getmaskarray(a),0,255)[...,None]],axis=2).astype('uint8');Image.fromarray(rgba).save(out/(name+'.png'))
  items.append(dict(id=name,kind=kind,url='/maps/'+name+'.png',bounds=list(ds.bounds),sourceResolution=abs(ds.transform.a),displayResolution=(ds.bounds.right-ds.bounds.left)/size,min=low,max=high,source=str(path.relative_to(root)).replace('\\','/'),sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
(root/'src/data/map-layers.json').write_text(json.dumps(items,indent=2))
print('Rendered',len(items),'georeferenced display layers')

