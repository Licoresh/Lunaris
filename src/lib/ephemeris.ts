export type SkySample = { time: string; azimuth: number; elevation: number };
export type Ephemeris = { siteId: string; start: string; end: string; retrievedAt: string; sun: SkySample[]; earth: SkySample[]; sources: string[]; headers: string[]; origin?: string };
export function validateInterval(start: string, end: string) {
  const valid=(s:string)=>/^20\d{2}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
  if(!valid(start)||!valid(end))throw new Error('Enter valid start and end dates.');
  const days=(Date.parse(end)-Date.parse(start))/86400000;
  if(start<'2024-01-01'||end>'2030-12-31'||days<1||days>31)throw new Error('Choose a 1–31 day interval within 2024–2030. End date is exclusive at 00:00 UTC.');
  return days;
}
export function horizonsURL(target:'10'|'399',latitude:number,longitude:number,start:string,end:string) {
  const url=new URL('https://ssd.jpl.nasa.gov/api/horizons.api');
  const values={format:'json',COMMAND:`'${target}'`,CENTER:"'coord@301'",COORD_TYPE:"'GEODETIC'",SITE_COORD:`'${longitude},${latitude},0'`,MAKE_EPHEM:"'YES'",EPHEM_TYPE:"'OBSERVER'",START_TIME:`'${start}'`,STOP_TIME:`'${end}'`,STEP_SIZE:"'1 h'",QUANTITIES:"'4'",CSV_FORMAT:"'YES'",APPARENT:"'AIRLESS'",EXTRA_PREC:"'YES'"};
  for(const [key,value]of Object.entries(values))url.searchParams.set(key,value);return url.toString();
}
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export function parseHorizons(text:string):SkySample[]{
  if(!text.includes('Center body name: Moon (301)')||!/Center pole\/equ\s*:\s*(MEAN_ME|MOON_ME)/.test(text))throw new Error('Unexpected lunar reference frame from Horizons.');
  const body=text.split('$$SOE')[1]?.split('$$EOE')[0];if(!body||!text.includes('$$EOE'))throw new Error('NASA returned no ephemeris table.');
  return body.trim().split('\n').map(line=>{
    const fields=line.split(',').map(s=>s.trim());const date=/^(\d{4})-([A-Za-z]{3})-(\d{2}) (\d{2}):(\d{2})$/.exec(fields[0]);
    const month=date?months.indexOf(date[2]):-1;const azimuth=Number(fields[3]),elevation=Number(fields[4]);
    if(!date||month<0||!fields[3]||!fields[4]||!Number.isFinite(azimuth)||!Number.isFinite(elevation)||azimuth<0||azimuth>360||Math.abs(elevation)>90)throw new Error('Unexpected NASA ephemeris row.');
    return {time:`${date[1]}-${String(month+1).padStart(2,'0')}-${date[3]}T${date[4]}:${date[5]}:00Z`,azimuth,elevation};
  });
}
export type WindowInterval={start:string;end:string;hours:number};
/** Linear crossings between hourly samples; opportunities, not certified contacts. */
export function aboveHorizonWindows(samples:SkySample[],threshold=0):WindowInterval[]{
  const windows:WindowInterval[]=[];if(samples.length<2)return windows;
  let begin:number|null=samples[0].elevation>threshold?Date.parse(samples[0].time):null;
  for(let i=1;i<samples.length;i++){
    const a=samples[i-1],b=samples[i],ta=Date.parse(a.time),tb=Date.parse(b.time);
    if((a.elevation>threshold)!==(b.elevation>threshold)){
      const crossing=ta+(tb-ta)*(threshold-a.elevation)/(b.elevation-a.elevation);
      if(b.elevation>threshold)begin=crossing;
      else if(begin!==null){windows.push({start:new Date(begin).toISOString(),end:new Date(crossing).toISOString(),hours:(crossing-begin)/3600000});begin=null;}
    }
  }
  if(begin!==null){const end=Date.parse(samples.at(-1)!.time);windows.push({start:new Date(begin).toISOString(),end:new Date(end).toISOString(),hours:(end-begin)/3600000});}
  return windows.filter(w=>w.hours>0);
}
export function opportunityPercent(samples:SkySample[],threshold:number){const total=(Date.parse(samples.at(-1)!.time)-Date.parse(samples[0].time))/3600000;return aboveHorizonWindows(samples,threshold).reduce((s,w)=>s+w.hours,0)/total*100;}

