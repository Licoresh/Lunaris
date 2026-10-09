import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {parseHorizons,validateInterval,horizonsURL,aboveHorizonWindows,opportunityPercent} from './ephemeris';
describe('NASA Horizons parsing and interval guardrails',()=>{
  it('parses a preserved real NASA response with UTC dates, azimuth and elevation',()=>{
    const samples=parseHorizons(readFileSync('docs/horizons-sun-reference.txt','utf8'));expect(samples).toHaveLength(25);expect(samples[0].time).toBe('2026-11-01T00:00:00Z');expect(samples[24].elevation).toBeCloseTo(1.926147947,8);
  });
  it('rejects invalid dates and unsafe/unbounded intervals',()=>{for(const pair of [['2026-02-30','2026-03-05'],['2026-01-01','2026-01-01'],['2026-02-01','2026-01-01'],['2026-01-01','2026-04-01']])expect(()=>validateInterval(...pair as [string,string])).toThrow();expect(validateInterval('2026-11-01','2026-11-08')).toBe(7)});
  it('keeps positive-east lunar coordinates and airless apparent angles explicit',()=>{const u=new URL(horizonsURL('399',-89.4,233,'2026-11-01','2026-11-08'));expect(u.searchParams.get('CENTER')).toBe("'coord@301'");expect(u.searchParams.get('SITE_COORD')).toBe("'233,-89.4,0'");expect(u.searchParams.get('APPARENT')).toBe("'AIRLESS'")});
  it('rejects malformed or non-lunar upstream output',()=>{expect(()=>parseHorizons('$$SOE\nn.a.\n$$EOE')).toThrow()});
});
describe('approximate opportunity windows',()=>{
  const series=(values:number[])=>values.map((e,i)=>({time:new Date(Date.UTC(2026,10,1,i)).toISOString(),elevation:e,azimuth:0}));
  it('interpolates crossings and handles windows clipped to the requested boundaries',()=>{const w=aboveHorizonWindows(series([-1,1,1,-1]));expect(w).toHaveLength(1);expect(w[0].hours).toBe(2);expect(w[0].start).toBe('2026-11-01T00:30:00.000Z');expect(opportunityPercent(series([1,1,1]),0)).toBe(100);expect(opportunityPercent(series([-1,-1]),0)).toBe(0)});
  it('changes opportunity when the assumed obstruction mask increases',()=>{expect(opportunityPercent(series([1,1]),2)).toBe(0);expect(opportunityPercent(series([1,1]),0)).toBe(100);expect(aboveHorizonWindows(series([0,0]))).toEqual([])});
});
