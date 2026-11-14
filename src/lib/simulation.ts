import { type LandingSite } from './sites';

export type SimulationSample = { time: string; sun: number; earth: number };
export type SimulatedBody = 'sun' | 'earth';

export function simulate(site: LandingSite, start: string, end: string): SimulationSample[] {
  const first = Date.parse(start + 'T00:00:00Z');
  const last = Date.parse(end + 'T00:00:00Z');
  const days = (last - first) / 86_400_000;
  if (!Number.isFinite(days) || days < 1 || days > 60) throw Error('Choose an interval of 1–60 days.');

  // NASA PGDA historical averages set each curve's above-horizon duty fraction.
  // Periods and phase are illustrative, so the selected dates are scenarios, not forecasts.
  const sunFraction = (site.metrics.illumination.value ?? 50) / 100;
  const earthFraction = (site.metrics.earthVisibility.value ?? 50) / 100;
  const epoch = Date.UTC(2026, 0, 1);
  const longitudePhase = site.longitude * Math.PI / 180;

  return Array.from({ length: Math.round(days * 24) + 1 }, (_, i) => {
    const time = first + i * 3_600_000;
    const day = (time - epoch) / 86_400_000;
    return {
      time: new Date(time).toISOString(),
      sun: 5 * (Math.sin(2 * Math.PI * day / 29.53 + longitudePhase) - Math.cos(Math.PI * sunFraction)),
      earth: 7 * (Math.sin(2 * Math.PI * day / 27.32 + longitudePhase * .25) - Math.cos(Math.PI * earthFraction)),
    };
  });
}

export function simulationStats(samples: SimulationSample[], body: SimulatedBody, horizon: number) {
  let hours = 0;
  let longest = 0;
  let run = 0;
  let belowHours = 0;
  let longestBelow = 0;
  let belowRun = 0;
  for (let i = 0; i < samples.length - 1; i++) {
    const start = samples[i][body] - horizon;
    const end = samples[i + 1][body] - horizon;
    const visible = start > 0 && end > 0 ? 1 : start <= 0 && end <= 0 ? 0 : start > 0 ? start / (start - end) : end / (end - start);
    hours += visible;
    if (start <= 0) run = 0;
    run += visible;
    longest = Math.max(longest, run);
    if (end <= 0) run = 0;
    const below = 1 - visible;
    belowHours += below;
    if (start > 0) belowRun = 0;
    belowRun += below;
    longestBelow = Math.max(longestBelow, belowRun);
    if (end > 0) belowRun = 0;
  }
  return { hours, percent: samples.length > 1 ? 100 * hours / (samples.length - 1) : 0, longest, belowHours, longestBelow };
}

export function hoursUntilSet(samples: SimulationSample[], body: SimulatedBody, horizon: number, index: number): number | null {
  const startIndex = Math.max(0, Math.min(index, samples.length - 1));
  if (!samples.length || samples[startIndex][body] <= horizon) return null;
  for (let i = startIndex; i < samples.length - 1; i++) {
    const start = samples[i][body] - horizon;
    const end = samples[i + 1][body] - horizon;
    if (start > 0 && end <= 0) return i - startIndex + start / (start - end);
  }
  return null;
}

/** Relative direct input on a horizontal collector; not watts or array output. */
export function solarInputIndex(samples: SimulationSample[], horizon: number): number {
  if (samples.length < 2) return 0;
  const input = (elevation: number) => elevation > horizon ? Math.max(0, Math.sin(elevation * Math.PI / 180)) : 0;
  let total = 0;
  for (let i = 0; i < samples.length - 1; i++) total += (input(samples[i].sun) + input(samples[i + 1].sun)) / 2;
  return total / (samples.length - 1) * 100;
}
