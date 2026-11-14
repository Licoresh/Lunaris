import { expect, it } from 'vitest';
import { candidateRegions } from './sites';
import { hoursUntilSet, simulate, simulationStats, solarInputIndex, type SimulationSample } from './simulation';

const sample = (sun: number, earth = sun): SimulationSample => ({ time: '2026-11-15T00:00:00.000Z', sun, earth });

it('samples a NASA-anchored scenario hourly and validates its date interval', () => {
  const samples = simulate(candidateRegions[0], '2026-11-15', '2026-11-17');
  expect(samples).toHaveLength(49);
  expect(samples[0].time).toBe('2026-11-15T00:00:00.000Z');
  expect(() => simulate(candidateRegions[0], '2026-11-15', '2026-11-15')).toThrow('1–60 days');
  expect(() => simulate(candidateRegions[0], '2026-11-15', '2027-02-14')).toThrow('1–60 days');
});

it('estimates above-horizon duration with interpolated crossings', () => {
  const samples = [sample(10), sample(-10), sample(-10)];
  expect(simulationStats(samples, 'sun', 0)).toEqual({ hours: .5, percent: 25, longest: .5, belowHours: 1.5, longestBelow: 1.5 });
  expect(hoursUntilSet(samples, 'sun', 0, 0)).toBe(.5);
  expect(hoursUntilSet(samples, 'sun', 0, 1)).toBeNull();
});

it('returns no set time when the body stays above the horizon through the interval', () => {
  expect(hoursUntilSet([sample(2), sample(1), sample(3)], 'sun', 0, 0)).toBeNull();
});

it('estimates normalized horizontal solar input from simulated elevation', () => {
  const value = solarInputIndex([sample(0), sample(30), sample(60)], 0);
  expect(value).toBeCloseTo((.25 + (.5 + Math.sin(Math.PI / 3)) / 2) / 2 * 100, 8);
});
