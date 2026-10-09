import { describe, expect, it } from 'vitest';
import { sites } from './sites';
import { latLonToVector } from './coordinates';

describe('lunar coordinate display transform', () => {
  it('keeps all surface points on the requested radius', () => {
    for (const site of sites) expect(latLonToVector(site.latitude, site.longitude, 1).length()).toBeCloseTo(1, 10);
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
  it('provides sourced NASA metrics for all three sites', () => {
    for (const site of sites) for (const metric of Object.values(site.metrics)) {
      expect(metric.value).not.toBeNull(); expect(metric.status).toBe('nasa-derived');
    }
  });
  it('keeps published reference coordinates inside valid bounds', () => {
    for (const site of sites) { expect(site.latitude).toBeGreaterThanOrEqual(-90); expect(site.latitude).toBeLessThanOrEqual(90); expect(site.longitude).toBeGreaterThanOrEqual(0); expect(site.longitude).toBeLessThan(360); }
  });
});
