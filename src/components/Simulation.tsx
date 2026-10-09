'use client';

import { useMemo, useState } from 'react';
import { type LandingSite } from '@/lib/sites';
import { simulate, simulationStats } from '@/lib/simulation';

export default function Simulation({ site, start, end }: { site: LandingSite; start: string; end: string }) {
  const [index, setIndex] = useState(0);
  const [mask, setMask] = useState(0);
  const samples = useMemo(() => simulate(site, start, end), [site, start, end]);
  const current = samples[Math.min(index, samples.length - 1)];
  const sun = simulationStats(samples, 'sun', mask);
  const earth = simulationStats(samples, 'earth', mask);
  const y = (value: number) => 150 - value * 7;
  const plot = (body: 'sun' | 'earth') => samples.map((sample, i) => `${i ? 'L' : 'M'}${35 + i / (samples.length - 1) * 430},${y(sample[body])}`).join(' ');

  const download = async () => {
    const { downloadReport } = await import('@/lib/pdf-report');
    downloadReport('Mission simulation', 'lunaris-simulation', [
      {
        heading: site.shortName,
        lines: [
          `${start} to ${end} UTC`,
          `Assumed obstruction: ${mask} degrees`,
          `Simulated sunlight: ${sun.percent.toFixed(1)}%; ${sun.hours.toFixed(1)} hours; longest window ${sun.longest.toFixed(1)} hours`,
          `Simulated Earth visibility: ${earth.percent.toFixed(1)}%; ${earth.hours.toFixed(1)} hours; longest window ${earth.longest.toFixed(1)} hours`,
        ],
      },
      {
        heading: 'Illustrative simulation, not a forecast',
        lines: [
          'Sine waves use periods of 29.53 and 27.32 days. NASA historical site averages set duty fractions. Amplitudes (5 and 7 degrees), longitude offsets and epoch January 1, 2026 are illustrative assumptions. No terrain shadows, electrical power or operational radio model is included.',
          'https://science.nasa.gov/moon/moon-phases/',
          'https://pgda.gsfc.nasa.gov/products/69',
        ],
      },
      {
        heading: 'Daily samples (UTC)',
        lines: samples.filter((_, i) => i % 24 === 0).map(sample => `${sample.time.slice(0, 10)}: Sun ${sample.sun.toFixed(2)} deg; Earth ${sample.earth.toFixed(2)} deg`),
      },
    ]);
  };

  return (
    <section className="simulation" aria-label="Illustrative mission simulation">
      <header className="simulation-header">
        <p className="eyebrow">SIMULATION · {site.shortName}</p>
        <h3>Your lunar window</h3>
        <p>{start} → {end} UTC · Illustrative scenario, not a forecast.</p>
      </header>
      <div className="simulation-layout">
        <div className="simulation-chart">
          <div className="sim-stats">
            <div><b>{sun.percent.toFixed(1)}%</b><span>Simulated sunlight</span><small>{sun.hours.toFixed(1)} hours total</small></div>
            <div><b>{earth.percent.toFixed(1)}%</b><span>Simulated Earth visibility</span><small>{earth.hours.toFixed(1)} hours total</small></div>
          </div>
          <svg viewBox="0 0 500 250" role="img" aria-label="Simulated Sun and Earth elevation relative to an assumed horizon">
            <rect x="35" y="150" width="430" height="75" fill="#172538" />
            <line x1="35" x2="465" y1={y(mask)} y2={y(mask)} stroke="#e1d9ee" strokeDasharray="5 5" />
            <text x="35" y={y(mask) - 6} fill="#ddd" fontSize="11">Assumed horizon {mask}°</text>
            <path d={plot('sun')} stroke="#ffd27d" fill="none" strokeWidth="2.5" />
            <path d={plot('earth')} stroke="#73d9ef" fill="none" strokeWidth="2.5" />
            <line x1={35 + index / (samples.length - 1) * 430} x2={35 + index / (samples.length - 1) * 430} y1="20" y2="225" stroke="white" opacity=".5" />
            {[-10, 0, 10].map(value => <text key={value} x="2" y={y(value) + 4} fill="#a7baca" fontSize="10">{value}°</text>)}
          </svg>
        </div>
        <div className="simulation-controls">
          <label>Explore time · {current.time.slice(0, 16).replace('T', ' ')} UTC<input type="range" min="0" max={samples.length - 1} value={index} onChange={event => setIndex(+event.target.value)} /></label>
          <p className="sim-readout">☀ Sun {current.sun.toFixed(1)}° · {current.sun > mask ? 'above' : 'below'} horizon<br />◉ Earth {current.earth.toFixed(1)}° · {current.earth > mask ? 'above' : 'below'} horizon</p>
          <label>Assumed obstruction: {mask}°<input type="range" min="0" max="8" step="0.5" value={mask} onChange={event => setMask(+event.target.value)} /></label>
          <p>Longest simulated window: sunlight {sun.longest.toFixed(1)} h · Earth visibility {earth.longest.toFixed(1)} h.</p>
          <details>
            <summary>How this simulation works</summary>
            <p>Two sine waves use a 29.53-day solar cycle and an approximate 27.32-day lunar cycle. NASA historical site averages set each wave’s above-horizon fraction over a full cycle. Dates move an arbitrary phase anchored to January 1, 2026; they do not predict the actual sky. The 5° and 7° amplitudes and longitude phase offsets are illustrative assumptions.</p>
            <p>Gold is Sun; cyan is Earth. The obstruction slider demonstrates how a higher horizon shortens opportunities. Terrain shadows, real libration, power output and radio performance are not calculated.</p>
            <a href="https://science.nasa.gov/moon/facts/" target="_blank" rel="noreferrer">NASA Moon facts ↗</a> · <a href="https://pgda.gsfc.nasa.gov/products/69" target="_blank" rel="noreferrer">NASA historical visibility data ↗</a>
          </details>
          <button onClick={download}>Download simulation PDF</button>
        </div>
      </div>
    </section>
  );
}
