import { sites } from '@/lib/sites';
import { horizonsURL, parseHorizons, validateInterval, type Ephemeris } from '@/lib/ephemeris';
export const runtime='nodejs';
const cache=new Map<string,Ephemeris>();
let queue:Promise<unknown>=Promise.resolve();
function serial<T>(fn:()=>Promise<T>):Promise<T>{const result=queue.then(fn,fn);queue=result.catch(()=>{});return result;}
export async function GET(request:Request){
  const params=new URL(request.url).searchParams,site=sites.find(s=>s.id===params.get('site')),start=params.get('start')??'',end=params.get('end')??'';
  if(!site)return Response.json({error:'Choose a catalog research site.'},{status:400});
  try{validateInterval(start,end)}catch(e){return Response.json({error:(e as Error).message},{status:400})}
  const key=[site.id,start,end].join(':');const previous=cache.get(key);if(previous)return Response.json(previous);
  try{
    const result=await serial(async()=>{
      const found=cache.get(key);if(found)return found;
      const sources=[horizonsURL('10',site.latitude,site.longitude,start,end),horizonsURL('399',site.latitude,site.longitude,start,end)];const texts:string[]=[];
      for(const url of sources){const response=await fetch(url,{signal:AbortSignal.timeout(25000),cache:'no-store'});if(!response.ok)throw Error('upstream');const data=await response.json();if(data.error||typeof data.result!=='string')throw Error('upstream');texts.push(data.result);}
      const sun=parseHorizons(texts[0]),earth=parseHorizons(texts[1]);const count=validateInterval(start,end)*24+1;
      if(sun.length!==count||earth.length!==count||sun.some((s,i)=>s.time!==earth[i].time||Date.parse(s.time)!==Date.parse(start)+i*3600000))throw Error('incomplete');
      const output:Ephemeris={siteId:site.id,start,end,retrievedAt:new Date().toISOString(),sun,earth,sources,headers:texts.map(t=>t.slice(t.indexOf('Target body name:'),t.indexOf('$$SOE'))),origin:'NASA/JPL Horizons live retrieval'};
      if(cache.size>=32)cache.delete(cache.keys().next().value!);cache.set(key,output);return output;
    });
    return Response.json(result);
  }catch{return Response.json({error:'NASA/JPL Horizons could not provide a complete result. Please retry. No estimated or historical data have been substituted.'},{status:502})}
}
