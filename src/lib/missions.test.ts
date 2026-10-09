import { describe, expect, it } from 'vitest';
import { missions, filterMissions, timelineMissions, formatDate } from './missions';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
describe('mission discovery and provenance',()=>{
  it('searches all required fields case-insensitively',()=>{
    for(const query of ['odysseus','INTUITIVE','Nova-C','Malapert','ROLSES']) expect(filterMissions(query).map(m=>m.id)).toContain('im-1');
    expect(filterMissions('upcoming').map(m=>m.id)).toEqual(['im-3']);
    expect(filterMissions('TRIDENT').map(m=>m.id)).toEqual(['im-2']);
  });
  it('combines search with both filters and handles empty matches',()=>{
    expect(filterMissions('Nova-C','Completed','Intuitive Machines').map(m=>m.id)).toEqual(['im-1']);
    expect(filterMissions('TRIDENT','Completed')).toEqual([]);
    expect(filterMissions('zzzzzz')).toEqual([]);
    expect(filterMissions('  blue   ghost  ','All','Firefly Aerospace')).toHaveLength(1);
  });
  it('supports every status and provider independently',()=>{
    expect(filterMissions('','Completed')).toHaveLength(2);expect(filterMissions('','Upcoming')).toHaveLength(1);expect(filterMissions('','Unsuccessful')).toHaveLength(2);
    expect(filterMissions('','All','Astrobotic')).toHaveLength(1);expect(filterMissions('','All','Intuitive Machines')).toHaveLength(3);expect(filterMissions('','All','Firefly Aerospace')).toHaveLength(1);
  });
  it('sorts confirmed dates before undated plans without mutating the records',()=>{
    expect(timelineMissions().map(m=>m.id)).toEqual(['peregrine-1','im-1','blue-ghost-1','im-2','im-3']);
    expect(missions.find(m=>m.id==='im-3')?.launch).toBeNull();
    expect(formatDate('2025-02-27')).toBe('Feb 27, 2025');
  });
  it('maintains unique identities, NASA sources and correct payload relationships',()=>{
    expect(new Set(missions.map(m=>m.id)).size).toBe(missions.length);
    for(const m of missions){expect(m.sources.some(s=>new URL(s.url).hostname.endsWith('nasa.gov'))).toBe(true);expect(m.verified).toBe('2026-10-08');expect(m.payloads.length).toBe(m.payloadCount);expect(new Set(m.payloads.map(p=>p.name)).size).toBe(m.payloads.length);}
    expect(missions.flatMap(m=>m.payloads)).toHaveLength(28);
  });
  it('never turns a planned region into an actual landing coordinate',()=>{
    for(const m of missions){if(m.coordinates){expect(m.coordinates.source).toMatch(/^https:/);expect(m.actualLocation).not.toBeNull();expect(m.coordinates.latitude).toBeGreaterThanOrEqual(-90);expect(m.coordinates.latitude).toBeLessThanOrEqual(90);}}
    expect(missions.find(m=>m.id==='peregrine-1')?.coordinates).toBeNull();expect(missions.find(m=>m.id==='im-3')?.coordinates).toBeNull();
  });
});
describe('original Moon integrity',()=>{
  it('serves an identical GLB 2.0 with embedded material and texture',()=>{
    const source=readFileSync('src/moon.glb'), deployed=readFileSync('public/models/moon.glb');
    const hash=(b:Buffer)=>createHash('sha256').update(b).digest('hex');expect(hash(source)).toBe(hash(deployed));
    expect(deployed.toString('utf8',0,4)).toBe('glTF');expect(deployed.readUInt32LE(4)).toBe(2);expect(deployed.readUInt32LE(8)).toBe(deployed.length);
    const json=JSON.parse(deployed.subarray(20,20+deployed.readUInt32LE(12)).toString());expect(json.meshes).toHaveLength(5);expect(json.materials[0].pbrMetallicRoughness.baseColorTexture.index).toBe(0);expect(json.images[0].bufferView).toBeDefined();expect(json.asset.extras.author).toContain('RenderX');
  });
});
