import urllib.request,concurrent.futures
from pathlib import Path
def get(kind):
 name=f'Site23_final_adj_5mpp_{kind}.tif'; p=Path('data/nasa/terrain')/name
 urllib.request.urlretrieve('https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site23/'+name,p)
 print(name,p.stat().st_size,flush=True)
with concurrent.futures.ThreadPoolExecutor(2) as e:list(e.map(get,['surf','slp']))
