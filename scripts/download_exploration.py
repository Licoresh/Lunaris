"""Download additional map-only NASA terrain regions from official product links."""
from pathlib import Path
from html.parser import HTMLParser
import urllib.request, concurrent.futures
class Links(HTMLParser):
 def handle_starttag(self,tag,attrs):
  if tag=='a':
   url=dict(attrs).get('href','')
   if any('/'+site+'/' in url for site in ['Site06','Site07','Site11']) and url.endswith(('_surf.tif','_slp.tif')): urls.append(url)
urls=[]
Links().feed(urllib.request.urlopen('https://pgda.gsfc.nasa.gov/products/78',timeout=60).read().decode())
def get(url):
 p=Path(__file__).resolve().parents[1]/'data/nasa/terrain'/url.rsplit('/',1)[1]
 if not p.exists():
  temp=p.with_suffix('.partial');urllib.request.urlretrieve(url,temp);temp.replace(p)
 print(p.name,p.stat().st_size,flush=True)
with concurrent.futures.ThreadPoolExecutor(3) as pool:list(pool.map(get,urls))
if len(urls)!=6:raise RuntimeError(f'Expected six files, found {len(urls)}')
