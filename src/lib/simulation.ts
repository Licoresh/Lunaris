import {type LandingSite} from './sites';
export function simulate(site:LandingSite,start:string,end:string){
 const first=Date.parse(start+'T00:00:00Z'),last=Date.parse(end+'T00:00:00Z'),days=(last-first)/86400000;
 if(!Number.isFinite(days)||days<1||days>60)throw Error('Choose an interval of 1–60 days.');
 const sunFraction=(site.metrics.illumination.value??50)/100,earthFraction=(site.metrics.earthVisibility.value??50)/100;
 // A sinusoid exceeds cos(pi*f) for fraction f of a complete cycle.
 // The epoch is an arbitrary phase anchor, not an astronomical observation.
 const epoch=Date.UTC(2026,0,1),offset=site.longitude*Math.PI/180;
 return Array.from({length:Math.round(days*24)+1},(_,i)=>{const time=first+i*3600000,t=(time-epoch)/86400000;return {time:new Date(time).toISOString(),sun:5*(Math.sin(2*Math.PI*t/29.53+offset)-Math.cos(Math.PI*sunFraction)),earth:7*(Math.sin(2*Math.PI*t/27.32+offset*.25)-Math.cos(Math.PI*earthFraction))}});
}
export function simulationStats(samples:ReturnType<typeof simulate>,body:'sun'|'earth',mask:number){let hours=0,longest=0,run=0;for(let i=0;i<samples.length-1;i++){const a=samples[i][body]-mask,b=samples[i+1][body]-mask;const fraction=a>0&&b>0?1:a<=0&&b<=0?0:a>0?a/(a-b):b/(b-a);hours+=fraction;if(a<=0)run=0;run+=fraction;longest=Math.max(longest,run);if(b<=0)run=0}return {hours,percent:100*hours/(samples.length-1),longest}}
