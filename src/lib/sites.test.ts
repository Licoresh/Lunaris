import { describe, expect, it } from 'vitest';
import { candidateRegions, terrainRegions } from './sites';
import { latLonToVector } from './coordinates';

describe('lunar coordinate display transform', () => {
  it('keeps all surface points on the requested radius', () => {
    for (const site of [...candidateRegions, ...terrainRegions]) expect(latLonToVector(site.latitude, site.longitude, 1).length()).toBeCloseTo(1, 10);
  });
  it('places the poles on the Y axis', () => {
    const north = latLonToVector(90, 117, 1); const south = latLonToVector(-90, 42, 1);
    expect(north.y).toBeCloseTo(1, 10); expect(south.y).toBeCloseTo(-1, 10);
    expect(Math.abs(north.x) + Math.abs(north.z)).toBeLessThan(1e-10);
  });
  it('uses positive-east longitude in the X/Z plane', () => {
    expect(latLonToVector(0, 0, 1).z).toBeCloseTo(1); expect(latLonToVector(0, 90, 1).x).toBeCloseTo(1);
  });
});

describe('science transparency', () => {
  it('lists all nine NASA candidate regions and historical light metrics', () => {
    expect(candidateRegions).toHaveLength(9);
    expect(new Set(candidateRegions.map(site=>site.shortName)).size).toBe(9);
    for (const site of candidateRegions) {
      expect(site.areaKm2).toBeGreaterThan(0);
      for (const key of ['illumination','earthVisibility'] as const) {
        expect(site.metrics[key].value).not.toBeNull(); expect(site.metrics[key].status).toBe('nasa-derived');
      }
      expect(site.metrics.elevation.value !== null).toBe(Boolean(site.terrainRegionId));
      expect(site.metrics.slope.value !== null).toBe(Boolean(site.terrainRegionId));
    }
  });
  it('preserves six local terrain study regions outside the candidate list', () => {
    expect(terrainRegions).toHaveLength(6);
    expect(terrainRegions.filter((site) => site.coordinateBasis === 'published-research-point')).toHaveLength(3);
    expect(terrainRegions.filter((site) => site.coordinateBasis === 'raster-footprint-center')).toHaveLength(3);
    for (const site of terrainRegions) for (const metric of Object.values(site.metrics)) {
      expect(metric.value).not.toBeNull(); expect(metric.status).toBe('nasa-derived');
    }
  });
  it('keeps all comparison coordinates inside valid bounds', () => {
    for (const site of candidateRegions) { expect(site.latitude).toBeGreaterThanOrEqual(-90); expect(site.latitude).toBeLessThanOrEqual(90); expect(site.longitude).toBeGreaterThanOrEqual(0); expect(site.longitude).toBeLessThan(360); }
  });
});
